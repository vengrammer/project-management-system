import mongoose from "mongoose";
// content, task, status, author

const taskLogSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["in_progress", "done", "stuck"],
      default: "in_progress",
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Add index for faster queries by task and author
taskLogSchema.index({ task: 1, author: 1 });
taskLogSchema.index({ createdAt: -1 });

const TaskLog = mongoose.model("TaskLog", taskLogSchema);
export default TaskLog;
