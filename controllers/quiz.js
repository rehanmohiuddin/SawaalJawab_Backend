const { sendErrorResponse } = require("../config/apiUtil");
const { Quiz, Solutions, Submissions } = require("../models/quiz");
const Upload = require("../Config/Upload");
const streamifier = require("streamifier");
const { default: mongoose } = require("mongoose");

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = Upload.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createQuiz = async (req, res) => {
  try {
    const {
      title,
      deadline,
      questions,
      uid,
      cover,
      maxScore,
      solutions,
      category,
    } = req.body;
    const _quiz = {
      title: title,
      deadline: deadline,
      quizCreator: uid,
      maxScore: maxScore,
      questions: questions,
      category: category,
    };
    if (req.files) {
      const files = req.files;
      for (let i in files) {
        const fileName = files[i].originalname.split("-")[0];
        const resultObj = await streamUpload(files[i].buffer);
        if (fileName === "cover") _quiz.coverImg = resultObj;
        else {
          questions[parseInt(fileName)] = resultObj;
        }
      }
    }
    const quiz = new Quiz(_quiz);
    const quizSaved = await quiz.save();
    const correctSolutions = [];
    for (let i in quizSaved.questions) {
      correctSolutions.push({
        question: quizSaved.questions[i]._id,
        solution: solutions[i],
        marks: quizSaved.questions[i].marks,
      });
    }
    const solutionsToSave = new Solutions({
      quiz: quizSaved._id,
      solutions: correctSolutions,
    });
    await solutionsToSave.save();
    res.status(200).send({
      message: quiz,
    });
  } catch (e) {
    console.log(e);
    sendErrorResponse(res, e);
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quiz_id, answers, user_id } = req.body;
    const quiz = await Quiz.findOne({ _id: quiz_id });
    const sumbitted = await Submissions.findOne({ submittedBy: user_id });
    if (sumbitted.submittedBy.equals(user_id) && sumbitted.quiz.equals(quiz_id))
      sendErrorResponse(res, "Already Submitted", 200);
    else if (quiz.deadline && new Date() > new Date(quiz.deadline))
      sendErrorResponse(
        res,
        "This Quiz Is No Longer Accepting The Solutions Now",
        200
      );
    else {
      let totalScore = 0,
        totalPercentage = 0;

      const solution = await Solutions.findOne({ quiz: quiz_id });
      for (let i in answers) {
        const actualQuestion = solution.solutions[i];
        if (
          actualQuestion.question.equals(answers[i].question) &&
          answers[i].answer === actualQuestion.solution
        ) {
          totalScore = totalScore + actualQuestion.marks;
        }
      }
      totalPercentage = (totalScore / quiz.maxScore) * 100;
      const submission = new Submissions({
        quiz: quiz_id,
        answers: answers,
        totalScore: totalScore,
        totalPercentage: totalPercentage + "%",
        submittedBy: user_id,
      });
      await submission.save();
      res.status(200).send({
        message: {
          totalScore: totalScore,
          totalPercentage: totalPercentage + "%",
          quiz_id: quiz_id,
          maxScore: quiz.maxScore,
        },
      });
    }
  } catch (e) {
    console.log(e);
    sendErrorResponse(res, e);
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { user_id } = req.query;
    const submissions = await Submissions.find({ submittedBy: user_id });
    res.send({
      message: submissions,
    });
  } catch (e) {
    console.log(e);
    sendErrorResponse(res, e);
  }
};

const getCreatedQuizes = async (req, res) => {
  try {
    const { user_id } = req.query;
    const Quizes = await Quiz.find({ quizCreator: user_id });
    res.send({
      message: Quizes,
    });
  } catch (e) {
    console.log(e);
    sendErrorResponse(res, e);
  }
};

const getSubmissionsForQuiz = async (req, res) => {
  try {
    const { user_id, quiz_id } = req.query;
    const quiz = await Quiz.findOne({ _id: quiz_id });
    if (!quiz.quizCreator.equals(user_id))
      sendErrorResponse(res, "UnAuthorized", 403);
    else {
      const submissions = await Submissions.find({
        quiz: quiz_id,
      }).populate("submittedBy", "firstName lastName");
      res.send({
        message: submissions,
      });
    }
  } catch (e) {
    console.log(e);
    sendErrorResponse(res, e);
  }
};

const getQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.query;
    const quiz = await Quiz.findOne({ _id: quiz_id });
    res.status(200).send({
      message: quiz,
    });
  } catch (e) {
    sendErrorResponse(res, e);
  }
};

const getQuizByCategory = async () => {
  try {
    const { categoryType } = req.query;
    const quizes = await Quiz.find({ category: categoryType });
    res.status(200).send({
      message: quizes,
    });
  } catch (e) {
    sendErrorResponse(res, e);
  }
};

module.exports = {
  createQuiz: createQuiz,
  submitQuiz: submitQuiz,
  getSubmissions: getSubmissions,
  getCreatedQuizes: getCreatedQuizes,
  getSubmissionsForQuiz: getSubmissionsForQuiz,
  getQuiz: getQuiz,
  getQuizByCategory: getQuizByCategory,
};
