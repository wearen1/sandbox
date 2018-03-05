module.exports = function (core)
 {
  core.lib.normalize = core.lib.normalize || {};
  core.lib.normalize.port = function (strPort)
   {
    var intPort = parseInt(strPort, 10);

    if (isNaN(intPort)) {
      // named pipe
      return strPort;
    }

    if (intPort >= 0)
     {
       // port number
       return intPort;
     }

    return false;
   }

 };
