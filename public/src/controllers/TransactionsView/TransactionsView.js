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
            "click .transaction": "transactionSelect",
            "click .budget_select div": "budgetCategorySelect"
        },

        initialize: function (info) {
            this.transactionCollection = info.transactionCollection;
            this.budgetCollection = info.budgetCollection;
            this.cardCollection = info.cardCollection;
            this.render();

            this.$el.addClass("transactions").attr("data-switch-view","transactions");

            this.transactionCollection.on('add', _.bind(this.render, this));

            var cycleTime = function () {
            	clearTimeout(window.cycleTimer);
            	$("[data-date]").each(function (i,e) {
            		var $e  = $(e);
            		$e.text((new Date($e.attr('data-date'))).formatAgo());
            	});
            	window.cycleTimer = setTimeout(cycleTime, 60000);
            };

            cycleTime();
        },

        transactionSelect: function (e) {
            $(e.currentTarget).addClass("view");
        },

        endTransactionSelect: function () {
        	this.$el.find(".view").removeClass("view");
            this.render();
        },

        budgetCategorySelect: function (e) {
        	var $e = $(e.currentTarget);
        	var $v = $e.closest(".view");
        	$e.toggleClass("selected");
            var transaction = this.transactionCollection.get($v.attr('data-id'));
        	var budgets = transaction.get('budget_ids');
            var index = budgets.indexOf($e.attr('data-id'));
            if(index!==-1) {
                budgets.splice(index, 1);
            }
            else {
                budgets.push($e.attr('data-id'));
            }
            transaction.set('budget_ids', budgets);
        },

        render: function () {
            var transactions = [], budgets = [];

            this.transactionCollection.each(_.bind(function (transaction) {
                var budget_ids = transaction.get('budget_ids');
                var card_id = transaction.get('card_id');
                transactions.push({
                	id: 			transaction.get('id'), 
                    merchant: 		transaction.get('merchant'),
                    date: 			new Date(transaction.get('date')),
                    amount: 		parseFloat(transaction.get('amount'), 10),
                    budget_ids: 	budget_ids, 
                    budget_names: 	(budget_ids && budget_ids.length) ? budget_ids.map(_.bind(function (e) { return this.budgetCollection.get(e).get('name'); },this)) : [],
                    card_image: 	this.cardCollection.get(card_id).get('image'),
                    card_number: 	this.cardCollection.get(card_id).get('number')
                });
            }, this));

            transactions.sort(function (a,b) { return b.date - a.date; });

            this.budgetCollection.each(function (budget) {
                budgets.push({
                    name: 		budget.get('name'),
                    id: 		budget.get('id')
                });
            });

            this.$el.empty().append(_.template(tmpl, { budgets: budgets.sort(function (a,b){return a.name > b.name;}), transactions: transactions }));
        }
    });
});