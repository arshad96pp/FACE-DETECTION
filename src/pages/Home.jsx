import React, { useEffect, useState, useRef } from 'react'
import KeyboardAltRoundedIcon from '@mui/icons-material/KeyboardAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as faceapi from "face-api.js";
import axios from 'axios';



function Home() {
  const [typeValue, setTypeValue] = useState('')
  const [micOne, setMicOne] = useState(false)


  // face detection functions


  const videoRef = useRef();
  const canvasRef = useRef();
  const [faceData, setFaceData] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [stream, setStream] = useState(null);
  // const [expressionImages, setExpressionImages] = useState({
  //   happy: Happy,
  //   sad: Sad,
  //   neutral: Nature,
  //   surprised: Surp,
  //   angry: An,
  // });

  useEffect(() => {
    if (isVideoOpen) {
      startVideo();
      loadModels();
    }
  }, [isVideoOpen]);

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.ageGenderNet.loadFromUri('/models')
    ]);
    faceDetection();
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
        setStream(currentStream);
      })
      .catch((err) => {
        console.error(err)
      });
  }

  const stopVideo = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsVideoOpen(false);
  };

  const faceDetection = async () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();

      const canvas = canvasRef.current;
      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      setFaceData(resizedDetections.map(face => ({
        gender: face.gender,
        age: face.age,
        expressions: face.expressions,
        landmarks: face.landmarks,
      })));

    }, 1000)
  }

  const handleOpenVideo = () => {
    setIsVideoOpen(true);
  };

  // const getMaxExpression = expressions => {
  //   let maxExpression = null;
  //   let maxProbability = 0;

  //   for (const [expression, probability] of Object.entries(expressions)) {
  //     if (probability > maxProbability) {
  //       maxProbability = probability;
  //       maxExpression = expression;
  //     }
  //   }

  //   return maxExpression;
  // };

  console.log(faceData);




  //  this is voice message convert in to text

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!listening) {
      // SpeechRecognition.startListening({ continuous: true });
    }
  }, [listening]);

  const handleStart = () => {
    SpeechRecognition.startListening({ continuous: true });
    setMicOne(true)
    handleOpenVideo()
  }



  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleStop = () => {

      SpeechRecognition.stopListening();
      setTypeValue('')
      setMicOne(false)
      resetTranscript()
      stopVideo()
   




  };







  return (
    <div className='home-page' >
      <div className="video-section" style={{ backgroundImage: `url("https://images7.alphacoders.com/856/thumb-1920-856890.png")` }}>


        <div className="camara">
          <div className='app__video' style={{ position: 'relative' }}>
            <video ref={videoRef} autoPlay width={480} height={360} style={{ display: 'none' }}></video>
            <canvas ref={canvasRef} className='app__canvas' style={{ display: 'none' }} />
          </div>

        </div>


        <div className="voice-contants">
          <p>{micOne ? transcript : typeValue}</p>
        </div>
      </div>




      <div className="mice-section">

        <div className="center-item">
          <div className="keyboard"><span>
            <KeyboardAltRoundedIcon />
          </span>
            <input type="text" value={typeValue} onChange={(e) => setTypeValue(e.target.value)} />
          </div>
          <div className="mice" onClick={handleStart}>
            <span ><MicRoundedIcon /></span>
            <div className={`${micOne && 'a'}`}>
            </div>
            <div className={`${micOne && 'b'}`}>
            </div>

          </div>
          <div className="close" onClick={handleStop}><span><CloseRoundedIcon /></span></div>
        </div>




      </div>
    </div>
  )
}

export default Home