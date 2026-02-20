import Department from "../../model/department.model.js";
import User from "../../model/user.model.js";
import Project from "../../model/project.model.js"
import {GraphQLError} from "graphql";

export const departmentResolver = {
  Query: {
    departments: async () => {
      try {
        const departments = await Department.find();
        return departments;
      } catch (error) {
        console.log("error", error);
      }
    },
  },
  Department: {
    users: async (parent) => {
      try {
        const users = await User.find({ department: parent._id });
        return users;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    createDepartment: async (_, args) => {
      try {
        const newDepartment = await Department.create({
          name: args.name,
          description: args.description,
          isActive: args.isActive || true,
        });
        return {
          message: "Successfully Created new Department",
          department: newDepartment,
        };
      } catch (error) {
        console.error("Create department error:", error);
        throw new Error(error.message || "Failed to create department");
      }
    },
    deleteDepartment: async (_, { id }) => {
      try {
        // 1️⃣ Check if department is used
        const departmentUsedInUser = await User.find({ department: id });
        const departmentUsedInProject = await Project.find({ department: id });

        if (
          departmentUsedInUser.length > 0 ||
          departmentUsedInProject.length > 0
        ) {
          throw new GraphQLError("Failed: This department is currently used", {
            extensions: { code: "USED" },
          });
        }

        // 2️⃣ Now safe to delete
        const deletedDepartment = await Department.findByIdAndDelete(id);

        if (!deletedDepartment) {
          throw new GraphQLError("Department not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return {
          message: "Successfully deleted department",
          department: deletedDepartment,
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
};
