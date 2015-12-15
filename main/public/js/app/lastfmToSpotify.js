define(["jquery", "material", "ripples", "utils"],
function ($, material, ripples, utils) {
    return {
        run: function (access_token, spotifyId) {
            $("#run").addClass('disabled');
            var lastFmName = utils.getFormData('#name');
            var playlistName = utils.getFormData('#playlistName');

            if (lastFmName.length < 1 || playlistName.length < 1) {
                return null;
            }

            $("#results").show();

            this._createSpotifyPlaylist(spotifyId, playlistName, access_token, ProccessLastFmTracks);

            function ProccessLastFmTracks(playlistId) {
                this._getLastFmTracks(lastFmName, MatchLastFmTracksToSpotify);

                function MatchLastFmTracksToSpotify(trackArray) {
                    var count = 1;
                    var progressBarIncrement = utils.calculateProgressBarIncrement(trackArray);
                    var trackArrays = utils.splitTrackArray(trackArray);

                    var interval = setInterval(function () {
                        this._matchTracksWithSpotify(access_token, trackArrays[count], progressBarIncrement, ProcessSpotifyTracks);

                        count++;
                        if (count == trackArrays.length) {
                            clearInterval(interval);
                        }
                    }, 9000);

                    function ProcessSpotifyTracks(songUris) {
                        songUris = utils.generateQueryString(songUris);

                        this._addTrackToPlaylist(spotifyId, playlistId, songUris, access_token);
                    }
                }
            }
        },

        _createSpotifyPlaylist: function (spotifyId, name, access_token, ProccessLastFmTracks) {
            $.ajax({
                method: "POST",
                url: "https://api.spotify.com/v1/users/" + spotifyId + "/playlists",
                headers: {'Authorization': 'Bearer ' + access_token},
                data: "{\"name\":\"" + name + "\", \"public\":false}"
                ,
                success: function (response) {
                    ProccessLastFmTracks(response.id);
                }
            });
        },

        _getLastFmTracks: function (name, callback) {
            var urlString = 'https://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' +
                name + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=280&format=json';

            $.ajax({
                url: urlString,
                success: function (response) {
                    callback(response.lovedtracks.track)
                }
            });
        },

        _addTrackToPlaylist: function (name, playlistId, songUris, access_token) {
            var addTrackUrl = "https://api.spotify.com/v1" + "" +
                "/users/" + name +
                "/playlists/" + playlistId +
                "/tracks?uris=" + songUris[0];

            $.ajax({
                url: addTrackUrl,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                type: "POST",
                success: function (response) {
                    console.log(response);
                }
            });
        },

        _matchTracksWithSpotify: function (access_token, longTrackArray, progressBarIncrement, getUriQueryString) {
            var successfulSearchUris = [];
            var failedSearchUris = [];
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
                    if (string.indexOf(index) > 1) {
                        string = string.substr(0, string.indexOf(index))
                    }
                    return string;
                }

                var longString = artist + " " + song;
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
                        console.log(response);
                        var spotifyTrack = response.tracks.items[0];

                        if (spotifyTrack) {
                            successfulSearchUris.push(spotifyTrack.uri);
                            utils.searchSuccessUiHandler(progress, progressBarIncrement, track, spotifyTrack);
                        }
                        else {
                            failedSearchUris.push("fail");
                            utils.failedSearchUiHandler(progress, progressBarIncrement, track);
                        }

                        if (successfulSearchUris.length + failedSearchUris.length == longTrackArray.length) {
                            getUriQueryString(successfulSearchUris);
                            utils.adjustFinalProgressBar();
                            successfulSearchUris = [];
                            failedSearchUris = [];
                        }

                    }
                });
            });
        }
    };
});


