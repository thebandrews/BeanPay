define([
    'underscore',
    'backbone',
    'jquery',
    'text!controllers/MagicCardView/tmpl.html',
    'BudgetsView',
    'BudgetView',
    'CardsView'
], function(_, Backbone, $, tmpl, BudgetsView, BudgetView, CardsView) {

    return Backbone.View.extend({

        el: '#card',

        events: {
            "click .button.left":  'prevCard',
            "click .button.right": 'nextCard'
        },

        initialize: function(info) {
            this.budgetCollection = info.budgetCollection;
            this.cardCollection = info.cardCollection;

            this.render();

            this.budgetsView = new BudgetsView(info);
            this.cardsView = new CardsView(info);
        },

        render: function() {
            this.$el.empty().append(_.template(tmpl, _.extend({owner: 'Ben', locked: false}, this.cardCollection.getElement().attributes)));
        },

        prevCard: function(card) {
            this.cardCollection.next();
            this.render();
        },

        nextCard: function(card) {
            this.cardCollection.next();
            this.render();
        },

        setCard: function(card) {
            this.cardCollection.setElement(card);
            this.render();
        }
    });
});

