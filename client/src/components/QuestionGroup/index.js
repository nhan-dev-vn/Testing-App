import { formGroupClasses } from '@mui/material';
import React from 'react';
import HtmlContent from '../HtmlContent';
import Question from '../Question';

const Component = ({ group, questions, startIndex, answers, setAnswers, examTestId }) => {
  return (
    <div>
      <HtmlContent content={group.passage.html} />
      {group.passage.audioUrl && (
        <div>
          <audio controls>
            <source src={group.passage.audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}
      {group.passage.videoUrl && (
        <div>
          <video controls width="80%" height="auto">
            <source src={group.passage.videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
      {questions.map((question, index) => (
        <Question key={question._id} question={question} index={index + startIndex} answers={answers} setAnswers={setAnswers} examTestId={examTestId} />
      ))}
    </div>
  );
};

export default Component;
