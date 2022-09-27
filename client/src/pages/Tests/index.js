import React, { useState, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import RemoveIcon from '@mui/icons-material/Delete';
import ArrowRight from '@mui/icons-material/ChevronRight';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { useSelector } from 'react-redux';
import { showDateTime } from '../../utils/date';
import { IconButton } from '@mui/material';
import ConfirmBox from '../../components/ConfirmBox';

export default function Component() {
  const { user } = useSelector(state => state.auth);
  const [exams, setExams] = useState([]);
  const [myExamTests, setMyExamTests] = useState([]);
  const [examTests, setExamTests] = useState([]);
  const navigate = useNavigate();
  const [showMockTestConfirm, setShowMockTestConfirm] = useState(false);
  const [confirm, setConfirm] = useState();

  const fetchExams = useCallback(async () => {
    try {
      const response = await axios.get('/exams');
      setExams(response.data);
    } catch (error) {
      alert('error')
    }
  }, []);
  const fetchExamTests = useCallback(async () => {
    try {
      const response = await axios.get('/exam-tests');
      setExamTests(response.data);
    } catch (error) {
      alert('error')
    }
  }, []);
  const fetchMyExamTests = useCallback(async () => {
    try {
      const response = await axios.get('/exam-tests?onlyMe=true');
      setMyExamTests(response.data);
    } catch (error) {
      alert('error')
    }
  }, []);

  useEffect(() => {
    fetchExams();
    fetchExamTests();
    fetchMyExamTests();
  }, [fetchExamTests, fetchExams, fetchMyExamTests]);

  const handleStartNewTest = useCallback(async (examId) => {
    try {
      const res = await axios.post('/exam-tests/new', { examId });
      if (!res.data) throw Error("Error");
      navigate('/testing/' + res.data._id);
    } catch (err) {
      alert('error')
    }
  }, [navigate]);

  const handleClickMockTest = useCallback((examId) => async () => {
    try {
      const response = await axios.get('/exam-tests/exams/' + examId);
      if (response.data) {
        setConfirm({
          onFinish: () => setConfirm(undefined),
          description: 'You did not finish this test last time. Do you want to continue from your saved session?',
          confirmText: 'Continue',
          cancelText: 'Start new',
          confirmAction: () => navigate('/testing/' + response.data._id),
          cancelAction: async () => handleStartNewTest(examId)
        });
      } else {
        handleStartNewTest(examId);
      }
    } catch (error) {
      alert('error')
    }
  }, [handleStartNewTest, navigate]);

  return (
    <Box>
      {user.email === 'admin@gmail.com' && (
        <Box></Box>
      )}
      <Box>
        <Typography variant='h6'>My Tests</Typography>
        <Card>
          {myExamTests.map((et) => (
            <>
              <Box display="flex" justifyContent="space-between" p={2}>
                <Box>
                  <Typography variant='h6'>{et.title}</Typography>
                  <Typography variant="body2" color="textSecondary">Started at: {et.startedAt ? showDateTime(et.startedAt) : 'Not started'}</Typography>
                  <Typography variant="body2" color="textSecondary">Finished at: {et.finishedAt ? showDateTime(et.finishedAt) : 'Not finished'}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <IconButton color="error" variant="contained" style={{ marginRight: 10 }}><RemoveIcon /></IconButton>
                  {et.status === 'new' && (
                    <Button color="primary" variant="contained" onClick={() => navigate('/testing/' + et._id)}>Start</Button>
                  )}
                  {et.status === 'paused' && (
                    <Button color="info" variant="contained">Continue</Button>
                  )}
                  {et.status === 'testing' && (
                    <Button color="warning" variant="contained">Testing</Button>
                  )}
                  {et.status === 'finished' && (
                    <Button color="success" variant="contained">Check Result</Button>
                  )}
                </Box>
              </Box>
              <Divider />
            </>
          ))}
        </Card>
      </Box>
      <Box>
        <Typography variant='h6'>Mock Tests</Typography>
        <Card>
          {exams.map((e) => (
            <>
              <Box display="flex" p={2} className='link cursor-pointer ' justifyContent="space-between" onClick={handleClickMockTest(e._id)}>
                <Box>
                  <Typography className="font-weight-500 title">{e.title}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <ArrowRight />
                </Box>
              </Box>
              <Divider />
            </>
          ))}
        </Card>
      </Box>
      {confirm && <ConfirmBox {...confirm} />}
    </Box>
  );
}
