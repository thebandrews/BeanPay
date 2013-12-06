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
        },

        budgetGraphClick: function (e) {
            console.log(e);
        },

        render: function () {
            // this.$el.append(_.template(tmpl, {}));
            this.budgetCollection.each(_.bind(function (budget) {
                var spentPercent = Math.random();
                var remaining = "" + (Math.floor((1 - spentPercent) * budget.get('amount') * 100) / 100);
                spentPercent = Math.floor(spentPercent * 100);  //  budget.get('amount')

                var html = _.template(budgetGraphTmpl, { name: budget.get('name'), remaining: remaining });
                var $html = $(html);

                $html.find(".budgetPie").append(createPie("pie", "90px", "white", [spentPercent, 100 - spentPercent], ["#55aa55", "#222222"]));
                this.$el.append($html);
            }, this));
        }
    });
});