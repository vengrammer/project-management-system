import Project from "../../model/project.model.js";

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
          progress: project.progress,
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
          progress: project.progress,
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
  },
};
