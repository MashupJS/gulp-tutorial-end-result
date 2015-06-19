// Ignore everythihng here.  This file is not being used yet.

console.log('config.js - loaded');

var mashupConfiguration = {
    'config': {
        'environment': 'localEnvironment',
        'revision': '8220',
        'configuration': [
            {
                'id': 'localEnvironment',
                'applications': {
                    'application': [
                        {
                            'name': 'mashup',
                            'modelBaseURL': '../',
                            'apiBaseURL': '/api/'
                        },
                        {
                            'name': 'app2',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/app2',
                            'apiBaseURL': 'vwebstg.versopaper.net/mashup/app2/api'
                        },
                        {
                            'name': 'app3',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/app3',
                            'apiBaseURL': 'vwebstg.versopaper.net/mashup/app3/api'
                        }
                    ]
                }
            },
            {
                'id': 'staging',
                'applications': {
                    'application': [
                        {
                            'name': 'mashup',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/',
                            'apiBaseURL': 'vwebstg.versopaper.net/mashup/api'
                        },
                        {
                            'name': 'app2',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/app2',
                            'apiBaseURL': 'vwebstg.versopaper.net/mashup/app2/api'
                        },
                        {
                            'name': 'app3',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/app3',
                            'apiBaseURL': 'vwebstg.versopaper.net/mashup/app3/api'
                        }
                    ]
                }
            },
            {
                'id': 'production',
                'applications': {
                    'application': [
                        {
                            'name': 'mashup',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/',
                            'apiBaseURL': 'vweb.versopaper.net/mashup/api'
                        },
                        {
                            'name': 'app2',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/app2',
                            'apiBaseURL': 'vweb.versopaper.net/mashup/app2/api'
                        },
                        {
                            'name': 'app3',
                            'modelBaseURL': 'vwebstg.versopaper.net/mashup/app3',
                            'apiBaseURL': 'vweb.versopaper.net/mashup/app3/api'
                        }
                    ]
                }
            }
        ]
    }
};


var apps = mashupConfiguration.config.configuration[0];

console.log(apps.applications.application[0].name);
console.log(apps.applications.application[0].modelBaseURL);
console.log(apps.applications.application[0].apiBaseURL);

console.log(apps.applications.application[1].name);
console.log(apps.applications.application[1].modelBaseURL);
console.log(apps.applications.application[1].apiBaseURL);

console.log(apps.applications.application[2].name);
console.log(apps.applications.application[2].modelBaseURL);
console.log(apps.applications.application[2].apiBaseURL);

// Can use the above to loop through each name and build the menu system.
// Possibly make a call into each location to verify and remove menu items
// if not found.
