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
};