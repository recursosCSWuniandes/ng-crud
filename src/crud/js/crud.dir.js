(function (ng) {
    var mod = ng.module('ngCrud');
    /**
     * @ngdoc directive
     * @name ngCrud.directive:searchBar
     * @priority 0
     * @restrict E
     * @scope
     * 
     * @param {expression} name name to show in toolbar
     * @param {object} fields definition of the search fields
     * @param {expression} record object to which the result is mapped
     * @param {function} submitFn function to execute when submitting
     * 
     * @description Creates a search form
     */
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

    /**
     * @ngdoc directive
     * @name ngCrud.directive:listRecords
     * @priority 0
     * @restrict E
     * @scope
     * 
     * @param {array} records Array with records to display
     * @param {object} fields definition of the fields
     * @param {object} actions Actions available per record
     * @param {boolean=} checklist Whether or not to show checkboxes
     * 
     * @description 
     * 
     * Creates a table showing the registered fields for every record in <strong>records</strong>
     * 
     */
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
            controller: ['$scope', function ($scope) {
                $scope.checkAll = function () {
                    this.records.forEach(function (item) {
                        item.selected = !item.selected;
                    });
                };
            }]
        };
    }]);

    /**
     * @ngdoc directive
     * @name ngCrud.directive:gallery
     * @priority 0
     * @restrict E
     * @scope
     */
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

    /**
     * @ngdoc directive
     * @name ngCrud.directive:toolbar
     * @priority 0
     * @restrict E
     * @scope
     */
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

    /**
     * @ngdoc directive
     * @name ngCrud.directive:crudForm
     * @scope
     * @priority 0
     * @restrict E
     * @param {object} fields description of fields
     * @param {object} record object in which values will be set
     * @param {object} listOfValues key/value objects where key is an attribute name and values are lists of values
     * 
     * @description
     * 
     * creates form inputs based on a fields description
     * 
     * @example
     * <pre>
     * <crud-form fields="fields" record="myRecord" lists-of-values="lovs"></crud-form>
     * </pre>
     */
    mod.directive('crudForm', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                fields: '=*',
                record: '=',
                listsOfValues: '=*?'
            },
            require: ['^^form'],
            restrict: 'E',
            templateUrl: tplDir + 'form.tpl.html',
            link: function(scope, elem, attr, controllers){
                scope.form = controllers[0];
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name ngCrud.directive:datePicker
     * @scope
     * @priority 0
     * @restrict E
     * @param {object} model {@link ngCrud.model} of the field
     * @description
     * 
     * Creates a text input field with a calendar pop-up
     * 
     * @example
     * 
     * <pre>
     * <date-picker value="person.birthdate" model="birthdateModel"></date-picker>
     * </pre>
     */
    mod.directive('datePicker', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                model: '=',
                value: '='
            },
            restrict: 'E',
            templateUrl: tplDir + 'datepicker.tpl.html',
            controller: ['$scope', function ($scope) {
                $scope.today = function () {
                    $scope.value = new Date();
                };

                $scope.clear = function () {
                    $scope.value = null;
                };

                $scope.open = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened = true;
                };
            }]
        };
    }]);

    /**
     * @ngdoc directive
     * @name ngCrud.directive:moveLists
     * @scope
     * @priority 0
     * @restrict E
     * 
     * @param {array} selected list of selected items
     * @param {array} available list of available items
     * 
     * @description
     * 
     * Creates a view to swap items between two lists
     * 
     * @example
     * <pre>
     *     <move-lists selected="selectedItems" available="availableItems"></move-lists>
     * </pre>
     */
    mod.directive('moveLists', ['CrudTemplatesDir', function (tplDir) {
        return {
            scope: {
                selected: '=*',
                available: '=*'
            },
            restrict: 'E',
            templateUrl: tplDir + 'move-lists.tpl.html',
            controllerAs: '$ctrl',
            controller: ['$scope', function ($scope) {
                function move(src, dst, marked) {
                    // If selected is undefined, all records from src are moved to dst
                    if (!!marked) {
                        for (var i = 0; i < marked.length; i++) {
                            if (marked.hasOwnProperty(i)) {
                                var index = null;
                                for (var j = 0; j < src.length; j++) {
                                    if (src.hasOwnProperty(j)) {
                                        if (src[j].id === marked[i].id) {
                                            index = j;
                                            break;
                                        }
                                    }
                                }
                                if (index !== null) {
                                    dst.push(src.splice(index, 1)[0]);
                                }
                            }
                        }
                    } else {
                        dst.push.apply(dst, src);
                        src.splice(0, src.length);
                    }
                }

                move($scope.available, [], $scope.selected);
                $scope.selectedMarked = [];
                $scope.availableMarked = [];

                this.addSome = function () {
                    move($scope.available, $scope.selected, $scope.availableMarked);
                    $scope.availableMarked = [];
                };
                this.addAll = function () {
                    move($scope.available, $scope.selected);
                    $scope.availableMarked = [];
                };
                this.removeSome = function () {
                    move($scope.selected, $scope.available, $scope.selectedMarked);
                    $scope.selectedMarked = [];
                };
                this.removeAll = function () {
                    move($scope.selected, $scope.available);
                    $scope.selectedMarked = [];
                };
            }]
        };
    }]);
})(window.angular);
