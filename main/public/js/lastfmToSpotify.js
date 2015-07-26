var debug;
var songId;
var playlistId;
var spotifyId;

var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

document.getElementById('run').addEventListener('click', function() {
    Run(access_token, songId);
}, false);

function Run(access_token, songId){
    var lastFmName = GetUsername();

    GetLastFmTracks(lastFmName);

    GetSpotifyPlaylist(spotifyId, access_token)

    GetSpotifyTrack(access_token);

    AddTrackToPlaylist(spotifyId, playlistId, songId);

    console.log("track " + songId);
}

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

document.getElementById('obtain-new-token').addEventListener('click', function() {
    $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': refresh_token
        }
    }).done(function(data) {
        access_token = data.access_token;
    });
}, false);

function AddTrackToPlaylist(name, songId, playlistId) {
    var addTrackUrl = "https://api.spotify.com/v1/users/" + name +
            "/playlists/" + playlistId +
            "tracks?uris=" + songId
        $.ajax({
            url: addTrackUrl
        });
}

function GetSpotifyPlaylist(name, access_token){
    var pid;
    $.ajax({
        url: "https://api.spotify.com/v1/users/" + name + "/playlists",
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
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
    $.ajax({
        url: urlString,
        success: function (response) {
            res = response.lovedtracks.track;

            //Append tracks for no reason
            res.forEach(function (entry) {
                console.log(entry.name.toString());
                $("#lastfm").append("<li>" + entry.name.toString() + "</li>");
            });

            $("#lastfm").append(name);
        }
    });
}

function GetSpotifyTrack(access_token) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search?q=Muse+a&type=track,artist&limit=1',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function (response) {
            console.log(response);
            songId = response.tracks.items[0].artists[0].id;
            console.log(songId);

        }
    });
}

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}