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

    var wallet_cards = {
	    red: {
	        name: "CapitalOne",
	        type: "VISA",
	        image: "redcard.jpg",
	        number: "4000 1234 5678 9010",
	        expires: "12/12",
	        CVV: "383"
	    },
	    black: {
	        name: "Virgin",
	        type: "MasterCard",
	        image: "blackcard.jpg",
	        number: "5412 3456 7890 1234",
	        expires: "12/04",
	        CVV: "049"
	    },
	    blue: {
	        name: "CapitalOne",
	        type: "AmericanExpress",
	        image: "bluecard.jpg",
	        number: "0000 1234 5678 9010",
	        expires: "10/15",
	        CVV: "756"
	    }
    };

    var $body = $(document.body);
    var touchTmpl = _.template(touch_tmpl);

    var setPrototypeData = function (budgets, cards, transactions) {
        budgetCollection = new BudgetCollection(budgets);
        cardCollection = new CardCollection(cards);
        transactionCollection = new TransactionCollection(transactions);
    }

    window.formatCardNumber = function (cardNumber) {
    	return cardNumber; // "-"+cardNumber.substr(-4);
    }

    window.formatMoney = function (val, decimals, includeDollarSign) {
        if (decimals === undefined) {
            decimals = 2;
        }
        if(includeDollarSign === undefined) {
        	includeDollarSign = true;
        }
        var amount = parseFloat(val, 10).toFixed(decimals);
        return (amount < 0 ? "-" : "") + (includeDollarSign ? '<span class="dollarSign">$</span>' : '') + Math.abs(parseFloat(val, 10).toFixed(decimals));
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

            'click .credit_cards .credit_card': "showCreditCard",
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
        		// TODO: make a form for generic purchases
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
        	this.$el.addClass("addingCard");

        	this.$el.one("webkitTransitionEnd", _.bind(function () {
        		this.$el.addClass("addCard");
        		this.phoneView.addingCard();
        	}, this));
        },

        cardAdded: function(e) {
        	this.$el.removeClass("addingCard");
    		this.phoneView.cardAdded();
        },

        showCreditCard: function (e) {
        	var card = $(e.currentTarget).attr('data-card-id');
        	var $df = $.Deferred();

        	if(card==="generic" || !wallet_cards[card]) {
        		// TODO: make a form for generic cards.. When the form is submitted, resolve the promise
        	}
        	else {
        		card = wallet_cards[card];
        		$df.resolve();
        	}

        	$df.done(_.bind(function () {
        		var $df2 = $.Deferred();
        		var lastMouseXPos;

        		var $e = $(e.currentTarget);

	        	$e.addClass('selected').removeClass('sideways');
	        	$e.clone().attr('id','secretSelected').appendTo(this.$el.find(".content"));

        		var $ss = $("#secretSelected").css('marginLeft',this.$el.width()*0.75 + "px");
        		var cardTimer = null;
        		var $dir = $(".directions");
        		var $ob = $(".overlay_bottom");
        		var $content = $(".content");

        		var allowMove = true;

        		var moveCardView = _.bind(function (e) {

					$("#phone")[0].style.top = e.pageY + "px";
					$("#phone")[0].style.left = e.pageX + "px";
        			if(allowMove) {
	        			$ss.css('marginLeft', ($(".selected").position().left + 121)  + "px");
						$ss[0].style.top = "-" + e.pageY + "px";
						$ss[0].style.left = "-" + e.pageX + "px";        				

						var ss_pos = $ss.offset();
						ss_pos.right = ss_pos.left + $ss.width();
						ss_pos.bottom = ss_pos.top + $ss.height();
						
						var left = $content.offset().left;
						var right = left + $content.width();
						var top = $dir.offset().top + $dir.height();
						var bottom = $ob.offset().top;

						if(ss_pos.left > left && ss_pos.right < right && ss_pos.top > top && ss_pos.bottom < bottom) {
							if(!cardTimer) {
								$dir.addClass("startTimer");
								cardTimer = setTimeout(_.bind(function () {
									allowMove = false;
									$dir.replaceWith('<div class="directions threeSeconds">Processing...</div>');
									$e.removeClass('selected').addClass('sideways');
									setTimeout(_.bind(function () {
										cardCollection.add(card);
										cardCollection.getElement();
										$("#secretSelected").remove();
										this.$el.off('mousemove', moveCardView);
										this.cardAdded();
										$("#phone").css({top:"",left:""});
									}, this), 3000)
								}, this), 1000);
							}
						}
						else {
							$dir.removeClass("startTimer");
							clearTimeout(cardTimer);
							cardTimer = null;
						}
        			}
	        	}, this);

	        	this.$el.on('mousemove', moveCardView);
        	}, this));
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

