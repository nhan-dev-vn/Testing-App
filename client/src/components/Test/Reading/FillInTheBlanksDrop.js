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
  const [choices, setChoices] = useState([]);

  const handleChangeChoices = useCallback((value, idx) => {
    setChoices(prev => {
      let _new = [...prev];
      if (idx === 'options') _new = _new.filter(c => c.text !== value);
      if (!prev.find(c => c.index === idx || c.text === value)) _new = _new.concat([{ index: idx, text: value }])
      else _new = _new.map(c => c.index !== idx && c.text !== value ? c : { index: idx, text: value });
      return _new
    })
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      await axios.post('/answer', {
        question: question._id,
        choices: choices.sort((c1, c2) => parseInt(c1.index) > parseInt(c2.index) ? 1 : -1).map(c => c.text),
        examTestId: testId
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error)
      alert('error')
    }
  }, [choices, question._id, testId]);

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

  const onDragStart = useCallback(function dragStart(event) {
    event.dataTransfer.setData("Text", event.target.id);
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("Text");
    event.target.appendChild(document.getElementById(data));
    handleChangeChoices(data, event.target.id);
  }, [handleChangeChoices]);

  const onDragOver = useCallback(function allowDrop(event) {
    event.preventDefault();
  }, []);

  return (
    <>
      <Box style={{ paddingTop: 30, paddingBottom: 30, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Container maxWidth="md" >
          <Typography className='font-weight-500'>
            {question.guide}
          </Typography>
          <HtmlContent content={question.question.html} />
          <Typography color="error" style={{ marginTop: 20, marginBottom: 10 }}>
            Remain: {showCount}
          </Typography>
          <Box width="100%" border="1px solid #ccc" borderRadius={1} >
            <Box padding={2}>

              {question.question.text.split(' ').map((w, i) => {
                if (w === '\n') return <br />;
                if (w.includes('{{drop}}')) return (
                  <>
                  <span data-index={i} className='word droptarget' onDrop={onDrop} id={i} onDragOver={onDragOver}>

                  </span>
                  {w.replace('{{drop}}', '')}
                  </>
                )
                return (
                  <span data-index={i} className={`word `}>{w}</span>
                );
              })}
            </Box>
            <Box className='droptarget' id="options" onDrop={onDrop} onDragOver={onDragOver} mt={3} borderTop="1px solid #ccc" p={2} style={{ background: '#eee' }}>
              {question.options.map(o => (
                <span className="dragtarget" onDragStart={onDragStart} draggable="true" id={o.text}>{o.text}</span>
              ))}
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
