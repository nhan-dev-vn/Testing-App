const Question = require('../models/questions');

module.exports = {
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.findById(id);
            res.status(200).send(question);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: 'Error'
            });
        }

    },
    list: async (req, res) => {
        try {
            const { type } = req.query;
            const questions = await Question.find({
                type: { $regex: type }
            });
            res.status(200).send(questions);
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: 'Error'
            });
        }

    },
};