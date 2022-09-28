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
  const [confirm, setConfirm] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState();

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        text: text?.trim(),
        examTestId: testId
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [question._id, testId, text]);

  const handleOnStopCount = useCallback(async () => {
    handleSubmit();
    setConfirm({
      onFinish: () => setConfirm(undefined),
      description: 'Please click "Next" to go to the next.',
      disabledCancel: true,
      confirmText: 'Next',
      confirmAction: onNextQ
    });
  }, [handleSubmit, onNextQ]);

  const { count, showCount, start, reset, stop } = useCountDownTime(question.timeout, 0, handleOnStopCount);

  useEffect(() => {
    start();
  }, []);

  const handleChangeText = useCallback(e => {
    setText(e.target.value);
  }, []);

  const handleNextQ = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [handleSubmit, onNextQ]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      handleSubmit();
      onPause();
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [handleSubmit, onPause]);

  return (
    <>
      <Box style={{ paddingTop: 30, paddingBottom: 30, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Container maxWidth="md" style={{ margin: 0 }}>
          <Typography className='font-weight-500'>
            {question.guide}
          </Typography>
          <HtmlContent content={question.question.html} />
          <Typography color="error">
            Remain: {showCount}
          </Typography>
          <TextareaAutosize
            minRows={10}
            style={{ width: '100%' }}
            value={text}
            onChange={handleChangeText}
            disabled={submitted}
          />
        </Container>
      </Box>
      <Footer onNextQ={handleNextQ} onSaveAndExit={handleSaveAndExit} />
      {confirm && <ConfirmBox {...confirm} />}
    </>
  );
};

export default Component;
