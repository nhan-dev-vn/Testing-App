const mongoose = require('mongoose');
const Exam = require('../models/exams');
const { areSameIds } = require('../utils');
const ObjectId = mongoose.Types.ObjectId;
const populate = [
    'parts.questions',
]
module.exports = {
    list: async (req, res) => {
        try {
            const exams = await Exam.find().sort({ createdAt: -1 }).populate(populate);
            res.status(200).send(exams);
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
            const exam = (await Exam.findById(id).populate(populate))
            res.status(200).send(exam);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
};