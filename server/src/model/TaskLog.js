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
    comments: {type: String, required: true},
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