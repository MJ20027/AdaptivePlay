const express = require("express");
const multer = require("multer");
const { initializeUpload, uploadChunk, completeUpload ,uploadToDb} = require("../controllers/multipartupload.controller");

const upload = multer();

const router = express.Router();
router.post("/initialize", upload.none(), initializeUpload);
router.post("/", upload.single("chunk"), uploadChunk);
router.post("/complete", completeUpload);
router.post("/uploadToDb", uploadToDb);
module.exports = router;
