(function (ng) {
    var mod = ng.module('CrudModule');

    mod.directive('searchBar', [function () {
            return {
                scope: {
                    name: '=',
                    model: '=*',
                    record: '=',
                    submitFn: '&'
                },
                restrict: 'E',
                templateUrl: 'src/templates/search.tpl.html'
            };
        }]);

    mod.directive('listRecords', [function () {
            return {
                scope: {
                    records: '=*',
                    model: '=*',
                    actions: '=*?',
                    checklist: '=?'
                },
                restrict: 'E',
                templateUrl: 'src/templates/list.tpl.html',
                controller: 'listCtrl'
            };
        }]);

    mod.directive('gallery', [function () {
            return {
                scope: {
                    records: '=*',
                    model: '=*',
                    actions: '=*?',
                    checklist: '=?'
                },
                restrict: 'E',
                templateUrl: 'src/templates/gallery.tpl.html'
            };
        }]);

    mod.directive('toolbar', [function () {
            return {
                scope: {
                    actions: '=*',
                    name: '=',
                    displayName: '='
                },
                restrict: 'E',
                templateUrl: 'src/templates/toolbar.tpl.html'
            };
        }]);

    mod.directive('crudForm', [function () {
            return {
                scope: {
                    name: '=',
                    model: '=*',
                    record: '='
                },
                restrict: 'E',
                templateUrl: 'src/templates/form.tpl.html'
            };
        }]);

    mod.directive('datePicker', [function () {
            return {
                scope: {
                    model: '=',
                    value: '='
                },
                restrict: 'E',
                templateUrl: 'src/templates/datepicker.tpl.html',
                controller: 'datePickerCtrl'
            };
        }]);
})(window.angular);
