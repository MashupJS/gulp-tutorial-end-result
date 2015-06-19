/*global mashupApp:false */

mashupApp.controller('indexController', ['$scope', '$modal', '$log', '$http', 'alertService',
    function ($scope, $modal, $log, $http, alertService) {
    'use strict';
    var x = 3.14;

    // Launches the modal dialog for the menu.
    $scope.open = function () {

        var myModal = $modal.open({
            templateUrl: 'apps/mashup/menu.min.html',
            backdrop: 'statis', // can be true 
            windowClass: 'modal',
            controller: 'menuController',
            keyboard: true,
            //backdropClick: true,

            resolve: {}

        });

        // get result here...  This seems like almost an if/else.  The second
        // function only runs when I press the cancel button which fires dismiss.
        myModal.result.then(function (result) {
            $log.log('result: ' + result);
        });

    };

    $scope.addAlert = function () {
        alertService.add('alert-danger', '<h4>Success!</h4> This is a success message!');
        // options
        // alert-success
        // alert-warning
        // alert-info
        // alert-danger
    };

    (function () {
        // Get the battery!
        var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
        var batteryStatusChange = function() {

            var batteryCharging = battery.charging;
            var batteryLevel = battery.level * 100;

            if (batteryCharging) {
                $scope.batteryStatus = 'Charging: ' + batteryLevel + '%';
            } else {
                $scope.batteryStatus = 'Battery: ' + batteryLevel + '%';
            }
            // TODO: write up this battery function and how $scope.$apply() was useful.
            // Having problems with this apply because the digest cycle is already running.  This happens
            // when using events from the DOM or other 3rd party plugins.
            // I decided to use a type of 'safe' $apply as recommended in the following article.
            // https://coderwall.com/p/ngisma
            // TODO: Move this safe apply to something shared like the utility service.
            var phase = $scope.$root.$$phase;
            if (phase !== '$apply' && phase !== '$digest') {
                $scope.$apply();
            }
        };

        // If battery object available then set values.
        if (battery) {

            batteryStatusChange();

            battery.addEventListener('chargingchange', function (e) {
                console.warn('Battery charge change: ', battery.charging);
                batteryStatusChange();
            }, false);
            battery.addEventListener('levelchange', function (e) {
                console.warn('Battery level change: ', battery.level);
                batteryStatusChange();
            }, false);
        }
    })();
}]);
