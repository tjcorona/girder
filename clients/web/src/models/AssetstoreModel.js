/**
 * @class
 * @extends girder.Model
 */
girder.models.AssetstoreModel = girder.Model.extend(/** @lends girder.models.AssetstoreModel.prototype */{
    resourceName: 'assetstore',

    capacityKnown: function () {
        var cap = this.get('capacity');
        return cap && cap.free !== null && cap.total !== null;
    },

    capacityString: function () {
        var cap = this.get('capacity');
        return girder.formatSize(cap.free) + ' free of ' +
            girder.formatSize(cap.total) + ' total';
    },

    import: function (params) {
        girder.restRequest({
            path: 'assetstore/' + this.get('_id') + '/import',
            type: 'POST',
            data: params,
            error: null
        }).done(_.bind(function (resp) {
            this.trigger('g:imported', resp);
        }, this)).error(_.bind(function (resp) {
            this.trigger('g:error', resp);
        }, this));

        return this;
    }
});
