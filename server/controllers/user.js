const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const { UPLOAD } = require('../server');
module.exports = {
    updateProfile: async (req, res) => {
        try {
            const { email, name } = req.body;
            const user = await User.findOneAndUpdate({ _id: req.user?._id }, {
                $set: {
                    email,
                    name
                }
            }, { new: true });
            req.user = user;
            res.cookie('user', JSON.stringify({ _id: user._id, email: user.email, name: user.name }));
            res.status(200).send({ phone, name });
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }

    },
    changeStatus: async (req, res) => {
        try {
            const userId = req.params.userId;
            const { status } = req.body;
            const user = await User.findOneAndUpdate({ _id: userId }, {
                $set: {
                    status
                }
            }, { new: true });
            res.status(200).send({ ...user, password: undefined });
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    },
    list: async (req, res) => {
        try {
            const users = await User.find({ email: { $ne: 'admin@gmail.com' } })
            res.status(200).send(users.map((user) => ({  ...user.toObject(), password: undefined })));
        } catch (error) {
            console.log(JSON.stringify(error))
            res.status(500).send({
                error: JSON.stringify(error)
            });
        }
    }
};