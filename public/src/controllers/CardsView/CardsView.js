define([
    'underscore',
    'backbone',
    'jquery',
    'CardCollection',
    'CardsView',
    'text!controllers/CardsView/tmpl.html'
], function(_, Backbone, $, CardCollection, CardsView, tmpl) {

    return Backbone.View.extend({
        events: {},

        initialize: function (info) {
            this.cardCollection = info.cardCollection;

            this.render();
        },

        render: function () {
            var cards = [];

            this.cardCollection.each(_.bind(function (card) {
                cards.push({
                    id: 			card.get('id'),
                    type: 			card.get('type'),
                    number: 		card.get('number'),
                    name: 			card.get('name'),
                    image: 			card.get('image'),
                    isCurrent: 		card.get('id') === this.cardCollection.getElement()
                });
            }, this));

            this.$el.addClass('cards').append(_.template(tmpl, {cards: cards}));
        }
    });
});

