/*global mashupApp:false */

// --------------------------------------------------------------------------------------------- 
// --------------------------------------------------------------------------------------------- 
// core/apps/app2/~appConfig/route.config.js
// --------------------------------------------------------------------------------------------- 
// --------------------------------------------------------------------------------------------- 

///*jshint laxcomma: true*/

mashupApp.config(['$routeProvider', function ($routeProvider) {
    'use strict';

    $routeProvider
        .when('/app2/page3', {
            templateUrl: 'apps/app2/page3/page3.min.html',
            controller: 'app2.Page3Controller',
            controllerAs: 'vm',
            resolve: {
                loadMyCtrl: [
                    '$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'mashupApp',
                            files: ['apps/app2/page3/page3.controller.min.js']
                        });
                    }
                ],
                logRoute: ['$route', 'coreRouteHelper', function ($route, coreRouteHelper) {
                    return coreRouteHelper.logRoute();
                }]
            }
        })
        .when('/app2/page4', {
            templateUrl: 'apps/app2/page4/page4.min.html',
            controller: 'app2.Page4Controller',
            controllerAs: 'vm',
            resolve: {
                loadMyCtrl: [
                    '$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'mashupApp',
                            files: ['apps/app2/page4/page4.controller.min.js']
                        });
                    }
                ],
                logRoute: ['$route', 'coreRouteHelper', function ($route, coreRouteHelper) {
                    return coreRouteHelper.logRoute();
                }]

            }
        });
}]);