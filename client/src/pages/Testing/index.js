import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Question from '../../components/Question';
import QuestionGroup from '../../components/QuestionGroup';
import Loading from '../Loading';
import './style.css'
import axios from '../../utils/axios';
import Header from './Header';
import { Box } from '@mui/material';
import useCountDownTime from '../../hooks/useCountDownTime';
import ConfirmBox from '../../components/ConfirmBox';
import { ReactMediaRecorder } from "react-media-recorder";
import WriteEssay from '../../components/Test/Writing/WriteEssay';
import SummarizeWrittenText from '../../components/Test/Writing/SummarizeWrittenText';
// import ReadAloud from '../../components/Test/Speaking/ReadAloud';
// import DescribeImage from '../../components/Test/Speaking/DescribeImage';
import RepeatSentence from '../../components/Test/Speaking/RepeatSentence';
import AnswerShortQuestion from '../../components/Test/Speaking/AnswerShortQuestion';
import DescribeImage from '../../components/Test/Speaking/DescribeImage';
import ReTellLecture from '../../components/Test/Speaking/ReTellLecture';
import SummarizeSpokenText from '../../components/Test/Listening/SummarizeSpokenText';
import WriteFromDictation from '../../components/Test/Listening/WriteFromDictation';
import SingleChoice from '../../components/Test/Reading/SingleChoice';
import MultipleChoice from '../../components/Test/Reading/MultipleChoice';
// import AnswerShortQuestion from '../../components/Test/Speaking/AnswerShortQuestion';
// import ReTellLecture from '../../components/Test/Speaking/ReTellLecture';
// import SummarizeSpokenText from '../../components/Test/Listening/SummarizeSpokenText';
// import WriteFromDictation from '../../components/Test/Listening/WriteFromDictation';
// import ListeningSingleChoice from '../../components/Test/Listening/SingleChoice';
// import ListeningMultipleChoice from '../../components/Test/Listening/MultipleChoice'
// import HighlightCorrectSummary from '../../components/Test/Listening/HighlightCorrectSummary';
// import SelectMissingWord from '../../components/Test/Listening/SelectMissingWord';
// import ReadingSingleChoice from '../../components/Test/Reading/SingleChoice';
// import ReadingMultipleChoice from '../../components/Test/Reading/MultipleChoice';


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
                setCurrQIdx(_questions.findLastIndex((q) => _answers.find((ans) => ans.question === q._id)) + 1);
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
                        const url = URL.createObjectURL(blobData);
                        let au = document.getElementById('audio');
                    
              
                        au.controls = true;
                        au.src = url;
                        au.preload = "auto";
                      
                        au.load();
                    }}
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
        examTest.status === 'testing' && questions[currQIdx] && (
            <>
                {/* {question.type === 'writing-essay' && <Essay question={question} reload={reload} />}
                        {question.type === 'writing-summarize' && <Summaarize question={question} reload={reload} />}
                        {question.type === 'speaking-read-aloud' && <ReadAloud question={question} reload={reload} />}
                        {question.type === 'speaking-describe-image' && <DescribeImage question={question} reload={reload} />} */}
                {questions[currQIdx].type === 'speaking-repeat-sentence' && <RepeatSentence testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'speaking-answer-short-question' && <AnswerShortQuestion testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'speaking-describe-image' && <DescribeImage testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'speaking-re-tell-lecture' && <ReTellLecture testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'listening-summarize-spoken-text' && <SummarizeSpokenText testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'listening-write-from-dictation' && <WriteFromDictation testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'writing-essay' && <WriteEssay testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'writing-summarize' && <SummarizeWrittenText testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'reading-single-choice' && <SingleChoice testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {questions[currQIdx].type === 'reading-multiple-choice' && <MultipleChoice testId={examTest._id} question={questions[currQIdx]} onPause={handlePause} onNextQ={handleNextQ} />}
                {/* {question.type === 'speaking-answer-short-question' && <AnswerShortQuestion question={question} reload={reload} />}
                        {question.type === 'speaking-re-tell-lecture' && <ReTellLecture question={question} reload={reload} />}
                        {question.type === 'listening-summarize-spoken-text' && <SummarizeSpokenText question={question} reload={reload} />}
                        {question.type === 'listening-write-from-dictation' && <WriteFromDictation question={question} reload={reload} />}
                        {question.type === 'listening-single-choice' && <ListeningSingleChoice question={question} reload={reload} />}
                        {question.type === 'listening-multiple-choice' && <ListeningMultipleChoice question={question} reload={reload} />}
                        {question.type === 'listening-highlight-correct-summary' && <HighlightCorrectSummary question={question} reload={reload} />}
                        {question.type === 'listening-select-missing-word' && <SelectMissingWord question={question} reload={reload} />}
                        {question.type === 'reading-single-choice' && <ReadingSingleChoice question={question} reload={reload} />}
                        {question.type === 'reading-multiple-choice' && <ReadingMultipleChoice question={question} reload={reload} />} */}
            </>
        )
    }
    { confirm && <ConfirmBox {...confirm} /> }
            </Box >
            : <></>
    );
};

export default Component;
