import mongoose from "mongoose";

const taskLogSchema = mongoose.Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "done", "stuck"],
      required: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    oldValue: {
      type: Schema.Types.Mixed,
    },

    newValue: {
      type: Schema.Types.Mixed,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
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