import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Radio, Checkbox, FormControlLabel, Button
} from '@mui/material';
import useCountTime from '../../hooks/useCountTime';
import useCountDownTime from '../../hooks/useCountDownTime';
import axios from '../../utils/axios';
import './multipleChoiceStyle.css';
import HtmlContent from '../../components/HtmlContent';
import { LABELS } from '../../components/Question';

const Component = ({ question, reload }) => {
  const correctOptionIds = question.options.filter(o => o.value === 'true').map(o => o._id)
  const [status, setStatus] = useState('prepare');
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstPlayDemo, setFirstPlayDemo] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);

  const { count, showCount, start, reset, stop } = useCountTime(0, question.timeout);

  useEffect(() => {
    start();
  }, []);

  const handleChangeOption = useCallback(value => {
    const newSelected = selectedOptionIds.includes(value) ? selectedOptionIds.filter(o => o !== value) : selectedOptionIds.concat(value)
    setSelectedOptionIds(prev => newSelected);
    setEnableSubmit(newSelected.length)
  }, [selectedOptionIds]);

  const handleRedo = useCallback(() => {
    setSelectedOptionIds([]);
    setSubmitted(false);
    setEnableSubmit(false);
    setFirstPlayDemo(true);
    reset();
    start();
  }, [reset, start]);

  const handleSubmit = useCallback(async () => {
    try {
      if (!selectedOptionIds.length) {
        alert('Choose answer!');
        return;
      }
      await axios.post('/answer', {
        question: question._id,
        choices: selectedOptionIds
      });
      setSubmitted(true);
      setEnableSubmit(false);
      stop();
      reload();
    } catch (error) {
      alert('error')
    }
  }, [question._id, selectedOptionIds, stop, reload]);

  return (
    <Box p={3}>
      <Typography className="guide">
        <Typography variant="h5">Multiple Choice</Typography>
        Read the text and answer the question by selecting all the correct responses. More than one response is correct.
      </Typography>
      <Box py={1} />
      <Typography># {question.name}</Typography>
      <Box py={1} />
      <Typography color="error">
        Time: {showCount}
      </Typography>
      <Box py={1} />
      <HtmlContent content={question.question.html} />
      <Box position='relative' display="flex" flexDirection="column">
        {question.options.map((option, idx) => (
          <FormControlLabel
            data-value={option._id}
            className="option-container"
            classes={{ root: 'option-container' }}
            control={<Checkbox disabled={submitted || count === question.time} checked={selectedOptionIds.includes(option._id)} onChange={() => handleChangeOption(option._id)} />}
            label={
              <div className={`${submitted ? (
                selectedOptionIds.includes(option._id) && correctOptionIds.includes(option._id) ? 'correctOption' :
                  correctOptionIds.includes(option._id) ? 'trueOption' : selectedOptionIds.includes(option._id) ? 'wrongOption' : ''
              ) : ''} d-flex align-items-center`}>
                <span className='font-weight-500 option-idx'>{LABELS[idx]}</span>
                <HtmlContent className="option-text" content={option.html} />
              </div>
            } />
        ))}
      </Box>
      <Box py={1}>
        <Button variant="contained" disabled={!enableSubmit} color={enableSubmit ? 'primary' : 'inherit'} onClick={handleSubmit}>Submit</Button>
        <Button variant="contained" color="primary" onClick={handleRedo} className="re-do">Re-do</Button>
      </Box>
    </Box>
  );
}

export default Component;
