define(["jquery", "app/utils", "app/graphing"],
function ($, utils, graphing) {
    return {
        init: function (access_token, spotifyId) {
            this.access_token = access_token;
            this.spotifyId = spotifyId;
            this.playlistName = utils.getFormData('#playlistName');
            this.lastFmName = utils.getFormData('#name');

            if (this.lastFmName.length < 1 || this.playlistName.length < 1) {
                return null;
            }
            this.run();
        },

        run: function (access_token, spotifyId) {
            $("#run").addClass('disabled');
            $("#results").show();

            this._createSpotifyPlaylist(spotifyId, this.playlistName);
            this._getLastFmTracks(this.lastFmName);
        },

        _createSpotifyPlaylist: function (spotifyId, name) {
            var url = "https://api.spotify.com/v1/users/" + spotifyId + "/playlists";
            var headers = {'Authorization': 'Bearer ' + this.access_token};
            var data = "{\"name\":\"" + name + "\", \"public\":false}";

            var query = $.ajax({method: "POST", url: url, headers: headers,data: data});
            query.then(function(response){
                this.playlistId = response.id;
            }.bind(this));
        },

        _getLastFmTracks: function (name) {
            var urlString = 'https://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' +
                name + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=280&format=json';

            var query = $.ajax({ url: urlString});
            query.then(function(response){
                this._initMatchLastFmTracksToSpotify(response.lovedtracks.track);
            }.bind(this));
        },

        _addTrackToPlaylist: function (name, playlistId, songUris, access_token) {
            var addTrackUrl = "https://api.spotify.com/v1" + "/users/" + name +
                "/playlists/" + this.playlistId + "/tracks?uris=" + songUris[0];
            var headers = {'Authorization': 'Bearer ' + this.access_token};

            return $.ajax({ url: addTrackUrl, headers: headers, type: "POST"});
        },

        _initMatchLastFmTracksToSpotify: function(trackArray) {
            var count = 1;
            var progressBarIncrement = utils.calculateProgressBarIncrement(trackArray);
            var trackArrays = utils.splitTrackArray(trackArray);

            var interval = setInterval(function () {
                this._matchTracksWithSpotify(this.access_token, trackArrays[count], progressBarIncrement);

                count++;
                if (count == trackArrays.length) {
                    clearInterval(interval);
                }
            }.bind(this), 9000);
        },

        _processSpotifyTracks: function (songUris) {
            songUris = utils.generateQueryString(songUris);

            var query = this._addTrackToPlaylist(this.spotifyId, this.playlistId, songUris, this.access_token);
            query.then(function (response) {
                console.log(response);
            })
        },

        _matchTracksWithSpotify: function (access_token, longTrackArray, progressBarIncrement) {
            var successfulSearchUris = [];
            var failedSearchUris = [];
            var progress;

            longTrackArray.forEach(function (track) {
                var queryString = this._generateQueryString(track);
                var url = 'https://api.spotify.com/v1/search?q=' + queryString + '&type=track&limit=1';
                var headers = {'Authorization': 'Bearer ' + this.access_token};

                var query = $.ajax({ url: url , headers: headers });
                query.then(function(response) {
                    console.log(response);
                    var spotifyTrack = response.tracks.items[0];

                    if (spotifyTrack) {
                        successfulSearchUris.push(spotifyTrack.uri);
                        utils.searchSuccessUiHandler(progress, progressBarIncrement, track, spotifyTrack);
                        graphing._groupBarGraphData(spotifyTrack.popularity);
                    }
                    else {
                        failedSearchUris.push("fail");
                        utils.failedSearchUiHandler(progress, progressBarIncrement, track);
                    }

                    if (successfulSearchUris.length + failedSearchUris.length == longTrackArray.length) {
                        this._processSpotifyTracks(successfulSearchUris);
                        utils.adjustFinalProgressBar();
                        successfulSearchUris = [];
                        failedSearchUris = [];
                    }
                }.bind(this));
            }.bind(this));
        },

        _generateQueryString: function (track) {
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
            return queryString.substr(6);
        }
    };
});


