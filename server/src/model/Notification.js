import mongoose from "mongoose";

const { Schema } = mongoose;

//recipients sender role type title message entity isRead, createdAt, updatedAt

const notificationSchema = new mongoose.Schema(
  {
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      required: true,
      default: "user",
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    entity: {
      type: {
        type: String,
        enum: ["Task", "Project", "TaskLogs"],
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for faster queries
notificationSchema.index({ recipients: 1, isRead: 1 });
notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ role: 1, createdAt: -1 });

const Notification =  mongoose.model("Notification", notificationSchema);
export default Notification