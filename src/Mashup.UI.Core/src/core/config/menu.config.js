
/*jshint -W101*/

// The menu will be described through JSON.
// The core/config/menu.config.js will describe some menu items but most will come from core/apps/[application]/~appConfig
// The JSON will load with a piece of code that adds to come JSON globally accessible objet.  Not sure how I should do that yet.  Possibly a service.
// ?Can I use ocLazyLoad to load the menu.config.js files with JS that adds it's contents to the menu?
// 

// 1. Concatinate menu.config.js files
// 2. core/config/menu.config.js declares the global(ish) menu object.
// 3. every other menu.config.js has a function with JSON data inside that addes to the menu object.
// 4. core/config/menu.config.js will have a method to finish up or will concatinate another file to the end with a method to clean up.
// or I'll come up with a not so janky solution... :)
