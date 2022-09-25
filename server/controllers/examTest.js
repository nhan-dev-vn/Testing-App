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
}, {
    path: 'examinee'
}]
module.exports = {
    list: async (req, res) => {
        try {
            const { onlyMe } = req.query;
            if (req.user.email !== 'admin@gmail.com' && onlyMe !== 'true') throw 'Not permission';
            const filter = {};
            if (onlyMe === 'true') filter.examinee = req.user._id;
            const examTests = await ExamTest.find(filter).sort({ createdAt: -1 }).populate(populate);
            res.status(200).send(examTests);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    fetchByExamId: async (req, res) => {
        try {
            const { examId } = req.params;
            const filter = {
                exam: examId,
                examinee: req.user._id,
                status: { $ne: 'finished' }
            };
            let examTest = (await ExamTest.findOne(filter).populate(populate))
            
            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    fetchById: async (req, res) => {
        try {
            const { id } = req.params;
            let examTest = (await ExamTest.findById(id).populate(populate))
            if (examTest.status === 'testing') {
                const now = new Date();
                const testedTime = Math.floor((now.getTime() - new Date(examTest.startedAt).getTime()) / 1000)
                const update = {

                }
                if (testedTime > examTest.timeout) {
                    update.status = 'finished'
                    update.finishedAt = now
                } else {
                    update.status = 'paused'
                    update.elapsedTime = examTest.timeout - testedTime
                }
                examTest = await ExamTest.findByIdAndUpdate(examTest._id, {
                    $set: update
                }, { new: true });
            }
            res.status(200).send(examTest);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    create: async (req, res) => {
        try {
            const { examId } = req.body;
            const exam = (await Exam.findById(examId))?.toObject();
            if (!exam) throw "Test template not found";
            let examTest = new ExamTest({
                title: exam.title,
                exam: examId,
                timeout: exam.timeout,
                status: 'new',
                elapsedTime: exam.timeout,
                examinee: req.user._id
            });
            examTest = await examTest.save();
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
                _id: req.params.id,
                status: 'new'
            }, {
                $set: { startedAt: new Date(), status: 'testing' }
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
                _id: req.params.id,
                status: 'testing'
            }, {
                $set: { finishedAt: new Date(), status: 'finished' }
            }, { new: true }).populate(populate))?.toObject();
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
    pauseTesting: async (req, res) => {
        try {
            let examTest = (await ExamTest.findOne({
                examinee: req.user?._id,
                _id: req.params.id,
                status: 'testing'
            }))?.toObject();
            examTest = (await ExamTest.findOneAndUpdate({
                examinee: req.user?._id,
                _id: req.params.id,
                status: 'testing'
            }, {
                $set: { elapsedTime: examTest.timeout - Math.floor((new Date().getTime() - new Date(examTest.startedAt).getTime()) / 1000) , status: 'paused' }
            }, { new: true }).populate(populate))?.toObject();
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
    resumeTesting: async (req, res) => {
        try {
            let examTest = (await ExamTest.findOne({
                examinee: req.user?._id,
                _id: req.params.id,
                status: 'paused'
            }))?.toObject();
            examTest = (await ExamTest.findOneAndUpdate({
                examinee: req.user?._id,
                _id: req.params.id,
                status: 'paused'
            }, {
                $set: { status: 'testing' }
            }, { new: true }).populate(populate))?.toObject();
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
};