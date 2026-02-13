import TaskLog from "../../model/TaskLogs.js";

const taskLogResolver = {
  Query: {
    taskLogs: async () => {
      try {
        const taskLogs = await TaskLog.find()
          .populate("task")
          .populate("author");
        if (!taskLogs) {
          throw new Error("There's no task log");
        }
        return taskLogs;
      } catch (error) {
        console.log(error);
        throw new Error("Error in getting the task logs data", error);
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
  },
};
export default taskLogResolver;
