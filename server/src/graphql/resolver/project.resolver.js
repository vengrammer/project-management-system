import Project from "../../model/project.model.js";
import TaskLog from "../../model/TaskLogs.js";
import Task from "../../model/Task.js";
import mongoose from "mongoose";

//projectData = title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
export const projectResolvers = {
  Query: {
    //show all the projects
    projects: async () => {
      try {
        const projects = await Project.find()
          .populate("users")
          .populate("department")
          .populate("projectManager");

        const formattedDate = (date) => {
          return date?.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        };

        return projects.map((project) => ({
          id: project._id.toString(),
          title: project.title,
          description: project.description,
          priority: project.priority,
          status: project.status,
          department: project.department,
          client: project.client,
          budget: project.budget || "0",
          users: project.users,
          projectManager: project.projectManager,
          startDate: formattedDate(project.startDate),
          endDate: formattedDate(project.endDate),
          createdAt: project.createdAt?.toISOString(),
          updatedAt: project.updatedAt?.toISOString(),
        }));
      } catch (error) {
        console.error("Return projects error:", error);
        throw new Error("Failed to fetch projects");
      }
    },
    project: async (_, { id }) => {
      try {
        const project = await Project.findById(id)
          .populate("users")
          .populate("department")
          .populate("projectManager");

        // const project2 = await Project.aggregate([
        //   {
        //     $match: {
        //       _id: new mongoose.Types.ObjectId(id),
        //     },
        //     $lookup: {
        //       from: "Users",
        //       localField: "users",
        //       foreignField: "_id",
        //       as: "user",
        //     },
        //     $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
        //     $lookup: {
        //       from: "Department",
        //       localField: "department",
        //       foreignField: "_id",
        //       as: "dept",
        //     },
        //     $unwind: { path: "$dept", preserveNullAndEmptyArrays: true },
        //     $lookup: {
        //       from: "Users",
        //       localField: "projectManager",
        //       foreignField: "_id",
        //       as: "pm",
        //     },
        //      $unwind: { path: "$pm", preserveNullAndEmptyArrays: true },
        //   },
        // ]);

        // console.log(project2);
        const formattedDate = (date) => {
          return date?.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        };

        if (!project) return null;

        return {
          id: project._id.toString(),
          title: project.title,
          description: project.description,
          priority: project.priority,
          status: project.status,
          department: project.department,
          client: project.client,
          budget: project.budget,
          users: project.users,
          projectManager: project.projectManager,
          startDate: formattedDate(project.startDate),
          endDate: formattedDate(project.endDate),
          createdAt: project.createdAt?.toISOString(),
          updatedAt: project.updatedAt?.toISOString(),
        };
      } catch (error) {
        console.error("Return project error:", error);
        throw new Error("Failed to fetch project");
      }
    },

    projectByUser: async (_, { id }) => {
      try {
        const project = await Project.find({ users: id })
          .populate("users")
          .populate("department")
          .populate("projectManager");

        if (project.length === 0) {
          console.log("No project");
          throw new Error("No project");
        }

        const formattedDate = (date) => {
          return date?.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        };

        return project.map((project) => ({
          id: project._id.toString(),
          title: project.title,
          description: project.description,
          priority: project.priority,
          status: project.status,
          department: project.department,
          client: project.client,
          budget: project.budget,
          users: project.users,
          projectManager: project.projectManager,
          startDate: formattedDate(project.startDate),
          endDate: formattedDate(project.endDate),
          createdAt: project.createdAt?.toISOString(),
          updatedAt: project.updatedAt?.toISOString(),
        }));
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createProject: async (_, args) => {
      try {
        const newProject = await Project.create({
          title: args.title,
          description: args.description,
          client: args.client,
          priority: args.priority,
          status: args.status,
          department: args.department,
          budget: args.budget,
          projectManager: args.projectManager,
          users: args.users,
          startDate: args.startDate,
          endDate: args.endDate,
        });
        return { message: "Project created successfully", project: newProject };
      } catch (error) {
        console.error("Create project error:", error);
        throw new Error(error.message || "Failed to create project");
      }
    },
    updateProject: async (_, args) => {
      const { id, users, addUsers, removeUsers, ...fields } = args;
      try {
        if (!id) throw new Error("Project id is required");

        // load project document
        const project = await Project.findById(id);
        if (!project) throw new Error("Project not found");

        // replace entire users array when `users` provided
        if (Array.isArray(users)) {
          project.users = users;
        }
        // update other allowed fields if provided
        const updatable = [
          "title",
          "description",
          "client",
          "priority",
          "status",
          "department",
          "budget",
          "projectManager",
          "startDate",
          "endDate",
        ];
        updatable.forEach((k) => {
          if (fields[k] !== undefined) project[k] = fields[k];
        });

        // append unique users
        if (Array.isArray(addUsers) && addUsers.length) {
          const existing = new Set((project.users || []).map(String));
          addUsers.forEach(
            (u) => existing.has(String(u)) || project.users.push(u),
          );
        }

        // remove users
        if (Array.isArray(removeUsers) && removeUsers.length) {
          const toRemove = new Set(removeUsers.map(String));
          project.users = (project.users || []).filter(
            (u) => !toRemove.has(String(u)),
          );
        }

        await project.save();

        const populated = await Project.findById(project._id)
          .populate("users")
          .populate("department")
          .populate("projectManager");

        return { message: "Project updated successfully", project: populated };
      } catch (error) {
        console.error("Update project error:", error);
        throw new Error(error.message || "Failed to update project");
      }
    },
    deleteProject: async (_, { id }) => {
      try {
        const tasks = await Task.find({ project: id });

        const taskIds = tasks.map((task) => task._id);

        await TaskLog.deleteMany({ task: { $in: taskIds } });

        await Task.deleteMany({ project: id });

        const deletedProject = await Project.findByIdAndDelete(id);

        return {
          message: "Successfully deleted project and all related data",
          project: deletedProject,
        };
      } catch (error) {
        throw new Error("Error in deleting the project.");
      }
    },
  },
};
