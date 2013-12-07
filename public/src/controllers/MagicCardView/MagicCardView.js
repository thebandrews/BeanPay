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

            this.cardCollection.on("cardSelected", _.bind(this.cardSelected, this));

            this.render();

            this.budgetsView = new BudgetsView(info);
            this.cardsView = new CardsView(info);
        },

        cardSelected: function() {
        	this.render();
        },

        render: function() {
        	var currentCard = this.cardCollection.getElement();
            this.$el.empty().append(_.template(tmpl, _.extend({owner: 'Ben', locked: false, hasCards: !!currentCard}, (currentCard ? currentCard.attributes : { image: null, CVV: ["", "", ""] }) )));
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

