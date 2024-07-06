import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player";

const HomePage = () => {
  const [videos, setVideos] = useState([]);


  //http://localhost:8082 port 8082 for watch
  useEffect(() => {
    axios
      .get("https://adaptiveplaywatchvideo.onrender.com/watch/videos")
      .then((response) => {
        setVideos(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the videos!", error);
      });
  }, []);

  return (




    <div className="mt-24">
      <div className="flex justify-center">
        <h1>
          <b>Recent Videos </b>
        </h1>
      </div>


      <div className="flex flex-wrap justify-around pb-16">
        {videos.map((video) => (
          <Link to={`/video/${video._id}`}>
            <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 px-1 py-1 m-4" key={video._id}>
            <ReactPlayer
              url={video.signedUrl}
              controls
              className="rounded-t-lg"
              width="auto"
              height="auto"
              style={{ maxWidth: "900px" }}
            />

            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{video.title}</h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {video.desc}
              </p>
            </div>
          </div>
          </Link>


        ))}
      </div>
    </div>
  );
};

export default HomePage;

