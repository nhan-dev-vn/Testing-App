import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextareaAutosize, Button
} from '@mui/material';
import useCountTime from '../../hooks/useCountTime';
import useCountDownTime from '../../hooks/useCountDownTime';
import axios from '../../utils/axios';
import './summarizeSpokenTextStyle.css';

const Component = ({ question, reload }) => {
  const [status, setStatus] = useState('prepare');
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstPlayDemo, setFirstPlayDemo] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [text, setText] = useState();

  const { count, showCount, start, reset, stop } = useCountTime(0, question.timeout);

  const handleStopPrepareCount = useCallback(async () => {
    try {
      document.getElementById('demo-audio-container').click();
      const demoAudio = document.getElementById('demo-audio');
      await demoAudio.play();
    } catch (error) {
      setShowGuide(true);
    }
  }, []);

  const { count: prepareCount, showCount: showPrepareCount, start: startPrepare, reset: resetPrepare, stop: stopPrepare } = useCountDownTime(question.prepareTimeout, 0, handleStopPrepareCount);

  useEffect(() => {
    startPrepare();
  }, []);

  const handlePlayDemoAudio = useCallback(() => {
    if (firstPlayDemo) {
      start();
      setStatus('testing');
      setFirstPlayDemo(false);
      setShowGuide(false);
    }
  }, [firstPlayDemo, start]);

  const handleChangeText = useCallback(e => {
    setText(e.target.value);
    setEnableSubmit(e.target.value)
  }, []);

  const resetAudio = useCallback(async () => {
    const demoAudio = document.getElementById('demo-audio');
    await demoAudio.pause();
    demoAudio.currentTime = 0;
  }, []);

  const handleRedo = useCallback(() => {
    setText('');
    setStatus('prepare');
    setSubmitted(false);
    setEnableSubmit(false);
    setFirstPlayDemo(true);
    reset();
    resetPrepare();
    startPrepare();
    resetAudio();
  }, [reset, resetAudio, resetPrepare, startPrepare]);

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        text: text?.trim()
      });
      setSubmitted(true);
      setEnableSubmit(false);
      stop();
      reload();
      resetAudio();
    } catch (error) {
      alert('error')
    }
  }, [question._id, text, stop, reload, resetAudio]);

  return (
    <Box p={3}>
      <Typography className="guide">
        <Typography variant="h5">Write From Dictation</Typography>
        You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.
      </Typography>
      <Box py={1} />
      <Typography># {question.name}</Typography>
      <Box py={1} />
      <Typography color="error">
        {status === 'prepare' ? 'Prepare' : 'Time'}: {status === 'prepare' ? showPrepareCount : showCount}
      </Typography>
      <Box py={1} />
      <Box p={2} border="1px dashed #ddd" style={{ background: '#fff', position: 'relative' }} id="demo-audio-container">
        {showGuide && <Box position="absolute" style={{ background: '#fff', border: '1px dashed #1876d2', color: '#1876d2', padding: 8, zIndex: 1, top: -15, left: 16 }}>Click play button to start</Box>}
        <audio src={question.question.audioUrl} preload="auto" id="demo-audio" controls onPlay={handlePlayDemoAudio} />
      </Box>
      <Box py={1} />
      <Box position='relative'>
        <TextareaAutosize
          minRows={10}
          style={{ width: '100%' }}
          value={text}
          onChange={handleChangeText}
          disabled={submitted || count === question.timeout}
        />
        <Box position="absolute" zIndex={submitted || count === question.timeout ? 1 : -1} display="flex" width="100%" height="100%" alignItems="center" justifyContent="center" top={0} left={0}>
          <Button variant="contained" color="primary" onClick={handleRedo} className="">Re-do</Button>
        </Box>
      </Box>
      <Box py={1}>
        <Button variant="contained" disabled={!enableSubmit} color={enableSubmit ? 'primary' : 'inherit'} onClick={handleSubmit}>Submit</Button>
        <Button variant="contained" color="primary" onClick={handleRedo} className="re-do">Re-do</Button>
      </Box>
    </Box>
  );
}

export default Component;
