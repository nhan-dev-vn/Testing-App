import React, { useState, useCallback, useEffect } from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import './style.css';


function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const categories = {
  'speaking': ['speaking-read-aloud', 'speaking-repeat-sentence', 'speaking-answer-short-question', 'speaking-describe-image', 'speaking-re-tell-lecture'],
  'writing': ['writing-essay', 'writing-summarize'],
  'reading': ['reading-and-writing-fill-in-the-blanks', 'reading-multiple-choice', 'reading-single-choice', 'reading-fill-in-the-blanks', 'reading-re-order-paragraphs'],
  'listening': ['listening-summarize-spoken-text', 'listening-write-from-dictation', 'listening-multiple-choice', 'listening-single-choice', 'listening-fill-in-the-blanks', 'listening-highlight-correct-summary', 'listening-select-missing-word', 'listening-highlight-incorrect-words']
};

export default function SimpleDialog(props) {
  const { onClose, open, type } = props;
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const handleChangeTab = useCallback((event, newValue) => {
    setTab(newValue);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('/questions?type=' + type);

        setQuestions(response.data);
      } catch (error) {
        alert('error')
      }
    })();
  }, [type]);

  return (
    <Dialog onClose={onClose} open={open} maxWidth="md" id="question-list" fullWidth>
      <DialogTitle>LIST</DialogTitle>
      <Box display="flex" p={2}>
      <Tabs value={tab} onChange={handleChangeTab} aria-label="basic tabs example">
        {categories[type].map((cate, i) => (
          <Tab label={cate} key={cate} {...a11yProps(i)} />
        ))}
      </Tabs>
      <List sx={{ pt: 0 }}>
        {questions.filter((q) => categories[type].findIndex(cate => cate === q.type) === tab).map((q, i) => (
          <ListItem button onClick={() => window.location.pathname = `/type/${type}/question/${q._id}` } key={q._id}>
            <Typography style={{ color: '#1976d2' }}>#{i + 1} {q.name}</Typography>
          </ListItem>
        ))}
      </List>
      </Box>
    </Dialog>
  );
}
