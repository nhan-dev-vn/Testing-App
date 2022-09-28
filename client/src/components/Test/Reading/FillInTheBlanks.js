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
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography color="error" style={{ margin: '10px' }}>
              Remain: {showCount}
            </Typography>
            <Box width="100%">
              {question.question.text.split(' ').map((w, i) => {
                if (w === '\n') return <br />;
                if (w.includes('{{select}}')) return (
                  <span data-index={i} className='word'>
                    <select value={words.find(_w => _w.index === i)?.text} onChange={(e) => handleChangeWords(e.target.value, i)} style={{ width: 120 }}>
                      <option selected hidden></option>
                      {question.missingWords.find(_w => _w.index === i).options.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    {w.replace('{{select}}', '')}
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
