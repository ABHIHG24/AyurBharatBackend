const mongoose = require("mongoose");

const dbUrl = process.env.DB_URL;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDatabase = () => {
  mongoose.connect(dbUrl, connectionParams).then(() => {
    console.log("Connected to the database");
  });
};

module.exports = connectDatabase;
