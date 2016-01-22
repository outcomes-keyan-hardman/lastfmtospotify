requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        "app": "../app",
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "material": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.6/js/material",
        "ripples": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.6/js/ripples",
        "bootstrap": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min",
        "plotly": "plotly-latest.min",
        "underscore": "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min"
    },

    shim: {
        'bootstrap': ['jquery'],
        "material": ['jquery'],
        "ripples": ['jquery']
    }
});

requirejs(["jquery", "app/app"]);