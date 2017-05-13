'use strict';

//https://github.com/cornflourblue/mean-angular2-registration-login-example

var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');

//configure routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/id:', update);
router.delete('/id:', _delete);

module.exports = router;

function authenticate(req, res) {

    userService.authenticate(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.status(401).send('username or password incorrect..!!');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function register(req, res) {

    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {

}