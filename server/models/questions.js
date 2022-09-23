var mongoose = require('mongoose');

var optionSchema = new mongoose.Schema({
  html: String,
  text: String,
  iamges: [{
    name: String,
    url: String
  }],
  value: String // true/false
});

var questionSchema = new mongoose.Schema({
  question: {
    html: String,
    text: String,
    audioUrl: String,
    videoUrl: String,
    iamges: [{
      name: String,
      url: String
    }]
  },
  name: String,
  type: String, // writing-summarize/writing-essay/speaking-read-aloud
  prepareTimeout: Number,
  timeout: Number,
  ansType: String, // Multiple Choice/Single Choice/Audio/Text
  options: [optionSchema],
  score: Number,
  group: {
    type: mongoose.Schema.Types.ObjectId, ref: 'QuestionGroup'
  }
}, { timestamps: true });


const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
