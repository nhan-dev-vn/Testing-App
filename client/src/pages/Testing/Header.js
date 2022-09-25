import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SegmentIcon from '@mui/icons-material/Segment';
import { showCountTime } from '../../utils/date';

const Component = ({ examTest, elapsedTime, currQIdx, totalQ }) => {
  return (
    <Box id="testing-header-container">
    <Container maxWidth="md" id="testing-header">
      <h3>{examTest.title}</h3>
      <Box width={130}>
        <Typography className='d-flex align-items-center'>
          <AccessTimeIcon style={{ marginRight: 5 }} /> {examTest.status === 'testing' ? elapsedTime : showCountTime(examTest.elapsedTime)} / {showCountTime(examTest.timeout)}
        </Typography>
        <Typography className='d-flex align-items-center'>
          <SegmentIcon style={{ marginRight: 5 }} /> {currQIdx + 1} of {totalQ}
        </Typography>
      </Box>
    </Container>
    </Box>
  );
};

export default Component;
