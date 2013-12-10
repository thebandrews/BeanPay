define([
    'underscore',
    'backbone',
    'jquery',
    'serializeObject',
    'BudgetCollection',
    'BudgetView',
    'CSSpie',
    'text!controllers/BudgetsView/tmpl.html',
    'text!controllers/BudgetsView/createABudgetTmpl.html',
    'text!controllers/BudgetsView/budgetGraphTmpl.html'
], function (_, Backbone, $, serializeObject, BudgetCollection, BudgetView, cssPie, tmpl, createABudgetTmpl, budgetGraphTmpl) {

	return Backbone.View.extend({
        events: {
            "click .budgetGraph": "budgetSelect",
            "click .purchase_option": "togglePurchaseOption",
            "keypress .budget_name": "checkName"
        },

        initialize: function (info) {
            this.budgetCollection = info.budgetCollection;
            this.cardCollection = info.cardCollection;
            this.transactionCollection = info.transactionCollection;
            this.render();

            this.$el.addClass("budgets").attr("data-switch-view","budgets");

            this.transactionCollection.on('add', _.bind(this.render, this));
            this.budgetCollection.on('add', _.bind(this.render, this));
        },

        togglePurchaseOption: function (e) {
        	var $e = $(e.currentTarget).toggleClass('selected');
        	var $c = $e.find('[type="checkbox"]');

        	$c.attr('checked', !$c.attr('checked'));

        	if($c.attr('checked')) {
        		$e.closest(".purchase_options").removeClass("error");
        	}
        },

        checkName: function (e) {
        	var $e = $(e.currentTarget);
        	setTimeout(function () {
        		if($e.val()) {
        			$e.removeClass("error");
        		}
        	}, 0);
        },

        createBudget: function () {
        	this.$el.find(".error").removeClass("error");
        	var data = this.$el.find(".createABudget").find("input").serializeObject();
        	var verified = true;

        	if(!data.budget_name) {
        		this.$el.find(".budget_name").addClass('error');
        		verified = false;
        	}

        	if(!data.budget_categories) {
        		this.$el.find(".purchase_options").addClass('error');
        		verified = false;
        	}

        	if(!verified) {
        		return false;
        	}

        	this.budgetCollection.add({
	            name: data.budget_name,
	            categories: Object.keys(data.budget_categories).map(function (e) { return e.replace("_"," "); }),
	            period: "Monthly",
	            startDate: "1",
	            amount: "" + Math.floor(250 * Math.random())
        	});

        	return true;
        },

        budgetSelect: function (e) {
            console.log(e);
        	if($(e.currentTarget).attr('data-id')!=="add") {
        		// Do something on budget select
	            $(e.currentTarget).addClass("view");
	        	// this.cardCollection.setElement(this.cardCollection.get($(e.currentTarget).attr('data-id')));
        	}
        },

        endBudgetSelect: function () {
        	this.$el.find(".view").removeClass("view");
        },

        render: function () {
            this.$el.empty();
            this.$el.append(_.template(createABudgetTmpl, { categories: window.budget_categories }));
            this.$el.append(_.template(tmpl, {}));

            var getBudgetSpendingInfo = _.bind(function (budget) {
                var spent = 0;
                var budgetAmount = parseFloat(budget.get('amount'),10);

                this.transactionCollection.each(function (transaction) {
                    if(transaction.get('budget_ids') && transaction.get('budget_ids').indexOf(budget.get('id'))!==-1) {
                        spent += parseFloat(transaction.get('amount'),10);
                    }
                });

                var spentPercent = spent / budgetAmount;
                var remaining = budgetAmount - spent; //"" + (Math.floor((1 - spentPercent) * budget.get('amount') * 100) / 100);
                spentPercent = Math.floor(spentPercent * 100);  //  budget.get('amount')

                return {
                    spent: spent,
                    spentPercent: spentPercent,
                    remaining: remaining
                };
            }, this);


            this.budgetCollection.comparator = function (budget) {
                return getBudgetSpendingInfo(budget).remaining;
            };

            this.budgetCollection.sort().each(_.bind(function (budget) {
            	var spending = getBudgetSpendingInfo(budget);

                var html = _.template(budgetGraphTmpl, { name: budget.get('name'), remaining: spending.remaining, id: budget.get('id') });
                var $html = $(html);

                $html.find(".budgetPie").append(createPie("pie", "80px", "white", [Math.min(100, spending.spentPercent), Math.max(0, 100 - spending.spentPercent)], ["#222222", "#339933"]));
                this.$el.find(".addABudget").before($html);
            }, this));
        }
    });
});