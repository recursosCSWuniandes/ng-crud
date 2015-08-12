(function (ng) {
    var mod = ng.module('ngCrud');

    mod.directive('searchBar', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                name: '=',
                fields: '=*',
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
                fields: '=*',
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
                fields: '=*',
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
                fields: '=*',
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

    mod.directive('childController', ['$compile', 'CrudCtrlAlias', function ($compile, alias) {
        return {
            restrict: 'A',
            terminal: true,
            priority: 100000,
            link: function (scope, elem) {
                elem.removeAttr('child-controller');
                if (scope.child && scope.child.ctrl) {
                    elem.attr('ng-controller', scope.child.ctrl + " as " + alias);
                    elem.attr('ng-include', scope.child.template?'child.template':'ctrl.tpl');
                    $compile(elem)(scope);
                }
            }
        };
    }]);
})(window.angular);