module.exports = function (app) {
    app.get('/setting', function (req, res) {
        res.render('setting', {
            user: req.user
        });
    });
};