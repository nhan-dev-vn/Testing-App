/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, TextareaAutosize, Button, IconButton
} from '@mui/material';
import useCountDownTime from '../../hooks/useCountDownTime';
import useCountTime from '../../hooks/useCountTime';
import HtmlContent from '../HtmlContent';
import './repeatSentenceStyle.css';
import axios from '../../utils/axios';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import Recorder from '../../components/Recorder';

const Component = ({ question, reload }) => {
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [blob, setBlob] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('prepare');
  const [firstPlayDemo, setFirstPlayDemo] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const handleOnStopCount = useCallback(() => {
    setTimeout(() => {
      document.getElementById('stop-record').click();
      setStatus('stopped');
    }, 1000);
  }, []);

  const { isCounting, count, showCount, start, reset, stop } = useCountTime(0, question.timeout, handleOnStopCount);

  const startRecord = useCallback(() => {
    setSubmitted(false);
    document.getElementById('start-record').click();
    start();
    setStatus('recording');
  }, [start]);

  const stopRecord = useCallback(() => {
    document.getElementById('stop-record').click();
    stop();
    setStatus('stopped');
  }, [stop]);

  const handleOnStopPrepareCount = useCallback(async () => {
    try {
      if (status === 'prepare') {
        document.getElementById('demo-audio-container').click();
        const demoAudio = document.getElementById('demo-audio');
        await demoAudio.play();
      }
    } catch (error) {
      setShowGuide(true);
    }
    
  }, [status]);

  const { count: prepareCount, showCount: showPrepareCount, start: startPrepare, reset: resetPrepare, stop: stopPrepare } = useCountDownTime(question.prepareTimeout, 0);

  useEffect(() => {
    if (prepareCount === 0) handleOnStopPrepareCount();
  }, [handleOnStopPrepareCount, prepareCount]);

  useEffect(() => {
    startPrepare();
  }, []);

  const resetAudio = useCallback(async () => {
    const demoAudio = document.getElementById('demo-audio');
    await demoAudio.pause();
    demoAudio.currentTime = 0;
  }, []);

  const handleRedo = useCallback(() => {
    startRecord();
    resetAudio();
  }, [startRecord]);

  const handleSubmit = useCallback(async () => {
    try {
      const fd = new FormData();
      fd.append('question', question._id);
      fd.append('audio', blob);
      await axios.post('/answer/audio', fd);
      setSubmitted(true);
      setEnableSubmit(false);
      reload();
      resetAudio()
    } catch (error) {
      alert('error')
    }
  }, [question._id, blob, reload, resetAudio]);

  useEffect(() => {
    setEnableSubmit(blob);
  }, [blob]);

  const handleEndDemoAudio = useCallback(() => {
    if (firstPlayDemo) {
      startRecord();
      setFirstPlayDemo(false);
    }
  }, [firstPlayDemo, startRecord]);

  return (
    <Box p={3}>
      <Typography className="guide">
        <Typography variant="h5">Repeat Sentence</Typography>
You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.
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
        <audio src={question.question.audioUrl} preload="auto" id="demo-audio" controls onEnded={handleEndDemoAudio} onPlay={() => setShowGuide(false)} />
      </Box>
      <Box py={1} />
      <Recorder status={status} setStatus={setStatus} setBlob={setBlob} progress={count / question.timeout * 100} start={startRecord} stop={stopRecord}  />
      <Box py={1} />
      <Box py={1}>
        <Button variant="contained" disabled={!enableSubmit} color={enableSubmit ? 'primary' : 'inherit'} onClick={handleSubmit}>Submit</Button>
        <Button variant="contained" color="primary" onClick={handleRedo} className="re-do">Re-do</Button>
      </Box>
    </Box>
  );
};

export default Component;
