import ProjectMgnt from "../../model/projectmgnt.js";
import mongoose from "mongoose";
export const projectMgntResolver = {
  Query: {
    projectMgnts: async () => {
      const projectMgnts = await ProjectMgnt.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "pm",
            foreignField: "_id",
            as: "pm",
          },
        },
        {
          $unwind: {
            path: "$pm",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "departments",
            foreignField: "_id",
            as: "departments",
          },
        },
        {
          $lookup: {
            from: "projects",
            let: { projectIds: "$projects" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$projectIds"] },
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
            ],
            as: "projects",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { managerIds: "$managers" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$managerIds"] },
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
            ],
            as: "managers",
          },
        },
      ]);
      return reusableReturnmap(projectMgnts);
    },
    projectMgnt: async (__dirname, { id }) => {
      const projectMgnt = await ProjectMgnt.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "pm",
            foreignField: "_id",
            as: "pm",
          },
        },
        {
          $unwind: {
            path: "$pm",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "departments",
            foreignField: "_id",
            as: "departments",
          },
        },
        {
          $lookup: {
            from: "projects",
            let: { projectIds: "$projects" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$projectIds"] },
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
            ],
            as: "projects",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { managerIds: "$managers" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$managerIds"] },
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
            ],
            as: "managers",
          },
        },

      ]);
      return reusableReturnmap(projectMgnt)[0] || null;
    },
    projectMgntByPm: async(__dirname, {id}, context) => {

      const userId = id || context?.user?.id;

      if (!userId) {
        throw new Error("User ID is required to fetch projects");
      }
      const projectMgnts = await ProjectMgnt.aggregate([
        {
          $match: { pm: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: "users",
            localField: "pm",
            foreignField: "_id",
            as: "pm",
          },
        },
        {
          $unwind: {
            path: "$pm",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "departments",
            foreignField: "_id",
            as: "departments",
          },
        },
        {
          $lookup: {
            from: "projects",
            let: { projectIds: "$projects" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$projectIds"] },
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
            ],
            as: "projects",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { managerIds: "$managers" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$managerIds"] },
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
            ],
            as: "managers",
          },
        },

      ]);

      return reusableReturnmap(projectMgnts);
    },
    projectsMgntByManager: async(__dirname, {id}, context) => {
      const userId = id || context?.user?.id;
      if (!userId) {
        throw new Error("User ID is required to fetch projects");
      }
      const projectMgnts = await ProjectMgnt.aggregate([
        {
          $match: { managers: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: "users",
            localField: "pm",
            foreignField: "_id",
            as: "pm",
          },
        },
        {
          $unwind: {
            path: "$pm",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "departments",
            foreignField: "_id",
            as: "departments",
          },
        },
        {
          $lookup: {
            from: "projects",
            let: { projectIds: "$projects" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$projectIds"] },
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
            ],
            as: "projects",
          },
        },
        {
          $lookup: {
            from: "users",
            let: { managerIds: "$managers" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$managerIds"] },
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
            ],
            as: "managers",
          },
        },

      ]);

      return reusableReturnmap(projectMgnts);
    }
  },
  Mutation: {
    createProjectMgnt: async (__dirname, args, context) => {
      // check who is the pm and who is the user and if it's authenticated
      const userId = args.pm || context?.user?.id;
      if (!userId) {
        throw new Error("User ID is required to fetch projectMgnt");
      }
      try {
        const newProjectMgnt = await ProjectMgnt.create({
          title: args.title,
          pm: args.pm || userId,
          priority: args.priority,
          status: args.status,
          isArchive: false,
          departments: args.departments,
          managers: args.managers,
          projects: args.projects,
          startDate: args.startDate,
          endDate: args.endDate,
        });

        return {
          projectMgnt: reusableReturnmap([newProjectMgnt])[0],
          message: "Successfully created project management",
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    updateProjectMgnt: async (_, args, context) => {
      const userId =   args.pm || context?.user?.id;
      if (!userId) {
        throw new Error("User ID is required");
      }
      try {
        const {
          id,
          departments,
          managers,
          projects,
          addDepartments,
          removeDepartments,
          addManagers,
          removeManagers,
          addProjects,
          removeProjects,
          ...fields
        } = args;

        if (!id) throw new Error("ProjectMgnt id is required");

        // fetch existing document
        const projectMgnt = await ProjectMgnt.findById(id);
        if (!projectMgnt) throw new Error("ProjectMgnt not found");

        // fields allowed to update
        const updatable = ["title", "pm", "priority", "startDate", "endDate"];

        // update scalar fields only if provided
        updatable.forEach((key) => {
          if (fields[key] !== undefined) {
            projectMgnt[key] = fields[key];
          }
        });

        // ===== ARRAY HANDLING =====

        // replace full arrays if provided
        if (Array.isArray(departments)) {
          projectMgnt.departments = departments;
        }
        if (Array.isArray(managers)) {
          projectMgnt.managers = managers;
        }
        if (Array.isArray(projects)) {
          projectMgnt.projects = projects;
        }

        // helper function for add/remove
        const updateArray = (existing = [], add = [], remove = []) => {
          let set = new Set(existing.map(String));

          if (Array.isArray(add)) {
            add.forEach((item) => set.add(String(item)));
          }

          if (Array.isArray(remove)) {
            remove.forEach((item) => set.delete(String(item)));
          }

          return Array.from(set);
        };

        // apply add/remove logic
        projectMgnt.departments = updateArray(
          projectMgnt.departments,
          addDepartments,
          removeDepartments,
        );

        projectMgnt.managers = updateArray(
          projectMgnt.managers,
          addManagers,
          removeManagers,
        );

        projectMgnt.projects = updateArray(
          projectMgnt.projects,
          addProjects,
          removeProjects,
        );

        // save updated document
        await projectMgnt.save();

        return {
          message: "Project Management updated successfully",
          projectMgnt: reusableReturnmap([projectMgnt])[0],
        };
      } catch (error) {
        console.error("Update ProjectMgnt error:", error);
        throw new Error(error.message || "Failed to update ProjectMgnt");
      }
    },
  },
};
const reusableReturnmap = (projectMgnts) => {
  const formattedDate = (date) => {
    return date?.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return projectMgnts.map((projectMgnt) => ({
    _id: projectMgnt._id.toString(),
    title: projectMgnt.title,
    priority: projectMgnt.priority,
    status: projectMgnt.status,
    isArchive: projectMgnt.isArchive,

    startDate: formattedDate(projectMgnt.startDate),
    endDate: formattedDate(projectMgnt.endDate),
    createdAt: projectMgnt.createdAt?.toISOString(),
    updatedAt: projectMgnt.updatedAt?.toISOString(),

    // single object
    pm: projectMgnt.pm
      ? {
          ...projectMgnt.pm,
          id: projectMgnt.pm._id.toString(),
        }
      : null,

    //Managers (array)
    managers:
      (projectMgnt.managers || []).map((m) => ({
        ...m,
        id: m._id.toString(),
        department: m.department
          ? {
              ...m.department,
              id: m.department._id.toString(),
            }
          : null,
      })),

    //Departments (array)
    departments:
      projectMgnt.departments?.map((d) => ({
        ...d,
        id: d._id.toString(),
      })) || [],

    //Projects (array)
    projects:
      (projectMgnt.projects || []).map((p) => ({
        ...p,
        id: p._id.toString(),
        department: p.department
          ? {
              ...p.department,
              id: p.department._id.toString(),
            }
          : null,
      })),
  }));
};
