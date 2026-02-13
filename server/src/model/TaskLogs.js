import mongoose from "mongoose";
//content, task,status,author
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
      enum: ["in progress", "done", "stuck"],
      default: "in progress",
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

const TaskLog = mongoose.model("TaskLog", taskLogSchema);
export default TaskLog;