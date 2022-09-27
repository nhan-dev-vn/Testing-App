var mongoose = require('mongoose');

var answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examTestId: String,
  score: Number,
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
  choices: [String],
  incorrectWords: [{ index: Number, text: String }],
  missingWords: [{ index: Number, text: String, options: [String] }],
  orderParagraphs: [Number]
}, { timestamps: true });


const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
