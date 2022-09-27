import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Question from '../../components/Question';
import QuestionGroup from '../../components/QuestionGroup';
import Loading from '../Loading';
import './style.css'
import axios from '../../utils/axios';
import Header from './Header';
import { Box, Typography } from '@mui/material';
import useCountDownTime from '../../hooks/useCountDownTime';
import ConfirmBox from '../../components/ConfirmBox';
import { Container } from '@mui/system';

export const waitAndGetAudioBlob = () => new Promise((res, rej) => {
    let audioEl = document.getElementById('audio');

    if (audioEl) {
        fetch(audioEl.src)
            .then(response => {
                console.log('fetttt');
                res(response.blob())
            })
    }
})

const Component = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [examTest, setExamTest] = useState();
    const [exam, setExam] = useState();
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState([]);
    const [currQIdx, setCurrQIdx] = useState(0);
    const { count, start, showCount, reset } = useCountDownTime(0, 0);
    const [confirm, setConfirm] = useState();
    const [questions, setQuestions] = useState([]);



    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/exam-tests/' + id);
                const _examTest = response.data;
                if (!_examTest) throw Error("Not found test");

                const res = await axios.get('/answers?examTestId=' + _examTest._id);
                const _answers = res.data;
                const _exam = _examTest.exam;
                let _questions = [];
                _exam.parts.forEach((part) => _questions = _questions.concat(part.questions));
                setAnswers(_answers);
                setExam(_exam);
                setQuestions(_questions);
                setCurrQIdx(_questions.findLastIndex((q) => _answers.find((ans) => ans.question === q._id)) + 1);
                setExamTest(_examTest);
            } catch (error) {
                console.error(error)
                alert('error')
            }
            setLoading(false);
        })();
    }, [id]);


    return (
        loading ? <Loading /> : examTest ?
            <Box id="testing" display="flex" flexDirection="column" height="100vh">
                <Header examTest={examTest} totalQ={questions.length} />
                <Box display="flex" justifyContent="center" flex={1} overflow="auto">
                    <Container maxWidth="md">
                        <Box display="flex" justifyContent="center" >
                            <Box border="1px solid #ccc">
                                <Typography variant="h5">Score: {examTest.score?.total}/{examTest.exam.fullScore}</Typography>
                                <div>Listening: {examTest.score?.Listening}/{examTest.exam.parts.find((p) => p.title === 'Listening')?.fullScore}</div>
                                <div>Reading: {examTest.score?.Reading}/{examTest.exam.parts.find((p) => p.title === 'Reading')?.fullScore}</div>
                                <div>Speaking: {examTest.score?.Speaking}/{examTest.exam.parts.find((p) => p.title === 'Speaking')?.fullScore}</div>
                                <div>Writing: {examTest.score?.Writing}/{examTest.exam.parts.find((p) => p.title === 'Writing')?.fullScore}</div>
                            </Box>
                        </Box>
                        
                    </Container>
                </Box>
            </Box >
            : <></>
    );
};

export default Component;
