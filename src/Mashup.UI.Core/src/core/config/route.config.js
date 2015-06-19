/*global mashupApp:false, _:false */

// --------------------------------------------------------------------------------------------- 
// --------------------------------------------------------------------------------------------- 
// core/config/route.config.js
// --------------------------------------------------------------------------------------------- 
// --------------------------------------------------------------------------------------------- 

mashupApp.factory('coreRouteHelper', ['$log', '$q', '$location', 'sessionService',
     'utility', function ($log, $q, $location, sessionService,
         utility) {
         'use strict';

         var logRouteInstrumentation = function (appName) {
             // -------------------------------------------------------------------
             // Instrumenting the application so we can track what pages get used.
             // -------------------------------------------------------------------
             var logObject = utility.getLogObject('Instr', appName, 'coreRouteHelper', 'logRoute',
                 'resolving route', sessionService);
             // Additional or custom properties for logging.
             logObject.absUrl = $location.absUrl();
             logObject.url = $location.url();
             $log.log('UI-Routing to [ ' + $location.url() + ' ]', logObject);
             // -------------------------------------------------------------------
             // -------------------------------------------------------------------
         };

         var logRoute = function (appName) {

             var defer = $q.defer();

             (function () {
                 logRouteInstrumentation(appName);
                 defer.resolve(true);
             })();

             return defer.promise;
         };

         return {

             logRoute: logRoute
         };
     }]);