/**
 * Created by keyan.hardman on 12/13/15.
 */
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

                if (i == 100 | i == songUris.length) {
                    var longQueryString = $.param({
                        track: longString.slice(0, -1)
                    });
                    trackStringArray.push(longQueryString.substr(6));
                }
                i++;
            });
            return trackStringArray;
        },

        getHashParams: function() {
            var hashParams = {};
            var e, r = /([^&;=]+)=?([^&;]*)/g,
                q = window.location.hash.substring(1);
            while (e = r.exec(q)) {
                hashParams[e[1]] = decodeURIComponent(e[2]);
            }
            return hashParams;
        },

        calculateProgressBarIncrement: function(trackArray) {
            var progressBarIncrement = 100 / trackArray.length;
            progressBarIncrement = Math.round(100 * progressBarIncrement) / 100;
            return progressBarIncrement;
        },

        splitTrackArray: function(trackArray) {
            var trackArrays = [];
            var t = Math.ceil(trackArray.length / 50);

            for (i = 1; i <= t; i++) {
                trackArrays[i] = trackArray.splice(0, 50)
            }
            return trackArrays;
        }
    };


});
