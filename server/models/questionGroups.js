var mongoose = require('mongoose');

var questionGroupSchema = new mongoose.Schema({
  passage: {
    html: String,
    text: String,
    audioUrl: String,
    videoUrl: String,
    iamges: [{
      name: String,
      url: String
    }],

  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Question'
  }]
}, { timestamps: true });


const QuestionGroup = mongoose.model('QuestionGroup', questionGroupSchema);

module.exports = QuestionGroup;
