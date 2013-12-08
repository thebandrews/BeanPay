define([
    'underscore',
    'backbone',
    'jquery',
    'BudgetCollection',
    'BudgetView',
    'CSSpie',
    'text!controllers/BudgetsView/tmpl.html',
    'text!controllers/BudgetsView/budgetGraphTmpl.html'
], function (_, Backbone, $, BudgetCollection, BudgetView, cssPie, tmpl, budgetGraphTmpl) {

    return Backbone.View.extend({
        events: {
            "click .budgetGraph": "budgetGraphClick"
        },

        initialize: function (info) {
            this.budgetCollection = info.budgetCollection;
            this.cardCollection = info.cardCollection;
            this.transactionCollection = info.transactionCollection;
            this.render();

            this.$el.addClass("budgets").attr("data-switch-view","budgets");

            this.transactionCollection.on('add', _.bind(this.render, this));
        },

        budgetGraphClick: function (e) {
            console.log(e);
        },

        render: function () {
            this.$el.empty().append(_.template(tmpl, {}));
            this.budgetCollection.each(_.bind(function (budget) {
            	var spent = 0;
            	var budgetAmount = parseFloat(budget.get('amount'),10);

            	this.transactionCollection.each(function (transaction) {
            		if(transaction.get('budget_id')===budget.get('id')) {
            			spent += parseFloat(transaction.get('amount'),10);
            		}
            	});

                var spentPercent = spent / budgetAmount;
                var remaining = budgetAmount - spent; //"" + (Math.floor((1 - spentPercent) * budget.get('amount') * 100) / 100);
                spentPercent = Math.floor(spentPercent * 100);  //  budget.get('amount')

                var html = _.template(budgetGraphTmpl, { name: budget.get('name'), remaining: remaining });
                var $html = $(html);

                $html.find(".budgetPie").append(createPie("pie", "80px", "white", [Math.min(100, spentPercent), Math.max(0, 100 - spentPercent)], ["#222222", "#55aa55"]));
                this.$el.find(".addABudget").before($html);
            }, this));
        }
    });
});