/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Slider, Button, IconButton, Container, TextareaAutosize
} from '@mui/material';
import useCountDownTime from '../../../hooks/useCountDownTime';
import useCountTime from '../../../hooks/useCountTime';
import HtmlContent from '../../HtmlContent';
import './style.css';
import axios from '../../../utils/axios';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import Recorder, { waitAndGetAudioBlob } from '../../Recorder';
import Footer from '../Footer';

import VolumeUp from '@mui/icons-material/VolumeUp';
import ConfirmBox from '../../ConfirmBox';

const Component = ({ testId, question, onPause, onNextQ }) => {
  const [demoStatus, setDemoStatus] = useState('prepare');
  const [confirm, setConfirm] = useState();
  const [currPlaying, setCurrPlaying] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [words, setWords] = useState([]);
  const [status, setStatus] = useState();

  const handleChangeWords = useCallback((word, i) => {
    setWords(prev => {
      if (prev.find(w => w.index === i)) return prev.filter(w => w.index !== i)
      return prev.concat([{ index: i, text: word?.trim() }]);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        missingWords: words,
        examTestId: testId
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [question._id, testId, words]);

  const handleOnStopCount = useCallback(async () => {
    setStatus('complete');
    handleSubmit();
    setConfirm({
      description: 'Please click "Next" to go to the next.',
      disabledCancel: true,
      confirmText: 'Next',
      confirmAction: onNextQ,
      onFinish: () => setConfirm(undefined)
    });
  }, [handleSubmit, onNextQ]);

  const { count, showCount, start, stop } = useCountDownTime(question.timeout, 0, handleOnStopCount);

  const handleOnStopPrepareCount = useCallback(async () => {
    setDemoStatus('playing');
    const audio = document.getElementById('demo-audio');
    audio.play();
  }, []);

  const { count: prepareCount, start: startPrepare, stop: stopPrepare } = useCountDownTime(question.prepareTimeout, 0, handleOnStopPrepareCount);

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
  }, []);

  const handleDemoStart = useCallback(() => {
    setDemoStatus('playing');
    start();
    setStatus('testing');
  }, [start]);

  const handleNextQ = useCallback(async () => {
    try {
      if (demoStatus !== 'complete') {
        setConfirm({
          description: 'You need to finish answering this question before going to the next.',
          disabledCancel: true,
          confirmText: 'OK',
          onFinish: () => setConfirm(undefined)
        })
      } else {
        setConfirm({
          description: 'Are you sure if you want to finish answering this question and go to the next.',
          confirmAction: async () => {
            try {
              handleSubmit();
              onNextQ();
            } catch (err) {
              console.error(err)
              alert('error')
            }
          },
          onFinish: () => setConfirm(undefined)
        })
      }
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [demoStatus, handleSubmit, onNextQ]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      onPause();
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [onPause]);

  return (
    <>
      <Box style={{ paddingTop: 30, paddingBottom: 30, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Container maxWidth="md">
          <Typography className='font-weight-500'>
            You will hear a recording. Below is a transcription of the recording. Some words in the transcription differ from what the speaker said. Please click on the words that are different.
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
            <Typography color="error" style={{ margin: '10px' }}>
              {status === 'testing' && `Remain: ${showCount}`}
              {status === 'complete' && "Complete"}
            </Typography>
            <Box width="100%">
              {question.question.text.split(' ').map((w, i) => {
                if (w === '\n') return <br />;
                if (w.includes('{{input}}')) return (
                  <span data-index={i} className='word'>
                    <input value={words.find(_w => _w.index === i)?.text} onChange={(e) => handleChangeWords(e.target.value, i)} style={{ width: 120 }} />
                    {w.replace('{{input}}', '')}
                  </span>
                )
                return (
                  <span data-index={i} className={`cursor-pointer word `}>{w}</span>
                );
              })}
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer onNextQ={handleNextQ} onSaveAndExit={handleSaveAndExit} />
      {confirm && <ConfirmBox {...confirm} />}
    </>
  );
};

export default Component;
