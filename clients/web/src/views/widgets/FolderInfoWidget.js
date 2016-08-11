/**
 * This view shows a dialog container detailed folder information.
 */
girder.views.FolderInfoWidget = girder.View.extend({
    initialize: function () {
        this.needToFetch = !this.model.has('nItems') || !this.model.has('nFolders');
        if (this.needToFetch) {
            this.model.once('g:fetched.details', function () {
                this.needToFetch = false;
                this.render();
            }, this).fetch({extraPath: 'details'});
        }
    },

    render: function () {
        if (this.needToFetch) {
            return;
        }

        this.$el.html(girder.templates.folderInfoDialog({
            folder: this.model,
            girder: girder
        })).girderModal(this);
    }
});
