define(["jquery", "app/utils", "app/graphing", "app/lastfmToSpotify"],
function ($, utils, graphing, lastFmToSpotify) {
    var spotifyId,
        params = utils.getHashParams(),
        access_token = params.access_token,
        error = params.error;


    if (error) {
        alert('There was an error during the authentication');
    }
    else {
        if (access_token) {
            var query = $.ajax({url: 'https://api.spotify.com/v1/me', headers: { 'Authorization': 'Bearer ' + access_token}});
            query.then(function (response) {
                spotifyId = response.id;

                graphing.init();
                $("#panel-title").append(response.display_name);
                $('#login').hide();
                $('#loggedin').show();
            })
        }
        else {
            $('#login').show();
            $('#loggedin').hide();
        }
    }

    $("#run").click(function (event) {
        event.stopPropagation();
        event.preventDefault();

        lastFmToSpotify.init(access_token, spotifyId);
    });

    $(document).ready(function () {
        $.material.init();
    });
});