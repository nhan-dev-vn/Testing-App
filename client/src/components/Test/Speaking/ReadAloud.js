/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Slider, Button, IconButton, Container, alertClasses
} from '@mui/material';
import useCountDownTime from '../../../hooks/useCountDownTime';
import useCountTime from '../../../hooks/useCountTime';
import HtmlContent from '../../HtmlContent';
import './style.css';
import axios from '../../../utils/axios';
import Footer from '../Footer';
import ConfirmBox from '../../ConfirmBox';

import { useDispatch, useSelector } from 'react-redux';
import { actions as audioAct } from '../../../redux/audioSlice';

const Component = ({ testId, question, onPause, onNextQ }) => {
  const [confirm, setConfirm] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('prepare');
  const dispatch = useDispatch();
  const { blob } = useSelector(state => state.audio);
  const [callbackSubmit, setCallbackSubmit] = useState('');

  const handleSubmit = useCallback(async (_blob) => {
    try {
      if (submitted || !_blob) return;
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

  useEffect(() => {
    if (blob) {
      handleSubmit(blob);
      dispatch(audioAct.setAudioBlob())
      if (callbackSubmit === 'nextQ') onNextQ();
      if (callbackSubmit === 'exit') onPause();
      if (callbackSubmit === 'autoNextQ')
        setConfirm({
          onFinish: () => setConfirm(undefined),
          description: 'Please click "Next" to go to the next.',
          disabledCancel: true,
          confirmText: 'Next',
          confirmAction: onNextQ
        });
    }
  }, [blob, callbackSubmit, dispatch, handleSubmit, onNextQ, onPause]);

  const handleOnStopCount = useCallback(async () => {
    document.getElementById('stop-record').click();
    setStatus('complete');
    setCallbackSubmit('autoNextQ');
  }, []);

  const { count, start, stop } = useCountTime(0, question.timeout, handleOnStopCount);

  const handleOnStopPrepareCount = useCallback(async () => {
    document.getElementById('start-record').click();
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
              stop(true);
              setCallbackSubmit('nextQ');
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
  }, [status, stop]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      document.getElementById('stop-record').click();
      stop(true);
      if (status === 'recording' || status === 'complete') setCallbackSubmit('exit');
      else onPause();
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [onPause, status, stop]);

  return (
    <>
      <Box style={{ paddingTop: 30, paddingBottom: 30, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Container maxWidth="md" style={{}}>
          <Typography className='font-weight-500'>
            {question.guide}
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
