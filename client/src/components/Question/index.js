import React, { useCallback, useMemo } from 'react';
import HtmlContent from '../HtmlContent';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import './style.css';

const LABELS = ['A', 'B', 'C', 'D']

const Component = ({ question, index, answers, setAnswers }) => {
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
  }, [answers]);

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
      {question.ansType === "Single Choice" && (
        <RadioGroup
          name={question._id}
          value={answer?.choices[0]}
          onChange={(e) => updateAnswer(e.target.value)}
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
