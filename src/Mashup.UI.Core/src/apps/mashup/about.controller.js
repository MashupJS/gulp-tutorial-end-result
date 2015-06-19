/*global mashupApp:false */

mashupApp.controller('mashup.AboutController', ['$filter', 'coreDataService', 'cacheService',
    function ($filter, coreDataService, cacheService) {

        'use strict';

        var vm = this;

        var getAppSession = function () {
            return cacheService.getCache('mashupSessions');
        };

        //  Commented JSON used to test multiple sessions to verify Tabs were created.

        //      vm.sessions = [
        //{
        //    'appName': 'coreSession',
        //    'userName': 'Joe',
        //    'roles': [
        //      'DomainUser',
        //      'MashupUser',
        //      'Administrator'
        //    ],
        //    'authTimeUTCMills': 1427325419503,
        //    'authTimelocalMills': 1427311019503,
        //    'authTimelocalDate': 'Wed Mar 25 2015 15:16:59 GMT-0400 (Eastern Daylight Time)',
        //    'sessionLastUsed': 1427325419503,
        //    'isAuthenticated': true
        //},
        //  {
        //      'appName': 'coreSession2',
        //      'userName': 'Joe',
        //      'roles': [
        //        'DomainUser',
        //        'MashupUser',
        //        'Administrator'
        //      ],
        //      'authTimeUTCMills': 1427325419503,
        //      'authTimelocalMills': 1427311019503,
        //      'authTimelocalDate': 'Wed Mar 25 2015 15:16:59 GMT-0400 (Eastern Daylight Time)',
        //      'sessionLastUsed': 1427325419503,
        //      'isAuthenticated': true
        //  }
        //      ];

        getAppSession().then(function (data) {
            vm.sessions = data[0].sessions;
        });

        coreDataService.getCache('mashCacheAge').then(function (data) {

            angular.forEach(data, function (record) {
                record.updatedDateTime = $filter('date')(record.updatedDate, 'short');
            });

            vm.sessionCache = data;

        });

        //$('#mytab').tab('show');

    }]);
