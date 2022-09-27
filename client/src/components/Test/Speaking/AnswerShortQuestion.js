/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Slider, Button, IconButton, Container, alertClasses
} from '@mui/material';
import useCountDownTime from '../../../hooks/useCountDownTime';
import useCountTime from '../../../hooks/useCountTime';
import HtmlContent from '../../HtmlContent';
import './repeatSentenceStyle.css';
import axios from '../../../utils/axios';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';

import Footer from '../Footer';

import VolumeUp from '@mui/icons-material/VolumeUp';
import ConfirmBox from '../../ConfirmBox';
import { waitAndGetAudioBlob } from '../../../pages/Testing'

const Component = ({ testId, question, onPause, onNextQ }) => {
  const [demoStatus, setDemoStatus] = useState('prepare');
  const [confirm, setConfirm] = useState();
  const [currPlaying, setCurrPlaying] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [blob, setBlob] = useState();
  const [status, setStatus] = useState();

  const handleSubmit = useCallback(async (_blob) => {
    try {
      if (submitted) return;
      const fd = new FormData();
      fd.append('question', question._id);
      fd.append('audio', _blob);
      fd.append('examTestId', testId);
      await axios.post('/answer/audio', fd);
      setSubmitted(true);
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [question._id, submitted, testId]);

  const handleOnStopCount = useCallback(async () => {
    document.getElementById('stop-record').click();
    setStatus('complete');
    const _blob = await waitAndGetAudioBlob();
    await handleSubmit(_blob);
    setConfirm({
      onFinish: () => setConfirm(undefined),
      description: 'Please click "Next" to go to the next.',
      disabledCancel: true,
      confirmText: 'Next',
      confirmAction: onNextQ
    });
  }, [handleSubmit, onNextQ]);

  const { count, start, stop } = useCountTime(0, question.timeout, handleOnStopCount);

  const handleOnStopPrepareCount = useCallback(async () => {
    try {
      const demoAudio = document.getElementById('demo-audio');
      await demoAudio.play();
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, []);

  const { count: prepareCount, start: startPrepare } = useCountDownTime(question.prepareTimeout, 0, handleOnStopPrepareCount);

  useEffect(() => {
    startPrepare();
  }, []);

  const handleTimeDemoChange = useCallback(() => {
    const audio = document.getElementById('demo-audio');
    const _currPlaying = audio.currentTime / audio.duration * 100;
    setCurrPlaying((prev) => Math.max(prev, _currPlaying));
  }, []);

  const handleDemoEnded = useCallback(() => {
    setCurrPlaying(100);
    setDemoStatus('complete');
    setStatus('recording');
    document.getElementById('start-record').click();
    start();
  }, [start]);

  const handleDemoStart = useCallback(() => {
    setDemoStatus('playing');
  }, []);

  const handleNextQ = useCallback(async () => {
    try {
      if (!status) {
        setConfirm({
          description: 'You need to finish answering this question before going to the next.',
          disabledCancel: true,
          confirmText: 'OK',
          onFinish: () => setConfirm(undefined)
        })
      } else {
        setConfirm({
          onFinish: () => setConfirm(undefined),
          description: 'Are you sure if you want to finish answering this question and go to the next.',
          confirmAction: async () => {
            try {
              document.getElementById('stop-record').click();
              const _blob = await waitAndGetAudioBlob();
              await handleSubmit(_blob);
              onNextQ();
            } catch (err) {
              console.error(err)
              alert('error')
            }
          }
        })
      }
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [handleSubmit, onNextQ, status]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      if (!blob && !status) {
        setConfirm({
          description: 'You need to finish answering this question before going to the next.',
          disabledCancel: true,
          confirmText: 'OK',
          onFinish: () => setConfirm(undefined)
        })
        return;
      }
      stop();
      document.getElementById('stop-record').click();
      const _blob = await waitAndGetAudioBlob();
      await handleSubmit(_blob);
      await onPause();
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [blob, handleSubmit, onPause, status, stop]);

  return (
    <>
      <Container maxWidth="md" style={{ paddingTop: 30, paddingLeft: 30, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography className='font-weight-500'>
          You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box style={{ border: '1.5px solid #ccc', width: 320, maxWidth: '100%' }} p={3} py={4} m={2}>
            <Typography>Current Status:</Typography>
            <Typography>
              {demoStatus === 'prepare' && `Start in ${prepareCount}s`}
              {demoStatus === 'playing' && "Playing"}
              {demoStatus === 'complete' && "Complete"}
            </Typography>
            <Box display="flex" alignItems="center" pt={2}>
              <Slider color="primary" value={currPlaying} disabled />
              <IconButton style={{ marginLeft: 20 }}>
                <VolumeUp />
              </IconButton>
              <audio src={question.question.audioUrl} onPlay={handleDemoStart} onEnded={handleDemoEnded} onTimeUpdate={handleTimeDemoChange} id="demo-audio" style={{ display: 'none' }} />
            </Box>
          </Box>
          <Box style={{ border: '1.5px solid #ccc', width: 320, maxWidth: '100%', background: '#eaf1fb' }} p={3} py={4} m={2}>
            <Typography className='font-weight-500' textAlign="center">Recorded Answer</Typography>
            <Typography>Current Status:</Typography>
            <Typography>
              {status === 'recording' && "Recording"}
              {status === 'complete' && "Complete"}
            </Typography>
            <Box display="flex" alignItems="center" pt={2}>
              <Slider color="primary" value={count / question.timeout * 100} disabled />
            
            </Box>
          </Box>
        </Box>
      </Container>
      <Footer onNextQ={handleNextQ} onSaveAndExit={handleSaveAndExit} />
      {confirm && <ConfirmBox {...confirm} />}
    </>
    //     <Box p={3}>
    //       <Typography className="guide">
    //         <Typography variant="h5">Repeat Sentence</Typography>
    // You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.
    //       </Typography>
    //       <Box py={1} />
    //       <Typography># {question.name}</Typography>
    //       <Box py={1} />
    //       <Typography color="error">
    //         {status === 'prepare' ? 'Prepare' : 'Time'}: {status === 'prepare' ? showPrepareCount : showCount}
    //       </Typography>
    //       <Box py={1} />
    //       <Box p={2} border="1px dashed #ddd" style={{ background: '#fff', position: 'relative' }} id="demo-audio-container">
    //         {showGuide && <Box position="absolute" style={{ background: '#fff', border: '1px dashed #1876d2', color: '#1876d2', padding: 8, zIndex: 1, top: -15, left: 16 }}>Click play button to start</Box>}
    //         <audio src={question.question.audioUrl} preload="auto" id="demo-audio" controls onEnded={handleEndDemoAudio} onPlay={() => setShowGuide(false)} />
    //       </Box>
    //       <Box py={1} />
    //       <Recorder status={status} setStatus={setStatus} setBlob={setBlob} progress={count / question.timeout * 100} start={startRecord} stop={stopRecord}  />
    //       <Box py={1} />
    //       <Box py={1}>
    //         <Button variant="contained" disabled={!enableSubmit} color={enableSubmit ? 'primary' : 'inherit'} onClick={handleSubmit}>Submit</Button>
    //         <Button variant="contained" color="primary" onClick={handleRedo} className="re-do">Re-do</Button>
    //       </Box>
    //     </Box>
  );
};

export default Component;
