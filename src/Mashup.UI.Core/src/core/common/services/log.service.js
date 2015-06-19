
/*global mashupApp:false */
/*global ydn:false */

// I read about this in aPress's Pro AngularJS by Adam Freeman.
// I copied this implementation from Vinny Linck's article 'AngularJS: How to override $log implementation
// http://vinnylinck.tumblr.com/post/58833687265/angularjs-how-to-override-log-implementation
// Obviously I've made many customizations but wanted to give credit to where my work began.

// All logs are saved locally in the indexeddb database 'logServiceDB'.
// Because this log can potentially consume a lot of space we will limited it.
// We can limit the log based on duration, size, and type of machine. IE: desktop vs mobile device.

// Future TODO: Request the log via SignalR or some other subscrib method.  Not polling.

mashupApp.config(['$provide', function ($provide) {
    $provide.decorator('$log', ['$delegate', 'logService', function ($delegate, logService) {
        return logService($delegate);
    }]);
}]);

mashupApp.factory('logService', ['$filter', 'sessionService', 'utility',
    function ($filter, sessionService, utility) {
        'use strict';

        return function ($delegate) {

            // Each log event will be interrogated and check the subject property.  
            // If the subject matches an event we are listening for then we will route it.

            var CONST_CUST_PARMS = 1;
            var CONST_STANDARD_LOGGING_PARM = 0;

            var schema = {
                stores: [{
                    name: 'log',
                    keyPath: 'logId',
                    autoIncrement: false,
                },
                {
                    name: 'heartbeat',
                    keyPath: 'logId',
                    autoIncrement: false
                }]
            };

            var logDb = new ydn.db.Storage('logServiceDB', schema);

            var logDbReady = false;

            logDb.onReady(function () {
                logDbReady = true;
                console.log('logServiceDB is ready. [logService]');
            });
            logDb.addEventListener('error', function (event) {
                var e = event.getError();
                console.log('connection failed with ' + e.name);
                // TODO: attempt WebApi call to let someone know the log is failing for this user.
            });

            // adding more information to the logging object.
            var buildLogObject = function (args, logType) {
                // args[1] is the result of a user passing extra data, as a second parameter, into the $log function.
                // We are adding all these properties to args[0] so that we can save a flat record to the database.
                // This will make interrogating the data much simpler in the future.
                // If an extra parameter was never passed then nothing will happen.

                var longDateTime = new Date().getTime();
                // To decouple this module so it can be a drop in module the utility module needed removed from DI.
                // Implementing the localMilToUtcMil directly instead of using utility.localMilToUtcMil(longDateTime)

                var longDateTimeUtc = utility.localMilToUtcMil(longDateTime);
                var dateTime = $filter('date')(longDateTime, 'short');
                var dateTimeUtc = $filter('date')(longDateTimeUtc, 'short');

                var logServiceObj = {
                    msg: args[CONST_STANDARD_LOGGING_PARM],
                    logId: longDateTimeUtc,
                    dateTimeLocal: dateTime,
                    dateTimeUtc: dateTimeUtc,
                    logType: logType,
                    transmitted: false
                };

                // Taking all the values added to args[0] and adding to args[1].
                if (args.length > 1) {
                    for (var name in args[CONST_CUST_PARMS]) {
                        if (args[CONST_CUST_PARMS].hasOwnProperty(name)) {
                            logServiceObj[name] = args[CONST_CUST_PARMS][name];
                        }
                    }
                }
                return logServiceObj;
            };

            // add additional logging
            var additionalProcessing = function (args, logType) {

                // wait until logDbReady is ready. IE: true
                (function wait() {
                    if (logDbReady) {

                        if (angular.isString(args[CONST_STANDARD_LOGGING_PARM])) {

                            var logServiceObj = buildLogObject(args, logType);

                            var subject = logServiceObj.subject;

                            switch (subject) {

                                case 'Perf':
                                    {

                                        break;
                                    }
                                case 'HeartBeatFail':
                                case 'CodeBlueMonitor':
                                    {
                                        logDb.put({ name: 'heartbeat' }, logServiceObj);
                                        break;
                                    }
                                case 'Debug':
                                    {
                                        // This is a space for doing anything you need to do with debug data.
                                        // This can be saved to a separate IndexedDB database or table.
                                        // This can be sent to a WebApi or file.
                                        // Using the 'subject' property you can add any custom behavior you need.
                                        break;
                                    }
                                case 'Error':
                                    {
                                        // Do something.
                                        break;
                                    }
                            }

                            logDb.put({ name: 'log' }, logServiceObj);
                        }
                    } else {
                        // Giving the cache database a moment to set up.
                        setTimeout(wait, 500);
                    }
                })();
            };

            // Manage the log size.
            (function () {

                // TODO: Consider altering the interval based on the power of the device, batter power, network speed.
                var intervalTime = null;
                var logDuration = null;

                var envSession = sessionService.envSession();

                // manage based on deviceType
                if (envSession.deviceType === 'desktop') {
                    intervalTime = 7200000;// check every 2 hours
                    logDuration = 604800000; // 1 week is 604800000
                } else {
                    intervalTime = 1800000;// check every 30 minutes
                    logDuration = 172800000; // 2 days is 172800000
                }
                // manage based on battery
                if (envSession.batteryLevel && envSession.batteryLevel <= 30) {
                    intervalTime = intervalTime * 4;
                    logDuration = logDuration * 4;
                }

                setInterval(function () {

                    // wait until logDbReady is ready. IE: true
                    (function wait() {
                        if (logDbReady) {

                            // delete all records older than 1 week.
                            var indexLongDateUtc = utility.localMilToUtcMil(new Date().getTime()) - logDuration;// - 7;

                            // TODO: figure out how to add ydn to angular modules to avoid implicit declaration.
                            var keyRange = ydn.db.KeyRange.upperBound(indexLongDateUtc, true);

                            var logObject = utility.getLogObject('logManagement:Truncate', 'Mashup.UI.Core',
                                'logService', 'anonymous:setInterval', null, sessionService);
                            // Truncate all logs older than a week old.
                            logDb.remove('log', keyRange)
                                .done(function (count) {
                                    logObject.status = true;
                                    logObject.count = count;

                                    additionalProcessing(['Truncating old [log] records.', logObject], 'log');
                                    console.log(['Truncating old [log] records.', logObject]);

                                }).fail(function (e) {
                                    logObject.status = false;

                                    additionalProcessing(['Truncating old [log] records. (failed)', logObject], 'log');
                                    console.log(['Truncating old [log] records.', logObject]);

                                    throw e;
                                });

                        } else {
                            // Giving the cache database a moment to set up.
                            setTimeout(wait, 500);
                        }
                    })();

                }, intervalTime, 0, false);
            })();

            return {
                // The extra try/catch statements might seem unnecessary and they might be.  The goal
                // is to keep the log service from causing the application to break should anything go wrong.
                log: function () {
                    $delegate.log(arguments[CONST_STANDARD_LOGGING_PARM]);
                    try {
                        additionalProcessing(arguments, 'log');
                    } catch (e) {
                    }
                },

                info: function () {
                    $delegate.info(arguments[CONST_STANDARD_LOGGING_PARM]);
                    try {
                        additionalProcessing(arguments, 'info');
                    } catch (e) {
                    }
                },

                error: function () {
                    $delegate.error(arguments[CONST_STANDARD_LOGGING_PARM]);
                    try {
                        additionalProcessing(arguments, 'error');
                    } catch (e) {
                    }
                },

                warn: function () {
                    $delegate.warn(arguments[CONST_STANDARD_LOGGING_PARM]);
                    try {
                        additionalProcessing(arguments, 'warn');
                    } catch (e) {
                    }
                }
            };
        };
    }]);