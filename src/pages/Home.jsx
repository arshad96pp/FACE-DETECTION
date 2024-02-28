import React, { useEffect, useState, useRef } from 'react'
import KeyboardAltRoundedIcon from '@mui/icons-material/KeyboardAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import * as faceapi from "face-api.js";
import axios from 'axios';
import AudioPlayer from 'react-audio-player';
import SendIcon from '@mui/icons-material/Send';
import { TypeAnimation } from 'react-type-animation';

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import Lottie from 'react-lottie';
import animationData from './speaking.json';





function Home() {
  const [typeValue, setTypeValue] = useState('')
  const [micOne, setMicOne] = useState(false)

  const [apiData, setApiData] = useState([])


  // store chat data
  const [storServerData, setStorServerData] = useState([])




  // face detection functions
  const videoRef = useRef();
  const canvasRef = useRef();
  const [faceData, setFaceData] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false)
  // const [expressionImages, setExpressionImages] = useState({
  //   happy: Happy,
  //   sad: Sad,
  //   neutral: Nature,
  //   surprised: Surp,
  //   angry: An,
  // });



  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  // focus scroll
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [typeValue, storServerData]);


  const inputRef = useRef(null);

  // Function to handle button click and focus the input field
  const handleButtonClick = () => {
    // Check if the input ref is defined before focusing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };



  // face detection functions


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

    //  new code
    let intervalId;

    intervalId = setInterval(async () => {
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

      // Check if faces are detected
      if (resizedDetections.length > 0) {
        // Stop the camera and clear interval
        stopVideo();
        clearInterval(intervalId);
      }

    }, 1000);
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
    if (micOne === false) {
      SpeechRecognition.startListening({ continuous: true });
      setMicOne(true)
      handleOpenVideo()
    } else {
      SpeechRecognition.stopListening();
      setTypeValue('')
      setMicOne(false)
      resetTranscript()
      stopVideo()
    }

  }



  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }










  const result_text = typeValue || transcript

  const handleSendData = async () => {
    const flattenedData = faceData.map((face, index) => ({
      gender: face.gender,
      age: face.age,
      expressions: JSON.stringify(face.expressions),
    }));

    if (typeValue.trim() === '' && transcript.trim() === '') {

    } else {
      try {
        console.log(flattenedData);
        setLoading(true)
        const response = await axios.get(
          'https://project.trogon.info/emotech/chat.php',
          {
            params: {
              search_query: result_text,
              face_Detection: flattenedData,
            },
          }
        );

        setApiData(response?.data?.data || [])

        const newData = {
          typingValue: typeValue || transcript,
          serverData: response?.data?.data?.result_text
        };

        setStorServerData((priv) => [...priv, newData])

        setLoading(false)

        SpeechRecognition.stopListening();
        setTypeValue('')
        setMicOne(false)
        resetTranscript()
        stopVideo()




      } catch (error) {
        console.log(error);
        setLoading(false)
      }
    }


  }








  return (
    <div className='home-page' >
      <div className="video-section" style={{ backgroundImage: `url("https://images7.alphacoders.com/856/thumb-1920-856890.png")` }}>

        <div>
        </div>
     
        <>
          <video ref={videoRef} autoPlay width={480} height={360} style={{ display: 'none', position: 'absolute' }} ></video>
          <canvas ref={canvasRef} className='app__canvas' style={{ display: 'none', position: 'absolute' }} />



          <div className="voice-contants">
            {apiData?.length === 0 ? "" : (
              <div className='voice-item'>
                <AudioPlayer
                  src={apiData?.result_audio}
                  autoPlay={true}
                  controls
                  style={{ display: 'none' }}
                />
              </div>
            )}


            <div className="voice-top">

              {storServerData?.map((item, index) => (
                <>
                  <div className="message_sender">
                    {item?.typingValue}
                  </div>



                  <div className="message_reciver">

                    <span>
                      <Lottie style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} options={defaultOptions} width={'30px'} />

                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} options={defaultOptions} width={'30px'}>
                      <TypeAnimation
                        
                        sequence={[
                          item?.serverData,
                          1000

                        ]}
                      />
                    </span>
                  </div>

                  <div ref={messageEndRef} />
                </>
              ))}




            </div>
            <div className="voice-bottom">
              <input className='type' placeholder='Type' ref={inputRef} value={typeValue || transcript} onChange={(e) => setTypeValue(e.target.value)} />

            </div>

          </div>


          <div>

          </div>
        </>
        {/* )} */}


      </div>





      <div className="mice-section">

        <div className="center-item">
          <div className="keyboard" onClick={handleButtonClick}><span>
            <KeyboardAltRoundedIcon />
          </span>
          </div>
          <div className="mice" onClick={handleStart}>
            <span ><MicRoundedIcon /></span>
            <div className={`${micOne && 'a'}`}>
            </div>
            <div className={`${micOne && 'b'}`}>
            </div>

          </div>
          {/* <div className="close" onClick={handleStop}><span><CloseRoundedIcon /></span></div> */}

          <div className="close" onClick={handleSendData}><span><SendIcon /></span></div>

        </div>




      </div>
    </div>
  )
}

export default Home