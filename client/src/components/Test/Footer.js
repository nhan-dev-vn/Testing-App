import React, { useState, useCallback, useEffect } from 'react';

import {
  Container,
  Box,
  Button
} from '@mui/material'

import ConfirmBox from '../ConfirmBox';

const Component = ({ onSaveAndExit, onNextQ }) => {
  const [confirm, setConfirm] = useState();
  const handleSaveAndExit = useCallback(() => {
    setConfirm({
      description: 'Are you sure to save and exit the test?',
      confirmAction: onSaveAndExit,
      onFinish: () => setConfirm(undefined)
    });
  }, [onSaveAndExit]);

  return (
    <Box style={{ background: '#ccc' }}>
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" justifyContent="space-between" height={60}>
          <Button onClick={handleSaveAndExit} color="inherit" variant="contained">Save and Exit</Button>
          <Button color="primary" variant="contained" onClick={onNextQ}>Next</Button>
        </Box>
        {confirm && <ConfirmBox {...confirm} />}
      </Container>
    </Box>
  );
}

export default Component;
