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
