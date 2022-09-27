import React, { useState, useCallback } from 'react';
import { ReactMediaRecorder } from "react-media-recorder";
import MicIcon from '@mui/icons-material/Mic';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Box, IconButton, Typography
} from '@mui/material';
import './style.css';

export const waitAndGetAudioBlob = () => new Promise((res, rej) => {
  let audioEl = document.getElementById('audio');
  const interval = setInterval(() => {
    console.log('asdf'  , audioEl);
    if (audioEl) {
      fetch(audioEl.src)
        .then(response => {
          console.log('fetttt');
          res(response.blob())
        })
      clearInterval(interval)
    }
  }, 100);
})
const Component = ({ progress = 0, status, setStatus, setBlob, start = () => {}, stop = () => {}, isCounting }) => {
  const handleRecorder = useCallback((clearBlobUrl) => () => {
    if (status === 'idle' || status === 'stopped' || status === 'prepare') {
      clearBlobUrl();
      setBlob();
      start();
      let au = document.getElementById('audio');
      const auContainer = document.getElementById('audio-container');
      if (au) auContainer.removeChild(au);
    }
    if (status === 'recording') {
      stop();
    }
  }, [setBlob, start, status, stop]);

  return (
    <ReactMediaRecorder
      video={false}
      onStop={(blobUrl, blobData) => {
        setBlob(blobData);
        const url = URL.createObjectURL(blobData);
        let au = document.getElementById('audio');
        const auContainer = document.getElementById('audio-container');
        if (au) auContainer.removeChild(au);
        au = document.createElement('audio');
        au.id = 'audio';
        au.controls = true;
        au.src = url;
        au.preload = "auto";
        auContainer.appendChild(au);
        au.load();
      }}
      render={({ status, startRecording, stopRecording, resumeRecording, pauseRecording, mediaBlobUrl, clearBlobUrl, }) => (
        <Box>
          <Box textAlign="center" py={2} style={{ background: '#eee', position: 'relative' }}>
            <LinearProgress  variant="determinate" value={progress} style={{ width: '100%', position: 'absolute', top: -3, left: 0, display: progress > 0 ? 'block' : 'none' }} />
            <Typography color="textSecondary" align="center">
              Click button to
              {status === 'idle' && ' start'}
              {status === 'stopped' && ' restart'}
              {status === 'recording' && ' stop'}
            </Typography>
            <button id="start-record" style={{ display: 'none' }} onClick={startRecording}></button>
            <button id="stop-record" style={{ display: 'none' }} onClick={stopRecording}></button>
            <IconButton color='primary' onClick={handleRecorder(clearBlobUrl)} id="recorder-control">
              {(status === 'idle' || status === 'stopped') ? <MicNoneOutlinedIcon /> : <MicIcon />}
            </IconButton>
          </Box>
          <Box id="audio-container">
            
          </Box>
        </Box>
      )}
    />
  );
}

export default Component;
