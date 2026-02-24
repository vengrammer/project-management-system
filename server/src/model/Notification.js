import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_updated",
        "task_completed",
        "comment_added",
        "mentioned",
        "project_update",
      ],
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
        enum: ["Task", "Project", "Comment"],
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
    },

    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Optional but useful indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);