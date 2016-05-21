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
