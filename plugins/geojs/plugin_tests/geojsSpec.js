$(function () {
    girderTest.addUncoveredScript('/plugins/geojs/web_client/js/ext/geo.js');
    girderTest.addCoveredScripts([
        '/plugins/geojs/web_client/js/GeoJSMapView.js',
        '/plugins/geojs/web_client/js/MapCameraModel.js',
        '/plugins/geojs/web_client/js/MapLayerCollection.js',
        '/plugins/geojs/web_client/js/MapLayerModel.js'
    ]);
    /*
    girderTest.importStylesheet(
        '/static/built/plugins/geojs/plugin.min.css'
    );
    */

    window.setTimeout(function () {
        girder.events.trigger('g:appload.before');
        var app = new girder.App({
            el: 'body',
            parentView: null
        });
        girder.events.trigger('g:appload.after');
    }, 0);
});

describe('a test for the geojs plugin', function () {
    /*
    it('creates the admin user', girderTest.createUser('geojs',
                                                       'geojs@girder.org',
                                                       'Geojs', 'Plugin',
                                                       'fuprEsuxAth2S7ac'));
    */

    it('GeoJS global object is exposed', function () {
        expect(!!window.geo).toBe(true);
    });
    xit('Generate a map on the main page', function () {
        var gmap = girder.views.GeoJSMapView();
        var $el = $('<div/>').appendTo('body');
        gmap.setElement($el);
        gmap.resize(500, 500);
        gmap.render();
    });
});
