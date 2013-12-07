define([
    'underscore',
    'backbone',
    'jquery',
    'CardCollection',
    'CardsView',
    'text!controllers/CardsView/tmpl.html',
    'text!controllers/CardsView/addACard.html'
], function(_, Backbone, $, CardCollection, CardsView, tmpl, addACardTmpl) {

    return Backbone.View.extend({
        events: {
        	"click .card": "selectCard"
        },

        initialize: function (info) {
            this.cardCollection = info.cardCollection;

            this.cardCollection.on("cardSelected", _.bind(this.cardSelected, this));

            this.$el.addClass('cards').attr("data-switch-view","cards");

            this.render();
        },

        cardSelected: function () {
        	this.render();
        },

        selectCard: function (e) {
        	this.cardCollection.setElement(this.cardCollection.get($(e.currentTarget).attr('data-id')));
        },

        render: function () {
            var cards = [];
            var currentCardID = this.cardCollection.getElement();
            currentCardID = currentCardID && currentCardID.get('id');

            this.cardCollection.each(_.bind(function (card) {
                cards.push({
                    id: 			card.get('id'),
                    type: 			card.get('type'),
                    number: 		card.get('number'),
                    name: 			card.get('name'),
                    image: 			card.get('image'),
                    isCurrent: 		card.get('id') === currentCardID
                });
            }, this));

            this.$el.empty().append(_.template(tmpl, {cards: cards})).append(_.template(addACardTmpl, {}));
        }
    });
});

