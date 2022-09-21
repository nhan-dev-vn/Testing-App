import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useReactMediaRecorder, ReactMediaRecorder } from "react-media-recorder";
import HtmlContent from '../HtmlContent';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Button
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import './style.css';
import axios from '../../utils/axios';
import CKEditor from '../CKEditor';
import { stripHTMLTags } from '../../utils/html';
import { getImagesProperty } from '../../utils/image';
const LABELS = ['A', 'B', 'C', 'D']

const Component = ({ question, index, answers, setAnswers, examTestId }) => {
  const answer = useMemo(() => answers.find((ans) => ans.question === question._id), [answers, question._id]);
  const updateAnswer = useCallback(async (optionId) => {
    if (answers.find(ans => ans.question === question._id)) {
      setAnswers(answers.map((ans) => ans.question === question._id ? ({
        ...ans,
        choices: [optionId]
      }) : ans));
    } else {
      setAnswers([
        ...answers,
        {
          question: question._id,
          choices: [optionId],
          score: question.score
        }
      ])
    }
  }, [answers, question._id, question.score, setAnswers]);
  const [blob, setBlob] = useState();
  const handleSubmitAudio = useCallback(async () => {
    try {
      const bodyFd = new FormData();
      const newAnswers = [...answers];
      if (!newAnswers.find(ans => ans.question === question._id)) {
        newAnswers.push({
          question: question._id,
          score: question.score,
          audioUrl: ''
        })
      }
      bodyFd.append('audio', blob, `${examTestId}_${question._id}.wav`);
      bodyFd.append('questionId', question._id);
      bodyFd.append('examTestId', examTestId);
      bodyFd.append('answers', JSON.stringify(newAnswers));
      const response = await axios.post('/upload-audio', bodyFd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAnswers(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [answers, blob, question._id, question.score, examTestId, setAnswers]);

  useEffect(() => {
    if (answer?.audioUrl) {
      const e = document.getElementById(answer.audioUrl);
      if (e)
        e.load();
    }
  }, [answer?.audioUrl]);

  const [text, setText] = useState(answer?.text?.html ?? '');

  const submitText = useCallback(() => {
    if (answers.find(ans => ans.question === question._id)) {
      setAnswers(answers.map((ans) => ans.question === question._id ? ({
        ...ans,
        text: {
          html: text,
          text: stripHTMLTags(text),
          images: getImagesProperty(`#cke_${question._id} iframe`, window.location.origin),
        }
      }) : ans));
    } else {
      setAnswers([
        ...answers,
        {
          question: question._id,
          score: question.score,
          text: {
            html: text,
            text: stripHTMLTags(text),
            images: getImagesProperty(`#cke_${question._id} iframe`, window.location.origin),
          }
        }
      ])
    }
  }, [answers, question._id, question.score, setAnswers, text]);

  return (
    <div>
      <div className='d-flex'>
        <span className='font-weight-500 question-idx'>{index}.</span>
        <HtmlContent content={question.question.html} />
      </div>
      {question.question.audioUrl && (
        <div>
          <audio controls>
            <source src={question.question.audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}
      {question.ansType === 'Text' && (
        <div>
          <CKEditor value={text} onChange={setText} name={question._id} readOnly={!setAnswers} />
          {setAnswers && <Button color="primary" onClick={submitText}>Submit</Button>}
        </div>
      )}
      {question.ansType === 'Audio' && (
        <div>
          {answer && (
            <div className='submitted-audio'>
              Submitted Answer: <audio controls id={answer.audioUrl}>
                <source src={answer.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}
          {setAnswers && (<ReactMediaRecorder
            video={false}
            onStop={(url, blobData) => setBlob(blobData)}
            render={({ status, startRecording, stopRecording, resumeRecording, pauseRecording, mediaBlobUrl, clearBlobUrl }) => (
              <div>
                <p>
                  Click buttons to
                  {status === 'idle' && ' start'}
                  {status === 'stopped' && ' restart'}
                  {status === 'paused' && ' resume'}
                  {status === 'recording' && ' pause/stop'}
                </p>
                {(status === 'idle' || status === 'stopped') && <IconButton onClick={() => { clearBlobUrl(); startRecording(); }}><PlayCircleOutlineIcon /></IconButton>}
                {status === 'recording' && <IconButton onClick={pauseRecording}><PauseCircleOutlineIcon /></IconButton>}
                {status === 'paused' && <IconButton onClick={resumeRecording}><PlayCircleOutlineIcon /></IconButton>}
                {(status === 'recording' || status === 'paused') && <IconButton onClick={stopRecording}><StopCircleIcon /></IconButton>}
                {mediaBlobUrl && <Button onClick={handleSubmitAudio}>Submit</Button>}
                <div>
                  {mediaBlobUrl && <audio src={mediaBlobUrl} controls />}
                  {status === 'recording' && 'recording'}
                </div>
              </div>
            )}
          />)}

        </div>
      )}
      {question.ansType === "Single Choice" && (
        <RadioGroup
          name={question._id}
          disabled={!setAnswers}
          value={answer?.choices[0]}
          onChange={(e) => setAnswers && updateAnswer(e.target.value)}
        >
          {question.options.map((option, idx) => (
            <FormControlLabel
              key={option._id}
              control={<Radio />}
              value={option._id}
              className="option-container"
              label={(
                <div className='d-flex align-items-center'>
                  <span className='font-weight-500 option-idx'>{LABELS[idx]}</span>
                  <HtmlContent className="option-text" content={option.html} />
                </div>
              )}
            />
          ))}
        </RadioGroup>
      )
      }
    </div >
  );
};

export default Component;
