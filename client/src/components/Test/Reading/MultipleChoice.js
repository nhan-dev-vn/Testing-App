/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Radio, RadioGroup, FormControlLabel, Button, Container, Checkbox
} from '@mui/material';
import useCountDownTime from '../../../hooks/useCountDownTime';
import useCountTime from '../../../hooks/useCountTime';
import HtmlContent from '../../HtmlContent';
import './repeatSentenceStyle.css';
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
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const handleChangeOption = useCallback(value => {
    const newSelected = selectedOptionIds.includes(value) ? selectedOptionIds.filter(o => o !== value) : selectedOptionIds.concat(value)
    setSelectedOptionIds(prev => newSelected);
  }, [selectedOptionIds]);

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        choices: selectedOptionIds,
        examTestId: testId
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [question._id, selectedOptionIds, testId]);

  const handleOnStopCount = useCallback(async () => {
    await handleSubmit();
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
            await handleSubmit();
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
      setConfirm({
        description: 'Are you sure to save and exit test?',
        onFinish: () => setConfirm(undefined),
        confirmAction: async () => {
          await handleSubmit();
          onPause();
        }
      })
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [handleSubmit, onPause]);

  return (
    <>
      <Container maxWidth="md" style={{ paddingTop: 30, paddingBottom: 30, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography className='font-weight-500'>
          Read the text and answer the question by selecting all the correct responses. More than one response is correct.
        </Typography>
        <HtmlContent content={question.question.html} />
        <Typography color="error">
          Remain: {showCount}
        </Typography>
        {question.options.map((option, idx) => (
          <FormControlLabel
            data-value={option._id}
            className="option-container"
            classes={{ root: 'option-container' }}
            control={<Checkbox disabled={submitted || count === question.time} checked={selectedOptionIds.includes(option._id)} onChange={() => handleChangeOption(option._id)} />}
            label={
              <div className='d-flex align-items-center'>
                <span className='font-weight-500 option-idx'>{LABELS[idx]}</span>
                <HtmlContent className="option-text" content={option.html} />
              </div>
            } />
        ))}
      </Container>
      <Footer onNextQ={handleNextQ} onSaveAndExit={handleSaveAndExit} />
      {confirm && <ConfirmBox {...confirm} />}
    </>
  );
};

export default Component;
