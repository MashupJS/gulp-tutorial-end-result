
/*global mashupApp:false */
/*jshint -W106 */


mashupApp.service('utility', ['utility_UtcDateService', 'utility_LogHelper',
    function (utility_UtcDateService, utility_LogHelper) {
    'use strict';

    //---------------------------------------------------------------------
    // INSTRUCTIONS for 'utility' usage.
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------
    // Keeps like utility groups together in their own modules then reference 
    // them here and use this general utility class throughout the project.
    // This will allow for more modular, testable, code while keeping the 
    // number of dependency injected modules to minimum.
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------

    //---------------------------------------------------------------------
    // Provides access to the utility_UtcDateService functions.
    // For converting to and from local and UTC dates.
    //---------------------------------------------------------------------
    var utcMilToLocalMil = utility_UtcDateService.utcMilToLocalMil;
    var localMilToUtcMil = utility_UtcDateService.localMilToUtcMil;
    var localDateToUtcDate = utility_UtcDateService.localDateToUtcDate;
    var utcDateToLocalDate = utility_UtcDateService.utcDateToLocalDate;
    //---------------------------------------------------------------------
    //---------------------------------------------------------------------


    var getLogObject = utility_LogHelper.getLogObject;

    return {
        //---------------------------------------------------------------------
        // Provides access to the utility_UtcDateService functions.
        // For converting to and from local and UTC dates.
        //---------------------------------------------------------------------
        localDateToUtcDate: localDateToUtcDate,
        utcDateToLocalDate: utcDateToLocalDate,
        localMilToUtcMil: localMilToUtcMil,
        utcMilToLocalMil: utcMilToLocalMil,
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------

        getLogObject: getLogObject
    };
}]);

