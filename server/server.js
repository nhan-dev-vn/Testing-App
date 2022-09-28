const express = require('express')
const app = express()
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 3001;
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
require('./db');
require('dotenv').config();

app.use(cors({
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
 }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));

const UPLOAD = path.join(__dirname, process.env.UPLOAD);
app.use(express.static(UPLOAD));


module.exports = {
    UPLOAD
};

if (!fs.existsSync(UPLOAD)) {
    fs.mkdirSync(UPLOAD, { recursive: true });
}

const upload = multer({
    dest: UPLOAD
});

const ctrlAuth = require('./controllers/auth');
const ctrlUser = require('./controllers/user');
const ctrlExamTest = require('./controllers/examTest');
const ctrlQuestion = require('./controllers/question');
const ctrlAnswer = require('./controllers/answer');
const ctrlExam = require('./controllers/exam');

app.post('/api/register', ctrlAuth.register);
app.post('/api/login', ctrlAuth.login);
app.post('/api/logout', ctrlAuth.checkAuth, ctrlAuth.logout);
app.get('/api/session-login', ctrlAuth.checkAuth, ctrlAuth.sessionLogin);
app.post('/api/user/update-profile', ctrlAuth.checkAuth, ctrlUser.updateProfile);
app.get('/api/exams', ctrlAuth.checkAuth, ctrlExam.list);
app.get('/api/exams/:id', ctrlAuth.checkAuth, ctrlExam.fetch);
app.get('/api/question/:id', ctrlAuth.checkAuth, ctrlQuestion.getOne);
app.get('/api/questions', ctrlAuth.checkAuth, ctrlQuestion.list);
app.post('/api/answer', ctrlAuth.checkAuth, ctrlAnswer.create);
app.post('/api/answer/audio', ctrlAuth.checkAuth, upload.single('audio'), ctrlAnswer.createAudio);
app.get('/api/answers', ctrlAuth.checkAuth, ctrlAnswer.list);
app.post('/api/exam-test/:id/start-testing', ctrlAuth.checkAuth, ctrlExamTest.startTesting);
app.post('/api/exam-test/:id/pause-testing', ctrlAuth.checkAuth, ctrlExamTest.pauseTesting);
app.post('/api/exam-test/:id/resume-testing', ctrlAuth.checkAuth, ctrlExamTest.resumeTesting);
app.post('/api/exam-test/:id/finish-testing', ctrlAuth.checkAuth, ctrlExamTest.finishTesting);
app.get('/api/exam-tests', ctrlAuth.checkAuth, ctrlExamTest.list);
app.get('/api/exam-tests/:id', ctrlAuth.checkAuth, ctrlExamTest.fetchById);
app.get('/api/exam-tests/exams/:examId', ctrlAuth.checkAuth, ctrlExamTest.fetchByExamId);
app.post('/api/exam-tests/new', ctrlAuth.checkAuth, ctrlExamTest.create)

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
