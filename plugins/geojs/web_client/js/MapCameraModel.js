/**
 * Define a model that describes a map's camera.
 */
girder.models.MapCameraModel = girder.models.ItemModel.extend({
    defaults: {
        zoom: 3,         // tile zoom level
        x: 0,            // map center in x
        y: 0,            // map center in y
        rotatation: 0,   // map rotation in degrees
        gcs: 'EPSG:4326' // gcs of the center coordinates
    }
});
