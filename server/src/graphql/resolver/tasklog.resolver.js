import mongoose from "mongoose";
import TaskLog from "../../model/TaskLogs.js";
import Task from "../../model/Task.js";

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
    taskLogsByProject: async (_, { projectId, startDate, endDate }) => {
      try {
        console.log("Fetching logs for project:", projectId);

        // Convert projectId to ObjectId if it's a string
        const projectObjectId = new mongoose.Types.ObjectId(projectId);

        // First get all tasks for this project
        const tasks = await Task.find({ project: projectObjectId });
        console.log("Found tasks:", tasks.length);

        const taskIds = tasks.map((task) => task._id);

        if (taskIds.length === 0) {
          console.log("No tasks found for this project");
          return [];
        }

        // Build query for task logs
        const query = { task: { $in: taskIds } };

        // Add date range filter if provided
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          // Set end date to end of day
          end.setHours(23, 59, 59, 999);
          query.createdAt = {
            $gte: start,
            $lte: end,
          };
        }

        console.log("Query:", query);

        const taskLogs = await TaskLog.find(query)
          .populate({
            path: "task",
            populate: { path: "project" },
          })
          .populate("author")
          .sort({ createdAt: -1 });

        console.log("Found logs:", taskLogs.length);
        return taskLogs;
      } catch (error) {
        console.log("Error getting task logs:", error);
        throw new Error(
          "Error in getting task logs by project: " + error.message,
        );
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
