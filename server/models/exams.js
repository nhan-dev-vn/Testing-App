var mongoose = require('mongoose');

var partShema = new mongoose.Schema({
  title: String, // Listening/Reading/Speaking/Writing
  fullScore: Number,
  questions: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Question'
  }],
  questionGroups: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'QuestionGroup'
  }]
});

var examSchema = new mongoose.Schema({
  title: String,
  fullScore: Number,
  timeout: Number,
  parts: [partShema],
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
