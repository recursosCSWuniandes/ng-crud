(function (ng) {
    var mod = ng.module('CrudModule');

    mod.directive('searchBar', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                name: '=',
                model: '=*',
                record: '=',
                submitFn: '&'
            },
            restrict: 'E',
            templateUrl: tplDir + 'search.tpl.html'
        };
    }]);

    mod.directive('listRecords', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                records: '=*',
                model: '=*',
                actions: '=*?',
                checklist: '=?'
            },
            restrict: 'E',
            templateUrl: tplDir + 'list.tpl.html',
            controller: 'listCtrl'
        };
    }]);

    mod.directive('gallery', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                records: '=*',
                model: '=*',
                actions: '=*?',
                checklist: '=?'
            },
            restrict: 'E',
            templateUrl: tplDir + 'gallery.tpl.html'
        };
    }]);

    mod.directive('toolbar', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                actions: '=*',
                name: '=',
                displayName: '='
            },
            restrict: 'E',
            templateUrl: tplDir + 'toolbar.tpl.html'
        };
    }]);

    mod.directive('crudForm', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                name: '=',
                model: '=*',
                record: '='
            },
            restrict: 'E',
            templateUrl: tplDir + 'form.tpl.html'
        };
    }]);

    mod.directive('datePicker', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                model: '=',
                value: '='
            },
            restrict: 'E',
            templateUrl: tplDir + 'datepicker.tpl.html',
            controller: 'datePickerCtrl'
        };
    }]);
})(window.angular);
