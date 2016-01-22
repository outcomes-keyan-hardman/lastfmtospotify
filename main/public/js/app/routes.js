define([ "app/lastfmToSpotify"], function (lastfmToSpotify) {
    return {
        init: function () {
            this.routeCollection = {};
            this._registerRoutes();
        },

        _registerRoutes: function () {
            this.addRoute('/', 'home', function (){});
            this.addRoute('/lastFm', 'lastFm', lastfmToSpotify);
            this.addRoute('/lastfmToSpotify', 'lastFm', lastfmToSpotify);
        },

        addRoute: function (path, templateId, controller) {
            this.routeCollection[path] = {templateId: templateId, controller: controller};
        }
    };
});
