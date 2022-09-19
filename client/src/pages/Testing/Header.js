import React, { } from 'react';
import { Button } from '@mui/material';

const Component = ({ title, onFinish, startedAt, onStart, score }) => {
  return (
    <div id="testing-header">
      <div></div>
      <h1>{title}</h1>
      {score === undefined ? (startedAt ? (
        <Button variant="contained" color="error" onClick={onFinish}>Finish</Button>
      ) : (
        <Button variant="contained" color="primary" onClick={onStart}>Start</Button>
      )) : <div></div>}
    </div>
  );
};

export default Component;
