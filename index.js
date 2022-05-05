const path = require("path");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const http = require("http");
const server = http.createServer(app);
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const AuthRoute = require("./views/auth");
const QuizRoute = require("./views/quiz");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("CONNECTED"))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/", AuthRoute);
app.use("/quiz", QuizRoute);

app.get("/", (req, res) => res.send("QUIZ API"));

server.listen(process.env.PORT, () => {
  console.log("Server Started At ", process.env.PORT);
});
