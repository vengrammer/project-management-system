import User from "../../model/user.model.js";
import { userValidator } from "../validator/user.validator.js";
// data = fullname, department, role, email, username, password, timestamps
export const userResolvers = {
  Query: {
    //Return all user 
    users: async () => {
      try {
        const users = await User.find();
        return users.map((user) => ({
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }));
      } catch (error) {
        console.log("return users error: ", error);
      }
    },
    //return user by id
    user: async (_, { id }) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new Error("Cannot find user");
        }
        return user;
      } catch (error) {
        console.log("Error User Find", error);
      }
    },
    //search user by their data
    searchUser: async (_, args) => {
      try {
        // Build a dynamic filter only with provided arguments
        const filter = {};
            if (args.fullname)
              filter.fullname = { $regex: args.fullname, $options: "i" };
            if (args.email)
              filter.email = { $regex: args.email, $options: "i" };
            if (args.department)
              filter.department = { $regex: args.department, $options: "i" };
            if (args.role) filter.role = { $regex: args.role, $options: "i" };

        const searchResults = await User.find(filter).select("-password");

        if (searchResults.length === 0) {
          console.log("No user found");
        }

        return searchResults.map((user) => ({
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          department: user.department,
          role: user.role,
          createdAt: user.createdAt?.toISOString() || null,
          updatedAt: user.updatedAt?.toISOString() || null,
        }));
      } catch (error) {
        console.error("Search error:", error);
        throw new Error("Failed to search users");
      }
    },
  },

  Mutation: {
    createUser: async (_, args) => {
      try {
        userValidator.parse(args);
        const newUser = await User.create({
          fullname: args.fullname,
          email: args.email,
          username: args.username,
          password: args.password,
          department: args.username,
          role: args.role || ["user"],
        });
        return {
          user: {
            id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            department: newUser.department,
            role: newUser.role,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        console.log("create user:", error);
      }
    },
  },
};
