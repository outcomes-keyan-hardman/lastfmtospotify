define(['jquery', "app/routes"], function ($, routes) {
    return {
        init: function () {
            this.cache = {};

            routes.init();
            this._handleRouteChange();

            window.addEventListener('hashchange', this._handleRouteChange.bind(this));
        },

        _handleRouteChange: function () {
            var currentModule = null;
            var url = location.hash.substr(1, location.hash.indexOf('/', 2) - 1) || '/';
            var route = routes.routeCollection[url];

            currentModule = currentModule || $('#current_module');
            if (currentModule && route) {
                this._loadScreen(route.template, route.module);
            }
        },

        _loadScreen: function tmpl(str, page) {
            $('#current_module').load('../../view/' + str + '.html');

            if (page && page.init) {
                page.init.bind(page)();
            }
        }
    }
});

