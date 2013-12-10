define([
    'underscore',
    'backbone',
    'jquery',
    'text!controllers/PhoneView/tmpl.html',
    'text!controllers/PhoneView/addCardTmpl.html',
    'text!controllers/PhoneView/menu.html',
    'BudgetsView',
    'BudgetView',
    'CardsView',
    'SearchView',
    'TransactionsView',
    'TransactionView'
], function(_, Backbone, $, tmpl, addCardTmpl, menuTmpl, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView) {

    return Backbone.View.extend({

        el: '#phone',

        viewStack: [],

        events: {
            'click #menu li': "menuSelect",
            'mousedown [data-switch-view]': "switchTo",
            'click #topbar .back': "goBack",

            "click .transaction": "transactionSelect",
            "click .budgetGraph": "budgetSelect",
            "click .create_budget_save": "createBudget"
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
	       	if(this.$el.attr("data-view")==="transaction") {
	       		this.transactionsView.endTransactionSelect();
	       	}
            this.$el.attr("data-view",$(e.currentTarget).attr("data-view"));
            this.cardsView.cardSelected();
        },

        switchTo: function (e) {
	       	if(this.$el.attr("data-view")==="home") {
	            this.$el.attr("data-view",$(e.currentTarget).attr("data-switch-view"));
	            this.cardsView.cardSelected();        		
        	}
        },

        transactionSelect: function() {
        	this.$el.attr("data-view","transaction");
        },

        budgetSelect: function(e) {
        	if($(e.currentTarget).hasClass("addABudget")) {
	        	this.$el.attr("data-view","add-budget");
        	}
        	else {
	        	this.$el.attr("data-view","budget");
        	}
        },

        createBudget: function(e) {
        	if(this.budgetsView.createBudget()) {
        		this.$el.attr("data-view","budgets");
        	}
        },

        goBack: function () {
        	switch(this.$el.attr("data-view")) {
        		case "transaction":
        			this.$el.attr("data-view","transactions");
        			this.transactionsView.endTransactionSelect();
        			break;

        		case "budget":
        		case "add-budget":
        			this.$el.attr("data-view","budgets");
        			this.budgetsView.endBudgetSelect();
        			break;

        		case "add-card":
        			this.$el.attr("data-view","cards");
        			this.cardsView.endCardAdd();
        			break;

        		case "cards":
        		case "transactions":
        		case "budgets":
        			this.$el.attr("data-view","home");
        			break;
        	}
            this.cardsView.cardSelected();
        },

        render: function() {
            this.$el.append(_.template(tmpl, {name: 'Ben'}));

            this.$content = this.$el.find(".content");

            this.$el.append(_.template(menuTmpl, {}));
        },

        setCard: function(card) {
            this.current_card = card && card.get('id');
        },

        addingCard: function() {
        	this.$content.append(_.template(addCardTmpl, {}));
        },

        cardAdded: function() {
        	this.$content.find(".phoneAddingCard").remove();
        }
    });
});

