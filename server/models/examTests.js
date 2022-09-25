var mongoose = require('mongoose');

var examTestSchema = new mongoose.Schema({
  title: String,
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
  timeout: Number,
  elapsedTime: Number,
  startedAt: Date,
  status: String, // new/testing/paused/finished
  finishedAt: Date,
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    choices: [String],
    audioUrl: String,
    isCorrect: Boolean,
    score: Number,
    text: {
      html: String,
      text: String,
      iamges: [{
        name: String,
        url: String
      }],
    }
  }],
  examinee: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }

}, { timestamps: true });

const ExamTest = mongoose.model('ExamTest', examTestSchema);

module.exports = ExamTest;
