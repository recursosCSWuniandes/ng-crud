/**
 * @ngdoc object
 * @name ngCrud.FieldType
 * @description
 * 
 * Defines the configuration for an object attribute
 * 
 * @example
 * <pre>
 * {
 *     displayName: 'String' //Name to display in forms or lists,
 *     type: '', //Type of the field
 *     required: false //Whether the field es required or not
 * }
 * </pre>
 */

/**
 * @ngdoc property
 * @name ngCrud.FieldType#type
 * @propertyOf ngCrud.FieldType
 * @returns {string} Name for field's type
 * 
 * @description Defines the type of the field. Currently the valid types are:
 * <ul>
 * <li>String</li>
 * <li>Image</li>
 * <li>Boolean</li>
 * <li>Reference</li>
 * <li>Date</li>
 * <li>Currency</li>
 * <li>Computed</li>
 * <li>Long</li>
 * <li>Number</li>
 * <li>Integer</li>
 * </ul>
 */

/**
 * @ngdoc property
 * @name ngCrud.FieldType#displayName
 * @propertyOf ngCrud.FieldType
 * @returns {string} Display name for the field
 * 
 * @description Defines the text to show on labels
 */

/**
 * @ngdoc property
 * @name ngCrud.FieldType#required
 * @propertyOf ngCrud.FieldType
 * @returns {boolean} Whether or not the field is required
 * 
 * @description Sets the field as required
 */

/**
 * @ngdoc overview
 * 
 * @name ngCrud
 * 
 * @description
 * 
 * Set of directives to handle specific model definition
 * 
 */

/**
 * @ngdoc object
 * @name ngCrud.ActionType
 * @description
 * 
 * Defines the configuration for an action
 * 
 * @example
 * <pre>
 * refresh: {
 *    displayName: 'Refresh',
 *    icon: 'refresh',
 *    fn: function (record) {},
 *    show: function(record){}
 * }
 * </pre>
 */

(function (ng) {
    var mod = ng.module('ngCrud', ['restangular', 'ui.bootstrap']);

    mod.constant('CrudTemplatesDir', 'src/crud/templates/');

})(window.angular);

