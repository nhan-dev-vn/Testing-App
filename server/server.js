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

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

const UPLOAD = path.join(__dirname, process.env.UPLOAD);
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

app.post('/api/register', ctrlAuth.register);
app.post('/api/login', ctrlAuth.login);
app.post('/api/session-login', ctrlAuth.checkAuth, ctrlAuth.sessionLogin);
app.put('/api/user/update-profile', ctrlAuth.checkAuth, ctrlUser.updateProfile);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
