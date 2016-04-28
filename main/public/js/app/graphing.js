define(['underscore', 'plotly'],
function (_, plotly) {
    return {
        init: function (data) {
            this.plotly = plotly;
            this._ = _;
            this.userPopularities = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.averagePopularities = data.popularities;
        },

        _groupBarGraphData: function (popularity) {
            if (this._.isEqual(this.userPopularities, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
                this._createGraph();
            }

            if (popularity <= 10) {
                this.userPopularities[0]++;
            }
            else if (popularity > 10 && popularity <= 20) {
                this.userPopularities[1]++;
            }
            else if (popularity > 20 && popularity <= 30) {
                this.userPopularities[2]++;
            }
            else if (popularity > 30 && popularity <= 40) {
                this.userPopularities[3]++;
            }
            else if (popularity > 40 && popularity <= 50) {
                this.userPopularities[4]++;
            }
            else if (popularity > 50 && popularity <= 60) {
                this.userPopularities[5]++;
            }
            else if (popularity > 60 && popularity <= 70) {
                this.userPopularities[6]++;
            }
            else if (popularity > 70 && popularity <= 80) {
                this.userPopularities[7]++;
            }
            else if (popularity > 80 && popularity <= 90) {
                this.userPopularities[8]++;
            }
            else {
                this.userPopularities[9] = this.userPopularities[9]++;
            }

            this.graph.then(function (graph) {
                graph.data[0].y = this.userPopularities;
                this.plotly.redraw('bargraph')
            }.bind(this));
        },

        _createGraph: function () {

            var userData = {
                    x: ['0s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'],
                    y: this.userPopularities,
                    type: 'bar'
                };

            var averageData =
                {
                    x: ['0s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'],
                    y: this.averagePopularities,
                    type: 'bar'
                };

            var data = [userData, averageData];

            var layout = {
                yaxis: {
                    title: "Number of Tracks"
                },
                xaxis: {
                    title: "Popularity"
                },
                title: "Spotify Track Popularity",
                barmode: "stack"
            };

            this.graph = this.plotly.newPlot('bargraph', data, layout);
        }
    };
    });