/*global mashupApp: false */
/*global ydn: false*/
/*global _:false */

mashupApp.service('detectService', ['$http', '$q', '$log', '$interval', '$filter',
    '$rootScope', 'utility', 'sessionService',
    function ($http, $q, $log, $interval, $filter, $rootScope, utility, sessionService) {
        'use strict';

        // Manage logServiceDB.Heartbeats.
        // delete all records over 1 week old.
        // Manage the log size.
        (function () {

            var logHeartbeatLog = new ydn.db.Storage('logServiceDB');

            var logHeartbeatReady = false;

            logHeartbeatLog.onReady(function () {
                logHeartbeatReady = true;
                console.log('logServiceDB is ready. [detectService]');
            });

            // TODO: Consider altering the interval based on the power of the device, batter power, network speed.
            var intervalTime = 10080000;// check every 2 hours
            var retainDuration = 604800000; // one week is 604800000

            setInterval(function () {

                // wait until logDbReady is ready. IE: true
                (function wait() {
                    if (logHeartbeatReady) {

                        // delete all records older than 1 week.
                        var indexLongDate = new Date().getTime() - retainDuration;
                        // TODO: figure out how to add ydn to angular modules to avoid implicit declaration.
                        var keyRange = ydn.db.KeyRange.upperBound(indexLongDate, true);

                        var logObject = utility.getLogObject('detectManagement:Truncate', 'Mashup.UI.Core',
                            'detectService', 'anonymous:setInterval', null, sessionService);
                        // Truncate all logs older than a week old.
                        logHeartbeatLog.remove('heartbeat', keyRange)
                            .done(function (count) {
                                logObject.status = true;
                                logObject.count = count;

                                $log.log('Truncating old [heartbeat] records.', logObject);
                                //$log.log(['Truncating old [heartbeat] records.', logObject], 'log');

                            }).fail(function (e) {
                                logObject.status = false;

                                $log.log('Truncating old [heartbeat] records. (failed)', logObject);

                                throw e;
                            });

                    } else {
                        // Giving the cache database a moment to set up.
                        setTimeout(wait, 500);
                    }
                })();

            }, intervalTime, 0, false);
        })();

        // add heartBeatMonitorList array.  Is defined in canDetectHeartBeat function.
        $rootScope.heartBeatMonitorList = [];

        var envSession = sessionService.envSession();

        var heartBeatMonitorInterval = 300000; // 5 minutes
        // manage based on battery
        if (envSession.batteryLevel && envSession.batteryLevel <= 30) {
            heartBeatMonitorInterval = heartBeatMonitorInterval * 2;
        }

        // starts up heartBeatMonitor immediately.
        $interval(function () {

            // for each item in heartBeatMonitorList, verify a connection is possible.
            _.each($rootScope.heartBeatMonitorList, function (item) {

                var result = true;

                // attempt to call the heartbeat WebApi.
                $http.get(item.url, { withCredentials: true })
                    .success(function (data) {
                        result = true;
                        item.detected = result;
                        // record results to the log and include data if available.
                        recordHeartBeatResult(item.id, result, data);
                    })
                    .error(function () {
                        result = false;
                        item.detected = result;

                        // record results to the log
                        recordHeartBeatResult(item.id, result);

                        // add to codeBlueList to be processed by the codeBlueMonitor process if not already added.
                        addToCodeBlueList(item);

                    });

            });

        }, heartBeatMonitorInterval, 0, false); // Starting at 1 minute but this might be adjusted.

        var recordHeartBeatResult = function (webApiName, result, data) {

            var datetime = $filter('date')(new Date().getTime(), 'short');

            var msg = 'The heartbeat result for \'' + webApiName + '\' is: [ ' + result + ' ] at ' + datetime;

            var logObject = utility.getLogObject('HeartBeat', 'Mashup.UI.Core', 'detectService',
                'recordHeartBeatResult', result, sessionService);
            if (result) {
                logObject.msg = msg;
                console.info(angular.fromJson(logObject));
            } else {
                logObject.subject = 'HeartBeatFail';
                $log.error('HeartBeatFail: ' + msg, logObject);
            }
        };

        var addToCodeBlueList = function (item) {
            if (!_.where($rootScope.codeBlueList, { 'id': item.id }).length) {

                $rootScope.codeBlueList.push(item);

                if (!codeBlueMonitor) {

                    var logObject = utility.getLogObject('StartCodeBlueMonitor', 'Mashup.UI.Core',
                        'detectService', 'addToCodeBlueList', 'Starting', sessionService);
                    $log.info('Starting up code Blue monitor from heartbeat monitor.', logObject);
                    startCodeBlueMonitor();
                }
            }
        };

        // add codeBlueList
        $rootScope.codeBlueList = [];

        // variable holding the promise from the $interval.  This is used to stop the codeBlueMonitor once all
        // connections are detected.
        var codeBlueMonitor;

        // function to check for a pulse for codeBlue list. (every 5 seconds)
        var startCodeBlueMonitor = function () {

            //var codeBlueMonitorInterval = envSession.envSession();
            var codeBlueMonitorInterval = 60000; // 10 seconds

            // manage based on battery
            if (envSession.batteryLevel && envSession.batteryLevel <= 30) {
                codeBlueMonitorInterval = codeBlueMonitorInterval * 3;
            }

            codeBlueMonitor = $interval(function () {

                var datetime = $filter('date')(new Date().getTime(), 'short');

                if ($rootScope.codeBlueList.length === 0) {
                    // no more items in codeBlueList so stop the codeBlueMonitor
                    $interval.cancel(codeBlueMonitor);
                    // set the promise to false so it can be evaluated later to determin if it is running.
                    codeBlueMonitor = false;

                    var logObject = utility.getLogObject('CodeBlueMonitor', 'Mashup.UI.Core',
                        'detectService', 'startCodeBlueMonitor', 'ended', sessionService);
                    $log.info('codeBlueMonitor ended ' + datetime, logObject);

                } else {
                    // Process each item in the codeBlueList
                    _.each($rootScope.codeBlueList, function (item) {

                        var result = true;

                        $http.get(item.url, { withCredentials: true })
                            .success(function (data) {
                                result = true;
                                item.detected = result;
                                // record results to the log and include data if available.
                                recordCodeBlueResult(item.id, result, data);
                                // remove item from list
                                $rootScope.codeBlueList = _.filter($rootScope.codeBlueList,
                                    function (x) { return x.id !== item.id; });
                            })
                            .error(function () {
                                result = false;
                                item.detected = result;
                                // record results to the log
                                recordCodeBlueResult(item.id, result);
                            });

                    });
                }

            }, codeBlueMonitorInterval, 0, false); // runs ever 10 seconds when running.
        };

        var recordCodeBlueResult = function (webApiName, result, data) {
            var datetime = $filter('date')(new Date().getTime(), 'short');

            var msg = 'The code Blue result for ' + webApiName + ' is: [ ' + result + ' ] at ' + datetime;

            var logObject = utility.getLogObject('CodeBlueMonitor', 'Mashup.UI.Core',
                'detectService', 'recordCodeBlueResult', result, sessionService);
            logObject.webApiName = webApiName;

            if (result) {
                $log.info(msg, logObject);
            } else {
                $log.error(msg, logObject);

            }

        };

        // Used to let the calling application know what results we currently have.
        // No connectivity attempt is made here.
        var canDetectHeartBeat = function (heartBeatUrl, webApiName) {

            // if no heartBeatUrl provided then short curcuit this method 
            // and return true allowing the webapi call to continue.
            if (!heartBeatUrl) {
                return true;
            }

            try {

                var record = _.where($rootScope.heartBeatMonitorList, { 'id': webApiName });

                if (record.length === 0) {

                    // No failure is detected so we assume a connection is possible.
                    // If the client fails to connect then we'll add this to the codeBlue list.
                    var newItem = { id: webApiName, url: heartBeatUrl, detected: true };
                    $rootScope.heartBeatMonitorList.push(newItem);

                    return true;
                } else {
                    // an item was found so returning the last known good information on this item.
                    return record[0].detected;
                }

            } catch (e) {

                var logObject = utility.getLogObject('CodeBlueMonitor', 'Mashup.UI.Core',
                    'detectService', 'canDetectHeartBeat', 'Error', sessionService);
                logObject.webApiName = webApiName;
                logObject.heartBeatUrl = heartBeatUrl;
                logObject.error = e;

                $log.error('detectService.canDetectHeartBeat: ' + e, logObject);
            }

            return true;
        };

        // Determine congestion and if a threshold is met to allow connectivity.
        // - This is determined by the user call passing in threshold requiements (not sure what that is yet)
        // - Also included in the calculation is the devices general performance information
        // - - If the machine always performs slowly then consider that the normal.

        return {

            // Detects whether or not a connection has failed the last time connected to.
            detect: function (heartBeatUrl, webApiName) {
                return canDetectHeartBeat(heartBeatUrl, webApiName);
            },

            // A method to tell the detectService an attempt has failed.
            failed: function (heartBeatUrl, webApiName) {
                // update the codeRed list.

                var logObject = utility.getLogObject('CodeBlueMonitor', 'Mashup.UI.Core',
                    'detectService', 'detectService.failed', false, sessionService);
                logObject.webApiName = webApiName;
                logObject.heartBeatUrl = heartBeatUrl;

                $log.warn('detectService.failed: A call to Web Api: ' + webApiName + ' failed', logObject);

                // if not already added to codeBlueList then add.
                if (!_.where($rootScope.codeBlueList, { 'id': webApiName }).length) {
                    var newItem = { id: webApiName, url: heartBeatUrl, detected: false };
                    $rootScope.codeBlueList.push(newItem);
                }

                // start up the codeBlueMonitor
                if (!codeBlueMonitor) {
                    // $log.detectService("Starting up code Blue monitor from failed method call.");
                    startCodeBlueMonitor();
                }

                // TODO: add a method to get the current state of apps for display to the user or admin.

            }
        };
    }]);