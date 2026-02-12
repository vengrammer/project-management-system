import mongoose from "mongoose";
//project = title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
const projectSchema = new mongoose.Schema(
  {
    // department: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Department",
    //   required: true,
    // },

    // // Multiple users assigned to this project
    // users: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    title: {
      type: String,
    },

    description: {
      type: String,
    },

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

    department: {
      type: String,
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
    timestamps: true, // adds createdAt & updatedAt
    versionKey: false,
  },
);

const Project = mongoose.model("Project", projectSchema);
export default Project;