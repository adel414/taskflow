import { Router } from "express";
import * as inboxCruds from "./inbox.controller.js";
import { protectedRoute } from "../../middleware/protectedRoute.js";
import { isAllowedTo } from "../../middleware/isAllowedTo.js";

export const inboxRouter = Router();

// Get messages between current user and another user
inboxRouter.get(
  "/chat/:id",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.getMessagesBetweenUsers
);

// Get all users who sent messages to current user
inboxRouter.get(
  "/senders",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.getInboxSenders
);

// Get all inbox messages for a user
inboxRouter.get(
  "/user/:id",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.getUserInbox
);

// Send a new message
inboxRouter.post(
  "/:id",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.addInbox
);

// Delete specific messages
inboxRouter.delete(
  "/",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.deleteInbox
);

// Delete all messages for a user
inboxRouter.delete(
  "/all/:id",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.deleteAllInbox
);

// Check for unread messages
inboxRouter.get(
  "/unread",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.checkUnreadMessages
);

// Get all users you have ever sent or received messages with
inboxRouter.get(
  "/chat-users",
  protectedRoute,
  isAllowedTo("admin", "user"),
  inboxCruds.getAllChatUsers
);
