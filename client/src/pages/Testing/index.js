import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../Loading';
import './style.css'
import axios from '../../utils/axios';
import Header from './Header';
import { Box } from '@mui/material';
import useCountDownTime from '../../hooks/useCountDownTime';
import ConfirmBox from '../../components/ConfirmBox';
import { ReactMediaRecorder } from "react-media-recorder";
import { useDispatch } from 'react-redux';

import { actions as audioAct } from '../../redux/audioSlice';

import WriteEssay from '../../components/Test/Writing/WriteEssay';
import SummarizeWrittenText from '../../components/Test/Writing/SummarizeWrittenText';

import ReadAloud from '../../components/Test/Speaking/ReadAloud';
import RepeatSentence from '../../components/Test/Speaking/RepeatSentence';
import AnswerShortQuestion from '../../components/Test/Speaking/AnswerShortQuestion';
import DescribeImage from '../../components/Test/Speaking/DescribeImage';
import ReTellLecture from '../../components/Test/Speaking/ReTellLecture';

import SummarizeSpokenText from '../../components/Test/Listening/SummarizeSpokenText';
import WriteFromDictation from '../../components/Test/Listening/WriteFromDictation';
import HighlightIncorrectWords from '../../components/Test/Listening/HighlightIncorrectWords';
import FillInTheBlanks from '../../components/Test/Listening/FillInTheBlanks';
import ListeningMultipleChoice from '../../components/Test/Listening/MultipleChoice';
import ListeningSingleChoice from '../../components/Test/Listening/SingleChoice';

import ReadingFillInTheBlanks from '../../components/Test/Reading/FillInTheBlanks';
import ReadingFillInTheBlanksDrop from '../../components/Test/Reading/FillInTheBlanksDrop';
import SingleChoice from '../../components/Test/Reading/SingleChoice';
import MultipleChoice from '../../components/Test/Reading/MultipleChoice';
import ReOrderParagraphs from '../../components/Test/Reading/ReOrderParagraphs';

export const waitAndGetAudioBlob = async () => {
    let src;
    // while(!src) {
    //     let audioEl = document.getElementById('audio');
    //     console.log('check', audioEl?.src);
    //     if (audioEl?.src) {
    //         src = audioEl.src;
    //         const response = await fetch(src);
    //         const res = await response.body.getReader().read();
    //         console.log('blob', res);
    //         return res;
    //     }
    // } 
}

