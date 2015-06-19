/*global mashupApp:false, _:false */

mashupApp.controller('mashup.LoginController', ['$location', '$log', '$timeout', '$scope',
    'sessionService', 'cacheService', 'utility',
    function ($location, $log, $timeout, $scope, sessionService, cacheService, utility) {
        'use strict';

        var vm = this;
        vm.appName = 'coreSession';

        var getAppSession = function () {
            return cacheService.getCache('mashupSessions');
        };

        getAppSession().then(function (data) {
            vm.appSession = data[0];
            // TODO: Improve checking for no session in cache. Maybe move this to the getCache() function.
            if (vm.appSession === 'NoCache' || vm.appSession === 'N' ||
                _.isNull(vm.appSession) || _.isUndefined(vm.appSession)) {
                vm.appSession = { sessions: [] };
                vm.appSession.id = 'mashupSessions';
            }

            var index = _.findIndex(vm.appSession.sessions, { 'appName': vm.appName });
            if (index > -1) {
                vm.labelUserName = vm.appSession.sessions[index].userName;
            }

        });

        vm.login = function () {

            // SIMULARED AUTHENTICATION: REPLACE WITH ACTUAL AUTH CODE HERE.
            var authenticated = true;

            if (authenticated) {
                // update the appSession in indexedDB
                updateAppSession(vm.name, vm.appName);
                // update the sessionService used by logging
                updateSessionsUser(vm.name, vm.appName);
                // log authentication results
                logAuthentication(vm.name, vm.appName, authenticated);

                $location.path('/');

            }
            else {
                logAuthentication(vm.name, vm.appName, authenticated);
            }

        };

        var updateSessionsUser = function (userName, appName) {
            // THIS INFORMATION IS USED BY SERVICES THAT NEED TO KNOW THE USER AND APP.
            var session = sessionService.getUserSessions();
            session.userName = userName;
            session.appName = appName;

            sessionService.setUserSession(session);

        };

        var updateAppSession = function (userName, appName) {
            // ASSUMING YOU'LL HAVE YOUR OWN SESSION OBJECT, REPLACE THESE PARAMETERS WITH YOUR AUTH OBJECT.
            var sessionAlreadyExists;
            sessionAlreadyExists = !!_.where(vm.appSession.sessions, { 'appName': appName }).length;

            var session = buildSessionJSON(userName, appName);

            if (sessionAlreadyExists) {
                // If YES then get the index of the session and update it.
                // getting index of the session
                var index = _.findIndex(vm.appSession.sessions, { 'appName': appName });
                vm.appSession.sessions[index] = session;
            }
            else {
                // If NO then push object onto the session.
                // ADD SESSION
                vm.appSession.sessions.push(session);
            }
            cacheService.putCache('mashupSessions', { name: 'mashupSessions', keyPath: 'id' }, vm.appSession);
        };

        var buildSessionJSON = function (userName, appName) {
            var sessionJSON = {};

            var utcMills = utility.localMilToUtcMil(new Date().getTime());
            var localMills = utility.utcMilToLocalMil(utcMills);
            var localDate = Date(localMills);

            // TODO: REPLACE stub roles array
            var roles = ['DomainUser', 'MashupUser', 'Administrator'];

            sessionJSON.appName = appName;
            sessionJSON.userName = userName;
            sessionJSON.roles = roles;
            sessionJSON.authTimeUTCMills = utcMills;
            sessionJSON.authTimelocalMills = localMills;
            sessionJSON.authTimelocalDate = localDate;
            // Below helps prevent the system from re-authenticating a session that is actively being used.
            sessionJSON.sessionLastUsed = utcMills;
            sessionJSON.isAuthenticated = true;

            return sessionJSON;
        };

        var logAuthentication = function (userName, appName, authenticated) {
            // -------------------------------------------------------------------
            // Instrumentation
            // -------------------------------------------------------------------
            var logObject = utility.getLogObject('Instr', appName, 'mashup.LoginController', 'login',
                authenticated, sessionService);
            // Additional or custom properties for logging.
            logObject.userName = userName;
            logObject.appName = appName;
            logObject.authenticated = authenticated;
            $log.log('Authentication [ User: ' + userName + ' ] on [App: ' + appName + ' ]', logObject);
            // -------------------------------------------------------------------
            // -------------------------------------------------------------------
        };

    }]);