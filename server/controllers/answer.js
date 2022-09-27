const Answer = require('../models/answers');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { UPLOAD } = require('../server');
const fs = require('fs');
const Question = require('../models/questions');
const { areSameIds } = require('../utils');

module.exports = {
    list: async (req, res) => {
        try {
            const { questionId, onlyMe, examTestId } = req.query;
            const filter = {
            };
            if (questionId) filter.question = questionId
            if (onlyMe === 'true') filter.user = req.user._id;
            if (examTestId) {
                filter.user = req.user._id;
                filter.examTestId = examTestId;
            }
            const answers = await Answer.find(filter).sort({ createdAt: -1 }).populate(['user']);
            res.status(200).send(answers);
        } catch (error) {
            console.log(error)
            res.status(500).send({
                error: 'Error'
            });
        }
    },
    create: async (req, res) => {
        try {
            let answer = new Answer({ ...req.body, user: req.user._id });
            const question = await Question.findById(answer.question);
            if (question.type.includes('choice')) {
                const correctAnswers = question.options.filter((o) => o.value === 'true').map(o => o._id)
                if (!correctAnswers.find((id) => !answer.choices.find(c => areSameIds(c, id)))) {
                    answer.score  = question.score
                }
            }
            answer = await answer.save()
            res.status(200).send(answer);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: 'Error'
            });
        }
    },
    createAudio: async (req, res) => {
        try {
            const file = req.file;
            const url = `${UPLOAD}/${file.filename}.wav`;
            fs.renameSync(file.path, file.path + '.wav');
            const answer = new Answer({ question: req.body.question, examTestId: req.body.examTestId, user: req.user._id, audio: { url: req.headers.origin + `/${file.filename}.wav`, name: `${file.filename}.wav` } });
            res.status(200).send(await answer.save());
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: 'Error'
            });
        }
    }
};