const Component = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
            console.error(error)
            alert('error')
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
            console.error(error)
            alert('error')
        }
    }, [reset, start]);
    const handleFinish = useCallback(async () => {
        try {
            if (!examTest?._id) return;
            const response = await axios.post('/exam-test/' + examTest?._id + '/finish-testing');
        } catch (error) {
            console.error(error)
            alert('error')
        }
    }, [examTest?._id]);

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
                const _currQIdx = _questions.findLastIndex((q) => _answers.find((ans) => ans.question === q._id)) + 1;
                setCurrQIdx(_currQIdx);
                setExamTest(_examTest);
                if (_examTest.status === 'new') {
                    setConfirm({
                        onFinish: () => setConfirm(undefined),
                        description: 'Start testing right now',
                        confirmAction: () => handleStart(_examTest._id),
                        disabledCancel: true,
                        disabledBackdropClick: true
                    });
                }
                if (_examTest.status === 'paused') {
                    setConfirm({
                        onFinish: () => setConfirm(undefined),
                        description: 'Resume testing right now',
                        confirmAction: () => handleResume(_examTest._id),
                        disabledCancel: true,
                        disabledBackdropClick: true
                    });
                }
                if (_examTest.status === 'finished') {
                    setConfirm({
                        onFinish: () => setConfirm(undefined),
                        description: 'Test finished!',
                        disabledCancel: true,
                        disabledBackdropClick: true,
                        confirmAction: () => navigate('/tests')
                    });

                }
                if (_examTest.status !== 'finished' && _currQIdx === _questions.length) {
                    setConfirm({
                        onFinish: () => setConfirm(undefined),
                        description: 'All questions were done. Are you want to finish test!',
                        disabledCancel: true,
                        disabledBackdropClick: true,
                        confirmAction: async () => {
                            await axios.post('/exam-test/' + _examTest?._id + '/finish-testing');
                            navigate('/tests')
                        }
                    });
                }
            } catch (error) {
                console.error(error)
                alert('error')
            }
            setLoading(false);
        })();
    }, [id]);

    const handleNextQ = useCallback(async () => {
        if (currQIdx === questions.length - 1) {
            await handleFinish()
            setConfirm({
                onFinish: () => setConfirm(undefined),
                description: 'Test finished!',
                disabledCancel: true,
                disabledBackdropClick: true,
                confirmAction: () => navigate('/tests')
            });
        } else
            setCurrQIdx(prev => prev + 1);
    }, [currQIdx, questions.length, handleFinish, navigate]);

    const handlePause = useCallback(async () => {
        try {
            await axios.post('/exam-test/' + id + '/pause-testing');
            navigate('/tests');
        } catch (error) {
            alert('error')
        }
    }, [id, navigate]);

    return (
        loading ? <Loading /> : examTest ?
            <Box id="testing" display="flex" flexDirection="column" height="100vh">
                <Box display="none">
                    <audio id="audio" style={{ display: 'none' }} />
                    <ReactMediaRecorder
                        video={false}
                        onStop={(blobUrl, blobData) => {
                            console.log('onStop');
                            const url = URL.createObjectURL(blobData);
                            let au = document.getElementById('audio');
                            au.controls = true;
                            au.src = url;
                            au.preload = "auto";
                            au.load();
                            dispatch(audioAct.setAudioBlob(blobData));
                        }}
                        onStart={() => console.log('start record')}
                        render={({ startRecording, stopRecording }) => (
                            <Box>
                                <button id="start-record" style={{ display: 'none' }} onClick={startRecording}></button>
                                <button id="stop-record" style={{ display: 'none' }} onClick={stopRecording}></button>
                            </Box>
                        )}
                    />
                </Box>
                <Header examTest={examTest} elapsedTime={showCount} currQIdx={currQIdx} totalQ={questions.length} />
                {
                    examTest.status === 'testing' && currQIdx >= 0 && questions[currQIdx] && (
                        <>

                            {questions[currQIdx].type === 'speaking-read-aloud' && <ReadAloud key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'speaking-repeat-sentence' && <RepeatSentence key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'speaking-answer-short-question' && <AnswerShortQuestion key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'speaking-describe-image' && <DescribeImage key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'speaking-re-tell-lecture' && <ReTellLecture key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}

                            {questions[currQIdx].type === 'listening-summarize-spoken-text' && <SummarizeSpokenText key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-write-from-dictation' && <WriteFromDictation key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-highlight-incorrect-words' && <HighlightIncorrectWords key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-fill-in-the-blanks' && <FillInTheBlanks key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-multiple-choice' && <ListeningMultipleChoice key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-single-choice' && <ListeningSingleChoice key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-highlight-correct-summary' && <ListeningSingleChoice key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'listening-select-missing-word' && <ListeningSingleChoice key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}

                            {questions[currQIdx].type === 'writing-essay' && <WriteEssay key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'writing-summarize' && <SummarizeWrittenText key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}

                            {questions[currQIdx].type === 'reading-fill-in-the-blanks' && <ReadingFillInTheBlanks key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'reading-single-choice' && <SingleChoice key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'reading-multiple-choice' && <MultipleChoice key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'reading-re-order-paragraphs' && <ReOrderParagraphs key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                            {questions[currQIdx].type === 'reading-fill-in-the-blanks-drop' && <ReadingFillInTheBlanksDrop key={questions[currQIdx]._id} testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                        </>
                    )
                }
                {confirm && <ConfirmBox {...confirm} />}
            </Box >
            : <></>
    );
};

export default Component;
