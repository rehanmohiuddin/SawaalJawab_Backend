const express = require("express");
const { multipleUpload } = require("../config/file-upload");
const { verifyJwt } = require("../controllers/auth");
const {
  createQuiz,
  submitQuiz,
  getSubmissions,
  getCreatedQuizes,
  getSubmissionsForQuiz,
  getQuiz,
  getQuizByCategory,
} = require("../controllers/quiz");
const router = express.Router();

router.post("/create", multipleUpload, verifyJwt, createQuiz);
router.post("/submit", verifyJwt, submitQuiz);
router.get("/submissions", verifyJwt, getSubmissions);
router.get("/created", verifyJwt, getCreatedQuizes);
router.get("/responses", verifyJwt, getSubmissionsForQuiz);
router.get("/details", verifyJwt, getQuiz);
router.get("/category", verifyJwt, getQuizByCategory);

module.exports = router;
