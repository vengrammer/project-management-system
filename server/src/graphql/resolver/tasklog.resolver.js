import TaskLog from "../../model/TaskLogs.js";

const taskLogResolver = {
  Query: {
    taskLogs: async () => {
      try {
        const taskLogs = await TaskLog.find()
          .populate("task")
          .populate("author")
          .sort({ createdAt: -1 });
        if (!taskLogs) {
          throw new Error("There's no task log");
        }
        return taskLogs;
      } catch (error) {
        console.log(error);
        throw new Error("Error in getting the task logs data", error);
      }
    },
    taskLogsByTask: async (_, { taskId }) => {
      try {
        const taskLogs = await TaskLog.find({ task: taskId })
          .populate("task")
          .populate("author")
          .sort({ createdAt: -1 });
        if (!taskLogs) {
          throw new Error("No task logs found for this task");
        }
        return taskLogs;
      } catch (error) {
        console.log(error);
        throw new Error("Error in getting task logs by task", error);
      }
    },
    taskLog: async (_, { id }) => {
      try {
        const taskLog = await TaskLog.findById(id)
          .populate("task")
          .populate("author");
        if (!taskLog) {
          throw new Error("Task log not found");
        }
        return taskLog;
      } catch (error) {
        console.log(error);
        throw new Error("Error in getting task log", error);
      }
    },
  },
  Mutation: {
    createTaskLog: async (_, args) => {
      try {
        const newTaskLog = await TaskLog.create({
          content: args.content,
          task: args.task,
          status: args.status,
          author: args.author,
        });
        return newTaskLog;
      } catch (error) {
        console.log("Error in creating the logs", error);
        throw new Error(error);
      }
    },
    updateTaskLog: async (_, { id, content, status }) => {
      try {
        const updates = {};
        if (content) updates.content = content;
        if (status) updates.status = status;

        const updatedTaskLog = await TaskLog.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        })
          .populate("task")
          .populate("author");

        if (!updatedTaskLog) {
          throw new Error("Task log not found");
        }
        return updatedTaskLog;
      } catch (error) {
        console.log("Error in updating the log", error);
        throw new Error(error);
      }
    },
    deleteTaskLog: async (_, { id }) => {
      try {
        const deletedTaskLog = await TaskLog.findByIdAndDelete(id)
          .populate("task")
          .populate("author");

        if (!deletedTaskLog) {
          throw new Error("Task log not found");
        }
        return deletedTaskLog;
      } catch (error) {
        console.log("Error in deleting the log", error);
        throw new Error(error);
      }
    },
  },
};

export default taskLogResolver;