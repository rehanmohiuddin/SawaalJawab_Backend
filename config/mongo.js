const mongoose = require("mongoose");

async function connectMongo() {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB CONNECTED");
    })
    .catch(console.log("DB NOT CONNECTED"));
}
module.exports = {
  connectMongo,
};
