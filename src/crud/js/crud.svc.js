(function (ng, Math) {
    var mod = ng.module('CrudModule');

    mod.service('actionsService', [function () {
        this.buildGlobalActions = function (ctrl) {
            return [{
                name: 'create',
                displayName: 'Create',
                icon: 'plus',
                fn: function () {
                    ctrl.createRecord();
                },
                show: function () {
                    return !ctrl.readOnly && !ctrl.editMode;
                }
            }, {
                name: 'refresh',
                displayName: 'Refresh',
                icon: 'refresh',
                fn: function () {
                    ctrl.fetchRecords();
                },
                show: function () {
                    return !ctrl.editMode;
                }
            }, {
                name: 'save',
                displayName: 'Save',
                icon: 'save',
                fn: function () {
                    ctrl.saveRecord();
                },
                show: function () {
                    return !ctrl.readOnly && ctrl.editMode;
                }
            }, {
                name: 'cancel',
                displayName: 'Cancel',
                icon: 'remove',
                fn: function () {
                    ctrl.fetchRecords();
                },
                show: function () {
                    return !ctrl.readOnly && ctrl.editMode;
                }
            }
            ];
        };
        this.buildRecordActions = function (ctrl) {
            return [{
                name: 'edit',
                displayName: 'Edit',
                icon: 'edit',
                fn: function (rc) {
                    ctrl.editRecord(rc);
                },
                show: function () {
                    return !ctrl.readOnly;
                }
            }, {
                name: 'delete',
                displayName: 'Delete',
                icon: 'minus',
                fn: function (rc) {
                    ctrl.deleteRecord(rc);
                },
                show: function () {
                    return !ctrl.readOnly;
                }
            }];
        };
    }]);

    mod.service('CRUDBase', ['Restangular', 'actionsService', '$injector', function (RestAngular, actionsBuilder, $injector) {
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
                function loadFieldOptions(field) {
                    var svc = $injector.get(field.service);
                    svc.fetchRecords().then(function (data) {
                        field.options = data.plain();
                        if (!field.required) {
                            field.options.unshift(null);
                        }
                    });
                }

                var model = scope.model;
                for (var i in model) {
                    if (model.hasOwnProperty(i)) {
                        var field = model[i];
                        if (field.type === 'Reference' && !!field.service) {
                            if ($injector.has(field.service)) {
                                loadFieldOptions(field);
                            }
                        }
                    }
                }
            };

            //Configuración de acciones
            this.globalActions = actionsBuilder.buildGlobalActions(this);
            this.recordActions = actionsBuilder.buildRecordActions(this);
        }

        this.extendCommonController = function (ctrl, scope, model, name, displayName) {
            extendCommonCtrl.call(ctrl, scope, model, name, displayName);
        };
        function extendCtrl(scope, model, svc, name, displayName) {
            extendCommonCtrl.call(this, scope, model, name, displayName);
            var self = this;

            //Funciones del controlador
            function responseError(response) {
                self.showError(response.data);
            }

            this.createRecord = function () {
                this.editMode = true;
                scope.currentRecord = {};
            };

            this.editRecord = function (record) {
                return svc.fetchRecord(record).then(function (data) {
                    scope.currentRecord = data;
                    self.editMode = true;
                    return data;
                }, responseError);
            };

            this.fetchRecords = function () {
                return svc.fetchRecords(this.currentPage, this.itemsPerPage).then(function (data) {
                    scope.records = data;
                    self.totalItems = data.totalRecords;
                    scope.currentRecord = {};
                    self.editMode = false;
                    return data;
                }, responseError);
            };
            this.saveRecord = function () {
                return svc.saveRecord(scope.currentRecord).then(function () {
                    self.fetchRecords();
                }, responseError);
            };
            this.deleteRecord = function (record) {
                return svc.deleteRecord(record).then(function () {
                    self.fetchRecords();
                }, responseError);
            };
        }

        function extendSvc(url) {
            this.url = url;
            this.api = RestAngular.all(this.url);

            this.fetchRecords = function (currentPage, itemsPerPage) {
                return this.api.getList({page: currentPage, maxRecords: itemsPerPage});
            };

            this.fetchRecord = function (record) {
                return record.get();
            };
            this.saveRecord = function (currentRecord) {
                if (currentRecord.id) {
                    return currentRecord.put();
                } else {
                    return this.api.post(currentRecord);
                }
            };
            this.deleteRecord = function (record) {
                return record.remove();
            };
            this.extendController = function (ctrl, scope, model, name, displayName) {
                extendCtrl.call(ctrl, scope, model, this, name, displayName);
            };
        }

        this.extendService = function (svc, ctx) {
            extendSvc.call(svc, ctx);
        };
    }]);

    mod.service('masterUtils', ['CRUDBase', 'actionsService', 'modalService', function (CRUDBase, actionsBuilder, modalService) {
        function commonChildCtrl(scope, model, childName) {
            CRUDBase.extendCommonController(this, scope, model, childName, childName);

            //Escucha de evento cuando se selecciona un registro maestro
            var self = this;
            scope.$on('master-selected', function (event, args) {
                if (args[childName] === undefined) {
                    args[childName] = [];
                }
                scope.records = args[childName];
                scope.refId = args.id;
                if (self.fetchRecords) {
                    self.fetchRecords();
                }
            });
        }

        this.extendService = function (svc, ctx) {
            function masterSvcConstructor() {
                var oldExtendFn = this.extendController;
                this.extendController = function (ctrl, scope, model, name, displayName) {
                    oldExtendFn.call(this, ctrl, scope, model, name, displayName);
                    var oldEditFn = ctrl.editRecord;
                    ctrl.editRecord = function (record) {
                        return oldEditFn.call(this, record).then(function (data) {
                            scope.$broadcast('master-selected', data);
                            return data;
                        });
                    };
                    var oldCreateFn = ctrl.createRecord;
                    ctrl.createRecord = function () {
                        oldCreateFn.call(this);
                        scope.$broadcast('master-selected', scope.currentRecord);
                    };
                    ctrl.changeTab = function (tab) {
                        scope.tab = tab;
                    };
                };
            }

            CRUDBase.extendService(svc, ctx);
            masterSvcConstructor.call(svc);
        };
        this.extendCompChildCtrl = function (ctrl, scope, model, childName, refName) {
            function compositeRelCtrl(scope, model, childName, refName) {
                commonChildCtrl.call(this, scope, model, childName);

                scope.refName = refName;

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
                        rc[scope.refName] = {id: scope.refId};
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

            compositeRelCtrl.call(ctrl, scope, model, childName, refName);
        };
        this.extendAggChildCtrl = function (ctrl, scope, model, childName, svc) {
            function aggregateRelCtrl(scope, model, childName, svc) {
                commonChildCtrl.call(this, scope, model, childName);
                this.showList = function () {
                    var modal = modalService.createSelectionModal(childName, svc.fetchRecords(), scope.records);
                    modal.result.then(function (data) {
                        scope.records.splice.call(scope.records, 0, scope.records.length);
                        scope.records.push.apply(scope.records, data);
                    });
                };

                var self = this;
                this.globalActions = [{
                    name: 'select',
                    displayName: 'Select',
                    icon: 'check',
                    fn: function () {
                        self.showList();
                    },
                    show: function () {
                        return !self.editMode;
                    }
                }];
                delete this.recordActions;
            }

            aggregateRelCtrl.call(ctrl, scope, model, childName, svc);
        };
    }]);

    mod.service('modalService', ['$modal', function ($modal) {
        this.createSelectionModal = function (name, items, currentItems) {
            return $modal.open({
                animation: true,
                templateUrl: 'src/crud/templates/modal.tpl.html',
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
})(window.angular, window.Math);
