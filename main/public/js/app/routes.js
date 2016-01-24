define(["app/lastfmToSpotify"],
function (lastfmToSpotify) {
    return {
        init: function () {
            this.routeCollection = {};
            this._registerRoutes();
        },

        _registerRoutes: function () {
            this.addRoute('/', 'home', {});
            this.addRoute('/lastFm', 'lastFm', {});
            this.addRoute('/lastfmToSpotify', 'lastFmToSpotify', lastfmToSpotify);
        },

        addRoute: function (path, template, module) {
            this.routeCollection[path] = {template: template, module: module};
        }
    };
});
