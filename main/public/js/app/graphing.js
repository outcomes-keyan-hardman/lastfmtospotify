define(['underscore', 'plotly'],
function (_, plotly) {
    return {
        init: function () {
            this.plotly = plotly;
            this._ = _;
            this.trackPopularties = [];
            this.popularityRanges = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        },

        _groupBarGraphData: function (popularity) {
            if (this._.isEqual(this.popularityRanges, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
                this._createGraph();
            }

            if (popularity <= 10) {
                this.popularityRanges[0]++;
            }
            else if (popularity > 10 && popularity <= 20) {
                this.popularityRanges[1]++;
            }
            else if (popularity > 20 && popularity <= 30) {
                this.popularityRanges[2]++;
            }
            else if (popularity > 30 && popularity <= 40) {
                this.popularityRanges[3]++;
            }
            else if (popularity > 40 && popularity <= 50) {
                this.popularityRanges[4]++;
            }
            else if (popularity > 50 && popularity <= 60) {
                this.popularityRanges[5]++;
            }
            else if (popularity > 60 && popularity <= 70) {
                this.popularityRanges[6]++;
            }
            else if (popularity > 70 && popularity <= 80) {
                this.popularityRanges[7]++;
            }
            else if (popularity > 80 && popularity <= 90) {
                this.popularityRanges[8]++;
            }
            else {
                this.popularityRanges[9] = this.popularityRanges[9]++;
            }

            var plot = $('bargraph');
            plot.data.y = this.popularityRanges;
            this.plotly.redraw('bargraph')

        },

        _createGraph: function () {
            var data = [
                {
                    x: ['0s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'],
                    y: this.popularityRanges,
                    type: 'bar'
                }
            ];

            var layout = {
                yaxis: {
                    title: "Number of Tracks"
                },
                xaxis: {
                    title: "Popularity"
                },
                title: "Spotify Track Popularity"
            };

            this.plotly.newPlot('bargraph', data, layout);
        }
    };
    });