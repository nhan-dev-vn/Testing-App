var mongoose = require('mongoose');

var examTestSchema = new mongoose.Schema({
  score: {
    total: Number,
    Listening: Number,
    Reading: Number,
    Speaking: Number,
    Writing: Number
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Exam'
  },
  startedAt: Date,
  finishedAt: Date,
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    choices: [String],
    isCorrect: Boolean,
    score: Number
  }],
  examinee: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }

}, { timestamps: true });

const ExamTest = mongoose.model('ExamTest', examTestSchema);

module.exports = ExamTest;
