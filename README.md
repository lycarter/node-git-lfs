# Node Git LFS
[![Build Status](https://travis-ci.org/kzwang/node-git-lfs.svg?branch=master)](https://travis-ci.org/kzwang/node-git-lfs)
[![Coverage Status](https://coveralls.io/repos/kzwang/node-git-lfs/badge.svg?branch=master&service=github)](https://coveralls.io/github/kzwang/node-git-lfs?branch=master)
[![Code Climate](https://codeclimate.com/github/kzwang/node-git-lfs/badges/gpa.svg)](https://codeclimate.com/github/kzwang/node-git-lfs)

A NodeJS implementation of [Git LFS](https://git-lfs.github.com/) Server.

## Installation
```shell
npm install node-git-lfs
```

## Features

  - Support [Git LFS v1 Batch API](https://github.com/github/git-lfs/blob/master/docs/api/http-v1-batch.md)
  - Multiple store supported - currently `AWS S3` and `MongoDB GridFS`
  - Multiple authentication method support - currently `basic` and `none`
  - Use [JWT](http://jwt.io) to secure `download`, `upload` and `verify` endpoints
  - Option to directly upload to and download from AWS S3
  - Use SHA256 checksum when upload directly to AWS S3

## Configuration
All configurations can be done via environment variable or configuration file

#### Environment Variables

 - `LFS_BASE_URL` - URL of the LFS server - **required**
 - `LFS_PORT` - HTTP portal of the LFS server, defaults to `3000` - **required**
 - `LFS_STORE_TYPE` - Object store type, can be either `s3` (for AWS S3), `s3_direct` (for direct upload and download from AWS S3) or `grid` (for MongoDB GridFS), defaults to `s3`  - **required**
 - `LFS_AUTHENTICATOR_TYPE` - Authenticator type, can be `basic` (for basic username and password), `none` (for no authentication), defaults to `none` - **required**
 - `LFS_JWT_ALGORITHM` - JWT signature algorithm, defaults to `HS256`
 - `LFS_JWT_SECRET` - JWT signature secret - **required**
 - `LFS_JWT_ISSUER` - Issuer of the JWT token, defaults to `node-git-lfs`
 - `LFS_JWT_EXPIRES` - JWT token expire time, defaults to `30m`

If **storage type** is `s3` or `s3_direct`:

 - `AWS_ACCESS_KEY` - AWS access key - **required**
 - `AWS_SECRET_KEY` - AWS secret key - **required**
 - `LFS_STORE_S3_BUCKET` - AWS S3 bucket - **required**
 - `LFS_STORE_S3_ENDPOINT` - AWS S3 endpoint, normally this will be set by region
 - `LFS_STORE_S3_REGION` - AWS S3 region
 - `LFS_STORE_S3_STORAGE_CLASS` - AWS S3 storage class, can be `STANDARD`, `STANDARD_IA` or `REDUCED_REDUNDANCY`, defaults to `STANDARD`

If **storage type** is `grid`:

 - `LFS_STORE_GRID_CONNECTION` - MongoDB connection URL - **required**

If **authenticator type** is `basic`:

  - `LFS_AUTHENTICATOR_USERNAME` - Username - **required**
  - `LFS_AUTHENTICATOR_PASSWORD` - Password - **required**
  - `LFS_AUTHENTICATOR_CLIENT_PUBLIC_KEY` - Location of the client's public key