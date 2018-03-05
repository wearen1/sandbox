//Window manager
function WindowMgr(scope, compile){

    var overlay = $('.overlay');

    this.close = function () {
        overlay.removeClass("enable");
        overlay.empty();
    };

    this.addWindow = function(type, options, onCreate, onRender){
        var window_scope = scope.$new(true);
        window_scope.options = options;
        if (onCreate) {
            onCreate(window_scope);
        }
        window_scope.close = this.close;
        window_scope.onRender = onRender;
        window_scope.pre = function (f) { //e.g. blocks content when loading
            if(this.options.block !== true) {
                f.apply(this.options, [].slice.call(arguments,1));
            }
        }

        compile(makeWindow(type))
            (window_scope, function(e, scope) {
                overlay.append(e);
                overlay.addClass("enable");
            }
        );
    };

    var makeWindow = function (type) {
        return "" +
            "   <div class='window'>" +
            "       <window type='" + type + "'>" +
            "       </window>" +
            "       <div class='close' ng-click='close()' ng-include=\"'css/images/close.svg'\"></div>" +
            "   </div>";
    };
}
