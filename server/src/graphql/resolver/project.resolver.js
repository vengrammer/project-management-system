import Project from "../../model/project.model.js";

//projectData = title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
export const projectResolvers = {
  Query: {
    //show all the projects
    projects: async () => {
      try {
        const projects = await Project.find()
          .populate("users") // ✅ correct field name
          .populate("department")
          .populate("projectManager"); // populate projectManager (matches model field)

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
          budget: project.budget,
          users: project.users, // ✅ already populated
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
  },
  Mutation: {
    createProject: async (_, args) => {
      try {
        const created = await Project.create({
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

        const formattedDate = (date) =>
          date?.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

        const project = {
          id: created._id.toString(),
          title: created.title,
          description: created.description,
          priority: created.priority,
          status: created.status,
          client: created.client,
          department: created.department,
          projectManager: created.projectManager,
          users: created.users,
          progress: created.progress,
          budget: created.budget,
          startDate: formattedDate(created.startDate),
          endDate: formattedDate(created.endDate),
          createdAt: created.createdAt?.toISOString(),
          updatedAt: created.updatedAt?.toISOString(),
        };

        return { message: "Project created successfully", project };
      } catch (error) {
        console.error("Create project error:", error);
        throw new Error(error.message || "Failed to create project");
      }
    },
  },
};