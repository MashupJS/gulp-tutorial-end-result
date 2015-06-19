// ALL GOOD IF NO ERRORS BELOW THIS LINE - I'm leaving this in the code to force the gulp-jshint-html-reporter pligin to update the html file.  If there are no errors then no report is written so you never know if your last JSHint error is fixed or not.

// -------------------------------------------------------------------------
// Kicks off the angularJS application
// create the module and name it "mashupApp"
// -------------------------------------------------------------------------
var mashupApp = angular.module('mashupApp', ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'oc.lazyLoad']);
// -------------------------------------------------------------------------


// ----------------------------------------------------------------------------------------------
// This configures ocLazyLoadProvider and let's it know that some modules have already been
// loaded.  Without this the Menu dialog would not work because some directive was loaded twice.
// https://github.com/ocombe/ocLazyLoad/issues/71
// ----------------------------------------------------------------------------------------------
angular.module('mashupApp').config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    'use strict';
    $ocLazyLoadProvider.config({
        loadedModules: ['ngRoute', 'ui.bootstrap', 'ngSanitize', 'oc.lazyLoad']
    });

}]);

// To disable $sce:
mashupApp.config(['$sceProvider', function ($sceProvider) {
    'use strict';
    $sceProvider.enabled(false);
}]);


// add authentication here...
// http://brewhouse.io/blog/2014/12/09/authentication-made-simple-in-single-page-angularjs-applications.html
//mashupApp.run(['$rootScope', '$state', 'loginModal', function ($rootScope, $state, loginModal) {
//mashupApp.run(['$rootScope', '$state', function ($rootScope, $state) {

//    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

//        window.windowalert(toState);

//        //var requireLogin = toState.data.requireLogin;

//        //if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
//        //    event.preventDefault();

//        //    loginModal()
//        //      .then(function () {
//        //          return $state.go(toState.name, toParams);
//        //      })
//        //      .catch(function () {
//        //          return $state.go('welcome');
//        //      });
//        //}

//    });
//}]);





