
import ProjectMgnt from "../../model/projectmgnt.js";
export const projectMgntResolver = {
    Query: {
        projectMgnts: async () => {
            const projectMgnts = await ProjectMgnt.aggregate([

                // 🔹 Populate pm (single user)
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

                // 🔹 Populate managers (array)
                {
                    $lookup: {
                        from: "users",
                        localField: "managers",
                        foreignField: "_id",
                        as: "managers",
                    },
                },

                // 🔹 Populate departments
                {
                    $lookup: {
                        from: "departments",
                        localField: "departments",
                        foreignField: "_id",
                        as: "departments",
                    },
                },

                // 🔹 Populate projects
                {
                    $lookup: {
                        from: "projects",
                        localField: "projects",
                        foreignField: "_id",
                        as: "projects",
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
                    "projectMgnt": newProjectMgnt,
                    "message": "Successfully created project management"
                }
            } catch (error) {
                throw new Error(error);
            }
        }
    }
}
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
      projectMgnt.managers?.map((m) => ({
        ...m,
        id: m._id.toString(),
      })) || [],

    //Departments (array)
    departments:
      projectMgnt.departments?.map((d) => ({
        ...d,
        id: d._id.toString(),
      })) || [],

    //Projects (array)
    projects:
      projectMgnt.projects?.map((p) => ({
        ...p,
        id: p._id.toString(),
      })) || [],
  }));
};