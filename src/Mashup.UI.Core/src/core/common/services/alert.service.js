/*
* Alert Service to be shared across controllers
*
* http://www.lovelucy.info/angularjs-global-alert-service.html
* http://jsbin.com/UxapebE/1/edit
*/

/*global mashupApp:false */

mashupApp.factory('alertService', ['$rootScope', function ($rootScope) {
    'use strict';

    var alertService = {};
    // global `alerts` array
    $rootScope.alerts = [];
    alertService.add = function (type, msg) {
        $rootScope.alerts.push({ 'type': type, 'msg': msg, 'close': function () { alertService.closeAlert(this); } });
    };
    alertService.closeAlert = function (alert) {
        alertService.closeAlertIdx($rootScope.alerts.indexOf(alert));
    };
    alertService.closeAlertIdx = function (index) {
        $rootScope.alerts.splice(index, 1);
    };
    return alertService;
}]);