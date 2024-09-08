'use strict';

var _ = require('lodash');
var config = require('config');
var wrap = require('co-express');
var parse = require('co-body');

var validate = require('jsonschema').validate;

var Store = require('../store');
var Authenticator = require('../authenticator');

const STORE = Store.getStore(config.get('store.type'), config.get('store.options'));

const AUTHENTICATOR = Authenticator.getAuthenticator(config.get('authenticator.type'), config.get('authenticator.options'));

const BATCH_REQUEST_SCHEMA = require('../../schema/http-v1-batch-request-schema.json');

const PRIVATE_LFS = config.get('private');



/**
 * Process upload object
 *
 * @param {String} user
 * @param {String} repo
 * @param {Object} object
 * @returns {Object}
 */
var handleUploadObject = function* (user, repo, object) {
    var oid = object.oid;
    var size = object.size;

    return {
        oid: oid,
        size: size,
        actions: {
            upload: STORE.getUploadAction(user, repo, oid, size),
            verify: STORE.getVerifyAction(user, repo, oid, size)
        }
    };
};

/**
 * Process download object
 *
 * @param {String} user
 * @param {String} repo
 * @param {Object} object
 * @returns {Object}
 */
var handleDownloadObject = function* (user, repo, object) {
    console.log('handleDownloadObject', user, repo, object);
    var oid = object.oid;
    var size = object.size;

    var result = {
        oid: oid,
        size: size
    };

    console.log("checking existence")
    var exist = yield STORE.exist(user, repo, oid);
    if (exist) {
        console.log("exists")
        result.actions = {
            download: STORE.getDownloadAction(user, repo, oid, size)
        };
    } else {
        console.log("does not exist")
        result.error = {
            code: 404,
            message: 'Object does not exist on the server'
        };
    }
    return result;
};

/**
 * Process verify object
 *
 * @param {String} user
 * @param {String} repo
 * @param {Object} object
 * @returns {Object}
 */
var handleVerifyObject = function* (user, repo, object) {
    var oid = object.oid;
    var size = object.size;

    return {
        oid: oid,
        size: size,
        actions: {
            verify: STORE.getVerifyAction(user, repo, oid, size)
        }
    };
};



module.exports = function(app) {
    app.post('/:user/:repo/objects/batch', wrap(function* (req, res, next) {
        // validate request body according to JSON Schema
        try {
            console.log('Received request', req);
            var body = yield parse.json(req);
            req.jsonBody = body;
            var valid = validate(body, BATCH_REQUEST_SCHEMA).valid;
            if (!valid) {
                console.log('Request body is not valid', req.body);
                let err = new Error();
                err.status = 422;
                next(err);
            } else {
                console.log('Request body is valid');
                next();
            }
        } catch (err) {
            console.log('Exception occurred while validating request body', err);
            next(err);
        }
    }), wrap(function* (req, res, next) {
        try {
            console.log('request json body', req.jsonBody);
            console.log("processing request");
            res.set('Content-Type', 'application/vnd.git-lfs+json');

            var body = req.jsonBody;
            var operation = body.operation;

            // validate operation
            if (operation !== 'upload' && operation !== 'verify' && operation !== 'download') {
                console.log('Invalid operation', operation);
                return res.status(422).end();
            }

            let user = req.params.user;
            let repo = req.params.repo;
            let authorization = req.header('Authorization');

            if (PRIVATE_LFS && !authorization) {
                console.log('Authorization header is missing');
                res.set('LFS-Authenticate', 'Basic realm="Git LFS"');
                return res.status(401).end();
            }


            console.log('User', user, 'Repo', repo, 'Authorization', authorization);
            let canRead = yield AUTHENTICATOR.canRead(user, repo, authorization);
            console.log('canRead', canRead);

            if (!canRead) {
                if (authorization) {
                    console.log('User does not have read access');
                    return res.status(403).end();
                } else {
                    console.log('User does not have read access and authorization header is missing');
                    res.set('LFS-Authenticate', 'Basic realm="Git LFS"');
                    return res.status(401).end();
                }

            }

            // validate objects
            let objects = body.objects;
            let results;
            let func;
            let yields = [];

            switch (operation) {
                case 'upload':
                    console.log('upload operation');
                    func = handleUploadObject;
                    // can Write only need to be checked for upload operation
                    let canWrite = yield AUTHENTICATOR.canWrite(user, repo, authorization);
                    if (!canWrite && authorization) {
                        console.log('User does not have write access');
                        return res.status(403).end();
                    }
                    break;
                case 'download':
                    console.log('download operation');
                    func = handleDownloadObject;
                    break;
                case 'verify':
                    console.log('verify operation');
                    func = handleVerifyObject;
                    break;
            }
            _.forEach(objects, function(object) {
                yields.push(func(user, repo, object));
            });

            results = yield yields;

            var response = {
                objects: results
            };
            res.status(200).json(response);
        } catch (err) {
            next(err);
        }

    }));
};
