define([
    'underscore',
    'backbone',
    'jquery',
    'text!controllers/PhoneView/tmpl.html',
    'text!controllers/PhoneView/menu.html',
    'BudgetsView',
    'BudgetView',
    'CardsView',
    'SearchView',
    'TransactionsView',
    'TransactionView'
], function(_, Backbone, $, tmpl, menuTmpl, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView) {

    return Backbone.View.extend({

        el: '#phone',

        viewStack: [],

        events: {
            'click #menu li': "menuSelect",
            'mousedown [data-switch-view]': "switchTo"
        },

        initialize: function(info) {
            this.render();

            this.budgetCollection = info.budgetCollection;
            this.cardCollection = info.cardCollection;
            this.transactionCollection = info.transactionCollection;

            this.budgetsView = new BudgetsView(info);
            this.cardsView = new CardsView(info);
            this.transactionsView = new TransactionsView(info);

            this.$content.append(this.budgetsView.$el);
            this.$content.append(this.cardsView.$el);
            this.$content.append(this.transactionsView.$el);
       	},

        menuSelect: function (e) {
            this.$el.attr("data-view",$(e.currentTarget).attr("data-view"));
        },

        switchTo: function (e) {
            this.$el.attr("data-view",$(e.currentTarget).attr("data-switch-view"));
        },

        render: function() {
            this.$el.append(_.template(tmpl, {name: 'Ben'}));

            this.$content = this.$el.find(".content");

            this.$el.append(_.template(menuTmpl, {}));
        },

        setCard: function(card) {
            this.current_card = card.get('id');
        }
    });
});

