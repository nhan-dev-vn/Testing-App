import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Question from '../../components/Question';
import QuestionGroup from '../../components/QuestionGroup';
import Loading from '../Loading';
import './style.css'
import axios from '../../utils/axios';
import Header from './Header';
import { Button } from '@mui/material';

const PART_IDX = ['I', 'II', 'III', 'IV']

const Component = (props) => {
    const { examTestId } = useParams();
    console.log(examTestId);
    const navigate = useNavigate();
    const [examTest, setExamTest] = useState();
    const [exam, setExam] = useState();
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState([]);
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/exam-tests/' + examTestId);
                setAnswers(response.data.answers);
                setExam(response.data.exam);
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

    return (
        loading ? <Loading /> : examTest ?
            <div id="review">
                <Header title={exam.title} examTest={examTest} />
                {
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
                                            examTestId={examTest._id}
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
                                            examTestId={examTest._id}
                                        />
                                    );
                                } else return (<></>);
                            })}
                        </div>
                    ))
                }
            </div>
            : <></>
    );
};

export default Component;
