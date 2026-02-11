import Department from "../../model/department.model.js";
import User from "../../model/user.model.js";

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
  },
};
