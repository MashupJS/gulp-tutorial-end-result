/*global mashupApp:false */

mashupApp.controller('menuController', ['$scope', '$modalInstance', '$log', '$http',
    function ($scope, $modalInstance, $log, $http) {
        'use strict';

        $scope.close = function () {
            // Closes the modal and returns a value
            $modalInstance.dismiss('Menu closed');
        };

        //http://localhost:50001/~appConfig/menu.json
        $http.get('menu.json.txt').success(function (data) {
            $scope.menuJson = data;
        });


    }]);