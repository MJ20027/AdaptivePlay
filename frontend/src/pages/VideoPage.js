import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Hls from "hls.js";

const VideoPage = () => {
  const { id } = useParams();
  const [videoSrc, setVideoSrc] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [author, setAuthor] = useState("");
  const [masterUrl, setMasterUrl] = useState("");

  useEffect(() => {
    axios
      .get(`https://adaptiveplaywatchvideo.onrender.com/watch/video/${id}`)
      .then((response) => {
        console.log(response);
        setVideoSrc(response.data.signedUrl);
        setTitle(response.data.title);
        setDesc(response.data.desc);
        setAuthor(response.data.author);
        setMasterUrl(response.data.masterUrl);
      })
      .catch((error) => {
        console.error("There was an error fetching the video!", error);
      });
  }, [id]);

  const videoRef = useRef(null);

  const handlePlay = () => {
    const video = videoRef.current;
    if (masterUrl && Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(video);
      hls.loadSource(masterUrl);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else if (masterUrl) {
      video.src = masterUrl;
      video.play();
    } else {
      video.src = videoSrc;
      video.play();
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen mt-20" >
      <div className="flex-grow p-6 pb-16"> 
        <div className="flex justify-center">
          <h1><b>Title : {title}</b></h1>
        </div>
        <div className="flex justify-center p-3">
          <video ref={videoRef} controls width="100%" height="auto" style={{ maxWidth: "900px" }} />
        </div>
        <div className="flex justify-center py-6">
          <button onClick={handlePlay}><b>PLAY</b></button>
        </div>
        <div className="flex justify-center">
          <h1><b>About :</b> {desc}</h1>
        </div>
        <div className="flex justify-center">
          <h1><b>Creator :</b> @{author}</h1>
        </div>
      </div>
    </div>
    </>
  );
};

export default VideoPage;
