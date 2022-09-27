import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, TextareaAutosize, Button
} from '@mui/material';
import useCountDownTime from '../../hooks/useCountDownTime';
import HtmlContent from '../HtmlContent';
import './summarizeStyle.css';
import axios from '../../utils/axios';

const Component = ({ question, reload }) => {
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [text, setText] = useState();
  const [submitted, setSubmitted] = useState(false);
  const { count, showCount, start, reset, stop } = useCountDownTime(question.timeout, 0);

  useEffect(() => {
    start();
  }, []);

  const handleChangeText = useCallback(e => {
    setText(e.target.value);
    setEnableSubmit(e.target.value)
  }, []);

  const handleRedo = useCallback(() => {
    setText('');
    setSubmitted(false);
    setEnableSubmit(false);
    reset();
    start();
  }, [reset, start]);

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        text: text?.trim()
      });
      setSubmitted(true);
      setEnableSubmit(false);
      stop();
      reload();
    } catch (error) {
      alert('error')
    }
  }, [question._id, stop, text, reload]);

  return (
    <Box p={3}>
      <Typography className="guide">
        <Typography variant="h5">Summarize Written Text</Typography>
        Read the passage below and summarize it using one sentence. Type your response in the box at the bottom of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points in the passage.
      </Typography>
      <Box py={1} />
      <Typography># {question.name}</Typography>
      <Box py={1} />
      <Typography color="error">
        Remain: {showCount}
      </Typography>
      <Box py={1} />
      <HtmlContent content={question.question.html} />
      <Box position='relative'>
        <TextareaAutosize
          minRows={10}
          style={{ width: '100%' }}
          value={text}
          onChange={handleChangeText}
          disabled={submitted || !count}
        />
        <Box position="absolute" zIndex={submitted || !count ? 1 : -1} display="flex" width="100%" height="100%" alignItems="center" justifyContent="center" top={0} left={0}>
          <Button variant="contained" color="primary" onClick={handleRedo} className="">Re-do</Button>
        </Box>
      </Box>
      <Box py={1}>
        <Button variant="contained" disabled={!enableSubmit} color={enableSubmit ? 'primary' : 'inherit'} onClick={handleSubmit}>Submit</Button>
        <Button variant="contained" color="primary" onClick={handleRedo} className="re-do">Re-do</Button>
      </Box>
    </Box>
  );
};

export default Component;
