define(['jquery', "app/routes"], function ($, routes) {
    return {
        init: function () {
            this.cache = {};

            routes.init();
            this._handleRouteChange();

            window.addEventListener('hashchange', this._handleRouteChange.bind(this));
            window.addEventListener('load', this._handleRouteChange.bind(this));
        },

        _handleRouteChange: function () {
            var currentModule = null;
            var url = location.hash.substr(1, location.hash.indexOf('/', 2)-1) || '/';
            var route = routes.routeCollection[url];

            currentModule = currentModule || $('#current_module');
            if (currentModule && route.controller) {
                this._loadScreen(route.templateId, route.controller);
            }
        },

        _loadScreen: function tmpl(str, page) {
            $('#current_module').load( '../../view/' + str + '.html' );

            if(page && page.load){page.load.bind(page)();}
            //catch(e){console.log(e)}
        }
    }
});

