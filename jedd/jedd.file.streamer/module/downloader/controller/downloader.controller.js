"use strict";

module.exports = function (core)
 {

  function byteRange (intFrom, intCount)
   {
    return core.util.format("bytes=%d-%d", intFrom, intFrom + intCount - 1);
   }

  core.downloader.controller =
   {
    download: function (request, response, next)
     {
      return core.pg.client.queryAsync
       (
        'SELECT id, name, jedd_directory_id, v_user_id FROM jedd_file_nodes ' +
        'WHERE id = \'' + request.params.id + '\' LIMIT 1'
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

          var strKey = request.params.v_user_id + '/' + request.params.jedd_directory_id + '/' + request.params.id;
          var strVersion = request.query.v;

          if (!strVersion)
           {
            return core.s3.headObjectAsync
             (
               {
                Bucket: 'v-fs',
                Key: 'user_data/' + strKey
               }
             )
            .then
             (
              function (objS3Object)
               {
                var intContent_Length = +objS3Object.ContentLength;

                var aryChunk = [],
                    intChunk_Position = 0,
                    aryChunk_Size = 100 * 1024; // 100kb

                response.setHeader('Content-Length', intContent_Length);
                response.setHeader('Content-Type', objS3Object.ContentType);
                response.setHeader('Content-Disposition', 'attachment; filename=' + objRow.name);

                while (intContent_Length > 0)
                 {
                  aryChunk.push(byteRange(intChunk_Position, aryChunk_Size));
                  intChunk_Position += aryChunk_Size;
                  intContent_Length -= aryChunk_Size;
                 }

                return core.promise.mapSeries
                 (
                  aryChunk,
                  function (strChunk_Range)
                   {
                    return core.s3.getObjectAsync
                     (
                       {
                        Bucket: 'v-fs',
                        Key: 'user_data/' + strKey,
                        Range: strChunk_Range
                       }
                     )
                    .then
                     (
                      function (objS3Object)
                       {
                        response.write(objS3Object.Body);
                       }
                     );
                   }
                 )
                .then
                 (
                  function ()
                   {
                    response.end();
                   }
                 );
               }
             );
           }
          else
           {
            return core.s3.getObjectAsync
             (
               {
                Bucket: 'v-fs',
                Key: '/' + strKey,
                VersionId: strVersion
               }
             )
            .then
             (
              function(objResult)
               {
                response.send(objResult).end();
               }
             );
           }
         }
       );
     }
   };
 };
