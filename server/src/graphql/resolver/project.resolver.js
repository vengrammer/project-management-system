import Project from "../../model/project.model.js";

//projectData = title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
export const projectResolvers = {
  Query: {
    //show all the user
    projects: async () => {
      try {
        const projects = await Project.find();

        return projects.map((project) => ({
          id: project._id.toString(),
          title: project.title,
          description: project.description,
          priority: project.priority,
          status: project.status,
          department: project.department,
          progress: project.progress,
          tags: project.tags,
          budget: project.budget,
          startDate: project.startDate?.toISOString(),
          endDate: project.endDate?.toISOString(),
          createdAt: project.createdAt?.toISOString(),
          updatedAt: project.updatedAt?.toISOString(),
        }));
      } catch (error) {
        console.error("Return projects error:", error);
        throw new Error("Failed to fetch projects");
      }
    },
  },
};