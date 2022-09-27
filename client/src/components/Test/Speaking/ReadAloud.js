/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, TextareaAutosize, Button, IconButton
} from '@mui/material';
import useCountDownTime from '../../../hooks/useCountDownTime';
import useCountTime from '../../../hooks/useCountTime';
import HtmlContent from '../../HtmlContent';
import './readAloudStyle.css';
import axios from '../../../utils/axios';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import Recorder from '../../../components/Recorder';

const Component = ({ question, reload }) => {
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [blob, setBlob] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('prepare');
  const [playDemo, setPlayDemo] = useState(false);

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

  const handleOnStopPrepareCount = useCallback(() => {
    if (status === 'prepare') startRecord();
  }, [startRecord, status]);

  const { count: prepareCount, showCount: showPrepareCount, start: startPrepare, reset: resetPrepare, stop: stopPrepare } = useCountDownTime(question.prepareTimeout, 0);

  useEffect(() => {
    if (prepareCount === 0) handleOnStopPrepareCount();
  }, [handleOnStopPrepareCount, prepareCount]);

  useEffect(() => {
    startPrepare();
  }, []);

  const handleRedo = useCallback(() => {
    startRecord();
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
    } catch (error) {
      alert('error')
    }
  }, [question._id, blob, reload]);

  const handleClickPlayDemo = useCallback(() => {
    const audio = document.getElementById('demo-audio');
    setPlayDemo(prev => {
      if (prev) {
        audio.pause(); 
        audio.currentTime = 0;
      } else audio.play();
      return !prev;
    });
  }, []);

  useEffect(() => {
    setEnableSubmit(blob);
  }, [blob]);

  return (
    <Box p={3}>
      <Typography className="guide">
        <Typography variant="h5">Read Aloud</Typography>
        Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.
      </Typography>
      <Box py={1} />
      <Typography># {question.name}</Typography>
      <Box py={1} />
      <Typography color="error">
        {status === 'prepare' ? 'Prepare' : 'Time'}: {status === 'prepare' ? showPrepareCount : showCount}
      </Typography>
      <Box py={1} />
      <Box p={2} border="1px dashed #ddd" position="relative" style={{ background: '#fff' }}>
        <HtmlContent content={question.question.html} />
        <audio src={question.question.audioUrl} style={{ display: 'none' }} id="demo-audio" />
        <IconButton color="primary" onClick={handleClickPlayDemo} style={{ position: 'absolute', right: 10, bottom: 10 }}>
          {playDemo && <VolumeUpIcon />}
          {!playDemo && <VolumeUpOutlinedIcon />}
        </IconButton>
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
