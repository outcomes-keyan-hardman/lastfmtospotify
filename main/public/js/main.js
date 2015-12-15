requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        "app": "../app",
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "material": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.6/js/material",
        "ripples": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.6/js/ripples"
    }
});

requirejs(["jquery", "app/app"]);