import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Question from '../../components/Question';
import QuestionGroup from '../../components/QuestionGroup';
import Loading from '../Loading';
import './style.css'
import axios from '../../utils/axios';
import Header from './Header';
import { Button } from '@mui/material';

const PART_IDX = ['I', 'II', 'III', 'IV']

const Component = () => {
    const navigate = useNavigate();
    const [examTest, setExamTest] = useState();
    const [exam, setExam] = useState();
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState([]);
    const [startedAt, setStartedAt] = useState();
    const [score, setScore] = useState();
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/exam-test');
                setAnswers(response.data.answers);
                setExam(response.data.exam);
                setStartedAt(response.data.startedAt);
                setExamTest(response.data);
            } catch (error) {
                alert(JSON.stringify(error));
            }
            setLoading(false);
        })();
    }, []);

    const handleUpdateAnswer = useCallback(async (_answers) => {
        if (!examTest?._id) return;
        try {
            setAnswers(_answers);
            await axios.post('/exam-test/' + examTest._id + '/update-answer',
                { answers: _answers }
            );
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }, [examTest?._id]);

    const handleStart = useCallback(async () => {
        try {
            if (!examTest?._id) return;
            const response = await axios.post('/exam-test/' + examTest._id + '/start-testing');
            setStartedAt(response.data.startedAt);
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }, [examTest?._id]);
    const handleFinish = useCallback(async () => {
        try {
            if (!examTest?._id) return;
            const response = await axios.post('/exam-test/' + examTest._id + '/finish-testing');
            setScore(response.data.score);
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }, [examTest?._id]);

    const handleTestingAgain = useCallback(() => { navigate(0) }, [navigate]);

    return (
        loading ? <Loading /> : examTest ?
            <div id="testing">
                <Header title={exam.title} onFinish={handleFinish} startedAt={startedAt} onStart={handleStart} score={score} />
                {startedAt && score === undefined && (
                    exam.parts.map((part, i) => (
                        <div className='part' key={part._id}>
                            <h2>{PART_IDX[i]}. {part.title}</h2>
                            {part.questions.map((question, idx) => {
                                if (!question.group) {
                                    return (
                                        <Question
                                            key={question._id}
                                            question={question}
                                            index={idx + 1}
                                            answers={answers}
                                            setAnswers={handleUpdateAnswer}
                                        />
                                    );
                                } else if (question.group !== (part.questions[idx - 1]?.group)) {
                                    return (
                                        <QuestionGroup
                                            key={question.group}
                                            group={part.questionGroups.find((g) => g._id === question.group)}
                                            startIndex={idx + 1}
                                            questions={part.questions.filter((q) => q.group === question.group)}
                                            answers={answers}
                                            setAnswers={handleUpdateAnswer}
                                        />
                                    );
                                } else return (<></>);
                            })}
                        </div>
                    ))
                )
                }
                {score !== undefined && (
                    <div id="score">
                        <h1><span>{score.total}</span>/{exam.fullScore}</h1>
                        <div>Listening: {score.Listening}/{exam.parts.find((p) => p.title === 'Listening')?.fullScore}</div>
                        <div>Reading: {score.Reading}/{exam.parts.find((p) => p.title === 'Reading')?.fullScore}</div>
                        <div>Speaking: {score.Speaking}/{exam.parts.find((p) => p.title === 'Speaking')?.fullScore}</div>
                        <div>Writing: {score.Writing}/{exam.parts.find((p) => p.title === 'Writing')?.fullScore}</div>
                        <Button variant="outlined" color="secondary" onClick={handleTestingAgain}>Testing again</Button>
                    </div>
                )}
            </div>
            : <></>
    );
};

export default Component;
