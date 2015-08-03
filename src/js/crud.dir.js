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
                templateUrl: 'src/shared/crud/search.tpl.html'
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
                templateUrl: 'src/shared/crud/list.tpl.html',
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
                templateUrl: 'src/shared/crud/gallery.tpl.html'
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
                templateUrl: 'src/shared/crud/toolbar.tpl.html'
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
                templateUrl: 'src/shared/crud/form.tpl.html'
            };
        }]);

    mod.directive('datePicker', [function () {
            return {
                scope: {
                    model: '=',
                    value: '='
                },
                restrict: 'E',
                templateUrl: 'src/shared/crud/datepicker.tpl.html',
                controller: 'datePickerCtrl'
            };
        }]);
})(window.angular);
