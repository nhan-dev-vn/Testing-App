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
            const question = (await Question.findById(answer.question))?.toObject();
            let score = 0;
            if (['Single Choice', 'Multiple Choice'].includes(question.ansType)) {
                const correctAnswers = question.options.filter((o) => o.value === 'true').map(o => o._id)
                if (correctAnswers.length === answer.choices.length && !correctAnswers.find((id) => !answer.choices.find(c => areSameIds(c, id)))) {
                    score = question.score
                }
            }
            if (question.type === 'listening-highlight-incorrect-words') {
                const correctAnswers = question.incorrectWords.map(w => w.index);
                const select = answer.incorrectWords.map(w => w.index)
                if (correctAnswers.length === select.length && !correctAnswers.find((ans) => !select.includes(ans))) {
                    score = question.score;
                }
            }
            if (question.type === 'listening-fill-in-the-blanks') {
                const correctAnswers = question.missingWords;
                const select = req.body.missingWords
                let check = true;
                correctAnswers.forEach((w) => {
                    const _c = select.find(_w => w.index === _w.index && w.text === _w.text);
                    if (!_c) {
                        check = false;
                    }
                });
                if (check) {
                    score = question.score;
                }
            }
            if (question.type === 'reading-fill-in-the-blanks') {
                const correctAnswers = question.missingWords;
                const select = req.body.missingWords
                let check = true;
                correctAnswers.forEach((w) => {
                    const _c = select.find(_w => w.index === _w.index && w.text === _w.text);
                    if (!_c) {
                        check = false;
                    }
                });
                if (check) {
                    score = question.score;
                }
            }
            if (question.type === 'reading-re-order-paragraphs') {
                const order = req.body.orderParagraphs
                let check = true;
                question.options.forEach((o, idx) => {
                    const id = idx + 1;
                    const index = order.findIndex(or => or === id)  + 1;
                    if (o.value !== index.toString()) {
                        check = false;
                    }
                })
                if (check) {
                    score = question.score;
                }
            }
            if (question.type === 'reading-fill-in-the-blanks-drop') {
                let check = true;
                question.options.forEach(o => {
                    if (o.value !== '0' && req.body.choices[parseInt(o.value) - 1] !== o.text) check = false;
                });
                if (check) score = question.score
            }
            answer.score = score
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