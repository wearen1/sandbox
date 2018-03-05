module.exports = function (core)
 {
  core.downloader.route = core.express.Router();

  core.downloader.route.use('/download/:v_user_id/:jedd_directory_id/:id', core.cors(), core.downloader.controller.download);

 };
