import Department from "../../model/department.model.js";
import User from "../../model/user.model.js";

// data = fullname, department, role, email, username, password, timestamps
export const userResolvers = {
  Query: {
    //Return all user
    users: async () => {
      try {
        const users = await User.find().populate("department");
        return users.map((user) => ({
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          username: user.username,
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
        const user = await User.findById(id).populate("department");
        if (!user) {
          throw new Error("Cannot find user");
        }
        return {
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt?.toISOString() || null,
          updatedAt: user.updatedAt?.toISOString() || null,
        };
      } catch (error) {
        console.log("Error User Find", error);
        throw new Error(error.message);
      }
    },
    //get all the user with a role manager
    userRoleManager: async () => {
      try {
        const managers = await User.find({ role: "manager" });
        if (!managers) {
          throw new Error("No manager found!");
        }
        return managers;
      } catch (error) {
        console.error("Get the manager error:", error);
        throw new Error("Failed to show users manager");
      }
    },
    // return info about the currently authenticated user
    currentUser: async (_, __, context) => {
      const uid = context?.user?.id;
      if (!uid) {
        throw new Error("Not authenticated");
      }
      const user = await User.findById(uid).populate("department");
      if (!user) {
        throw new Error("User not found");
      }
      return {
        id: user._id.toString(),
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        department: user.department,
        position: user.position,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt?.toISOString() || null,
        updatedAt: user.updatedAt?.toISOString() || null,
      };
    },
    //search user by their data
    searchUser: async (_, args) => {
      try {
        const filter = {};
        if (args.fullname)
          filter.fullname = { $regex: args.fullname, $options: "i" };
        if (args.email) filter.email = { $regex: args.email, $options: "i" };
        if (args.position)
          filter.position = { $regex: args.position, $options: "i" };
        if (args.role) filter.role = { $regex: args.role, $options: "i" };

        // Handle department search properly
        if (args.department) {
          const dept = await Department.findOne({
            name: { $regex: args.department, $options: "i" },
          });
          if (dept) filter.department = dept._id;
        }

        const searchResults = await User.find(filter)
          .populate("department")
          .select("-password");

        return searchResults.map((user) => ({
          id: user._id.toString(),
          fullname: user.fullname,
          email: user.email,
          department: user.department,
          position: user.position,
          role: user.role,
          status: user.status,
          username: user.username,
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
        // Check if email already exists
        const existingEmail = await User.findOne({ email: args.email });
        if (existingEmail) {
          throw new Error("EMAIL_EXISTS: This email is already registered");
        }

        // Check if username already exists
        const existingUsername = await User.findOne({
          username: args.username,
        });
        if (existingUsername) {
          throw new Error("USERNAME_EXISTS");
        }
        const newUser = await User.create({
          fullname: args.fullname,
          email: args.email,
          username: args.username,
          password: args.password,
          position: args.position,
          status: args.status || true,
          department: args.department,
          role: args.role || "user",
        });
        return {
          message: "User created successfully",
          user: {
            id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            department: newUser.department,
            position: newUser.position,
            role: newUser.role,
            status: newUser.status,
            username: newUser.username,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        console.error("Create user error:", error);
        // Handle email exists error - show direct message
        if (error.message.includes("EMAIL_EXISTS")) {
          throw new Error(
            "This email is already registered. Please use a different email.",
          );
        }
        // Handle username exists error - generic message
        if (error.message.includes("USERNAME_EXISTS")) {
          throw new Error("Please change your username and try again.");
        }
        throw new Error(error.message || "Failed to create user");
      }
    },
    updateUser: async (_, args, context) => {
      try {
        const { id, ...updateData } = args;
        // prevent user from deactivating themselves
        if (context?.user?.id === id && updateData.status === false) {
          throw new Error("Cannot deactivate your own account");
        }

        // Check if user exists
        const existingUser = await User.findById(id);
        if (!existingUser) {
          throw new Error("User not found");
        }

        // Check if email already exists for another user
        if (updateData.email && updateData.email !== existingUser.email) {
          const existingEmail = await User.findOne({ email: updateData.email });
          if (existingEmail) {
            throw new Error("EMAIL_EXISTS: This email is already registered");
          }
        }

        // Check if username already exists for another user
        if (
          updateData.username &&
          updateData.username !== existingUser.username
        ) {
          const existingUsername = await User.findOne({
            username: updateData.username,
          });
          if (existingUsername) {
            throw new Error("USERNAME_EXISTS");
          }
        }

        // Hash password if it's being updated
        if (updateData.password) {
          const bcrypt = await import("bcryptjs");
          updateData.password = await bcrypt.default.hash(
            updateData.password,
            10,
          );
        }

        const updatedUser = await User.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true },
        ).populate("department");

        return {
          message: "User updated successfully",
          user: {
            id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            department: updatedUser.department,
            position: updatedUser.position,
            role: updatedUser.role,
            status: updatedUser.status,
            username: updatedUser.username,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        console.error("Update user error:", error);
        // Handle email exists error - show direct message
        if (error.message.includes("EMAIL_EXISTS")) {
          throw new Error(
            "This email is already registered. Please use a different email.",
          );
        }
        // Handle username exists error - generic message
        if (error.message.includes("USERNAME_EXISTS")) {
          throw new Error("Please change your username and try again.");
        }
        throw new Error(error.message || "Failed to update user");
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        const deletedUser = await User.findByIdAndDelete(id);
        return deletedUser;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },
    deactivateUser: async (_, { id }, context) => {
      if (context?.user?.id === id) {
        throw new Error("Cannot deactivate your own account");
      }
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { status: false },
          { new: true },
        );
        return user;
      } catch (error) {
        console.error("Deactivate user error", error);
        throw new Error("Failed to deactivate user");
      }
    },
  },
};
