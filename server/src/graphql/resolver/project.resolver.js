import Project from "../../model/project.model.js";
import TaskLog from "../../model/TaskLogs.js";
import Task from "../../model/Task.js";
import User from "../../model/user.model.js";
import mongoose from "mongoose";
//projectData = title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
export const projectResolvers = {
  Query: {
    //show all the projects
    projects: async () => {
      try {
        const projects = await Project.aggregate([
          {
            $match: { isArchive: false },
          },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        return reusableReturnmap(projects);
      } catch (error) {
        console.error("Return projects error:", error);
        throw new Error("Failed to fetch projects");
      }
    },

    project: async (_, { id }) => {
      try {
        const project = await Project.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(id) } },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        if (!project.length) return null;
        return reusableReturnmap(project)[0];
      } catch (error) {
        console.error("Return project error:", error);
        throw new Error("Failed to fetch project");
      }
    },

    projectByUser: async (_, { id }, context) => {
      // allow callers to omit the id and fall back to authenticated user
      const userId = id || context?.user?.id;
      if (!userId) {
        throw new Error("User ID is required to fetch projects");
      }

      try {
        const project = await Project.aggregate([
          { $match: { users: new mongoose.Types.ObjectId(userId) } },
          { $match: { isArchive: false } },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        if (project.length === 0) {
          return [];
        }

        return reusableReturnmap(project);
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },

    projectsByManager: async (_, { id }, context) => {
      // allow callers to omit the id and fall back to authenticated user
      const userId = id || context?.user?.id;
      if (!userId) {
        throw new Error("User ID is required to fetch projects");
      }

      try {
        const project = await Project.aggregate([
          { $match: { projectManager: new mongoose.Types.ObjectId(userId) } },
          { $match: { isArchive: false } },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        if (project.length === 0) {
          return [];
        }

        return reusableReturnmap(project);
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    },
    projectsByArchive: async (_, __, context) => {
      const currentUserId = context?.user?.id;

      if (!currentUserId) {
        throw new Error("Not authenticated");
      }

      // Get user
      const foundUser = await User.findById(currentUserId);

      if (!foundUser) {
        throw new Error("Cannot find the user");
      }

      //console.log(foundUser?.role)

      let filter = { isArchive: true }; // assuming archived projects use this status

      if (foundUser?.role === "admin") {
        // Admin gets ALL archived projects
      } else if (foundUser?.role === "manager") {
        filter.projectManager = new mongoose.Types.ObjectId(currentUserId);
      } else if (foundUser?.role === "user") {
        filter.users = { $in: [new mongoose.Types.ObjectId(currentUserId)] };
      } else {
        throw new Error("Unauthorized role");
      }

      const projects = await Project.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "users",
            localField: "users",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $unwind: {
            path: "$department",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "projectManager",
            foreignField: "_id",
            as: "projectManager",
          },
        },
        {
          $unwind: {
            path: "$projectManager",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      if (projects.length === 0) {
        return [];
      }

      return reusableReturnmap(projects);
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

        const project = await Project.aggregate([
          { $match: { _id: newProject._id } },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        return {
          message: "Project created successfully",
          project: reusableReturnmap(project)[0],
        };
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
          "isArchive",
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

        const populated = await Project.aggregate([
          { $match: { _id: project._id } },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        return {
          message: "Project updated successfully",
          project: reusableReturnmap(populated)[0],
        };
      } catch (error) {
        console.error("Update project error:", error);
        throw new Error(error.message || "Failed to update project");
      }
    },
    deleteProject: async (_, { id }) => {
      try {
        // First get the project data before deleting
        const projectToDelete = await Project.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(id) } },
          {
            $lookup: {
              from: "users",
              localField: "users",
              foreignField: "_id",
              as: "users",
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "department",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "projectManager",
              foreignField: "_id",
              as: "projectManager",
            },
          },
          {
            $unwind: {
              path: "$projectManager",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);

        const tasks = await Task.find({ project: id });

        const taskIds = tasks.map((task) => task._id);

        await TaskLog.deleteMany({ task: { $in: taskIds } });

        await Task.deleteMany({ project: id });

        await Project.findByIdAndDelete(id);

        return {
          message: "Successfully deleted project and all related data",
          project:
            projectToDelete.length > 0
              ? reusableReturnmap(projectToDelete)[0]
              : null,
        };
      } catch (error) {
        throw new Error("Error in deleting the project.");
      }
    },
  },
};

const reusableReturnmap = (projects) => {
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
    client: project.client,
    budget: project.budget || "0",
    isArchive: project.isArchive,
    startDate: formattedDate(project.startDate),
    endDate: formattedDate(project.endDate),
    createdAt: project.createdAt?.toISOString(),
    updatedAt: project.updatedAt?.toISOString(),

    // Add id for department
    department: project.department
      ? { ...project.department, id: project.department._id.toString() }
      : null,

    // Add id for projectManager
    projectManager: project.projectManager
      ? {
          ...project.projectManager,
          id: project.projectManager._id.toString(),
        }
      : null,

    // Add id for users array
    users: project.users?.map((u) => ({ ...u, id: u._id.toString() })) || [],
  }));
};
