//projectData = title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
export const projectSchema = `#graphql
      type Project {
        id: ID!
        title: String
        description: String
        priority: String
        status: String
        department: String
        progress: Int
        budget: Int
        startDate: String
        endDate: String
        createdAt: String
        updatedAt: String
    }
    type Query {
        projects: [Project]!
    }
`;