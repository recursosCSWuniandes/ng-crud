(function (ng) {
    var mod = ng.module('ngCrud', ['restangular', 'ui.bootstrap']);

    var tplDir = 'src/crud/templates/';

    mod.constant('CrudTemplatesDir', tplDir);

    mod.constant('CrudTemplateURL', tplDir + 'crud.tpl.html');

    mod.constant('CrudCtrlAlias', 'ctrl');

    mod.config(['RestangularProvider', function (rp) {
            rp.addRequestInterceptor(function (data, operation) {
                if (operation === "remove") {
                    return null;
                }
                return data;
            });
            rp.addResponseInterceptor(function (data, operation, what, url, response) {
                if (operation === "getList" && response.headers("X-Total-Count")) {
                    data.totalRecords = parseInt(response.headers("X-Total-Count"));
                }
                return data;
            });
        }]);
})(window.angular);
