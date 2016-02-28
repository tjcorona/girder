/**
 * Defines a layer that can be rendered within a map.
 */
girder.models.MapLayerModel = girder.models.ItemModel.extend({
    defaults: {
        type: 'GeoJSON',
        geojson: {},
        url: '',
        renderer: 'vgl'
    },

    setGeoJSON: function (geojson) {
        this.set({
            type: 'GeoJSON',
            geojson: geojson
        });
    },

    setWMS: function (url) {
        // todo
        _.noop(url);
    }
});
