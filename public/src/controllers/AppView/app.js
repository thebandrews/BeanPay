define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/AppView/app.html',
	'text!controllers/AppView/touchview.html',
	'PhoneView',
	'MagicCardView',
	'BudgetsView',
	'BudgetView',
	'CardsView',
	'SearchView',
	'TransactionsView',
	'TransactionView',
	'BudgetCollection',
	'CardCollection',
	'TransactionCollection',
	'models/sampleBudgetCollection',
	'models/sampleCardCollection',
	'models/sampleTransactionCollection'
], function(_, Backbone, $, tmpl, touch_tmpl, PhoneView, MagicCardView, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView, BudgetCollection, CardCollection, TransactionCollection, budgets, cards, transactions) {

	var budgetCollection = new BudgetCollection(localStorage.getItem('budgets') || budgets);
	var cardCollection = new CardCollection(localStorage.getItem('cards') || cards);
	var transactionCollection = new TransactionCollection(localStorage.getItem('transactions') || transactions);

	var $body = $(document.body);
	var touchTmpl = _.template(touch_tmpl);

	var resetPrototypeData = function () {
		localStorage.removeItem('budgets');
		localStorage.removeItem('cards');
		localStorage.removeItem('transactions');

		budgetCollection = new BudgetCollection(budgets);
		cardCollection = new CardCollection(cards);
		transactionCollection = new TransactionCollection(transactions);
	}

	window.touchStart = function(e) {
		$body.addClass('touching');
		$body.find(".touch_view").css(
			{
				top: e.clientY + "px",
				left: e.clientX + "px"
			}
		);
	};

	window.touchMove = function(e) {
		$body.find(".touch_view").css(
			{
				top: e.clientY + "px",
				left: e.clientX + "px"
			}
		);
	};

	window.touchEnd = function(e) {
		$body.removeClass('touching');
	};

	var AppView = Backbone.View.extend({

		events: {
			// "mousedown .touchable": window.touchStart,
			// "mousemove .touchable": window.touchMove,
			// "mouseup": 				window.touchEnd
		},

		initialize: function() {
			this.render();

			this.phoneView = new PhoneView({budgetCollection: budgetCollection, cardCollection: cardCollection, transactionCollection: transactionCollection});
			this.magicView = new MagicCardView({budgetCollection: budgetCollection, cardCollection: cardCollection, transactionCollection: transactionCollection});

			this.setCard(cardCollection.get(1));

			this.phoneView.on('cardChosen', _.bind(this.setCard, this));
			this.magicView.on('cardChosen', _.bind(this.setCard, this));
		},

		resetPrototype: function() {
			resetPrototypeData();

			this.initialize();
		},

		render: function() {
			this.$el.empty().append(_.template(touch_tmpl, {}), _.template(tmpl, {}));
		},

		setCard: function(card) {
			this.phoneView.setCard(card);
			this.magicView.setCard(card);
		},
	});

	return new AppView({el: 'body'});
});

