'use strict';

const { Upload } = require("@aws-sdk/lib-storage");
const { S3 } = require("@aws-sdk/client-s3");

var Store = require('./');

class S3Store extends Store {

    /**
     * Construct S3Store instance
     * @param {Object} options, optional
     */
    constructor(options) {
        super();
        this._options = options || {};

        let s3_config = {
            accessKeyId: this._options.access_key,
            secretAccessKey: this._options.secret_key
        };

        // optional S3 endpoint
        if (this._options.endpoint) {
            s3_config.endpoint = this._options.endpoint;
            s3_config.s3ForcePathStyle = true;
        }

        // optional S3 region
        if (this._options.region) {
            s3_config.region = this._options.region;
        }

        this._s3 = new S3(s3_config);

    }


    put(user, repo, oid, stream) {
        var self = this;
        return new Promise(function(resolve, reject) {
            let storageClass = self._options.storage_class || 'STANDARD';
            let params = {
                Bucket: self._options.bucket,
                Key: S3Store._getKey(user, repo, oid),
                Body: stream,
                StorageClass: storageClass
            };
            const upload = new Upload({
                client: self._s3,
                params: params
            });
            upload.done().then(function (data) {
                resolve();
            }).catch(function (err) {
                console.log(err);
                reject(err);
            });
        });

    }


    get(user, repo, oid) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var params = {Bucket: self._options.bucket, Key: S3Store._getKey(user, repo, oid)};
            self._s3.getObject(params, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data.Body);
            });
        });

    }


    getSize(user, repo, oid) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var params = {Bucket: self._options.bucket, Key: S3Store._getKey(user, repo, oid)};
            self._s3.headObject(params, function (err, data) {
                if (err) {
                    if (err.statusCode === 404) {
                        return resolve(-1);
                    }
                    reject(err);
                }
                resolve(Number(data.ContentLength));
            });
        });
    }


    static _getKey(user, repo, oid) {
        return `${user}/${repo}/${oid}`;
    }

}



module.exports = S3Store;