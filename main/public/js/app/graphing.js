define(['underscore', 'plotly'],
function (_, plotly) {
    return {
        init: function (data) {
            this.plotly = plotly;
            this._ = _;
            this.userPopularities = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.userTotalSongCount = 0;

            var totalAverageSongsStored = data.popularities.reduce(function(previousValue, currentValue){
                return previousValue + currentValue;
            });

            this.averagePopularitiesPercentages = data.popularities.map(function(averageInRange){
                return averageInRange / totalAverageSongsStored * 100;
            });
        },

        _groupBarGraphData: function (popularity) {
            if (this._.isEqual(this.userPopularities, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
                this._createGraph();
            }

            var j = 0;
            for (var i=0; i<=100; i+=10) {
                if(popularity >= i && popularity < i+10){
                    this.userPopularities[j]++;
                }
                j++;
            }

            this.userTotalSongCount++;

            var userPopularityPercentages = this.userPopularities.map(function (songCount) {
                return songCount / this.userTotalSongCount * 100;
            }.bind(this));

            this.graph.then(function (graph) {
                graph.data[0].y = userPopularityPercentages;
                this.plotly.redraw('bargraph')
            }.bind(this));
        },

        _createGraph: function () {

            var userData = {
                    x: ['0s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'],
                    y: this.userPopularities,
                    type: 'bar',
                    name: 'You'
                };

            var averageData =
                {
                    x: ['0s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'],
                    y: this.averagePopularitiesPercentages,
                    mode: 'lines+markers',
                    name: 'User Average'
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