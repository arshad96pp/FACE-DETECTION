import { useRef, useEffect, useState } from 'react';
import * as faceapi from "face-api.js";
import Happy from '../images/hap.jpeg';
import Sad from '../images/sa.jpeg';
import Nature from '../images/n.jpeg';
import Surp from '../images/su.jpeg';
import An from '../images/an.jpeg';

function Face() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [faceData, setFaceData] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [expressionImages, setExpressionImages] = useState({
    happy: Happy,
    sad: Sad,
    neutral: Nature,
    surprised: Surp,
    angry: An,
  });

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

  const getExpressionImage = (expressions) => {
    // Find the expression with the highest probability
    const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
    // Use the dominant expression to retrieve the corresponding image
    return expressionImages[dominantExpression] ;
  };

  return (
    <div className="app">
      <h1>AI FACE DETECTION</h1>
      {isVideoOpen ? (
        <div>
          <div className='app__video'>
            <video ref={videoRef} autoPlay width={480} height={360}></video>
            <canvas ref={canvasRef} className='app__canvas' />
          </div>
          <div>
            
            {/* {faceData.map((face, index) => (
              <div key={index}>
                <h2>Face {index + 1}</h2>
                <p>Gender: {face.gender}</p>
                <p>Age: {face.age}</p>
                <p>Expressions: {JSON.stringify(face.expressions)}</p>
                <img src={getExpressionImage(face.expressions)} alt="Expression" />
                {console.log(getExpressionImage(face.expressions))}
              </div>
            ))} */}

          </div>
          <button onClick={stopVideo}>Close Video</button>
        </div>
      ) : (
        <button onClick={handleOpenVideo}>Open Video</button>
      )}
    </div>
  );
}

export default Face;
