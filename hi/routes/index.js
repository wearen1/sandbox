module.exports = function (app) {
    require("./home")(app);
    require("./auth")(app);
    require("./dialog")(app);
    require("./dialog.api")(app);
    require("./conversation.api")(app);
    require("./user.api")(app);
    require("./setting")(app);
    require("./setting.api")(app);
    require("./notification.api")(app);
};