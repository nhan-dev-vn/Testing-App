/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Radio, RadioGroup, FormControlLabel, Button, Container, TextareaAutosize
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
import { LABELS } from '../../Question';

const Component = ({ testId, question, onPause, onNextQ }) => {
  const [confirm, setConfirm] = useState();
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState();
  const [selectedOptionId, setSelectedOptionId] = useState();
  const handleChangeOption = useCallback(e => {
    setSelectedOptionId(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        choices: [selectedOptionId],
        examTestId: testId
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [question._id, selectedOptionId, testId]);

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
        <Container maxWidth="md">
          <Typography className='font-weight-500'>
            {question.guide}
          </Typography>
          <HtmlContent content={question.question.html} />
          <Typography color="error">
            Remain: {showCount}
          </Typography>
          <Box>
            <RadioGroup
              name={question._id}
              disabled={submitted}
              value={selectedOptionId}
            >
              {question.options.map((option, idx) => (
                <FormControlLabel
                  control={<Radio onClick={handleChangeOption} />}
                  value={option._id}
                  disabled={submitted}
                  className="option-container"
                  classes={{ root: 'option-container' }}
                  label={(
                    <div className='selectedOption d-flex align-items-center'>
                      <span className='font-weight-500 option-idx'>{LABELS[idx]}</span>
                      <HtmlContent className="option-text" content={option.html} />
                    </div>
                  )}
                />
              ))}
            </RadioGroup>
          </Box>
        </Container>
      </Box>
      <Footer onNextQ={handleNextQ} onSaveAndExit={handleSaveAndExit} />
      {confirm && <ConfirmBox {...confirm} />}
    </>
  );
};

export default Component;
