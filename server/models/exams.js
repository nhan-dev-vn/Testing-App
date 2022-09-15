var mongoose = require('mongoose');

var examSchema = new mongoose.Schema({
  title: String,
  fullScore: Number,
  timeout: Number,
  questions: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Question'
  }],
  questionGroups: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'QuestionGroup'
  }]
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
