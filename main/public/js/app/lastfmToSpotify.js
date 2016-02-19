define(["jquery", "app/utils", "app/graphing"],
function ($, utils, graphing) {
    return {
        init: function () {
            var params = utils.getHashParams();
            App.spotifyAccessToken = params.access_token ? params.access_token : App.spotifyAccessToken;
            this.error = params.error;
            this.numberOfTracksToProcess = 0;

            if(App.spotifyAccessToken){
                window.location.hash = '#/lastFmToSpotify/';
                this._showUi();
            }
            else {
                window.location.href = 'login';
            }
        },

        _showUi: function () {
            if (this.error) {
                alert('There was an error during the authentication');
            }
            else {
                if (App.spotifyAccessToken) {
                    graphing.init();

                    var query = $.ajax({
                        url: 'https://api.spotify.com/v1/me',
                        headers: {'Authorization': 'Bearer ' + App.spotifyAccessToken}
                    });
                    query.then(function (response) {
                        this.spotifyId = response.id;

                        $("#panel-title").append(response.display_name);
                        $('#loggedin').show();

                        this._bindRunButton();
                    }.bind(this))
                }
                else {
                    $('#loggedin').hide();
                }
            }
        },

        _bindRunButton: function () {
            $("#run").click(function (event) {

                var formData = utils.getFormData();
                this.playlistName = formData['playlistName'];
                this.lastFmName = formData['lastFmName'];
                this.chartType = formData['chartType'];

                if (this.lastFmName.length < 1 || this.playlistName.length < 1) {
                    return null;
                }

                event.stopPropagation();
                event.preventDefault();

                this._run();
            }.bind(this));
        },

        _run: function () {
            $("#run").addClass('disabled');
            $("#results").show();

            this._createSpotifyPlaylist();
            if(this.chartType == 'loved') {
                this._getLastFmLovedTracks();
            }
            else{
                this._getLastFmTopTracks()
            }
        },

        _postSomething: function (tracklist) {
            var url = window.location.origin + "/store_songs/";
            var data = {popularities: tracklist, time: new Date()};

            var query = $.ajax({method: "POST", url: url, data: data});
            query.then(function (response) {
                console.log('');
            }.bind(this));
        },

        _createSpotifyPlaylist: function () {
            var url = "https://api.spotify.com/v1/users/" + this.spotifyId + "/playlists";
            var headers = {'Authorization': 'Bearer ' + App.spotifyAccessToken};
            var data = "{\"name\":\"" + this.playlistName + "\", \"public\":false}";

            var query = $.ajax({method: "POST", url: url, headers: headers, data: data});
            query.then(function (response) {
                this.playlistId = response.id;
            }.bind(this));
        },

        _getLastFmLovedTracks: function () {
            var urlString = 'https://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' +
                this.lastFmName + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=400&format=json';

            var query = $.ajax({url: urlString});
            query.then(function (response) {
                this.numberOfTracksToProcess = response.lovedtracks.track.length;
                this._initMatchLastFmTracksToSpotify(response.lovedtracks.track);
            }.bind(this));
        },
        _getLastFmTopTracks: function () {
            var urlString = 'https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=' +
                this.lastFmName + '&api_key=ddf133674ebcf8752b9cf7919884feb1&limit=150&format=json&period=' + this.chartType;
            var query = $.ajax({url: urlString});

            query.then(function (response) {
                this._initMatchLastFmTracksToSpotify(response.toptracks.track);
            }.bind(this));
        },
        _addTrackToPlaylist: function (songUris) {
            var addTrackUrl = "https://api.spotify.com/v1" + "/users/" + this.spotifyId +
                "/playlists/" + this.playlistId + "/tracks?uris=" + songUris[0];
            var headers = {'Authorization': 'Bearer ' + App.spotifyAccessToken};

            return $.ajax({url: addTrackUrl, headers: headers, type: "POST"});
        },

        _initMatchLastFmTracksToSpotify: function (trackArray) {
            var count = 1;
            var progressBarIncrement = utils.calculateProgressBarIncrement(trackArray);
            var trackArrays = utils.splitTrackArray(trackArray);

            var interval = setInterval(function () {
                this._matchTracksWithSpotify(App.spotifyAccessToken, trackArrays[count], progressBarIncrement);

                count++;
                if (count == trackArrays.length) {
                    clearInterval(interval);
                }
            }.bind(this), 900);
        },

        _processSpotifyTracks: function (songUris) {
            songUris = utils.generateQueryString(songUris);

            var query = this._addTrackToPlaylist(songUris);
            query.then(function (response) {
                console.log(response);
            })
        },

        _matchTracksWithSpotify: function (access_token, longTrackArray, progressBarIncrement) {
            var successfulSearchUris = [];
            var failedSearchUris = [];
            var progress;

            longTrackArray.forEach(function (track) {
                var queryString = this._generateSpotifySearchQueryString(track);
                var url = 'https://api.spotify.com/v1/search?q=' + queryString + '&type=track&limit=1';
                var headers = {'Authorization': 'Bearer ' + App.spotifyAccessToken};

                var query = $.ajax({url: url, headers: headers});
                query.then(function (response) {
                    console.log(response);
                    var spotifyTrack = response.tracks.items[0];
                    if (spotifyTrack) {
                        successfulSearchUris.push(spotifyTrack.uri);
                        utils.searchSuccessUiHandler(progress, progressBarIncrement, track, spotifyTrack);
                        graphing._groupBarGraphData(spotifyTrack.popularity);
                        graphing.trackPopularties.push(spotifyTrack.popularity);
                    }
                    else {
                        failedSearchUris.push("fail");
                        utils.failedSearchUiHandler(progress, progressBarIncrement, track);
                    }

                    if (successfulSearchUris.length + failedSearchUris.length == longTrackArray.length) {
                        this._processSpotifyTracks(successfulSearchUris);
                        this.numberOfTracksToProcess -= successfulSearchUris.length + failedSearchUris.length;
                        if(this.numberOfTracksToProcess == 0){
                            this._postSomething(graphing.trackPopularties);
                        }
                        utils.adjustFinalProgressBar();
                        successfulSearchUris = [];
                        failedSearchUris = [];
                    }
                }.bind(this));
            }.bind(this));
        },

        _generateSpotifySearchQueryString: function (track) {
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


