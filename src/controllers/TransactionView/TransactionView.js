define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/VariationsView/tmpl.html'
], function(_, Backbone, $, tmpl) {

	return Backbone.View.extend({
		events: {
			'mouseenter li.variation': 'showVariation',
		},

		className: 'variation_view',

		initialize: function() {
		},

		isSelected: function() {
			
		},

		showVariation: function(e) {
			var $clicked = $(e.currentTarget);
			var model = this.collection.get($clicked.attr('data-cid')).attributes;
			this.$el.find('li.selected').removeClass('selected');
			$clicked.addClass('selected');
			this.trigger('variationChange', model);
		},

		render: function(currentImage) {
			if(this.collection && this.collection.length) {
				this.collection.each(_.bind(function (child) {
					var selected = child.get('imageURL').indexOf(encodeURIComponent(currentImage.physicalId))!==-1;
					var modelData = _.extend({cid: child.cid, selected: selected}, child.attributes);
					var $el = $(_.template(tmpl, modelData));
					this.$el.append($el);
				},this));
			}
			return this;
		}
	});
});

