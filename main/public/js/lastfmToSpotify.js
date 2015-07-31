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

$("#run").click(function(event){
    var lastFmName = GetUsername();

    if(lastFmName.length < 1){
        return null;
    }

    Run(access_token,lastFmName);

    event.preventDefault();
    event.stopPropagation();
    return false;
});

function Run(access_token, lastFmName) {
    var playlistId;

    $("#results").show();

    GetLastFmTracks(lastFmName, callback);

    function callback(trackArray) {

        GetSpotifyTrack(access_token, trackArray, song);

        function song(songUris) {
            songUris = GenerateQueryString(songUris);

            playlistId = GetSpotifyPlaylist(spotifyId, access_token);

            AddTrackToPlaylist(spotifyId, playlistId, songUris, access_token);
        }
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
});

function AddTrackToPlaylist(name, playlistId, songUris, access_token) {
    //var addTrackUrl = "https://api.spotify.com/v1/users/" + name +
    //        "/playlists/" + playlistId +
    //        "/tracks?uris=spotify%3Atrack%" + songUri;
        $.ajax({
            url: "https://api.spotify.com/v1/users/khardman51/playlists/1sP4fYLmDZHMqRSMGBBMZ1/tracks?uris=" + songUris[0],
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

function GetLastFmTracks(name, callback) {
    var urlString = 'http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' + name + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=90&format=json';
    var trackArray = false;

    $.ajax({
        url: urlString,
        success: function (response) {
            callback(response.lovedtracks.track)
        }
    });
}

function GetSpotifyTrack(access_token, trackArray,  getUriQueryString) {
    var uriArray = [];
    var i = 1;

    trackArray.forEach(function (track) {
        var artist = track.artist.name;
        var song = track.name;

        var index1 = "feat.";
        var index2 = "ft.";

        artist = RemoveAtIndex(index1, artist);
        artist = RemoveAtIndex(index2, artist);
        song = RemoveAtIndex(index1, song);
        song = RemoveAtIndex(index2, song);

        function RemoveAtIndex(index, string) {
            if(string.indexOf(index) > 1){
                string = string.substr(0, string.indexOf(index))
            }
            return string;
        }

        var longString =  artist + " " + song;
        var queryString = $.param({
            track: longString
        });
        queryString = queryString.substr(6);

        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + queryString + '&type=track&limit=1',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                var spotifyTrack = response.tracks.items[0];

                if(spotifyTrack != undefined){
                    console.log(response);
                    uriArray.push(spotifyTrack.uri)
                    console.log(spotifyTrack.uri);

                    $("#successful-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
                    $("#successful-result-spotify").append('<p class="result">' + spotifyTrack.artists[0].name + " - " + spotifyTrack.name) + '</p>';
                }
                else{
                    $("#fail-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
                }

                if(i == trackArray.length){
                    getUriQueryString(uriArray);
                }
                i++;
            }
        });
    });
}

function GenerateQueryString(songUris){
    var longString = "";
    var trackStringArray = [];
    var i = 1;
    songUris.forEach(function (uri) {
        longString += uri + ",";

        if (i == 100 | i == songUris.length) {
            var longQueryString = $.param({
                track: longString.slice(0,-1)
            });
            trackStringArray.push(longQueryString.substr(6));
        }
        i++;
    });
    return trackStringArray;
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
