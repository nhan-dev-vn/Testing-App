import React, { } from 'react';
import { Button } from '@mui/material';
import { showDateTime } from '../../utils/date';
import './style.css'

const Component = ({ title, examTest }) => {
  return (
    <div id="review-header">
      <h1>{title}</h1>
      <div id="info">
        Examinee: {examTest.examinee.name}, Started At: {showDateTime(examTest.startedAt)}, Finished At: {showDateTime(examTest.finishedAt)}
      </div>
      {examTest.score !== undefined && (
        <div id="score">
          <h1><span>{examTest.score?.total}</span>/{examTest.exam.fullScore}</h1>
          <div>Listening: {examTest.score?.Listening}/{examTest.exam.parts.find((p) => p.title === 'Listening')?.fullScore}</div>
          <div>Reading: {examTest.score?.Reading}/{examTest.exam.parts.find((p) => p.title === 'Reading')?.fullScore}</div>
          <div>Speaking: {examTest.score?.Speaking}/{examTest.exam.parts.find((p) => p.title === 'Speaking')?.fullScore}</div>
          <div>Writing: {examTest.score?.Writing}/{examTest.exam.parts.find((p) => p.title === 'Writing')?.fullScore}</div>
        </div>
      )}
    </div>
  );
};

export default Component;
