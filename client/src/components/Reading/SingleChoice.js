import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Radio, RadioGroup, FormControlLabel, Button
} from '@mui/material';
import useCountTime from '../../hooks/useCountTime';
import axios from '../../utils/axios';
import './singleChoiceStyle.css';
import HtmlContent from '../../components/HtmlContent';
import { LABELS } from '../../components/Question';

const Component = ({ question, reload }) => {
  const correctOptionId = question.options.find(o => o.value === 'true')?._id
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState();
  const [reRenderRadio, setReRenderRadio] = useState(1);
  const { count, showCount, start, reset, stop } = useCountTime(0, question.timeout);

  
  useEffect(() => {
    start();
  }, []);

  const handleChangeOption = useCallback(e => {
    setSelectedOptionId(e.target.value);
    setEnableSubmit(e.target.value)
  }, []);

  const handleRedo = useCallback(() => {
    setSelectedOptionId('');
    setSubmitted(false);
    setEnableSubmit(false);
    reset();
    start();
    setReRenderRadio(prev => prev + 1);
  }, [reset, start]);

  const handleSubmit = useCallback(async () => {
    try {
      if (!selectedOptionId) {
        alert('Choose answer!');
        return;
      }
      await axios.post('/answer', {
        question: question._id,
        choices: [selectedOptionId]
      });
      setSubmitted(true);
      setEnableSubmit(false);
      stop();
      reload();
    } catch (error) {
      alert('error')
    }
  }, [question._id, selectedOptionId, stop, reload]);

  return (
    <Box p={3}>
      <Typography className="guide">
        <Typography variant="h5">Single Choice</Typography>
        Listen to the recording and answer the single-choice question by selectingthe correct response . Only one response is correct.
      </Typography>
      <Box py={1} />
      <Typography># {question.name}</Typography>
      <Box py={1} />
      <Typography color="error">
        Time: {showCount}
      </Typography>
      <Box py={1} />
      <HtmlContent content={question.question.html} />
      <Box position='relative'>
        {/* <TextareaAutosize
          minRows={10}
          style={{ width: '100%' }}
          value={text}
          onChange={handleChangeText}
          disabled={submitted || count === question.timeout}
        /> */}
        {reRenderRadio && (<RadioGroup
          name={question._id}
          key={reRenderRadio}
          disabled={submitted || count === question.timeout}
          value={selectedOptionId}
        >
          {question.options.map((option, idx) => (
            <FormControlLabel
              control={<Radio onClick={handleChangeOption} />}
              value={option._id}
              disabled={submitted || count === question.timeout}
              className="option-container"
              classes={{ root: 'option-container' }}
              label={(
                <div className={`${submitted ? (selectedOptionId === correctOptionId && correctOptionId === option._id ? 'correctOption' : option._id === correctOptionId ? 'trueOption' : option._id === selectedOptionId ? 'wrongOption' : '') : option._id === selectedOptionId ? 'selectedOption' : ''} d-flex align-items-center`}>
                  <span className='font-weight-500 option-idx'>{LABELS[idx]}</span>
                  <HtmlContent className="option-text" content={option.html} />
                </div>
              )}
            />
          ))}
        </RadioGroup>
        )}
      </Box>
      <Box py={1}>
        <Button variant="contained" disabled={!enableSubmit} color={enableSubmit ? 'primary' : 'inherit'} onClick={handleSubmit}>Submit</Button>
        <Button variant="contained" color="primary" onClick={handleRedo} className="re-do">Re-do</Button>
      </Box>
    </Box>
  );
}

export default Component;
