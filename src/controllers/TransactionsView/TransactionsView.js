define([
	'underscore',
	'backbone',
	'jquery',
	'InlineView',
	'ProductView',
	'text!controllers/ShovelerView/tmpl.html'
], function(_, Backbone, $, InlineView, ProductView, tmpl) {
	return InlineView.extend({
		tmpl: tmpl,
		initialize: function(info) {
			this.$ref = info.$ref;
			this.$el.addClass('shoveler_view');
			this.on('render', this.renderProductViews, this);
			this.render();
		},
		renderProductViews: function() {
			var app = require('controllers/AppView/app');
			this.$productContainer = this.$('.inline_view_listing');
			this.collection.each(function(product) {
				var productView = new ProductView({model: product});
				this.$productContainer.append(productView.render().el);
				productView.on('more', app.showInlineShoveler, app);
				productView.on('details', app.showInlineView, app);
			}, this);
		}
	});
});
