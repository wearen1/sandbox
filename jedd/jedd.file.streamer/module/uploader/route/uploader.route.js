module.exports = function (core)
 {
  core.uploader.route = core.express.Router();
  
  core.uploader.route.use('/upload', core.cors());
  core.uploader.route.post('/upload/', core.uploader.controller.upload);

 };
