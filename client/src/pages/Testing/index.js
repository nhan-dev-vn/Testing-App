import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Question from '../../components/Question';
import QuestionGroup from '../../components/QuestionGroup';
import Loading from '../Loading';
import './style.css'
import axios from '../../utils/axios';
import Header from './Header';
import { Button } from '@mui/material';
import useCountDownTime from '../../hooks/useCountDownTime';
import ConfirmBox from '../../components/ConfirmBox';

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


    const handleStart = useCallback(async (id) => {
        try {
            const response = await axios.post('/exam-test/' + id + '/start-testing');
            const _examTest = response.data;
            if (_examTest) {
                setExamTest(prev => ({ ...prev, status: _examTest.status, startedAt: _examTest.startedAt }));
                reset(_examTest.elapsedTime, 0)
                start();
            }
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }, [reset, start]);
    const handleResume = useCallback(async (id) => {
        try {
            const response = await axios.post('/exam-test/' + id + '/resume-testing');
            const _examTest = response.data;
            if (_examTest) {
                setExamTest(prev => ({ ...prev, status: _examTest.status, startedAt: _examTest.startedAt }));
                reset(_examTest.elapsedTime, 0)
                start();
            }
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }, [reset, start]);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/exam-tests/' + id);
                const _examTest = response.data;
                if (!_examTest) throw Error("Not found test");
                
                const res = await axios.get('/answers?examTestId=' + _examTest._id);
                const _answers = res.data;
                setAnswers(_answers);
                const _exam = _examTest.exam;
                setExam(_exam);
                let _questions = [];
                _exam.parts.forEach((part) => _questions = _questions.concat(part.questions));
                setQuestions(_questions);
                setCurrQIdx(_questions.findLastIndex((q) => _answers.find((ans) => ans.question === q._id)) + 1);
                setExamTest(_examTest);
                if (_examTest.status === 'new') {
                    setConfirm({
                        description: 'Start testing right now',
                        confirmAction: () => handleStart(_examTest._id),
                        disabledCancel: true,
                        disabledBackdropClick: true
                    });
                }
                if (_examTest.status === 'paused') {
                    setConfirm({
                        description: 'Resume testing right now',
                        confirmAction: () => handleResume(_examTest._id),
                        disabledCancel: true,
                        disabledBackdropClick: true
                    });
                }
                if (_examTest.start === 'finished') {
                    alert('Test finished')
                    navigate('/tests');
                }
            } catch (error) {
                alert(JSON.stringify(error));
            }
            setLoading(false);
        })();
    }, [id]);

    return (
        loading ? <Loading /> : examTest ?
            <div id="testing">
                <Header examTest={examTest} elapsedTime={showCount} currQIdx={currQIdx} totalQ={questions.length} />
                {examTest.status === 'testing' && (
                    <>Testing</>
                )}
                {confirm && <ConfirmBox {...confirm} />}
            </div>
            : <></>
    );
};

export default Component;
