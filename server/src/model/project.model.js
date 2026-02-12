import mongoose from "mongoose";
//project =  projectmanager,users, title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
const projectSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    title: {
      type: String,
      required: true,
    },

    client: String,

    description: String,

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
      index: true,
    },

    status: {
      type: String,
      enum: ["not started", "in progress", "completed"],
      default: "not started",
      index: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    budget: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Project = mongoose.model("Project", projectSchema);
export default Project;