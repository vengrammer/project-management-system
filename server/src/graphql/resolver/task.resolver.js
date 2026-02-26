import Task from "../../model/Task.js";
import TaskLog from "../../model/TaskLogs.js";

const taskResolver = {
  Query: {
    // return all tasks
    tasks: async () => {
      try {
        const tasks = await Task.find().populate("project").populate("users");
        return tasks;
      } catch (error) {
        console.error("Return tasks error:", error);
        throw new Error("Failed to fetch tasks");
      }
    },

    // return single task by id
    task: async (_, { id }) => {
      try {
        const task = await Task.findById(id)
          .populate("project")
          .populate("users");
        if (!task) throw new Error("Task not found");
        return task;
      } catch (error) {
        console.error("Return task error:", error);
        throw new Error(error.message || "Failed to fetch task");
      }
    },

    //return all thas based on the project id
    taskByProject: async (_, { id }) => {
      try {
        const task = await Task.find({ project: id })
          .populate("project")
          .populate("users");
        if (!task) throw new Error("Task not found");
        return task;
      } catch (error) {
        console.log("error in getting the task", error);
        throw new Error(error.message || "Failed to fetch task by project id");
      }
    },
  },

  Mutation: {
    createTask: async (_, args) => {
      try {
        const newTask = await Task.create({
          title: args.title,
          description: args.description,
          project: args.project,
          users: args.users,
          priority: args.priority,
          status: args.status,
          //dueDate: args.dueDate,
        });
        return newTask;
      } catch (error) {
        console.error("Create task error:", error);
        throw new Error(error.message || "Failed to create task");
      }
    },

    updateTask: async (_, args) => {
      const { id, ...fields } = args;
      try {
        if (!id) throw new Error("Task id is required");

        const task = await Task.findById(id);
        if (!task) throw new Error("Task not found");

        const updatable = [
          "title",
          "description",
          "priority",
          "status",
          "users",
          "completedDate",
        ];

        updatable.forEach((k) => {
          if (fields[k] !== undefined) task[k] = fields[k];
        });

        await task.save();

        const populated = await Task.findById(task._id)
          .populate("project")
          .populate("users");

        return populated;
      } catch (error) {
        console.error("Update task error:", error);
        throw new Error(error.message || "Failed to update task");
      }
    },

    deleteTask: async (_, { id }) => {
      try {
        //delete all tasklog reference in this task
        await TaskLog.deleteMany({ task: id });

        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) throw new Error("Task not found");
        return deletedTask;
      } catch (error) {
        console.log("Error in deleting the task");
        throw new Error(error.message || "error in deleting task");
      }
    },
  },
};

export default taskResolver;
