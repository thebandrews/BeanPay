define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/InlineView/tmpl.html'
], function(_, Backbone, $, tmpl) {
	return Backbone.View.extend({
		tmpl: tmpl,

		events: {
			'click .close': 'destroy'
		},

		className: 'item inline_view',

		initialize: function(info) {
			this.$ref = info.$ref;
			this.render();
		},

		render: function() {
			var tmplData = this.model ? this.model.toJSON() : { collection: this.collection };
			if(!tmplData) return;

			this.$el.append(_.template(this.tmpl, tmplData));
			this.$arrow = this.$('.arrow');
			this.trigger('render');
			return this;
		},

		destroy: function() {
			var $el = this.$el;
			if($el) $el.remove();
			this.trigger('destroy');
		}
	});
});
