import axios from '../../utils/axios';
import React, { useState, useEffect, useCallback } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import Essay from '../../components/Writing/Essay';
import Summaarize from '../../components/Writing/Summaarize';
import ReadAloud from '../../components/Speaking/ReadAloud';
import DescribeImage from '../../components/Speaking/DescribeImage';
import RepeatSentence from '../../components/Speaking/RepeatSentence';
import AnswerShortQuestion from '../../components/Speaking/AnswerShortQuestion';
import ReTellLecture from '../../components/Speaking/ReTellLecture';
import './style.css';
import { useSelector } from 'react-redux';
import { showDate } from '../../utils/date';
import HtmlContent from '../../components/HtmlContent';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Component = () => {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [question, setQuestion] = useState();
    const [answers, setAnswers] = useState([]);
    const [tab, setTab] = React.useState(1);

    const getAnswers = useCallback(async () => {
        try {
            const response = await axios.get(`/answers?questionId=${id}`);
            setAnswers(response.data);
        } catch (error) {
            alert('Error');
        }
    }, [id, tab]);

    const getData = useCallback(async () => {
        try {
            const response = await axios.get('/question/' + id);
            setQuestion(response.data);
        } catch (error) {
            alert('Error');
        }
    }, [id]);

    useEffect(() => {
        getData();
        getAnswers();
    }, []);



    const handleChangeTab = useCallback((event, newValue) => {
        setTab(newValue);
        getAnswers();
    }, [getAnswers]);

    const reload = useCallback(() => {
        getAnswers();
    }, [getAnswers]);

    return (
        question ? (
            <>
                {question.type === 'writing-essay' && <Essay question={question} reload={reload} />}
                {question.type === 'writing-summarize' && <Summaarize question={question} reload={reload} />}
                {question.type === 'speaking-read-aloud' && <ReadAloud question={question} reload={reload} />}
                {question.type === 'speaking-describe-image' && <DescribeImage question={question} reload={reload} />}
                {question.type === 'speaking-repeat-sentence' && <RepeatSentence question={question} reload={reload} />}
                {question.type === 'speaking-answer-short-question' && <AnswerShortQuestion question={question} reload={reload} />}
                {question.type === 'speaking-re-tell-lecture' && <ReTellLecture question={question} reload={reload} />}

                <Box p={1} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tab} onChange={handleChangeTab} aria-label="basic tabs example">
                        <Tab label="Board" {...a11yProps(0)} />
                        <Tab label="Me" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <Box p={1}>
                    {answers.filter((ans) => !tab ? ans : ans.user._id === user._id).map((ans) => (
                        <Box py={1}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    <b>{ans.user.name}</b> {showDate(ans.createdAt)}
                                </Typography>
                            </Box>
                            {ans.text && <HtmlContent content={ans.text} />}
                            {ans.audio && <audio src={ans.audio.url} controls />}
                        </Box>
                    ))}
                </Box>
            </>
        ) : <></>
    );
};

export default Component;
