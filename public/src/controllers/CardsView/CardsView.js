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
            var currentCardID = this.cardCollection.getElement();
            currentCardID = currentCardID && currentCardID.get('id');

        	this.$el.find(".current").removeClass('current');
        	this.$el.find('[data-id="' + currentCardID + '"]').addClass('current');

            if(this.$el.find(".current").length && $("#phone").attr('data-view')==='home') {
            	this.$el.scrollTop(this.$el.find(".card").index(this.$el.find(".current")) * this.$el.find(".card").outerHeight());
            }
        },

        selectCard: function (e) {
        	if($(e.currentTarget).attr('data-id')==="add") {
        		this.addCard();
        	}
        	else {
	        	this.cardCollection.setElement(this.cardCollection.get($(e.currentTarget).attr('data-id')));
        	}
        },

        addCard: function () {
        	console.log("adding card");
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
                    image: 			card.get('image')
                });
            }, this));

            this.$el.empty().append(_.template(tmpl, {cards: cards})).append(_.template(addACardTmpl, {}));

			this.cardSelected();
        }
    });
});

