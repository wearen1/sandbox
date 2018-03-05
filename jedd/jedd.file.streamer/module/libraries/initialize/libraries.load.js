module.exports = function (core)
 {
  core._ = require('lodash');
  core.express = require('express');
  core.promise = require('bluebird');
  core.fs = core.promise.promisifyAll(require('fs'));
  core.aws = require('aws-sdk');
  core.path = require('path');
  core.logger = require('morgan');
  core.bodyParser = require('body-parser');
  core.debug = require('debug')('jedd.file-streamer:server');
  core.http = require('http');
  core.archiver = require('archiver');
  core.aws.config.update
   (
     {
      region: process.env['AWS_REGION'],
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
      signatureVersion: 'v4'
     }
   );
  core.s3 = core.promise.promisifyAll(new core.aws.S3());
  core.multer = require('multer');
  core.multer_s3 = require('multer-s3');
  core.redis = require('redis');
  core.pg = core.promise.promisifyAll(require('pg').native);
  core.url = require('url');
  core.querystring = require('querystring');
  core.util = require('util');
  core.cors = require('cors');

 };