const express = require("express");
const multer = require("multer");
const { s3ToS3 } = require("../controller/transcoder");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
    const { file } = req;
    console.log(req.body);

    const { title, author, description } = req.body;
    if (!file) return res.status(400).send("No file uploaded.");

    try {
        const masterUrl = await s3ToS3({ file, title, author, description });
        res.status(200).send("Video uploaded and transcoded successfully.");
    } catch (error) {
        res.status(500).send("Error during transcoding.");
    }
});

module.exports = router;
