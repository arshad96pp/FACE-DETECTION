import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';



const Dictaphone = () => {
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

  const handleSatar=()=>{
    SpeechRecognition.startListening({ continuous: true });

  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleStop = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={handleSatar}>Start</button>

      <button onClick={handleStop}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>

      

    </div>
  );
};

export default Dictaphone;
