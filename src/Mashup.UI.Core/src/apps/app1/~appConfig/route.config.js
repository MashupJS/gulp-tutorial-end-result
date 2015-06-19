/*global mashupApp:false */

// --------------------------------------------------------------------------------------------- 
// --------------------------------------------------------------------------------------------- 
// core/apps/app1/~appConfig/route.config.js
// --------------------------------------------------------------------------------------------- 
// --------------------------------------------------------------------------------------------- 

///*jshint laxcomma: true*/

mashupApp.config(['$routeProvider', function ($routeProvider) {
    'use strict';

    $routeProvider
        .when('/app1/page1', {
            templateUrl: 'apps/app1/page1/page1.min.html',
            controller: 'app1.Page1Controller',
            controllerAs: 'vm',
            resolve: {
                loadMyCtrl: [
                    '$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'mashupApp',
                            files: ['apps/app1/page1/page1.controller.min.js']
                        });
                    }
                ],
                logRoute: ['$route', 'coreRouteHelper', function ($route, coreRouteHelper) {
                    return coreRouteHelper.logRoute();
                }]
            }
        })
        .when('/app1/page2', {
            templateUrl: 'apps/app1/page2/page2.min.html',
            controller: 'app1.Page2Controller',
            controllerAs: 'vm',
            resolve: {
                loadMyCtrl: [
                    '$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'mashupApp',
                            files: ['apps/app1/page2/page2.controller.min.js']
                        });
                    }
                ],
                logRoute: ['$route', 'coreRouteHelper', function ($route, coreRouteHelper) {
                    return coreRouteHelper.logRoute();
                }]

            }
        });
}]);