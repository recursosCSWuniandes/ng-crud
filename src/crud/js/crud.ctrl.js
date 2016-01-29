(function (ng) {
    var mod = ng.module('ngCrud');

    mod.controller('listCtrl', ['$scope', function ($scope) {
        $scope.checkAll = function () {
            this.records.forEach(function (item) {
                item.selected = !item.selected;
            });
        };
    }]);

    mod.controller('datePickerCtrl', ['$scope', function ($scope) {
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
    }]);

    mod.controller('modalCtrl', ['$scope', '$modalInstance', 'items', 'name', 'currentItems',
        function ($scope, $modalInstance, items, name, currentItems) {
        $scope.fields = [{name: 'name', displayName: 'Name', type: 'String'}];
        $scope.name = name;
        $scope.items = items;
        var self = this;

        $scope.recordActions = {
            add: {
                displayName: 'Add',
                icon: 'plus',
                fn: function (rc) {
                    currentItems.post(rc);
                },
                show: function () {
                    return !self.readOnly;
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

        loadSelected(items, currentItems);

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
