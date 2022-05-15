const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  options: [String],
  media: Object,
  important: {
    type: Boolean,
    default: false,
  },
  marks: {
    type: Number,
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  coverImg: {
    type: Object,
  },
  category: {
    type: String,
    default: "others",
  },
  questions: [
    {
      questionId: {
        type: Schema.ObjectId,
      },
      name: { type: String, required: true },
      options: [String],
      media: Object,
      important: {
        type: Boolean,
        default: false,
      },
      marks: {
        type: Number,
      },
    },
  ],
  maxScore: { type: Number, required: true },
  submissions: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      submission: {
        type: Schema.Types.ObjectId,
        ref: "Submissions",
      },
    },
  ],
  deadline: {
    type: Date,
    default: null,
  },
  scheduled: {
    bool: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
    },
  },
  quizCreator: {
    type: Schema.ObjectId,
    ref: "User",
  },
});

const solutionSchema = new mongoose.Schema({
  quiz: {
    type: Schema.ObjectId,
    ref: "Quiz",
  },
  solutions: [
    {
      question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
      solution: String,
      marks: Number,
    },
  ],
});

const submissionSchema = new mongoose.Schema({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
  },
  answers: [
    {
      question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
      answer: String,
    },
  ],
  timestamp: {
    type: Date,
    default: new Date().toISOString(),
  },
  totalScore: Number,
  totalPercentage: String,
  submittedBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = {
  Quiz: mongoose.model("Quiz", quizSchema),
  Question: mongoose.model("Question", quizSchema),
  Solutions: mongoose.model("Solutions", solutionSchema),
  Submissions: mongoose.model("Submissions", submissionSchema),
};
