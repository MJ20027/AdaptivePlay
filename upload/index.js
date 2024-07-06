const express = require("express");
const uploadRouter = require("./routes/upload.route");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const cors = require("cors");
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("database is connected successfully!")

    }
    catch(err){
        console.log(err)
    }
}


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*"); 
  next();
});
app.use(express.json());
app.use("/upload", uploadRouter);

app.get("/", (req, res) => {
  res.send("cloneyt");
});

app.listen(port, () => {
  connectDB();
  console.log(`Server is listening at ${port}`);
});
