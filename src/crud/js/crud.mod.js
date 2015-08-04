(function (ng) {
    var crud = ng.module('CrudModule', ['restangular', 'ui.bootstrap']);

    crud.config(['RestangularProvider', function (rp) {
            rp.setBaseUrl('webresources');
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
