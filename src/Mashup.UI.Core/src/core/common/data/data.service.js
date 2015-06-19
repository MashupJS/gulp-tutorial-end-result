/*global mashupApp:false */

mashupApp.service('coreDataService', ['$http', '$q', '$log', 'cacheService', function ($http, $q, $log, cacheService) {
    'use strict';

    return {

        getCache: function (cacheName) {
            var deferred = $q.defer();

            cacheService.getCache(cacheName).then(function (data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        }

    };
}]);