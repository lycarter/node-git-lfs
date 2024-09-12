# Node Git LFS

A NodeJS implementation of [Git LFS](https://git-lfs.github.com/) Server.

This code is forked from [kzwang/node-git-lfs](https://github.com/kzwang/node-git-lfs), and the primary changes I made were to upgrade to the [AWS SDK for js v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/), since the original implementation used [AWS SDK for js v2](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/aws-jsdk-reference.html), which is [deprecated](https://aws.amazon.com/blogs/developer/announcing-end-of-support-for-aws-sdk-for-javascript-v2/) and will lose support in September 2025. I have not tested anything except the `none` authenticator using S3, since that's the config I use (I only run this on localhost). I recommend following the code from [my blog](https://github.com/lycarter/blog/blob/bb4815ab16b8b471ace15a04f22ea55566764210/.github/workflows/build-and-deploy-to-s3.yml) to get this set up locally or with Github Actions. Good luck!

## Installation
```shell
npm install node-git-lfs
```

## Features

  - Support [Git LFS v1 Batch API](https://github.com/github/git-lfs/blob/master/docs/api/http-v1-batch.md)
  - Support [SSH Authentication](https://github.com/github/git-lfs/tree/master/docs/api#authentication)
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
 - `LFS_STORE_TYPE` - Object store type, can be either `s3` (for AWS S3) or `grid` (for MongoDB GridFS), defaults to `s3`  - **required**
 - `LFS_AUTHENTICATOR_TYPE` - Authenticator type, can be `basic` (for basic username and password), `none` (for no authentication), defaults to `none` - **required**
 - `LFS_JWT_ALGORITHM` - JWT signature algorithm, defaults to `HS256`
 - `LFS_JWT_SECRET` - JWT signature secret - **required**
 - `LFS_JWT_ISSUER` - Issuer of the JWT token, defaults to `node-git-lfs`
 - `LFS_JWT_EXPIRES` - JWT token expire time, defaults to `30m`

If **storage type** is `s3`:

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


##### SSH Environment Variables

  - `LFS_SSH_ENABLED` - Enable SSH server, defaults to `true`
  - `LFS_SSH_PORT` - SSH server port, defaults to `2222`
  - `LFS_SSH_IP` - SSH server bind IP, defaults to `0.0.0.0`
  - `LFS_SSH_PUBLIC_KEY` - SSH server public key - **required** if SSH is enabled
  - `LFS_SSH_PRIVATE_KEY` - SSH server private key - **required** if SSH is enabled
