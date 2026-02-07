import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 500,
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
      index: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    budget: {
      type: Number,
      required: true,
      min: 0,
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