const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const cors = require("cors");
const videoRouter = require("./routes/view.route");
dotenv.config();
const app = express();
const port = process.env.PORT || 8082;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("database is connected successfully!");
  } catch (err) {
    console.log(err);
  }
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
app.use(express.json());
app.use("/watch", videoRouter);



app.listen(port, () => {
  connectDB();
  console.log(`Server is listening at ${port}`);
});
