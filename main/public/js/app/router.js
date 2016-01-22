define(['jquery', "app/routes", 'app/utils'], function ($, routes, utils) {
    return {
        init: function () {
            routes.init();
            this._handleRouteChange();
            this.cache = {};

            window.addEventListener('hashchange', this._handleRouteChange.bind(this));
            window.addEventListener('load', this._handleRouteChange.bind(this));
        },

        _handleRouteChange: function () {
            var currentModule = null;
            var url = location.hash.substr(1, location.hash.indexOf('/', 2)-1) || '/';
            var route = routes.routeCollection[url];

            currentModule = currentModule || $('#current_module');
            if (currentModule && route.controller) {
                this._loadScreen(route.templateId, route.controller, data);
            }
        },

        _loadScreen: function tmpl(str, page) {
            if(page.init){
                page.init();
            }
            $('#current_module').load( '../../view/' + str + '.html' );
        }
    }
});

