/**
 * Created by keyan.hardman on 12/13/15.
 */

requirejs.config({
    "baseUrl": "js/libs",
    "paths": {
        "js": "../",
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        "material": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/0.5.5/js/material"
    }
});

// Load the main app module to start the app
requirejs(["jquery", "js/lastfmToSpotify"]);