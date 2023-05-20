import React, { useRef, useState } from "react";


function Home() {
  const videoRef = useRef();
  const [link, setLink] = useState('');

  const recordHandler = async () => {
    let stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    const mediaConfig = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
      ? "video/webm; codecs=vp9"
      : "video/webm"
    let mediaRecorder = new MediaRecorder(stream, {
      mimeType: mediaConfig
    })

    let chunks = []
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = (e) => uploadHandler(new Blob(chunks, { type: 'video/webm' }));


    //we have to start the recorder manually
    mediaRecorder.start();
  }

  function readFile(file) {
    console.log("readFile()=>", file);
    return new Promise(function (resolve, reject) {
      let fr = new FileReader();

      fr.onload = function () {
        resolve(fr.result);
      };

      fr.onerror = function () {
        reject(fr);
      };

      fr.readAsDataURL(file);
    });
  }

  const uploadHandler = async (blob) => {
    let video = videoRef.current;
    await readFile(blob).then((encoded_file) => {
      try {
        fetch('/api/cloudinary', {
          method: 'POST',
          body: JSON.stringify({ data: encoded_file }),
          headers: { 'Content-Type': 'application/json' },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data.data)
            setLink(data.data)
          });
      } catch (error) {
        console.error(error);
      }
    });
  }
  return (
    <div>
      <img 
        src="videocam.png" 
        alt="videocam"/>
      <h1 className='elegantshadow'>Screen  Recorder</h1>
      
      <video ref={videoRef} className="video" width="600px" src={link && link} controls></video><br />
      <button onClick={recordHandler} className="record-btn">record</button>
      <p >" Please wait for your video link, it might take some time to upload to the cloud "</p><br/>
      {link && <a href={link}>Link</a>}
    </div>
  )
} export default Home;