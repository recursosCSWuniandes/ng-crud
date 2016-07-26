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

    mod.controller('modalCtrl', ['$scope', '$modalInstance', 'items', 'name', 'currentItems',
        function ($scope, $modalInstance, items, name, currentItems) {
        $scope.fields = [{name: 'name', displayName: 'Name', type: 'String'}];
        $scope.name = name;
        $scope.items = items.plain();
        var self = this;

        $scope.recordActions = {
            add: {
                displayName: 'Add',
                icon: 'plus',
                fn: function (rc) {
                    rc.selected = true;
                    currentItems.customPOST(rc, rc.id);
                },
                show: function (rc) {
                    return !self.readOnly && !rc.selected;
                }
            }
        };

        function loadSelected(list, selected) {
            ng.forEach(selected, function (selectedValue) {
                ng.forEach(list, function (listValue) {
                    if (listValue.id === selectedValue.id) {
                        listValue.selected = true;
                    }
                });
            });
        }

        loadSelected($scope.items, currentItems);

        function getSelectedItems() {
            return $scope.items.filter(function (item) {
                return !!item.selected;
            });
        }

        $scope.ok = function () {
            $modalInstance.close(getSelectedItems());
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
})(window.angular);

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
            controller: ['$scope', function ($scope) {
                $scope.checkAll = function () {
                    this.records.forEach(function (item) {
                        item.selected = !item.selected;
                    });
                };
            }]
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

    mod.directive('childController', ['$compile', 'CrudCtrlAlias', function ($compile, alias) {
        return {
            restrict: 'A',
            terminal: true,
            priority: 100000,
            link: function (scope, elem) {
                elem.removeAttr('child-controller');
                if (scope.child && scope.child.ctrl) {
                    elem.attr('ng-controller', scope.child.ctrl + " as " + alias);
                    elem.attr('ng-include', scope.child.template ? 'child.template' : 'ctrl.tpl');
                    $compile(elem)(scope);
                }
            }
        };
    }]);

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

(function (ng, Math) {
    var mod = ng.module('ngCrud');

    function buildGlobalActions(ctrl) {
        return {
            create: {
                displayName: 'Create',
                icon: 'plus',
                fn: function () {
                    ctrl.createRecord();
                },
                show: function () {
                    return !ctrl.readOnly && !ctrl.editMode;
                }
            },
            refresh: {
                displayName: 'Refresh',
                icon: 'refresh',
                fn: function () {
                    ctrl.fetchRecords();
                },
                show: function () {
                    return !ctrl.editMode;
                }
            },
            save: {
                displayName: 'Save',
                icon: 'save',
                fn: function () {
                    ctrl.saveRecord();
                },
                show: function () {
                    return !ctrl.readOnly && ctrl.editMode;
                }
            },
            cancel: {
                displayName: 'Cancel',
                icon: 'remove',
                fn: function () {
                    ctrl.fetchRecords();
                }

                ,
                show: function () {
                    return !ctrl.readOnly && ctrl.editMode;
                }
            }
        };
    }

    function buildRecordActions(ctrl) {
        return {
            edit: {
                displayName: 'Edit',
                icon: 'edit',
                fn: function (rc) {
                    ctrl.editRecord(rc);
                },
                show: function () {
                    return !ctrl.readOnly;
                }
            },
            delete: {
                displayName: 'Delete',
                icon: 'minus',
                fn: function (rc) {
                    ctrl.deleteRecord(rc);
                },
                show: function () {
                    return !ctrl.readOnly;
                }
            }
        };
    }

    mod.service('CrudCreator', ['Restangular', '$injector', 'CrudTemplateURL', 'modalService', '$location', function (RestAngular, $injector, tplUrl, modalService, $location) {

        /*
         * Función constructora para un controlador con funcionalidad genérica.
         * Añade comportamiento para:
         *   Manejo de alertas
         *   Manejo de paginación
         *   Acciones para CRUD
         *   Carga de opciones de referencias
         */
        function extendCommonCtrl(scope, model, name, displayName) {
            //Variables para el scope
            scope.name = name;
            scope.displayName = displayName;
            scope.model = model;
            scope.currentRecord = {};
            scope.records = [];
            scope.alerts = [];

            //Paginación
            this.maxSize = 5;
            this.itemsPerPage = 10;
            this.totalItems = 0;
            this.currentPage = 1;
            this.numPages = 0;

            this.pageChanged = function () {
                this.fetchRecords();
            };

            //Variables para el controlador
            this.readOnly = false;
            this.editMode = false;
            this.tpl = tplUrl;
            this.asGallery = false;

            //Alertas
            function showMessage(msg, type) {
                var types = ['info', 'danger', 'warning', 'success'];
                if (types.some(function (rc) {
                        return type === rc;
                    })) {
                    scope.alerts.push({type: type, msg: msg});
                }
            }

            this.showError = function (msg) {
                showMessage(msg, 'danger');
            };

            this.showSuccess = function (msg) {
                showMessage(msg, 'success');
            };

            this.showWarning = function (msg) {
                showMessage(msg, 'warning');
            };

            this.showInfo = function (msg) {
                showMessage(msg, 'info');
            };

            this.closeAlert = function (index) {
                scope.alerts.splice(index, 1);
            };

            //Código para cargar los valores de las referencias
            this.loadRefOptions = function () {
                var self = this;

                function loadFieldOptions(field) {
                    var url = $injector.get(field.url);
                    RestAngular.all(url).getList().then(function (data) {
                        field.options = data.plain();
                        if (!field.required) {
                            field.options.unshift(null);
                        }
                    }, function (response) {
                        self.showError(response.data);
                    });
                }

                var model = scope.model.fields;
                for (var i in model) {
                    if (model.hasOwnProperty(i)) {
                        var field = model[i];
                        if (field.type === 'Reference' && !!field.url) {
                            if ($injector.has(field.url)) {
                                loadFieldOptions(field);
                            }
                        }
                    }
                }
            };

            //Configuración de acciones
            this.globalActions = buildGlobalActions(this);
            this.recordActions = buildRecordActions(this);
        }

        function extendCtrl(scope, model, url, name, displayName) {
            extendCommonCtrl.call(this, scope, model, name, displayName);
            var self = this;

            //Funciones del controlador
            function responseError(response) {
                self.showError(response.data);
            }

            this.changeTab = function (tab) {
                scope.tab = tab;
            };

            this.fetchRecords = function () {
                var queryParams = {page: this.currentPage, maxRecords: this.itemsPerPage};
                ng.extend(queryParams, $location.search());
                return RestAngular.all(url).getList(queryParams).then(function (data) {
                    scope.records = data;
                    self.totalItems = data.totalRecords;
                    scope.currentRecord = {};
                    self.editMode = false;
                    return data;
                }, responseError);
            };

            this.createRecord = function () {
                scope.$broadcast('pre-create', scope.currentRecord);
                this.editMode = true;
                scope.currentRecord = {};
                scope.$broadcast('post-create', scope.currentRecord);
            };

            this.editRecord = function (record) {
                scope.$broadcast('pre-edit', record);
                return record.get().then(function (data) {
                    scope.currentRecord = data;
                    self.editMode = true;
                    scope.$broadcast('post-edit', data);
                    return data;
                }, responseError);
            };
            this.saveRecord = function () {
                var promise, record = scope.currentRecord;
                if (record.id) {
                    promise = record.put();
                } else {
                    promise = scope.records.post(record);
                }
                promise.then(function () {
                    self.fetchRecords();
                }, responseError);
            };
            this.deleteRecord = function (record) {
                return record.remove().then(function () {
                    self.fetchRecords();
                }, responseError);
            };
        }

        function commonChildCtrl(scope, model, name, displayName) {
            var parentRecord = scope.currentRecord;

            extendCommonCtrl.call(this, scope, {fields: model.fields}, name, displayName);

            if (parentRecord) {
                if (parentRecord[name] === undefined) {
                    parentRecord[name] = [];
                }
                scope.records = parentRecord[name];
                scope.refId = parentRecord.id;
            }
        }

        function compositeRelCtrl(scope, model, name, displayName, parent) {
            commonChildCtrl.call(this, scope, model, name, displayName);

            scope.parent = parent;

            //Función para encontrar un registro por ID o CID
            function indexOf(rc) {
                var field = rc.id !== undefined ? 'id' : 'cid';
                for (var i in scope.records) {
                    if (scope.records.hasOwnProperty(i)) {
                        var current = scope.records[i];
                        if (current[field] === rc[field]) {
                            return i;
                        }
                    }
                }
            }

            this.fetchRecords = function () {
                scope.currentRecord = {};
                this.editMode = false;
            };
            this.saveRecord = function () {
                var rc = scope.currentRecord;
                if (rc.id || rc.cid) {
                    var idx = indexOf(rc);
                    scope.records.splice(idx, 1, rc);
                } else {
                    rc.cid = -Math.floor(Math.random() * 10000);
                    rc[scope.parent] = {id: scope.refId};
                    scope.records.push(rc);
                }
                this.fetchRecords();
            };
            this.deleteRecord = function (record) {
                var idx = indexOf(record);
                scope.records.splice(idx, 1);
            };
            this.editRecord = function (record) {
                scope.currentRecord = ng.copy(record);
                this.editMode = true;
            };
            this.createRecord = function () {
                this.editMode = true;
                scope.currentRecord = {};
            };
        }

        function aggregateRelCtrl(scope, model, name, displayName, parent, ctx) {
            commonChildCtrl.call(this, scope, model, name, displayName);

            //Servicio para obtener la lista completa de registros que se pueden seleccionar
            var svc = RestAngular.all(ctx);

            var parentSvc = RestAngular.one(parent, scope.refId).all(name);

            scope.records = parentSvc.getList().$object;

            var self = this;

            this.fetchRecords = function () {
                return parentSvc.getList().then(function (data) {
                    scope.records = data;
                    return data;
                });
            };

            this.deleteRecord = function (rc) {
                return rc.remove().then(this.fetchRecords);
            };

            this.showList = function () {
                var modal = modalService.createSelectionModal(scope.displayName, svc.getList(), scope.records);
                modal.result.then(function () {
                    self.fetchRecords();
                }, function(){
                    self.fetchRecords();
                });
            };

            this.globalActions = [{
                name: 'select',
                displayName: 'Select',
                icon: 'check',
                fn: function () {
                    self.showList();
                },
                show: function () {
                    return !self.editMode && scope.records;
                }
            }];

            this.recordActions = {
                delete: {
                    displayName: 'Delete',
                    icon: 'minus',
                    fn: function (rc) {
                        self.deleteRecord(rc);
                    },
                    show: function () {
                        return !self.readOnly;
                    }
                }
            };
        }

        this.extendController = function (options) {
            extendCtrl.call(options.ctrl, options.scope, options.model, options.url, options.name, options.displayName);
        };
        this.extendCompChildCtrl = function (options) {
            compositeRelCtrl.call(options.ctrl, options.scope, options.model, options.name, options.displayName,
                options.parent);
        };
        this.extendAggChildCtrl = function (options) {
            aggregateRelCtrl.call(options.ctrl, options.scope, options.model, options.name,
                options.displayName, options.parentUrl, options.listUrl);
        };
    }]);

    mod.service('modalService', ['$modal', 'CrudTemplatesDir', function ($modal, tplDir) {
        this.createSelectionModal = function (name, items, currentItems) {
            return $modal.open({
                animation: true,
                templateUrl: tplDir + 'modal.tpl.html',
                controller: 'modalCtrl',
                resolve: {
                    name: function () {
                        return name;
                    },
                    items: function () {
                        return items;
                    },
                    currentItems: function () {
                        return currentItems;
                    }
                }
            });
        };
    }]);
})
(window.angular, window.Math);
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
