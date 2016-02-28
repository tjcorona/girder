/**
 * Defines a collection of layers that can be rendered within a map.
 */
girder.collections.MapLayerCollection = girder.Collection.extend({
    resourceName: 'item',
    model: girder.models.MapLayerModel
});
