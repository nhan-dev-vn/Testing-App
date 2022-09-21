const mongoose = require('mongoose');
const ExamTest = require('../models/examTests');
const Exam = require('../models/exams');
const { areSameIds } = require('../utils');
const { UPLOAD, server } = require('../server');
const fs = require('fs');
const path = require('path');
const ObjectId = mongoose.Types.ObjectId;
const populate = [{
    path: 'exam',
    populate: [
        'parts.questions',
        'parts.questionGroups'
    ]
}]
module.exports = {
    list: async (req, res) => {
        try {
            const examTests = await ExamTest.find().sort({ createdAt: -1 }).populate(['examinee', 'exam']);
            res.status(200).send(examTests);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    fetch: async (req, res) => {
        try {
            const { id } = req.params;
            let examTest = (await ExamTest.findOne({
                _id: id
            }).populate([...populate, 'examinee']))
            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    fetchOrCreate: async (req, res) => {
        try {
            const exam = await Exam.findOne({ _id: ObjectId("63238be0723add4502fdb135") });
            let examTest = (await ExamTest.findOne({
                examinee: req.user?._id,
                finishedAt: null
                // $or: [{
                //     startedAt: null
                // }, {
                //     $and: [{
                //         startedAt: { $gt: new Date(new Date().getTime() - exam.timeout * 60 * 1000) }
                //     }, {
                //         finishedAt: null
                //     }]
                // }]
            }).populate(populate))
            if (!examTest) {
                examTest = await (new ExamTest({
                    exam: ObjectId("63238be0723add4502fdb135"),
                    examinee: req.user?._id,
                    answers: []
                })).save();
                examTest = (await ExamTest.findOne({
                    _id: examTest._id,
                }).populate(populate))
            }

            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    startTesting: async (req, res) => {
        try {
            let examTest = (await ExamTest.findOneAndUpdate({
                examinee: req.user?._id,
                _id: req.params.id
            }, {
                $set: { startedAt: new Date() }
            }, { new: true }).populate(populate))
            if (!examTest) {
                throw "Not found";
            }
            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    finishTesting: async (req, res) => {
        try {
            let examTest = (await ExamTest.findOneAndUpdate({
                examinee: req.user?._id,
                _id: req.params.id
            }, {
                $set: { finishedAt: new Date() }
            }, { new: true }).populate(populate))?.toObject();
            if (!examTest) {
                throw "Not found";
            }
            const exam = examTest.exam;
            const score = {
                Listening: 0,
                Reading: 0,
                Speaking: 0,
                Writing: 0,
                total: 0
            };
            exam.parts.forEach((part) => {
                part.questions.forEach((q) => {
                    const ans = examTest.answers.find((ans) => areSameIds(ans.question, q._id));
                    if (ans) {
                        if (q.ansType === 'Single Choice') {
                            const correctOptionId = q.options.find((o) => o.value === 'true')?._id;
                            if (ans.choices.find(choice => areSameIds(choice, correctOptionId))) {
                                score[part.title]+=q.score;
                                score.total+=q.score;
                            }
                        }
                    }
                });
            });
            examTest = await ExamTest.findOneAndUpdate({
                _id: req.params.id
            }, {
                $set: {
                    score
                }
            }, { new: true }).populate(populate);
            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    updateAnswer: async (req, res) => {
        try {
            let examTest = (await ExamTest.findOneAndUpdate({
                examinee: req.user?._id,
                _id: req.params.id
            }, {
                $set: { answers: req.body.answers }
            }, { new: true }).populate(populate))
            if (!examTest) {
                throw "Not found";
            }

            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    updateAudioAnswer: async (req, res) => {
        try {
            const { examTestId, questionId, answers: _answers } = req.body;
            const answers = JSON.parse(_answers);
            const file = req.file;
            const url = `${UPLOAD}/${examTestId}_${questionId}_${file.filename}.wav`;
            if (fs.existsSync(url)) fs.unlinkSync(url);
            fs.copyFileSync(file.path, url);
            fs.unlinkSync(file.path);
            const examTest = await ExamTest.findOneAndUpdate({ _id: examTestId, examinee: req.user._id }, {
                $set: {
                    answers: answers.map((ans) => areSameIds(ans.question, questionId) ? ({ ...ans, audioUrl: `${req.headers.origin}/api/exam-test/${examTestId}/question/${questionId}/filename/${file.filename}/audio-answer` }) : ans )
                }
            }, { new: true });
            res.status(200).send(examTest.answers);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    getAudioAnswer: async (req, res) => {
        try {
            const { examTestId, questionId, filename } = req.params;
            const filter = {
                _id: examTestId
            };
            if (req.user.email !== 'admin@gmail.com') filter.examinee = req.user._id;
            const examTest = await ExamTest.findOne(filter);
            if (!examTest) res.status(404).send({ error: 'Not found' });
            else res.sendFile(path.join(__dirname, '../upload', `${examTestId}_${questionId}_${filename}.wav`));
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    }
};