import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SegmentIcon from '@mui/icons-material/Segment';
import { showCountTime } from '../../utils/date';

const Component = ({ examTest, totalQ }) => {
  return (
    <Box id="testing-header-container">
    <Container maxWidth="md" id="testing-header">
      <h3 style={{ margin: '0.5em' }}>{examTest.title}</h3>
      <Box width={130}>
        <Typography className='d-flex align-items-center'>
          
        </Typography>
        <Typography className='d-flex align-items-center'>
          <SegmentIcon style={{ marginRight: 5 }} /> Total: {totalQ} questions
        </Typography>
      </Box>
    </Container>
    </Box>
  );
};

export default Component;
