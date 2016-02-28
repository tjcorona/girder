/* global geo */

/**
 * A view containing a geojs rendered map.
 */
girder.views.GeoJSMapView = girder.View.extend({
    /**
     * Initialize the view.
     * @param {object} settings Optional configuration object
     *
     * @param {string|null} [settings.base]
     *  A tile url to use as a base layer (null for no layer).
     * @param {number} [settings.width]
     *  Static map width (default 100% of the containing element).
     * @param {number} [settings.height]
     *  Static map height (default 100% of the containing element).
     *
     * @param {girder.models.MapCameraModel} [settings.camera]
     *  Initial camera model.
     * @param {girder.collections.MapLayerCollection} [settings.layers]
     *  Initial layer collection.
     */
    initialize: function (settings) {
        settings = settings || {};
        this.geojsMap = null;

        this.layers = settings.layers || new girder.models.MapLayerCollection();
        this.camera = settings.camera || new girder.models.MapCameraModel();

        this._base = settings.base || 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png';
        if (settings.base === null) {
            this._base = null;
        }
        this._width = settings.width || null;
        this._height = settings.height || null;

        this.listenTo(this.layers, 'change', this.render);
        this.listenTo(this.camera, 'change', this.updateCamera);
        return this;
    },

    render: function () {
        this._createMap();
        this._resetMap();
        this.updateCamera();
        this.layers.toArray().forEach(_.bind(function (layer) {
            var l;
            if (layer.get('type') === 'GeoJSON') {
                l = this.geojsMap.createLayer('feature', {renderer: layer.get('renderer')});
            } else if (layer.get('type') === 'WMS') {
                l = this.geojsMap.createLayer('osm', {renderer: layer.get('renderer')});
            } else {
                console.warn('Unknown layer type ' + layer.get('type'));
                return this;
            }
            this._renderGeoJSON(layer.get('geojson'), l);
            return this;
        }, this));
        this.draw();
        return this;
    },

    /**
     * Force a redraw of the map.
     */
    draw: function () {
        if (this.geojsMap) {
            this.geojsMap.draw();
        }
        return this;
    },

    /**
     * Render a geojson object into the given map layer.
     */
    _renderGeoJSON: function (json, layer) {
        // normalize all possible formats into a feature collection
        if (json.coordinates) {
            // handle bare geometries
            return this._renderGeoJSON({
                type: 'Feature',
                geometry: json
            }, layer);
        } else if (json.type === 'GeometryCollection') {
            // handle geometry collections
            return this._renderGeoJSON({
                type: 'FeatureCollection',
                features: _.map(json.geometries || [], function (g) {
                    return {
                        type: 'Feature',
                        geometry: g
                    };
                })
            }, layer);
        } else if (json.type === 'Feature') {
            // handle bare features
            return this._renderGeoJSON({
                type: 'FeatureCollection',
                features: [json]
            });
        } else if (json.type !== 'FeatureCollection') {
            console.warn('Unhandled GeoJSON type ' + json.type);
            return this;
        }

        // defensive programming
        json.features = json.features || [];

        // collect all point features
        this.geojsMap._renderPoints(_.filter(
            json.features,
            function (feature) {
                var type = ((feature || {}).geometry || {}).type;
                return _.contains(['Point', 'MultiPoint'], type);
            }
        ));

        // collect all line features
        this.geojsMap._renderLines(_.filter(
            json.features,
            function (feature) {
                var type = ((feature || {}).geometry || {}).type;
                return _.contains(['LineString', 'MultiLineString'], type);
            }
        ));

        // collect all polygon features
        this.geojsMap._renderLines(_.filter(
            json.features,
            function (feature) {
                var type = ((feature || {}).geometry || {}).type;
                return _.contains(['Polygon', 'MultiPolygon'], type);
            }
        ));
    },

    /**
     * Flatten a geojson feature or multifeature into an array of objects
     * suitable for passing into GeoJS's feature API.  For single geometry
     * features, this places the geometry into the property object and returns
     * a 1 element array.  For multi geometry features, it breaks them into
     * an array of single geometries.
     */
    _flattenFeature: function (feature) {
        var type = feature.type || '';
        if (type.match(/^Multi/)) {
            type = type.slice(5);
            return _.map(feature.geometry || [], _.bind(function (geometry) {
                return this._flattenFeature({
                    type: type,
                    geometry: geometry,
                    properties: feature.properties
                })[0];
            }, this));
        }

        return [_.extend({}, feature.properties || {}, {
            coordinates: (feature.geometry || {}).coordinates
        })];
    },

    /**
     * Flatten an array of feature objects as described above.
     */
    _flattenFeatures: function (features) {
        return _.chain(features).map(this._flattenFeature).flatten(true).value();
    },

    /**
     * Position accessor for geojson-like objects.
     */
    _position: function (d) {
        return {
            x: d.coordinates[0],
            y: d.coordinates[1]
        };
    },

    /**
     * Returns an accessor to a key in an object with a default value
     * in case the object does not contain the given key.
     * @example
     *   var prop = this._property('fillOpacity', 0.5);
     *   prop({}); // -> 0.5
     *   prop({fillOpacity: 0.75}); // -> 0.75
     */
    _property: function (key, def) {
        return function (d) {
            return _.has(d, key) ? d[key] : def;
        };
    },

    /**
     * Returns style accessors for geojson-like point objects.
     * Defaults are taken from this leaflet example:
     *   http://leafletjs.com/examples/geojson.html
     */
    _pointStyle: function () {
        return {
            // fill style
            fill: this._property('fill', true),
            fillColor: _.compose(
                this._property('fillColor', '#ff7800'),
                geo.util.convertColor
            ),
            fillOpacity: this._property('fillOpacity', 0.8),

            // stroke style
            stroke: this._property('stroke', true),
            strokeColor: _.compose(
                this._property('strokeColor', '#000000'),
                geo.util.convertColor
            ),
            strokeWidth: this._property('strokeWidth', 1),
            strokeOpacity: this._property('strokeOpacity', 1),

            // size
            radius: this._property('radius', 8)
        };
    },

    /**
     * Returns style accessors for geojson-like line objects.
     * Defaults are taken from this leaflet example:
     *   http://leafletjs.com/examples/geojson.html
     */
    _lineStyle: function () {
        return {
            stroke: this._property('stroke', true),
            strokeColor: _.compose(
                this._property('strokeColor', '#ff7800'),
                geo.util.convertColor
            ),
            strokeWidth: this._property('strokeWidth', 5),
            strokeOpacity: this._property('strokeOpacity', 0.5)
        };
    },

    /**
     * Returns style accessors for geojson-like polygon objects.
     * Defaults are taken from this leaflet example:
     *   http://leafletjs.com/examples/geojson.html
     */
    _polygonStyle: function () {
        return {
            // fill style
            fill: this._property('fill', true),
            fillColor: _.compose(
                this._property('fillColor', '#B0de5c'),
                geo.util.convertColor
            ),
            fillOpacity: this._property('fillOpacity', 0.8),

            // stroke style
            stroke: this._property('stroke', true),
            strokeColor: _.compose(
                this._property('strokeColor', '#999999'),
                geo.util.convertColor
            ),
            strokeWidth: this._property('strokeWidth', 2),
            strokeOpacity: this._property('strokeOpacity', 1)
        };
    },

    /**
     * Render a set of point features into the given map layer.
     */
    _renderPoints: function (points, layer) {
        layer.createFeature('point')
            .data(points)
            .position(this._position)
            .style(this._pointStyle());
    },

    /**
     * Syncronize the map's camera with attached camera model.
     */
    updateCamera: function () {
        if (!this.geojsMap) {
            return this;
        }
        this.geojsMap.center({
            x: this.camera.get('x'),
            y: this.camera.get('y')
        }, this.camera.get('gcs'));
        this.geojsMap.zoom(this.camera.get('zoom'));
        this.geojsMap.rotation(this.camera.get('rotation') * 180 / Math.PI);
        return this;
    },

    /**
     * Create the map object on demand.
     */
    _createMap: function () {
        if (this.geojsMap) {
            return this;
        }

        this.geojsMap = geo.map({
            node: this.el,
            autoResize: false,
            width: this._width,
            height: this._height
        });

        if (this._base) {
            this._baseLayer = this.geojsMap.createLayer('osm', {
                url: this._base
            });
        }
    },

    /**
     * Remove all of the map layers (except the base layer).
     */
    _resetMap: function () {
        if (!this.geojsMap) {
            return this;
        }
        this.geojsMap.children().forEach(_.bind(function (layer) {
            if (layer !== this._baseLayer) {
                this.geojsMap.deleteLayer(layer);
            }
        }, this));
        return this;
    },

    /**
     * Trigger an explicit resize.  Optionally provide new width/height.
     */
    resize: function (width, height) {
        if (this.geojsMap) {
            if (!width) {
                width = this.$el.width();
            }
            if (!height) {
                height = this.$el.height();
            }
            this.geojsMap.size({width: width, height: height});
        }
        return this;
    }
});
