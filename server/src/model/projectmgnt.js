import mongoose from "mongoose";
//project =  projectmanager,users, title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
const projectMgntSchema = new mongoose.Schema(
  {
     title: {
      type: String,
      required: true,
    },
    pm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    }],
    managers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    }],

    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    }],
   
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

    isArchive: {
      type: Boolean,
      default: false,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
      validate: {
        validator(value) {
          // validate only when both dates are provided
          if (!value || !this.startDate) return true;
          return value >= this.startDate;
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

const ProjectMgnt = mongoose.model("ProjectMgnt", projectMgntSchema);
export default ProjectMgnt;