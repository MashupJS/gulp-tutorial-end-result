
/*global mashupApp:false */

mashupApp.service('utility_UtcDateService', function () {
	'use strict';

	var utcMilToLocalMil = function (milliseconds) {
		var now = new Date();
		return new Date().setTime(milliseconds - (now.getTimezoneOffset() * 60000));
	};

	var localMilToUtcMil = function (milliseconds) {
		var now = new Date();
		return new Date().setTime(milliseconds + (now.getTimezoneOffset() * 60000));
	};

	var localDateToUtcDate = function (localDate) {
		return new Date(localMilToUtcMil(localDate.getTime()));
	};

	var utcDateToLocalDate = function (utcDate) {
		return new Date(utcMilToLocalMil(utcDate.getTime()));
	};
	
	//(function () {

	//    var longDateTime = new Date().getTime();
	//    var longDateTimeUTC = localMilToUtcMil(longDateTime);

	//    var newDateLongDateTime = new Date(longDateTime);
	//    var newDateLongDateTimeUTC = new Date(longDateTimeUTC);

	//    var longConvertBackToLocal = utcMilToLocalMil(longDateTimeUTC);
	//    var newLongConvertBackToLocal = new Date(longConvertBackToLocal);

	//    var newUTCDateFromLocal = localDateToUtcDate(newDateLongDateTime);
	//    var newLocalDateFromUtc = utcDateToLocalDate(newDateLongDateTimeUTC);

	//    console.log("");
	//    console.log("Create long date values");
	//    console.log("newDateLongDateTime: " + newDateLongDateTime);
	//    console.log("longDateTime: " + longDateTime);

	//    console.log("");
	//    console.log("Create UTC values from long dates created above");
	//    console.log("newDateLongDateTimeUTC: " + newDateLongDateTimeUTC);
	//    console.log("longDateTimeUTC: " + longDateTimeUTC);

	//    console.log("");
	//    console.log("Convert UTC back to Local");
	//    console.log("longConvertBackToLocal: " + longConvertBackToLocal);
	//    console.log("newLongConvertBackToLocal: " + newLongConvertBackToLocal);

	//    console.log("");
	//    console.log("Convert Local Date to UTC Date");
	//    console.log("newUTCDateFromLocal: " + newUTCDateFromLocal);

	//    console.log("");
	//    console.log("Convert UTC Date to Local Date");
	//    console.log("newLocalDateFromUtc: " + newLocalDateFromUtc);

	//})();

	return {

		localDateToUtcDate: localDateToUtcDate,

		utcDateToLocalDate: utcDateToLocalDate,

		localMilToUtcMil: localMilToUtcMil,

		utcMilToLocalMil: utcMilToLocalMil

	};

});