var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
  question: {
    html: String,
    text: String,
    iamges: [{
      name: String,
      url: String
    }]
  },
  ansType: String, // Multiple Choice/Single Choice/Audio/Text
  options: [{
    html: String,
    text: String,
    iamges: [{
      name: String,
      url: String
    }],
    isCorrect: Boolean
  }],
  score: Number,
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'QuestionGroup'
  }
}, { timestamps: true });


const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
