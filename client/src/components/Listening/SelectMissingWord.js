import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Radio, RadioGroup, FormControlLabel, Button
} from '@mui/material';
import useCountTime from '../../hooks/useCountTime';
import useCountDownTime from '../../hooks/useCountDownTime';
import axios from '../../utils/axios';
import './multipleChoiceStyle.css';
import HtmlContent from '../../components/HtmlContent';
import { LABELS } from '../../components/Question';

const Component = ({ question, reload }) => {
  const correctOptionId = question.options.find(o => o.value === 'true')?._id
  const [status, setStatus] = useState('prepare');
  const [enableSubmit, setEnableSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstPlayDemo, setFirstPlayDemo] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState();
  const [reRenderRadio, setReRenderRadio] = useState(1);

  const { count, showCount, start, reset, stop } = useCountTime(0, question.timeout);

  const handleStopPrepareCount = useCallback(async () => {
    try {
      document.getElementById('demo-audio-container').click();
      const demoAudio = document.getElementById('demo-audio');
      await demoAudio.play();
    } catch (error) {
      setShowGuide(true);
    }
  }, []);

  const { count: prepareCount, showCount: showPrepareCount, start: startPrepare, reset: resetPrepare, stop: stopPrepare } = useCountDownTime(question.prepareTimeout, 0, handleStopPrepareCount);

  useEffect(() => {
    startPrepare();
  }, []);

  const handlePlayDemoAudio = useCallback(() => {
    if (firstPlayDemo) {
      start();
      setStatus('testing');
      setFirstPlayDemo(false);
      setShowGuide(false);
    }
  }, [firstPlayDemo, start]);

  const handleChangeOption = useCallback(e => {
    setSelectedOptionId(e.target.value);
    setEnableSubmit(e.target.value)
  }, []);

  const resetAudio = useCallback(async () => {
    const demoAudio = document.getElementById('demo-audio');
    await demoAudio.pause();
    demoAudio.currentTime = 0;
  }, []);

  const handleRedo = useCallback(() => {
    setSelectedOptionId('');
    setReRenderRadio(prev => prev + 1);
    setStatus('prepare');
    setSubmitted(false);
    setEnableSubmit(false);
    setFirstPlayDemo(true);
    reset();
    resetPrepare();
    startPrepare();
    resetAudio();
  }, [reset, resetAudio, resetPrepare, startPrepare]);

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
      resetAudio();
    } catch (error) {
      alert('error')
    }
  }, [question._id, selectedOptionId, stop, reload, resetAudio]);

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
        {status === 'prepare' ? 'Prepare' : 'Time'}: {status === 'prepare' ? showPrepareCount : showCount}
      </Typography>
      <Box py={1} />
      <Box p={2} border="1px dashed #ddd" style={{ background: '#fff', position: 'relative' }} id="demo-audio-container">
        {showGuide && <Box position="absolute" style={{ background: '#fff', border: '1px dashed #1876d2', color: '#1876d2', padding: 8, zIndex: 1, top: -15, left: 16 }}>Click play button to start</Box>}
        <audio src={question.question.audioUrl} preload="auto" id="demo-audio" controls onPlay={handlePlayDemoAudio} />
      </Box>
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
