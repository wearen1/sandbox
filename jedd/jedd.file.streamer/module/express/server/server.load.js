module.exports = function (core)
 {
  return new core.promise
   (
    function (resolve, reject)
     {
      var intPort_Normalized = core.lib.normalize.port(process.env.PORT || core.configuration.express.port);

      core.express.server = core.http.createServer(core.express.app);
      core.express.server.listen(intPort_Normalized);

      core._.map
       (
        core._.keys(core), function (strModule_Name)
         {
          if (core._.has(core[strModule_Name], 'route'))
           {
            core.express.app.use(core[strModule_Name].route);
           }
         }
       );

      core.express.server.on('error', reject);
      core.express.server.on('listening', resolve);
     }
   );

 };
