var mongoose = require('mongoose');

var answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exemTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamTest',
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  audio: {
    url: String,
    name: String
  },
  text: String,
  choices: [String]
}, { timestamps: true });


const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
