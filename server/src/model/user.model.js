import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//fulname, department,role,email,status,username,password,timestamps
const userSchema = new mongoose.Schema(
  {
    fullname: { type: String },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: ["user"],
    },
    position: { type: String },
    status: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
    },
    password: { type: String, select: false },
  },
  { timestamps: true, versionKey: false },
);

// 🔐 HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// 🔑 COMPARE PASSWORD (for login)
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
