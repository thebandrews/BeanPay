define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/AppView/app.html',
	'BudgetsView',
	'BudgetView',
	'CardsView',
	'SearchView',
	'TransactionsView',
	'TransactionView',
	'BudgetCollection',
	'models/sampleBudgetCollection'
], function(_, Backbone, $, tmpl, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView, BudgetCollection, budgets) {

	var collection = new BudgetCollection(budgets);

	var AppView = Backbone.View.extend({

		events: {
		},

		initialize: function() {
			this.render();

			this.$window = $(window);
		},

		render: function() {
			this.$el.append(_.template(tmpl, {name: 'Ben'}));
		}
	});

	return new AppView({el: 'body', collection: collection});
});
