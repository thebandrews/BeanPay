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

		initialize: function () {
			// this.CardCollection = new CardCollection()
		},

		render: function () {
			this.$el.append(_.template(tmpl, {Cards: "temp"}));
		}
	});
});

