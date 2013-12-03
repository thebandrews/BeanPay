define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/PhoneView/tmpl.html',
	'BudgetsView',
	'BudgetView',
	'CardsView',
	'SearchView',
	'TransactionsView',
	'TransactionView',
	'BudgetCollection',
	'models/sampleBudgetCollection'
], function(_, Backbone, $, tmpl, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView, BudgetCollection, budgets) {

	return Backbone.View.extend({

		el: '#phone',

		events: {
		},

		initialize: function(info) {
			this.render();

			this.$content = this.$el.find(".content");

			this.budgetCollection = info.budgetCollection;
			this.cardCollection = info.cardCollection;

			this.budgetsView = new BudgetsView(info.budgetCollection);
			this.cardsView = new CardsView(info.cardCollection);

			this.$content.append(this.budgetsView.$el);
		},

		render: function() {
			this.$el.append(_.template(tmpl, {name: 'Ben'}));
		},

		setCard: function(card) {
			this.current_card = card.get('id');
		}
	});
});