(function (ng) {
    var mod = ng.module('ngCrudMock', ['ngMockE2E']);

    mod.provider('MockConfig', [function () {

        var config = {
            baseUrl: 'api' //base path for rest api
        };

        this.setConfig = function (overrides) {
            if (overrides) {
                config = ng.extend(config, overrides);
            }
            return config;
        };

        this.$get = [function () {
            return config;
        }];
    }]);

    mod.value('ngCrudMock.mockRecords', {});

    mod.run(['$httpBackend', 'ngCrudMock.mockRecords', 'MockConfig', function ($httpBackend, mockRecords, config) {
        var baseUrl = config.baseUrl;

        function getQueryParams(url) {
            var vars = {}, hash;
            var hashes = url.slice(url.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }
            return vars;
        }

        function getEntityName(req_url) {
            var url = req_url.split("?")[0];
            var baseRegex = new RegExp(baseUrl + "/");
            var urlSuffix = url.split(baseRegex).pop();
            return urlSuffix.split("/")[0];
        }

        function getRecords(url) {
            var entity = getEntityName(url);
            if (mockRecords[entity] === undefined) {
                mockRecords[entity] = [];
            }
            return mockRecords[entity];
        }

        /*
         * Regular expression for query parameters
         * Accepts any number of query parameters in the format:
         * ?param1=value1&param2=value2&...&paramN=valueN
         */
        var queryParamsRegex = '(([?](\\w+=\\w+))([&](\\w+=\\w+))*)?$';
        var collectionUrl = new RegExp(baseUrl + '/(\\w+)' + queryParamsRegex);
        var recordUrl = new RegExp(baseUrl + '/(\\w+)/([0-9]+)' + queryParamsRegex);
        var ignore_regexp = new RegExp('^((?!' + baseUrl + ').)*$');

        $httpBackend.whenGET(ignore_regexp).passThrough();
        $httpBackend.whenGET(collectionUrl).respond(function (method, url) {
            var records = getRecords(url);
            var responseObj = [];
            var queryParams = getQueryParams(url);
            var page = queryParams.page;
            var maxRecords = queryParams.maxRecords;
            var headers = {};
            if (page && maxRecords) {
                var start_index = (page - 1) * maxRecords;
                var end_index = start_index + maxRecords;
                responseObj = records.slice(start_index, end_index);
                headers = {"X-Total-Count": records.length};
            } else {
                responseObj = records;
            }
            return [200, responseObj, headers];
        });
        $httpBackend.whenGET(recordUrl).respond(function (method, url) {
            var records = getRecords(url);
            var id = parseInt(url.split('/').pop());
            var record;
            ng.forEach(records, function (value) {
                if (value.id === id) {
                    record = ng.copy(value);
                }
            });
            return [200, record, {}];
        });
        $httpBackend.whenPOST(collectionUrl).respond(function (method, url, data) {
            var records = getRecords(url);
            var record = ng.fromJson(data);
            record.id = Math.floor(Math.random() * 10000);
            records.push(record);
            return [201, record, {}];
        });
        $httpBackend.whenPUT(recordUrl).respond(function (method, url, data) {
            var records = getRecords(url);
            var record = ng.fromJson(data);
            ng.forEach(records, function (value, key) {
                if (value.id === record.id) {
                    records.splice(key, 1, record);
                }
            });
            return [200, null, {}];
        });
        $httpBackend.whenDELETE(recordUrl).respond(function (method, url) {
            var records = getRecords(url);
            var id = parseInt(url.split('/').pop());
            ng.forEach(records, function (value, key) {
                if (value.id === id) {
                    records.splice(key, 1);
                }
            });
            return [204, null, {}];
        });
    }]);
})(window.angular);

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
angular.module('ngCrud').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/crud/templates/crud.tpl.html',
    "<toolbar name=\"name\" display-name=\"displayName\" actions=\"ctrl.globalActions\"></toolbar><alert ng-repeat=\"alert in alerts\" type=\"{{alert.type}}\" close=\"ctrl.closeAlert($index)\">{{alert.msg}}</alert><div ng-if=\"!ctrl.editMode\"><div ng-if=\"ctrl.asGallery\"><gallery fields=\"model.fields\" records=\"records\" actions=\"ctrl.recordActions\"></gallery></div><div ng-if=\"!ctrl.asGallery\"><list-records fields=\"model.fields\" records=\"records\" actions=\"ctrl.recordActions\"></list-records></div><div class=\"text-center\"><pagination ng-if=\"ctrl.numPages > 1\" num-pages=\"ctrl.numPages\" total-items=\"ctrl.totalItems\" ng-model=\"ctrl.currentPage\" ng-change=\"ctrl.pageChanged()\" items-per-page=\"ctrl.itemsPerPage\" max-size=\"ctrl.maxSize\" class=\"pagination-md\" boundary-links=\"true\" rotate=\"false\"></pagination></div></div><div ng-if=\"ctrl.editMode\"><div class=\"well\"><form name=\"{{name}}\"><fieldset><crud-form fields=\"model.fields\" record=\"currentRecord\"></crud-form></fieldset></form></div><div id=\"childs\" ng-if=\"model.childs\"><ul class=\"nav nav-tabs\"><li ng-repeat=\"child in model.childs\" role=\"presentation\" ng-class=\"{active: tab === child.name}\" ng-if=\"child.owned || currentRecord.id\"><a href ng-click=\"ctrl.changeTab(child.name)\">{{child.displayName}}</a></li></ul><div ng-repeat=\"child in model.childs\" ng-if=\"tab === child.name && (child.owned || currentRecord.id)\"><div child-controller></div></div></div></div>"
  );


  $templateCache.put('src/crud/templates/datepicker.tpl.html',
    "<p class=\"input-group\"><input type=\"text\" id=\"{{model.name}}\" name=\"{{model.name}}\" class=\"form-control\" ng-model=\"value\" ng-required=\"model.required\" datepicker-popup is-open=\"opened\" readonly> <span class=\"input-group-btn\"><button type=\"button\" id=\"{{model.name}}-datepicker\" class=\"btn btn-default\" ng-click=\"open($event)\"><span class=\"glyphicon glyphicon-calendar\"></span></button></span></p>"
  );


  $templateCache.put('src/crud/templates/form.tpl.html',
    "<input id=\"id\" class=\"form-control\" type=\"hidden\" ng-model=\"record.id\"><div class=\"form-group col-md-12\" ng-repeat=\"(fieldName, field) in fields\" ng-switch=\"field.type\" ng-class=\"{'has-success': form[fieldName].$valid && form[fieldName].$dirty, 'has-error': form[fieldName].$invalid && form[fieldName].$dirty}\"><label for=\"{{fieldName}}\" class=\"col-md-2 control-label\">{{field.displayName}}</label><div class=\"col-md-10\"><input ng-switch-when=\"String\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"text\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"> <input ng-switch-when=\"Currency\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"number\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"> <input ng-switch-when=\"Integer\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"number\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"> <input ng-switch-when=\"Number\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"number\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"> <input ng-switch-when=\"Long\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"number\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"> <input ng-switch-when=\"Boolean\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" ng-checked=\"record[fieldName]\" type=\"checkbox\" ng-model=\"record[fieldName]\" ng-required=\"field.required && record[fieldName].$isEmpty\"> <input ng-switch-when=\"Computed\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"text\" ng-value=\"field.fn(record)\" readonly> <input ng-switch-when=\"Image\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"url\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"><select ng-switch-when=\"Reference\" id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" ng-options=\"rc.name for rc in listsOfValues[fieldName] track by rc.id\" ng-model=\"record[fieldName]\"></select><date-picker ng-switch-when=\"Date\" value=\"record[fieldName]\" model=\"field\"></date-picker><input ng-switch-default id=\"{{fieldName}}\" name=\"{{fieldName}}\" class=\"form-control\" type=\"text\" ng-model=\"record[fieldName]\" ng-required=\"field.required\"></div></div>"
  );


  $templateCache.put('src/crud/templates/gallery.tpl.html',
    "<div class=\"col-sm-12\"><div ng-repeat=\"record in records\"><div class=\"col-md-4 col-sm-6 col-lg-3 well\"><div class=\"col-md-12\"><div class=\"img-thumbnail\" ng-class=\"{'col-sm-4': !$first}\" ng-repeat=\"(key, column) in fields| filter: {type: 'Image'}\" id=\"{{$parent.$index}}-{{column.name}}\" ng-if=\"record[column.name]\"><a ng-href=\"{{record[column.name]}}\" target=\"_blank\"><img class=\"img-responsive\" style=\"height: 20vmax\" ng-src=\"{{record[column.name]}}\" alt=\"{{record[column.name]}}\"></a></div></div><div class=\"caption\"><div ng-repeat=\"(key, column) in fields| filter: {type: '!Image'}\" ng-switch=\"column.type\" id=\"{{$parent.$index}}-{{column.name}}\"><p ng-switch-when=\"Computed\"><strong>{{column.displayName}}:</strong> {{column.fn(record)}}</p><p ng-switch-when=\"Date\"><strong>{{column.displayName}}:</strong> {{record[column.name]| date}}</p><p ng-switch-when=\"Reference\"><strong>{{column.displayName}}:</strong> {{record[column.name].name}}</p><p ng-switch-when=\"Boolean\"><strong>{{column.displayName}}:</strong> <span ng-if=\"record[column.name] !== undefined\" class=\"glyphicon\" ng-class=\"{'glyphicon-check': record[column.name], 'glyphicon-unchecked': !record[column.name]}\"></span></p><p ng-switch-when=\"String\"><strong>{{column.displayName}}:</strong> {{record[column.name]}}</p><p ng-switch-when=\"Currency\"><strong>{{column.displayName}}:</strong> {{record[column.name] | currency}}</p><p ng-switch-default><strong>{{column.displayName}}:</strong> {{record[column.name]}}</p></div></div><p ng-if=\"actions\" class=\"text-center\"><button ng-repeat=\"(key, action) in actions\" id=\"{{$parent.$index}}-{{key}}-btn\" class=\"btn btn-default btn-sm\" ng-class=\"action.class\" ng-show=\"action.show(record)\" ng-click=\"action.fn(record)\"><span class=\"glyphicon glyphicon-{{action.icon}}\"></span> {{action.displayName}}</button></p></div></div></div>"
  );


  $templateCache.put('src/crud/templates/list.tpl.html',
    "<div><table class=\"table table-striped table-bordered\"><thead><tr><th ng-if=\"checklist\" id=\"check-all\"><input type=\"checkbox\" ng-click=\"checkAll()\"></th><th ng-repeat=\"(fieldName, field) in fields\">{{field.displayName}}</th><th ng-if=\"actions\">Actions</th></tr></thead><tbody><tr ng-repeat=\"record in records\"><td ng-if=\"checklist\" id=\"{{$index}}-selected\"><input type=\"checkbox\" ng-model=\"record.selected\"></td><td ng-repeat=\"(fieldName, field) in fields\" ng-switch=\"field.type\" id=\"{{$parent.$index}}-{{fieldName}}\"><div ng-switch-when=\"Computed\">{{field.fn(record)}}</div><div ng-switch-when=\"Currency\">{{record[fieldName] | currency}}</div><div ng-switch-when=\"Date\">{{record[fieldName]| date}}</div><div ng-switch-when=\"Reference\">{{record[fieldName].name}}</div><div ng-switch-when=\"Boolean\"><span ng-if=\"record[fieldName] != undefined\" class=\"glyphicon\" ng-class=\"{'glyphicon-check': record[fieldName], 'glyphicon-unchecked': !record[fieldName]}\"></span></div><div ng-switch-when=\"Image\"><a ng-href=\"{{record[fieldName]}}\">URL</a></div><div ng-switch-when=\"String\">{{record[fieldName]}}</div><div ng-switch-default>{{record[fieldName]}}</div></td><td ng-if=\"actions\"><button ng-repeat=\"(key, action) in actions\" id=\"{{$parent.$index}}-{{key}}-btn\" ng-class=\"action.class || 'btn btn-default btn-sm'\" ng-hide=\"action.show && !action.show(record)\" ng-click=\"action.fn(record)\"><span class=\"glyphicon glyphicon-{{action.icon}}\"></span> {{action.displayName}}</button></td></tr></tbody></table></div>"
  );


  $templateCache.put('src/crud/templates/modal.tpl.html',
    "<div class=\"modal-header\"><h3 class=\"modal-title\">{{name}}</h3></div><div class=\"modal-body\"><list-records fields=\"fields\" records=\"items\" actions=\"recordActions\"></list-records></div><div class=\"modal-footer\"><button class=\"btn btn-default btn-sm\" ng-click=\"ok()\"><span class=\"glyphicon glyphicon-ok\"></span> OK</button> <button class=\"btn btn-default btn-sm\" ng-click=\"cancel()\"><span class=\"glyphicon glyphicon-remove\"></span> Cancel</button></div>"
  );


  $templateCache.put('src/crud/templates/move-lists.tpl.html',
    "<div class=\"col-md-12\"><div class=\"col-md-5\"><fieldset><legend>Selected</legend><select class=\"form-control\" multiple ng-options=\"rc.name for rc in selected track by rc.id\" ng-model=\"selectedMarked\"></select></fieldset></div><div class=\"col-md-2\"><button class=\"form-control btn btn-default\" ng-click=\"$ctrl.removeAll()\">&gt;&gt;</button> <button class=\"form-control btn btn-default\" ng-click=\"$ctrl.removeSome()\">&gt;</button> <button class=\"form-control btn btn-default\" ng-click=\"$ctrl.addSome()\">&lt;</button> <button class=\"form-control btn btn-default\" ng-click=\"$ctrl.addAll()\">&lt;&lt;</button></div><div class=\"col-md-5\"><fieldset><legend>Available</legend><select class=\"form-control\" multiple ng-options=\"rc.name for rc in available track by rc.id\" ng-model=\"availableMarked\"></select></fieldset></div></div>"
  );


  $templateCache.put('src/crud/templates/search.tpl.html',
    "<form novalidate name=\"form\" id=\"{{name}}-form\" role=\"form\" ng-submit=\"submitFn()\" class=\"form-horizontal\"><legend>Search</legend><fieldset><div class=\"form-group col-md-12\" ng-repeat=\"column in fields|filter: {searchable: true}\" ng-switch=\"column.type\" ng-class=\"{'has-success': form[column.name].$valid && form[column.name].$dirty, 'has-error': form[column.name].$invalid && form[column.name].$dirty}\"><label for=\"{{column.name}}-search\" class=\"col-md-2 control-label\">{{column.displayName}}</label><div class=\"col-md-10\"><input ng-switch-when=\"String\" id=\"{{column.name}}-search\" name=\"{{column.name}}\" class=\"form-control\" type=\"text\" ng-model=\"record[column.name]\" ng-required=\"column.required\"> <input ng-switch-when=\"Integer\" id=\"{{column.name}}-search\" name=\"{{column.name}}\" class=\"form-control\" type=\"number\" ng-model=\"record[column.name]\" ng-required=\"column.required\"> <input ng-switch-when=\"Long\" id=\"{{column.name}}-search\" name=\"{{column.name}}\" class=\"form-control\" type=\"number\" ng-model=\"record[column.name]\" ng-required=\"column.required\"> <input ng-switch-when=\"Boolean\" id=\"{{column.name}}-search\" name=\"{{column.name}}\" type=\"checkbox\" ng-model=\"record[column.name]\" ng-checked=\"record[column.name]\" ng-required=\"column.required && record[column.name].$isEmpty\"> <input ng-switch-when=\"Computed\" id=\"{{column.name}}-search\" name=\"{{column.name}}\" class=\"form-control\" type=\"text\" ng-value=\"column.fn(record)\" readonly><select ng-switch-when=\"Reference\" id=\"{{column.name}}-search\" name=\"{{column.name}}\" class=\"form-control\" ng-options=\"rc.name for rc in column.options track by rc.id\" ng-model=\"record[column.name]\"></select><date-picker ng-switch-when=\"Date\" value=\"record[column.name]\" model=\"column\"></date-picker></div></div><div class=\"form-group col-md-12\"><input type=\"submit\" value=\"Search\" class=\"form-control btn btn-primary\"></div></fieldset></form>"
  );


  $templateCache.put('src/crud/templates/toolbar.tpl.html',
    "<nav class=\"navbar navbar-default\" role=\"navigation\"><div class=\"container-fluid\"><div class=\"navbar-header\"><button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#{{name}}-navbar\"><span class=\"sr-only\">Toggle navigation</span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button> <a class=\"navbar-brand\">{{displayName}}</a></div><div class=\"collapse navbar-collapse\" id=\"{{name}}-navbar\"><button ng-repeat=\"(key, action) in actions\" id=\"{{key}}-{{name}}\" ng-hide=\"action.show && !action.show()\" ng-class=\"action.class || 'btn btn-default navbar-btn'\" ng-click=\"action.fn()\"><span class=\"glyphicon glyphicon-{{action.icon}}\"></span> {{action.displayName}}</button></div></div></nav>"
  );

}]);
