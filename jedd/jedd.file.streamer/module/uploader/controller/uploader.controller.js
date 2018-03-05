"use strict";

module.exports = function (core)
 {

  var file_Filter = function (request, file, next)
   {
    var blnHasUpload_Access_Code = core._.has(request.body, 'upload_access_code');

    if (!blnHasUpload_Access_Code)
     {
      return next(new Error('core.upload.access.code', 'Missing upload access code'));
     }

    next(null, true);
  };

  var storage = core.multer_s3
   (
     {
      dirname: 'user_data',
      filename: function (request, file, next)
       {
        var strUploadAccessCode = core._.get(request.body, 'upload_access_code', null);

        return core.pg.client.queryAsync
         (
          'SELECT id, jedd_directory_id, v_user_id FROM jedd_file_nodes ' +
          'WHERE upload_access_code = \'' + strUploadAccessCode.toString() + '\';'
         )
        .then
         (
          function (objResult)
           {
            if (objResult.rowCount !== 1)
             {
              throw new Error('core.upload.access.code.found', 'Upload access code not found');
             }

            var objRow = objResult.rows[0];
            var strFile_Extension = '';
            var strFile_Name = objRow.v_user_id + '/' + objRow.jedd_directory_id + '/' + objRow.id;

            if (file.originalname.indexOf('.') !== -1)
             {
               strFile_Extension = '.' + (/.*\.(.+?)$/.exec(file.originalname)[1]);
             }

            request.row = objRow;
            return next(null, strFile_Name);
           }
         )
        .catch
         (
          function (eException)
           {
            return next(eException);
           }
         );
       },
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: 'v-fs',
      region: 'eu-central-1'
    }
  );

 var uploadMiddleware = core.multer
  (
    {
     storage: storage,
     fileFilter: file_Filter
    }
  );

 core.uploader.controller =
  {
   upload:
    [
     uploadMiddleware.single('file'),
     function (request, response, next)
      {
       if (!request.file || !request.row)
        {
         return next();
        }

       return core.pg.client.queryAsync
        (
         'UPDATE jedd_file_nodes ' +
         'SET uploaded = TRUE, ' +
         'name = \'' + request.file.originalname + '\', ' +
         'mime_type = \'' + request.file.mimetype + '\' ' +
         'WHERE id = \'' + request.row.id + '\''
        )
       .then
        (
         function ()
          {
           response.status(200).end();
          }
        )
       .catch
        (
         function (eException)
          {
           next(eException);
          }
        );
      }
    ]
  };

};
