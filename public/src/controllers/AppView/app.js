define([
    'underscore',
    'backbone',
    'jquery',
    'stringToTitleCase',
    'text!controllers/AppView/app.html',
    'text!controllers/AppView/touchview.html',
    'text!controllers/AppView/taskhelp.html',
    'text!controllers/AppView/datahelp.html',
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
], function (_, Backbone, $, stringToTitleCase, tmpl, touch_tmpl, taskhelp_tmpl, datahelp_tmpl, PhoneView, MagicCardView, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView, BudgetCollection, CardCollection, TransactionCollection, budgets, cards, transactions) {

	if(!localStorage.getItem('storedData')) {
		localStorage.setItem('storedData',"{}");
	}

    var budgetCollection = new BudgetCollection(JSON.parse(localStorage.getItem('budgets')) || budgets);
    var cardCollection = new CardCollection(JSON.parse(localStorage.getItem('cards')) || cards);
    var transactionCollection = new TransactionCollection(JSON.parse(localStorage.getItem('transactions')) || transactions);

    var wallet_cards = [
	    {
	        name: "CapitalOne",
	        type: "VISA",
	        image: "redcard.jpg",
	        number: "4000 1234 5678 9010",
	        CVV: "383"
	    },
	    {
	        name: "Virgin",
	        type: "MasterCard",
	        image: "blackcard.jpg",
	        number: "5412 3456 7890 1234",
	        CVV: "049"
	    },
	    {
	        name: "CapitalOne",
	        type: "AmericanExpress",
	        image: "bluecard.jpg",
	        number: "0000 1234 5678 9010",
	        CVV: "756"
	    }
    ];

    var $body = $(document.body);
    var touchTmpl = _.template(touch_tmpl);

    var setPrototypeData = function (budgets, cards, transactions) {
        budgetCollection = new BudgetCollection(budgets);
        cardCollection = new CardCollection(cards);
        transactionCollection = new TransactionCollection(transactions);
    }

    window.formatMoney = function (val, decimals) {
        if (decimals === undefined) {
            decimals = 2;
        }
        var amount = parseFloat(val, 10).toFixed(decimals);
        return (amount < 0 ? "-" : "") + '$' + Math.abs(parseFloat(val, 10).toFixed(decimals));
    };

    window.touchStart = function (e) {
        $body.addClass('touching');
        $body.find(".touch_view").css(
            {
                top: e.clientY + "px",
                left: e.clientX + "px"
            }
        );
    };
    window.touchMove = function (e) {
        if ($body.hasClass('touching')) {
            var $tv = $body.find(".touch_view");
            var $ot = $('<div class="old_touch"></div>').css({
                top: $tv.css('top'),
                left: $tv.css('left'),
            });
            $tv.css({
                top: e.clientY + "px",
                left: e.clientX + "px"
            });
            $body.append($ot);
            $ot.addClass('hot').css('opacity');
            $ot.removeClass('hot').css('-webkit-transition');
        }
    };
    window.touchEnd = function (e) {
        $body.removeClass('touching');
        $body.find(".old_touch").remove();
    };

    var AppView = Backbone.View.extend({

        events: {
            // "mousedown .touchable": window.touchStart,
            // "mousemove .touchable": window.touchMove,
            // "mouseup": window.touchEnd,

            "click .purchase": "doPurchase",
            "click .addABudget": "addBudget",
            "click .addACard": "addCard",

            'click [data-action="save"] input[type="button"]': "saveDataState",
            'click [data-action="load"] [data-name]': "loadDataState",
        },

        initialize: function () {
            this.render();

            this.phoneView = new PhoneView({ budgetCollection: budgetCollection, cardCollection: cardCollection, transactionCollection: transactionCollection });
            this.magicView = new MagicCardView({ budgetCollection: budgetCollection, cardCollection: cardCollection, transactionCollection: transactionCollection });

            this.setCard(cardCollection.get(1));

            this.phoneView.on('cardChosen', _.bind(this.setCard, this));
            this.magicView.on('cardChosen', _.bind(this.setCard, this));

            budgetCollection.on('add change remove', function () { localStorage.setItem('budgets', JSON.stringify(budgetCollection)); });
            cardCollection.on('add change remove', function () { localStorage.setItem('cards', JSON.stringify(cardCollection)); });
            transactionCollection.on('add change remove', function () { localStorage.setItem('transactions', JSON.stringify(transactionCollection)); });
        },

        resetPrototype: function (budgets, cards, transactions) {
            setPrototypeData(budgets, cards, transactions);

            this.initialize();
        },

        render: function () {
            this.$el.empty().append(_.template(touch_tmpl, {}), _.template(tmpl, {}));
            this.$el.find("#task_help").append(_.template(taskhelp_tmpl, {}));
            this.$el.find("#data_help").append(_.template(datahelp_tmpl, {storedData: JSON.parse(localStorage.getItem('storedData'))}));
        },

        setCard: function (card) {
            this.phoneView.setCard(card);
            this.magicView.setCard(card);
        },

        doPurchase: function(e) {
        	var type = $(e.currentTarget).attr('data-merchant');
        	var amount = parseInt($(e.currentTarget).attr('data-amount'),10);
        	var category = $(e.currentTarget).attr('data-category');
        	if(type==="generic") {

        	}
        	else {
	        	transactionCollection.add({
					date: new Date(),
					merchant: type.replace("_"," ").toTitleCase(),
					amount: Math.floor(Math.random()*100*amount)/100,
					card_id: cardCollection.getElement().get('id'),
					budget_id: budgetCollection.findWhere({category: category}).get('id')
				});        		
        	}
        },

        addBudget: function(e) {
        },

        addCard: function(e) {
        	var type = $(e.currentTarget).attr('data-merchant');
        },

        saveDataState: function(e) {
        	var saveName = $(e.currentTarget).closest('[data-action="save"]').find('input[type="text"]').val();

        	if(!saveName) {
        		alert("Please enter a name for this saved data.");
        	}
        	else {
	        	// save in localStorage
	        	var toStore = JSON.parse(localStorage.getItem('storedData'));
	        	toStore[saveName] = {
	        		budgets: budgetCollection.toJSON(),
	        		cards: cardCollection.toJSON(),
	        		transactions: transactionCollection.toJSON()
	        	};
	        	localStorage.setItem('storedData', JSON.stringify(toStore));

	        	alert("Data saved.");

				this.$el.find("#data_help").empty().append(_.template(datahelp_tmpl, {storedData: JSON.parse(localStorage.getItem('storedData'))}));
        	}
        },

        loadDataState: function(e) {
        	var loadName = $(e.currentTarget).attr('data-name');
        	var storedData = JSON.parse(localStorage.getItem('storedData'))[loadName];

        	// Load from localStorage
        	console.log("loadData", $(e.currentTarget).attr('data-name'));
        	if(loadName==="new user") {
        		this.resetPrototype();
        	}
        	else if(loadName==="example data") {
        		this.resetPrototype(budgets, cards, transactions);
        	}
        	else {
        		this.resetPrototype(storedData.budgets, storedData.cards, storedData.transactions);        		
        	}

        	budgetCollection.trigger('change');
        	cardCollection.trigger('change');
        	transactionCollection.trigger('change');
        }
    });

    return new AppView({ el: 'body' });
});

