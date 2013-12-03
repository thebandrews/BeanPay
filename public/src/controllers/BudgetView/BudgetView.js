define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/BudgetView/tmpl.html'
], function(_, Backbone, $, tmpl) {

	return Backbone.View.extend({
		events: {},

		render: function () {
			this.$el.append(_.template(tmpl, {name: "Coffee"}));
		}
	});
});

