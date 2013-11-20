define([
	'underscore',
	'backbone',
	'jquery',
	'BudgetCollection',
	'text!controllers/BudgetsView/tmpl.html'
], function(_, Backbone, $, BudgetCollection, tmpl) {

	return Backbone.View.extend({
		events: {},

		render: function () {
			this.$el.append(_.template(tmpl, {budgets: "temp"}));
		}
	});
});

