import React, { useState } from "react";
import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();


const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!title || !author || !description || !selectedFile) {
      alert("All fields are required fields.");
      return;
    }

    try {


      // section 1

      setUploading(true);
      const formData = new FormData();
      formData.append("filename", selectedFile.name);
      console.log(formData);

      // port 8080 for upload

      const initializeRes = await axios.post(
        "https://adaptiveplayuploadservice.onrender.com/upload/initialize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { uploadId } = initializeRes.data;
      console.log("Upload id is ", uploadId);

      //section 2

      const chunkSize = 5 * 1024 * 1024; 
      const totalChunks = Math.ceil(selectedFile.size / chunkSize);

      let start = 0;
      const uploadPromises = [];

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunk = selectedFile.slice(start, start + chunkSize);
        start += chunkSize;
        const chunkFormData = new FormData();
        chunkFormData.append("filename", selectedFile.name);
        chunkFormData.append("chunk", chunk);
        chunkFormData.append("totalChunks", totalChunks);
        chunkFormData.append("chunkIndex", chunkIndex);
        chunkFormData.append("uploadId", uploadId);


        // port 8080 for upload

        const uploadPromise = axios.post(
          "https://adaptiveplayuploadservice.onrender.com/upload",
          chunkFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      //section 3
      // port 8080 for upload
      const completeRes = await axios.post(
       "https://adaptiveplayuploadservice.onrender.com/upload/complete",
        {
          filename: selectedFile.name,
          totalChunks: totalChunks,
          uploadId: uploadId,
          title: title,
          description: description,
          author: author,
        }
      );

      
      
      // transcoder
      if (window.location.origin === "http://localhost:3000"){
      const formVideo = new FormData();
      formVideo.append("file", selectedFile, selectedFile.name);
      formVideo.append("title", title);
      formVideo.append("author", author);
      formVideo.append("description", description);

      const transcodeRes = await axios.post(
        "http://localhost:8086/upload",
        formVideo,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          
        }
      );
      console.log(transcodeRes);
    }


      setUploading(false);
      alert(" video uploaded sucessfully");


    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  
  return (
    <div className="container mx-auto max-w-lg p-10 my-4">
      <div className="flex my-6 justify-center">
        <h1 className="text-3xl">
          {" "}
          <b>Upload Video </b>
        </h1>
      </div>
      <form encType="multipart/form-data">
        <div className="mb-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-3 py-2 w-full block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 w-full block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="px-3 py-2 w-full block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="mb-4">
          <input
            type="file"
            name="file"
            required
            onChange={handleFileChange}
            className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex  justify-center">
          {!uploading && <button
            type="button"
            onClick={handleUpload}
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Upload
          </button>}
          {uploading && <button
            type="button"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Uploading ...
          </button>}
          
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
