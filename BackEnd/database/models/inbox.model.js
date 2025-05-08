import { Schema, model } from "mongoose";

const inboxSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        deletedFor: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    { timestamps: true, versionKey: false }
);

export const Inbox = model("Inbox", inboxSchema);
