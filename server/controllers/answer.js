const Answer = require('../models/answers');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { UPLOAD } = require('../server');
const fs = require('fs');

module.exports = {
    list: async (req, res) => {
        try {
            const { questionId, onlyMe } = req.query;
            const filter = {
                question: new ObjectId(questionId)
            };
            if (onlyMe === 'true') filter.user = req.user._id;
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
            const answer = new Answer({ ...req.body, user: req.user._id });
            res.status(200).send(await answer.save());
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
            const answer = new Answer({ question: req.body.question, user: req.user._id, audio: { url: req.headers.origin + `/${file.filename}.wav`, name: `${file.filename}.wav` } });
            res.status(200).send(await answer.save());
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: 'Error'
            });
        }
    }
};