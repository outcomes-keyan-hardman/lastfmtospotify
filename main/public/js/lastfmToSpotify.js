var debug; ;
var spotifyId;

var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

if (error) {
    alert('There was an error during the authentication');
}
else {
    if (access_token) {
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                spotifyId = response.id;
                $("#panel-title").append(response.display_name);
                $('#login').hide();
                $('#loggedin').show();
            }
        });
    }
    else {
        $('#login').show();
        $('#loggedin').hide();
    }
}

document.getElementById('run').addEventListener('click', function() {
    Run(access_token);
}, false);

function Run(access_token){
    var playlistId;
    var songId;
    var trackArray;
    var lastFmName = GetUsername();

    if(lastFmName.length < 1){
        return null;
    }

    trackArray = GetLastFmTracks(lastFmName);

    var track = GenerateQueryString(trackArray[0]);

    playlistId = GetSpotifyPlaylist(spotifyId, access_token);

    songId = GetSpotifyTrack(access_token, track);

    AddTrackToPlaylist(spotifyId, playlistId, songId, access_token);

    console.log(trackArray);
}

document.getElementById('obtain-new-token').addEventListener('click', function() {
    $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': refresh_token
        }
    }).done(function(data) {
        access_token = data.access_token;
    });
});

function AddTrackToPlaylist(name, playlistId, songId, access_token) {
    var addTrackUrl = "https://api.spotify.com/v1/users/" + name +
            "/playlists/" + playlistId +
            "/tracks?uris=spotify%3Atrack%" + songId;
        $.ajax({
            url: "https://api.spotify.com/v1/users/khardman51/playlists/1sP4fYLmDZHMqRSMGBBMZ1/tracks?uris=spotify%3Atrack%3A4jrCMOG9OPe6iF4vWFxatb",
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            type: "POST",
            success: function(response) {
                console.log(response);
            }
        });
}

function GetSpotifyPlaylist(name, access_token){
    var pid = false;
    $.ajax({
        url: "https://api.spotify.com/v1/users/" + name + "/playlists",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        async: false,
        success: function(response) {
            console.log(response);
            playlistId = response.items[5].id;
            pid = response.items[5].id;
            console.log(playlistId);
        }
    });
    console.log(pid + "ASDFASDFASDFASDF");
    return pid.toString();
}

function GetUsername() {
    var name = $('#name').serializeArray();
    name = name[0].value.toString();
    console.log(name);
    return name;
}

function GetLastFmTracks(name) {
    var urlString = 'http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' + name + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=5&format=json';
    var trackArray = false;

    $.ajax({
        url: urlString,
        async: false,
        success: function (response) {
            res = response.lovedtracks.track;

            //Append tracks for no reason
            //res.forEach(function (entry) {
            //    console.log(entry.name.toString());
            //    $("#lastfm").append("<li>" + entry.name.toString() + "</li>");
            //});
            trackArray = response.lovedtracks.track;
            //$("#lastfm").append(name);
        }
    });
    return trackArray;
}

function GetSpotifyTrack(access_token, track) {
    var songId = false;
    console.log(track);
    $.ajax({
        url: 'https://api.spotify.com/v1/search?q=' + track.queryString + '&type=track&limit=1',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        async: false,
        success: function (response) {
            var spotifyTrack = response.tracks.items[0];
            console.log(response);
            songId = spotifyTrack.uri;
            console.log(songId);
            $("#results").show();
            $("#successful-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
            $("#successful-result-spotify").append('<p class="result">' + spotifyTrack.artists[0].name + " - " + spotifyTrack.name) + '</p>';
        }
    });
    return songId;
}

function GenerateQueryString(track){
    var trackToAdd= $.param({
        track: track.name
    });
    track.queryString = trackToAdd.substr(6);
    return track;
}

//function GenerateUriString(tracks){
//    var trackArray = [];
//    var trackString = "";
//    tracks.forEach(function (entry) {
//        var i;
//        var e;
//        trackString += entry.name + ",";
//        trackArray.push()
//    });
//    console.log(trackToAdd);
//}

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}
