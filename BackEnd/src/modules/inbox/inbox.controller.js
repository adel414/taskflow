import { Inbox } from "../../../database/models/inbox.model.js";
import { User } from "../../../database/models/user.model.js";
import { Notifications } from "../../../database/models/notification.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchError } from "../../utils/catchError.js";

export const addInbox = catchError(async (req, res, next) => {
  const { body } = req.body;
  if (!body) {
    return next(new AppError("message content is required", 400));
  }

  req.body.sender = req.user._id;
  req.body.receiver = req.params.id;

  let user = await User.findById(req.params.id);
  if (!user) return next(new AppError("this user does not exist", 404));

  // Create the inbox message
  let inbox = await Inbox.create(req.body);

  // Get sender's name for the notification
  const sender = await User.findById(req.user._id).select("name");

  // Create or update notification
  const notificationData = {
    assignedTo: [req.params.id],
    message: `${sender.name} sent you a message`,
    type: "general",
    isRead: false,
    createdBy: req.user._id,
  };

  // Find and update existing notification from the same sender
  await Notifications.findOneAndUpdate(
    {
      assignedTo: req.params.id,
      createdBy: req.user._id,
      type: "general",
    },
    {
      $set: {
        message: notificationData.message,
        isRead: false,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  res.status(201).json({ message: "success", inbox });
});

export const getUserInbox = catchError(async (req, res, next) => {
  const { id } = req.params;
  let user = await User.findById(id);
  if (!user) return next(new AppError("this user does not exist", 404));

  let userInbox = await Inbox.find({ receiver: id })
    .populate("sender", "name email")
    .sort({ createdAt: -1 });

  if (!userInbox.length)
    return next(new AppError("no inbox messages found", 404));
  res.json({ message: "success", userInbox });
});

export const deleteInbox = catchError(async (req, res, next) => {
  const { inboxes } = req.body;
  if (!inboxes || !Array.isArray(inboxes)) {
    return next(new AppError("inboxes array is required", 400));
  }

  let deletedInboxes = await Promise.all(
    inboxes.map(async (inboxId) => {
      const inbox = await Inbox.findByIdAndDelete(inboxId);
      if (!inbox) {
        throw new AppError(`Inbox with id ${inboxId} not found`, 404);
      }
      return inbox;
    })
  );

  res.json({ message: "deleted successfully", deletedInboxes });
});

export const deleteAllInbox = catchError(async (req, res, next) => {
  const { id } = req.params;
  let user = await User.findById(id);
  if (!user) return next(new AppError("this user does not exist", 404));

  // Mark messages as deleted for the current user instead of actually deleting them
  let updatedInbox = await Inbox.updateMany(
    {
      $or: [
        { sender: req.user._id, receiver: id },
        { sender: id, receiver: req.user._id },
      ],
    },
    { $addToSet: { deletedFor: req.user._id } }
  );

  if (updatedInbox.acknowledged !== true) {
    return next(new AppError("failed to clear chat history", 400));
  }
  res.json({ message: "chat history has been cleared" });
});

export const getInboxSenders = catchError(async (req, res, next) => {
  // Get all unique senders who sent messages to the current user
  const senders = await Inbox.aggregate([
    // Match messages where current user is the receiver
    { $match: { receiver: req.user._id } },
    // Group by sender to get unique senders
    {
      $group: {
        _id: "$sender",
        lastMessage: { $last: "$$ROOT" },
        messageCount: { $sum: 1 },
      },
    },
    // Sort by the last message date
    { $sort: { "lastMessage.createdAt": -1 } },
    // Lookup sender details from User collection
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "senderDetails",
      },
    },
    // Unwind the senderDetails array
    { $unwind: "$senderDetails" },
    // Project only needed fields
    {
      $project: {
        _id: 1,
        messageCount: 1,
        lastMessage: {
          _id: "$lastMessage._id",
          body: "$lastMessage.body",
          isRead: "$lastMessage.isRead",
          createdAt: "$lastMessage.createdAt",
        },
        sender: {
          _id: "$senderDetails._id",
          name: "$senderDetails.name",
          email: "$senderDetails.email",
          image: "$senderDetails.image",
        },
      },
    },
  ]);

  // Return empty array instead of error when no messages found
  res.json({
    message: "success",
    senders: senders || [],
  });
});

export const getMessagesBetweenUsers = catchError(async (req, res, next) => {
  const { id } = req.params; // other user's ID

  // Get messages where current user is either sender or receiver with the other user
  // and exclude messages that the current user has deleted
  const messages = await Inbox.find({
    $or: [
      { sender: req.user._id, receiver: id },
      { sender: id, receiver: req.user._id },
    ],
    deletedFor: { $ne: req.user._id },
  })
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: 1 }); // Sort by oldest first

  // Mark messages as read where current user is the receiver
  await Inbox.updateMany(
    { receiver: req.user._id, sender: id, isRead: false },
    { $set: { isRead: true } }
  );

  // Check if there are any remaining unread messages
  const hasUnread = await Inbox.exists({
    receiver: req.user._id,
    isRead: false,
    deletedFor: { $ne: req.user._id },
  });

  res.json({
    message: "success",
    messages: messages || [],
    hasUnread: !!hasUnread,
  });
});

export const checkUnreadMessages = catchError(async (req, res, next) => {
  const userId = req.user._id;

  // Check if there are any unread messages where the current user is the receiver
  const hasUnread = await Inbox.exists({
    receiver: userId,
    isRead: false,
    deletedFor: { $ne: userId },
  });

  res.json({
    message: "success",
    hasUnread: !!hasUnread,
  });
});

export const getAllChatUsers = catchError(async (req, res, next) => {
  const userId = req.user._id;

  // Find all unique users you have sent or received messages with
  const users = await Inbox.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    {
      $project: {
        user: {
          $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
        },
        body: 1,
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$user",
        lastMessage: { $first: "$body" },
        lastDate: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 1,
        lastMessage: 1,
        lastDate: 1,
        user: {
          _id: "$userDetails._id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          image: "$userDetails.image",
          role: "$userDetails.role",
        },
      },
    },
    { $sort: { lastDate: -1 } },
  ]);

  res.json({ message: "success", users });
});
