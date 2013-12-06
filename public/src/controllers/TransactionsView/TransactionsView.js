define([
    'underscore',
    'backbone',
    'jquery',
    'BudgetCollection',
    'BudgetView',
    'dateFormat',
    'text!controllers/TransactionsView/tmpl.html'
], function(_, Backbone, $, BudgetCollection, BudgetView, dateFormat, tmpl) {

    return Backbone.View.extend({
        events: {
            "click .transaction": "transactionSelect"
        },

        initialize: function (info) {
            this.transactionCollection = info.transactionCollection;
            this.budgetCollection = info.budgetCollection;
            this.cardCollection = info.cardCollection;
            this.render();

            this.$el.addClass("transactions").attr("data-switch-view","search");
        },

        transactionSelect: function (e) {
            console.log(e);
        },

        render: function () {
            var transactions = [], budgets = [];

            this.transactionCollection.each(_.bind(function (transaction) {
                var budget_id = transaction.get('budget_id');
                var card_id = transaction.get('card_id');
                transactions.push({
                    merchant: 		transaction.get('merchant'),
                    date: 			new Date(transaction.get('date')),
                    amount: 		parseFloat(transaction.get('amount'), 10),
                    budget_id: 		transaction.get('budget_id'), 
                    budget_name: 	this.budgetCollection.get(budget_id).get('name'),
                    card_image: 	this.cardCollection.get(card_id).get('image'),
                    card_number: 	this.cardCollection.get(card_id).get('number')
                });
            }, this));

            this.budgetCollection.each(function (budget) {
                budgets.push({
                    name: 		budget.get('name'),
                    id: 		budget.get('id')
                });
            });

            this.$el.append(_.template(tmpl, { budgets: budgets, transactions: transactions }));
        }
    });
});