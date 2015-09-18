var spotifyId;
var params = getHashParams();

var access_token = params.access_token,
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
    var lastFmName = GetFormData('#name');
    var playlistName = GetFormData('#playlistName')

    if(lastFmName.length < 1 || playlistName.length < 1){
        return null;
    }

    Run(access_token,lastFmName, playlistName);

    event.stopPropagation();
    return false;
});

function Run(access_token, lastFmName, playlistName) {
    $("#results").show();

    var playlistId = CreateSpotifyPlaylist(spotifyId, playlistName, access_token, ProccessLastFmTracks);

    function ProccessLastFmTracks(playlistId) {
        GetLastFmTracks(lastFmName, MatchLastFmTracksToSpotify);

        function MatchLastFmTracksToSpotify(trackArray) {
            var count = 1;
            var progressBarIncrement = calculateProgressBarIncrement(trackArray);
            var trackArrays = splitTrackArray(trackArray);

            var interval = setInterval(function(){
                MatchTracksWithSpotify(access_token, trackArrays[count], progressBarIncrement, ProcessSpotifyTracks);
                count++;
                if(count == trackArrays.length) {
                    clearInterval(interval);
                }
            }, 9000);

            function ProcessSpotifyTracks(songUris) {
                songUris = GenerateQueryString(songUris);

                AddTrackToPlaylist(spotifyId, playlistId, songUris, access_token);
            }
        }
    }
}

function AddTrackToPlaylist(name, playlistId, songUris, access_token) {
        var addTrackUrl = "https://api.spotify.com/v1/users/" + name +
            "/playlists/" + playlistId +
            "/tracks?uris=" + songUris[0];
        console.log(addTrackUrl);
        $.ajax({
            //url: "https://api.spotify.com/v1/users/khardman51/playlists/1sP4fYLmDZHMqRSMGBBMZ1/tracks?uris=" + songUris[0],
            url: addTrackUrl,
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            type: "POST",
            success: function(response) {
                console.log(response);
            }
        });
}

function CreateSpotifyPlaylist(spotifyId, name, access_token, ProccessLastFmTracks){
    console.log("d");
    $.ajax({
        method: "POST",
        url: "https://api.spotify.com/v1/users/" + spotifyId + "/playlists",
        headers: { 'Authorization': 'Bearer ' + access_token },
        data: "{\"name\":\"" + name + "\", \"public\":false}"
            ,
        success: function(response) {
            var pid = response.id;
            ProccessLastFmTracks(pid)
        }
    });
}

function GetFormData(field) {
    var name = $(field).serializeArray();
    name = name[0].value.toString();
    console.log(name);
    return name;
}

function GetLastFmTracks(name, callback) {
    var urlString = 'http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' + name + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=280&format=json';

    $.ajax({
        url: urlString,
        success: function (response) {
            callback(response.lovedtracks.track)
        }
    });
}

function getCurrentProgress(type) {
    var progress = $(type).attr("style");
    progress = progress.substring(7, progress.length - 1);
    progress = parseFloat(progress).toFixed(2);
    progress = parseFloat(progress);
    return progress;
}

function MatchTracksWithSpotify(access_token, longTrackArray, progressBarIncrement, getUriQueryString) {
    var uriArray = [];
    var failArray = [];
    var progress;

    longTrackArray.forEach(function (track) {
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

                    progress = getCurrentProgress("#success-progress");
                    progress = (progress + progressBarIncrement).toFixed(2) + "%";

                    $("#success-progress").attr({"style": "width: " + progress});
                    $("#successful-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
                    $("#successful-result-spotify").append('<p class="result">' + spotifyTrack.artists[0].name + " - " + spotifyTrack.name) + '</p>';
                }
                else{
                    progress = getCurrentProgress("#failure-progress");
                    progress = (progress + progressBarIncrement).toFixed(2) + "%";

                    $("#failure-progress").attr({"style": "width: " + progress});
                    failArray.push("fail");
                    $("#fail-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
                }

                if(uriArray.length + failArray.length == longTrackArray.length){
                    getUriQueryString(uriArray);
                    uriArray = [];
                    failArray = [];
                    var totalProgress = getCurrentProgress("#success-progress") + getCurrentProgress("#failure-progress");
                    if( totalProgress > 100){
                        var p = 100 - getCurrentProgress("#success-progress");
                        p = p.toFixed(2) + "%";
                        $("#failure-progress").attr({"style": "width: " + p})
                    }
                }

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

function calculateProgressBarIncrement(trackArray) {
    var progressBarIncrement = 100 / trackArray.length;
    progressBarIncrement = Math.round(100 * progressBarIncrement) / 100;
    return progressBarIncrement;
}

function splitTrackArray(trackArray) {
    var trackArrays = [];
    var t = Math.ceil(trackArray.length / 50);

    for (i = 1; i <= t; i++) {
        trackArrays[i] = trackArray.splice(0, 50)
    }
    return trackArrays;
}