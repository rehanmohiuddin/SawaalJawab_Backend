const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  quizAttempted: [
    {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
    },
  ],
  confirmed: {
    type: Boolean,
    default: false,
  },
  skills: [String],
  github: { type: String },
  linkedIn: { type: String },
});

module.exports = {
  User: mongoose.model("User", UserSchema),
};
