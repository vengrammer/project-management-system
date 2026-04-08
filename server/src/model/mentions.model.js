import mongoose from "mongoose";

const { Schema } = mongoose;

const mentionsSchema = new Schema(
  {
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      required: true,
    },
    datemention: {
      type: Date,
    },

    replies: [
      {
        message: {
          type: String,
          trim: true,
        },
        sender: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Mention = mongoose.model("Mention", mentionsSchema);
export default Mention;