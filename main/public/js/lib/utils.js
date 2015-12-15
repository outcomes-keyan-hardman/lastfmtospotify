define(function () {
    return {
        getFormData: function (field) {
            var fieldValue = $(field).serializeArray();
            fieldValue = fieldValue[0].value.toString();
            return fieldValue;
        },

        generateQueryString: function (songUris) {
            var longString = "";
            var trackStringArray = [];
            var i = 1;
            songUris.forEach(function (uri) {
                longString += uri + ",";

                if (i == 100 || i == songUris.length) {
                    var longQueryString = $.param({
                        track: longString.slice(0, -1)
                    });
                    trackStringArray.push(longQueryString.substr(6));
                }
                i++;
            });
            return trackStringArray;
        },

        getHashParams: function () {
            var hashParams = {};
            var e, r = /([^&;=]+)=?([^&;]*)/g,
                q = window.location.hash.substring(1);
            while (e = r.exec(q)) {
                hashParams[e[1]] = decodeURIComponent(e[2]);
            }
            return hashParams;
        },

        calculateProgressBarIncrement: function (trackArray) {
            var progressBarIncrement = 100 / trackArray.length;
            progressBarIncrement = Math.round(100 * progressBarIncrement) / 100;
            return progressBarIncrement;
        },

        splitTrackArray: function (trackArray) {
            var trackArrays = [];
            var t = Math.ceil(trackArray.length / 50);

            for (i = 1; i <= t; i++) {
                trackArrays[i] = trackArray.splice(0, 50)
            }
            return trackArrays;
        },

        // UI Utils

        searchSuccessUiHandler: function (progress, progressBarIncrement, track, spotifyTrack) {
            progress = this._getCurrentProgress("#success-progress");
            progress = (progress + progressBarIncrement).toFixed(2) + "%";

            $("#success-progress").attr({"style": "width: " + progress});
            $("#successful-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
            $("#successful-result-spotify").append('<p class="result">' + spotifyTrack.artists[0].name + " - " + spotifyTrack.name) + '</p>';
        },

        failedSearchUiHandler: function (progress, progressBarIncrement, track) {
            progress = this._getCurrentProgress("#failure-progress");
            progress = (progress + progressBarIncrement).toFixed(2) + "%";

            $("#failure-progress").attr({"style": "width: " + progress});
            $("#fail-result-lastfm").append('<p class="result">' + track.artist.name + " - " + track.name) + '</p>';
        },

        adjustFinalProgressBar: function () {
            var totalProgress = this._getCurrentProgress("#success-progress") + this._getCurrentProgress("#failure-progress");
            if (totalProgress > 100) {
                var p = 100 - this._getCurrentProgress("#success-progress");
                p = p.toFixed(2) + "%";
                $("#failure-progress").attr({"style": "width: " + p})
            }
        },

        _getCurrentProgress: function (type) {
            var progress = $(type).attr("style");
            progress = progress.substring(7, progress.length - 1);
            progress = parseFloat(progress).toFixed(2);
            progress = parseFloat(progress);
            return progress;
        }
    };

});
