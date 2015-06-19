
// This module holds the most common information other application components might need.
// The reason this module is vauge is to reduce the number of services injected into modules.

// Included in this module:
// - User information
// - App, Web Api, and Database environments

/*global mashupApp:false */
/*jshint maxcomplexity:13 */  // This is to address the complexity of the if statements below.

mashupApp.service('sessionService', function () {
    'use strict';

    var envSession = {};

    // Get the OS and general environment string.
    (function () {
        // This piece of code is credited to this page.
        // http://www.javascripter.net/faq/operatin.htm

        // This script sets OSName variable as follows:
        // 'Windows'    for all versions of Windows
        // 'MacOS'      for all versions of Macintosh OS
        // 'Linux'      for all versions of Linux
        // 'UNIX'       for all other UNIX flavors 
        // 'Unknown OS' indicates failure to detect the OS

        var OSName = 'Unknown OS';
        if (navigator.appVersion.indexOf('Win') !== -1) { OSName = 'Windows'; }
        if (navigator.appVersion.indexOf('Mac') !== -1) { OSName = 'MacOS'; }
        if (navigator.appVersion.indexOf('X11') !== -1) { OSName = 'UNIX'; }
        if (navigator.appVersion.indexOf('Linux') !== -1) { OSName = 'Linux'; }

        envSession.osName = OSName;
        envSession.appVersion = navigator.appVersion;
    })();

    (function () {
        // This piece of code is credited to this page.
        // http://www.javascripter.net/faq/browsern.htm
        //Browser name = Mozilla Firefox
        //Full version = 32.0
        //Major version = 32
        //navigator.appName = Netscape
        //navigator.userAgent = Mozilla/5.0 (Windows NT 6.3; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0

        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // In Opera, the true version is after 'Opera' or after 'Version'
        if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
            browserName = 'Opera';
            fullVersion = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) !== -1)
            { fullVersion = nAgt.substring(verOffset + 8); }
        }
            // In MSIE, the true version is after 'MSIE' in userAgent
        else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
            browserName = 'Microsoft Internet Explorer';
            fullVersion = nAgt.substring(verOffset + 5);
        }
            // In Chrome, the true version is after 'Chrome' 
        else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
            browserName = 'Chrome';
            fullVersion = nAgt.substring(verOffset + 7);
        }
            // In Safari, the true version is after 'Safari' or after 'Version' 
        else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
            browserName = 'Safari';
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) !== -1)
            { fullVersion = nAgt.substring(verOffset + 8); }
        }
            // In Firefox, the true version is after 'Firefox' 
        else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
            browserName = 'Firefox';
            fullVersion = nAgt.substring(verOffset + 8);
        }
            // In most other browsers, 'name/version' is at the end of userAgent 
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
                  (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);
            if (browserName.toLowerCase() === browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(';')) !== -1)
        { fullVersion = fullVersion.substring(0, ix); }
        if ((ix = fullVersion.indexOf(' ')) !== -1)
        { fullVersion = fullVersion.substring(0, ix); }

        majorVersion = parseInt('' + fullVersion, 10);
        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        envSession.browserName = browserName;
        envSession.fullVersion = fullVersion;
        envSession.majorVersion = majorVersion;
    })();

    (function () {
        // This piece of code is credited to this page.
        // http://www.abeautifulsite.net/detecting-mobile-devices-with-javascript/

        // detect desktop versus mobile
        // if mobile then detect which mobileType
        var isMobile = {
            Android: function () {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function () {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: function () {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() ||
                    isMobile.Opera() || isMobile.Windows());
            }
        };

        var mobileType = '';
        // check if mobile or desktop
        if (isMobile.any()) {
            envSession.deviceType = 'mobile';
            if (isMobile.Android()) { mobileType = 'Android'; }
            if (isMobile.BlackBerry()) { mobileType = 'BlackBerry'; }
            if (isMobile.iOS()) { mobileType = 'iPhone|iPad|iPod'; }
            if (isMobile.Opera()) { mobileType = 'Opera Mini'; }
            if (isMobile.Windows()) { mobileType = 'IEMobile'; }
        } else {
            envSession.deviceType = 'desktop';
        }
        envSession.mobileType = mobileType;

    })();

    (function () {
        // Retrieve battery information

        var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;

        if (battery) {
            var batteryLevelChanged = function () {
                envSession.batteryLevel = battery.level * 100;
            };

            battery.addEventListener('levelchange', function (e) {
                console.warn('sessionService: Battery level change: ', battery.level);
                batteryLevelChanged();
            }, false);

        }

    })();

    // The userSession object is used for general logging.  This prevents
    // the log interception from having to know what user and app are invoking 
    // the logService.  Each route will set these values.
    var userSessions = {};

    return {

        getUserSessions: function () {

            if (!userSessions.hasOwnProperty('logUserName')) {
                userSessions.logUserName = 'unknown-user';
            }

            if (!userSessions.hasOwnProperty('logAppName')) {
                userSessions.logAppName = 'unknown-app';
            }
            return userSessions;
        },

        setUserSession: function (session) {
            userSessions = session; return true;
        },

        envSession: function () { return envSession; }

    };
});

