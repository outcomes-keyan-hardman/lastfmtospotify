define(["jquery", "app/utils", "app/graphing", "app/lastfmToSpotify", "app/router"],
function ($, utils, graphing, lastFmToSpotify, router) {
    var spotifyId,
        params = utils.getHashParams(),
        access_token = params.access_token,
        error = params.error;

    router.init();

    //if (error) {
    //    alert('There was an error during the authentication');
    //}
    //else {
    //    if (access_token) {
    //        var query = $.ajax({url: 'https://api.spotify.com/v1/me', headers: { 'Authorization': 'Bearer ' + access_token}});
    //        query.then(function (response) {
    //            spotifyId = response.id;
    //
    //            graphing.init();
    //            $("#panel-title").append(response.display_name);
    //            $('#loggedin').show();
    //        })
    //    }
    //    else {
    //        $('#loggedin').hide();
    //    }
    //}
    //
    //$("#run").click(function (event) {
    //    event.stopPropagation();
    //    event.preventDefault();
    //
    //    lastFmToSpotify.init(access_token, spotifyId);
    //});

    $(document).ready(function () {
        $.material.init();
    });
});