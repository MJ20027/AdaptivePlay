const AWS = require("aws-sdk");
const video = require("../model/Video");

const initializeUpload = async (req, res) => {
  try {
    console.log("Initialising Upload");
    const { filename } = req.body;
    console.log(filename);

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "us-east-1",
    });

    const bucketName = process.env.AWS_BUCKET;

    const createParams = {
      Bucket: bucketName,
      Key: filename,
      ContentType: "video/mp4",
    };

    const multipartParams = await s3
      .createMultipartUpload(createParams)
      .promise();
    console.log("multipartparams---- ", multipartParams);
    const uploadId = multipartParams.UploadId;

    res.status(200).json({ uploadId });
  } catch (err) {
    console.error("Error initializing upload:", err);
    res.status(500).send("Upload initialization failed");
  }
};

// Upload chunk
const uploadChunk = async (req, res) => {
  try {
    console.log("Uploading Chunk");
    const { filename, chunkIndex, uploadId } = req.body;
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "ap-south-1",
    });
    const bucketName = process.env.AWS_BUCKET;

    const partParams = {
      Bucket: bucketName,
      Key: filename,
      UploadId: uploadId,
      PartNumber: parseInt(chunkIndex) + 1,
      Body: req.file.buffer,
    };

    const data = await s3.uploadPart(partParams).promise();
    console.log("data-- ", data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error uploading chunk:", err);
    res.status(500).send("Chunk could not be uploaded");
  }
};

// Complete upload
const completeUpload = async (req, res) => {
  try {
    console.log("Completing Upload");
    const { filename, totalChunks, uploadId, title, description, author } =
      req.body;


    const uploadedParts = [];

    // Build uploadedParts array from request body
    for (let i = 0; i < totalChunks; i++) {
      uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "ap-south-1",
    });
    const bucketName = process.env.AWS_BUCKET;

    const completeParams = {
      Bucket: bucketName,
      Key: filename,
      UploadId: uploadId,
    };

    // Listing parts using promise
    const data = await s3.listParts(completeParams).promise();

    const parts = data.Parts.map((part) => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber,
    }));

    completeParams.MultipartUpload = {
      Parts: parts,
    };

    // Completing multipart upload using promise
    const uploadResult = await s3
      .completeMultipartUpload(completeParams)
      .promise();

    console.log("data-- ", uploadResult);

    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: filename,
      Expires: 60 * 60 * 60,
    });
    
    console.log(signedUrl);

    const detail = {
      title: title,
      desc: description,
      author: author,
      signedUrl: signedUrl,
    };

    const videoDetail = new video(detail);
    await videoDetail.save();    
    return res
      .status(200)
      .json({
        title: req.title,
        url: signedUrl,
        message: "Uploaded successfully!!!",
      });

  } catch (error) {
    console.log("Error completing upload :", error);
    return res.status(500).send("Upload completion failed");
  }
};

const uploadToDb = async (req, res) => {
  console.log("Adding details to DB");
  try {
    const videoDetails = req.body;
    await addVideoDetailsToDB(
      videoDetails.title,
      videoDetails.description,
      videoDetails.author,
      videoDetails.url,      
    );
    
    return res.status(200).send("success");
  } catch (error) {
    console.log("Error in adding to DB ", error);
    return res.status(400).send(error);
  }
};

module.exports = { initializeUpload, uploadChunk, completeUpload, uploadToDb };
