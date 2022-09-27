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
// import Recorder, { waitAndGetAudioBlob } from '../../Recorder';
import Footer from '../Footer';

import VolumeUp from '@mui/icons-material/VolumeUp';
import ConfirmBox from '../../ConfirmBox';

import { waitAndGetAudioBlob } from '../../../pages/Testing'

const Component = ({ testId, question, onPause, onNextQ }) => {
  const [confirm, setConfirm] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('prepare');

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
    start();
    setStatus('recording');
  }, [start]);

  const { count: prepareCount, start: startPrepare } = useCountDownTime(question.prepareTimeout, 0, handleOnStopPrepareCount);

  useEffect(() => {
    startPrepare();
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
      if (!status) {
        setConfirm({
          onFinish: () => setConfirm(undefined),
          description: 'You need to finish answering this question before going to the next.',
          disabledCancel: true,
          confirmText: 'OK',
        })
        return;
      }
      document.getElementById('stop-record').click();
      const _blob = await waitAndGetAudioBlob();
      await handleSubmit(_blob);
      await onPause();
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [handleSubmit, onPause, status]);

  return (
    <>
      <Box style={{ paddingTop: 30, paddingBottom: 30, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Container maxWidth="md" style={{}}>
          <Typography className='font-weight-500'>
            Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center">

            <Box style={{ border: '1.5px solid #ccc', width: 320, maxWidth: '100%', background: '#eaf1fb' }} p={3} py={4} m={2}>
              <Typography className='font-weight-500' textAlign="center">Recorded Answer</Typography>
              <Typography>Current Status:</Typography>
              <Typography>
                {status === 'prepare' && `Recording in ${prepareCount} seconds`}
                {status === 'recording' && "Recording"}
                {status === 'complete' && "Complete"}
              </Typography>
              <Box display="flex" alignItems="center" pt={2}>
                <Slider color="primary" value={count / question.timeout * 100} disabled />
                {/* <Box display="none">
                  <Recorder status={status} setBlob={setBlob} />
                </Box> */}
              </Box>
            </Box>
            <HtmlContent content={question.question.html} />
          </Box>
        </Container>
      </Box>
      <Footer onNextQ={handleNextQ} onSaveAndExit={handleSaveAndExit} />
      {confirm && <ConfirmBox {...confirm} />}
    </>
  );
};

export default Component;
