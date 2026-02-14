import Task from "../../model/Task.js";

const taskResolver = {
  Query: {
    // return all tasks
    tasks: async () => {
      try {
        const tasks = await Task.find()
          .populate("project")
          .populate("assignedTo");
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
          .populate("assignedTo");
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
          .populate("assignedTo");
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
          assignedTo: args.assignedTo,
          priority: args.priority,
          status: args.status,
          dueDate: args.dueDate,
        });
        return newTask;
      } catch (error) {
        console.error("Create task error:", error);
        throw new Error(error.message || "Failed to create task");
      }
    },
  },
};

export default taskResolver;