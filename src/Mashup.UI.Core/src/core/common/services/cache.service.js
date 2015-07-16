/*global mashupApp:false */
/*global indexedDB:false*/
/*global ydn:false */

mashupApp.service('cacheService', ['$http', '$q', '$log', 'utility', 'detectService',
     'sessionService', function ($http, $q, $log, utility, detectService, sessionService) {
         'use strict';

         // -------------------------------------------------------------------------
         // Kicks off the local caching solution
         // Most caching will be performed by angular-cached-resource.
         // This caching is to satisfy the use case where data is stable and does not
         // need to be retrieved often.  This approach prevents many unnecessary calls
         // across the network.
         // indexedDB.deleteDatabase('mashCacheDB');
         // 
         // -------------------------------------------------------------------------
         // Note on schema:  You'll notice we are not passing in a schema which is 
         // recommended.  This is because we are using YDN-DB/IndexedDB only as a 
         // generic cache and because the Mashup is a composite set of applications
         // we don't want to hold application specific schemas in the core. When
         // using this caching model you will pass yoru schema in as part of your data
         // call.  This schema is then, dynamically, added to the mashCacheDB database.
         // -------------------------------------------------------------------------
         var dbCache = new ydn.db.Storage('mashCacheDB');

         // This only works with the debug version of YDN-DB
         // ydn.debug.log('ydn.db', 'finest');

         // This value 'dbCacheReady' allows the rest of the application to know when the database is ready
         // to use.  Specifically, cacheService needs this.
         var dbCacheReady = false;
         dbCache.onReady(function () {
             dbCacheReady = true;
             console.log('mashCacheDB is ready.  [cacheService]');
         });
         // -------------------------------------------------------------------------

         var isCacheStale = function (cacheName, minutes) {
             // dbCache: is 'mashCacheDB'
             // store: No store is provided but might be added later to remove constaint 'mashCacheAge'
             // subject: is the name of the cache being evaluated.
             // minutes: is the number of minutes before the cache is considered stale.

             var deferred = $q.defer();
             var result = true;

             // get milliseconds version of minutes.
             var ageToleranceMilliseconds = (minutes * 60) * 1000;

             var envSession = sessionService.envSession();

             // manage based on battery
             if (envSession.batteryLevel && envSession.batteryLevel <= 30) {
                 ageToleranceMilliseconds = ageToleranceMilliseconds * 4;
             }

             var currentDateMilliseconds = new Date().getTime();

             // checking dbCacheReady because, if a page loads to quickly, before the cache database is ready
             // then accessing it will cause an error.
             (function wait() {
                 if (dbCacheReady) {

                     // The database is ready so go ahead and begin checking for stale data.
                     try {
                         dbCache.executeSql('SELECT * FROM mashCacheAge WHERE id = \'' + cacheName + '\'')
                             .then(function (record) {
                                 //$log.log('mashCacheAge record for: [ ' + cacheName + ' ] cache.');
                                 //$log.log(record);

                                 // if no record is returned then it is considered stale.
                                 var recordCount = record.length;
                                 if (recordCount > 0) {
                                     var durationMilliseconds = currentDateMilliseconds - record[0].updatedDate;

                                     // Check if the data is stale.
                                     if (durationMilliseconds > ageToleranceMilliseconds) {
                                         result = true;
                                     } else { result = false; }

                                     deferred.resolve(result);
                                 } else {
                                     // no records found so this cache is considered stale.
                                     deferred.resolve(true);
                                 }
                             });
                     }
                     catch (e) {
                         // no data store for the cache was found so it is considered stale.
                         deferred.resolve(true);
                     }

                 } else {
                     // Giving the cache database a moment to set up.
                     setTimeout(wait, 500);
                 }
             })();

             return deferred.promise;
         };

         // Updates the age of any cacheName.
         var updateCacheAge = function (cacheName) {
             // updates the mashCacheAge which keeps track of how old/stale a cache is.
             var cacheJSON = { id: cacheName, updatedDate: new Date().getTime() };
             dbCache.put({ name: 'mashCacheAge', keyPath: 'id' }, cacheJSON);
         };

         var getCache = function (cacheName) {
             var deferred = $q.defer();
             // waiting for dbCacheReady because accessing the cache to early causes an error.
             (function wait() {
                 if (dbCacheReady) {

                     try {
                         dbCache.executeSql('SELECT * FROM \'' + cacheName + '\'').then(function (record) {
                             if (record === 'N') { deferred.resolve(''); }
                             else { deferred.resolve(record); }
                         });

                     }
                     catch (e) {
                         // no data store for the cache was found so it is considered stale.
                         deferred.resolve('NoCache');
                     }

                 } else { setTimeout(wait, 500); }
             })();
             return deferred.promise;
         };

         // --------------------------------------------------------------------------------
         // If the machCache is too old then all the data is wiped out and the user starts again.
         // --------------------------------------------------------------------------------
         var minutesInOneWeek = 10080;  // 10080 = 1 week
         isCacheStale('mashCacheStart', minutesInOneWeek).then(function (result) {
             //alert(result);
             if (result) {
                 // The mashCache is too old and needs cleared.
                 //ydn.db.deleteDatabase('mashCacheDB');
                 //setTimeout(function () { alert('mashCacheDB was stale so deleted.'); }, 1);

                 // TODO: Add this to mashup logging so we can keep track of this happening.
                 //       Possibly make this kind of information available to the user log page.

                 // The first time through there will be no objects and this clear will fail. 
                 try { dbCache.clear(); } catch (e) { }

                 var logObject = utility.getLogObject('mashCasheDelete', 'Mashup.UI.Core', 'cacheService',
                     'root of cacheService', 'Stale-Cache', sessionService);
                 $log.log('mashCacheDB was stale so deleted.', logObject);
                 updateCacheAge('mashCacheStart');
             }
         });


         return {

             dbCache: dbCache,

             putCache: function (cacheName, schema, data) {

                 //dbCache.put({ name: cacheName, keyPath: 'id' }, { id: cacheName, data: data });
                 dbCache.put(schema, data);
                 updateCacheAge(cacheName);

             },

             // Retrieve cache
             getCache: function (cacheName) {
                 var deferred = $q.defer();

                 getCache(cacheName).then(function (data) {
                     deferred.resolve(data);
                 }, function (reason) {
                     deferred.reject();
                 });

                 return deferred.promise;

             },
             getData: function (cacheName, schema, options, staleMinutes,
                 heartBeatOptions) {

                 var deferred = $q.defer();

                 var webApiUrl = options.url;
                 
                 // Check if the cache is stale.
                 isCacheStale(cacheName, staleMinutes).then(function (cacheIsStale) {
                     // If cache stale then get new data.

                     // if no application name is provided for the detect service to use then the url is used.
                     // this is mostly used for logging purposes.
                     if (!heartBeatOptions.heartBeatName) {
                         heartBeatOptions.heartBeatName = heartBeatOptions.heartBeatName || webApiUrl;
                     }
                     else {
                         heartBeatOptions.heartBeatName = heartBeatOptions.heartBeatName || heartBeatOptions.heartBeatUrl;
                     }


                     var webApiAvailable = detectService.detect(heartBeatOptions.heartBeatUrl, heartBeatOptions.heartBeatName);

                     if (cacheIsStale && webApiAvailable) {
                         // cache has become stale so retrieving fresh data.
                         // -------------------
                         // Example of options
                         // -------------------
                         //var options = {
                         //    url: 'http://localhost:50004/api/ExampleData/Items/Search2/',
                         //    method: 'POST',
                         //    data: JSON.stringify(myData),
                         //    withCredentials: true,
                         //    contentType: 'application/json'
                         //}
                         // -------------------
                         // Example of options.params
                         // -------------------
                         //var params = {
                         //    id: vm.id,
                         //    action: vm.action,
                         //    completed: vm.completed,
                         //    myDecimal: vm.myDecimal,
                         //    myDouble: vm.myDouble,
                         //    myLong: vm.myLong,
                         //    contact: vm.contact,
                         //    doneWithIndeterminate: vm.doneCheckedState
                         //};
                         $http(options)
                             .success(function (data) {

                                 //#region

                                 // -------------------------------------------------------------------------------
                                 // Schema will be passed in so that it can be generated on the fly.
                                 // When a schema for an object store changes it will break and cause
                                 // an error.  We will look for that error and simply delete the
                                 // indexedDB database so the next time this is caused the new schema
                                 // can take hold.  This doesn't seem ideal but the impact is only
                                 // to performance when schemas change for cached data.
                                 // -------------------------------------------------------------------------------
                                 // Normally the schema is defined up front and versioned.  For the cache we want
                                 // developers to have one less thing to consider and allow the mashup core
                                 // to be less coupled to the caching needs of other mashup applications.
                                 // -------------------------------------------------------------------------------

                                 //#endregion

                                 try {
                                     // add data to cache
                                     dbCache.put(schema, data);
                                     // updateCacheAge
                                     updateCacheAge(cacheName);
                                 }
                                 catch (err) {

                                     var logObject = utility.getLogObject('mashCasheDelete', 'Mashup.UI.Core',
                                         'cacheService', 'getData', 'Error', sessionService);
                                     $log.error(err, logObject);
                                     indexedDB.deleteDatabase('mashCacheDB');
                                     $log.log('IndexedDB error on updating a cache. Deleted database',
                                         logObject);

                                 }

                                 // return web api data to the client
                                 // async alert() so the performance perception isn't affected.
                                 //setTimeout(function () { alert('web api data'); }, 1);
                                 deferred.resolve(data);
                             })
                         .error(function () {
                             // if the call fails then return the current cache.
                             // TODO: make an async call to let someone know a service failed?
                             // alert('Web Api Error');
                             detectService.failed(heartBeatOptions.heartBeatUrl, heartBeatOptions.heartBeatName);
                             getCache(cacheName).then(function (data) {
                                 // async alert()
                                 // setTimeout(function () { alert('cache data'); }, 1);
                                 deferred.resolve(data);
                             });
                         });
                     } else {
                         // cached data is still good so return it.
                         getCache(cacheName).then(function (data) {
                             deferred.resolve(data);
                         });
                     }
                 });
                 return deferred.promise;
             }
         };
     }]);
