'use strict';

var config = require('config.json');
var _ = require('lodash');
var token = require('jwtwebtoken');
var bcrypt = require('bcryptjs');
var q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

// export service to entire app
module.export = service;

function authenticate(username, password) {
    var deferred = q.defere();

    db.users.findOne({ username: username }, function (err, user) {

        if (err) {
            deferred.reject(err.name + ' ' + err.message);
        }

        if (user && bcrypt.compareSync(password, user.hash)) {
            //authentication successful
            deferred.resolve({
                id: user.id,
                username: user.usename,
                firstname: user.firstname,
                lastname: user.lasename,
                token: token.sign({ sub: user.id }, config.secret)
            });
        } else {
            //authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = q.defer();

    db.users.find().toArray(function (err, users) {

        if (err) {
            deferred.reject(err.name + ' ' + err.message)
        }

        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}

function getById(id) {
    var deferred = q.defer();

    db.user.findById(id, function (err, user) {

        if (err) {
            deferred.reject(err.name + ' ' + err.message);
        }

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {

    var deferred = q.defer();

    db.users.findOne({ username: userParam.username }, function (err, user) {
        if (err) {
            deferred.reject(err.name + ': ' + err.message);
        }

        if (user) {
            // username already exists
            deferred.reject('Username "' + userParam.username + '" is already taken');
        } else {
            createUser();
        }
    });

    function createUser() {
        var user = _.omit(userParam, 'password');

        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.users.insert(user, function (err, doc) {
            if (err) {
                deferred.reject(err.name + ': ' + err.message);
            }
            deferred.resolve();
        });

    }

    return deferred.promise;
}

function update(id, userParam) {
    var deferred = Q.defer();

    // validation
    db.users.findById(id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.users.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        db.users.update(
            { id: mongo.helper.toObjectID(id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(id) {
    var deferred = Q.defer();

    db.users.remove(
        { id: mongo.helper.toObjectID(id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

