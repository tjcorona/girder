$(function () {
    girderTest.addUncoveredScript('/plugins/geojs/web_client/js/ext/geo.js');
    girderTest.addCoveredScripts([
        '/plugins/geojs/web_client/js/GeoJSMapView.js',
        '/plugins/geojs/web_client/js/MapCameraModel.js',
        '/plugins/geojs/web_client/js/MapLayerCollection.js',
        '/plugins/geojs/web_client/js/MapLayerModel.js'
    ]);
    girderTest.importStylesheet(
        '/static/built/plugins/geojs/plugin.min.css'
    );

    window.setTimeout(function () {
        girder.events.trigger('g:appload.before');
        var app = new girder.App({
            el: 'body',
            parentView: null
        });
        girder.events.trigger('g:appload.after');
    }, 0);
});

describe('The geojs plugin', function () {
    /*
    it('creates the admin user', girderTest.createUser('geojs',
                                                       'geojs@girder.org',
                                                       'Geojs', 'Plugin',
                                                       'fuprEsuxAth2S7ac'));
    */

    it('GeoJS global object is exposed', function () {
        expect(!!window.geo).toBe(true);
    });
    describe('GeoJSMapView', function () {
        var GeoJSMapView;
        beforeEach(function () {
            GeoJSMapView = girder.views.GeoJSMapView;
        });

        it('_position', function () {
            expect(GeoJSMapView.prototype._position({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            })).toEqual({
                x: 0,
                y: 0
            });
        });

        it('_property', function () {
            var prop = GeoJSMapView.prototype._property('somekey', 'somevalue');
            expect(prop({})).toBe('somevalue');
            expect(prop({properties: {otherkey: 'othervalue'}})).toBe('somevalue');
            expect(prop({properties: {somekey: 'myvalue'}})).toBe('myvalue');
        });

        describe('_flattenFeature', function () {
            var _flattenFeature;
            beforeEach(function () {
                _flattenFeature = _.bind(
                    GeoJSMapView.prototype._flattenFeature,
                    _.clone(GeoJSMapView.prototype)
                );
            });

            it('Point', function () {
                expect(_flattenFeature({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {name: 'a point'}
                })).toEqual([{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {name: 'a point'}
                }]);
            });
            it('MultiPoint', function () {
                expect(_flattenFeature({
                    type: 'Feature',
                    geometry: {
                        type: 'MultiPoint',
                        coordinates: [[1, 1], [0, 0]]
                    },
                    properties: {name: 'a point'}
                })).toEqual([{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [1, 1]
                    },
                    properties: {name: 'a point'}
                }, {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {name: 'a point'}
                }]);
            });


            it('Line', function () {
                expect(_flattenFeature({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0], [1, 1]]
                    },
                    properties: {name: 'a line'}
                })).toEqual([{
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0], [1, 1]]
                    },
                    properties: {name: 'a line'}
                }]);
            });
            it('MultiLine', function () {
                expect(_flattenFeature({
                    type: 'Feature',
                    geometry: {
                        type: 'MultiLineString',
                        coordinates: [[[1, 1], [0, 0]], [[2, 1], [3, 2]]]
                    },
                    properties: {name: 'a line'}
                })).toEqual([{
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[1, 1], [0, 0]]
                    },
                    properties: {name: 'a line'}
                }, {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[2, 1], [3, 2]]
                    },
                    properties: {name: 'a line'}
                }]);
            });
        });
    });
    xit('Generate a map on the main page', function () {
        var gmap = girder.views.GeoJSMapView();
        var $el = $('<div/>').appendTo('body');
        gmap.setElement($el);
        gmap.resize(500, 500);
        gmap.render();
    });
});
