define([
    'underscore',
    'backbone',
    'jquery',
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
], function (_, Backbone, $, tmpl, touch_tmpl, taskhelp_tmpl, datahelp_tmpl, PhoneView, MagicCardView, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView, BudgetCollection, CardCollection, TransactionCollection, budgets, cards, transactions) {

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

    window.formatMoney = function (val, decimals) {
        if (decimals === undefined) {
            decimals = 2;
        }
        return '$' + parseFloat(val, 10).toFixed(decimals);
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
            // "mouseup": window.touchEnd
        },

        initialize: function () {
            this.render();

            this.phoneView = new PhoneView({ budgetCollection: budgetCollection, cardCollection: cardCollection, transactionCollection: transactionCollection });
            this.magicView = new MagicCardView({ budgetCollection: budgetCollection, cardCollection: cardCollection, transactionCollection: transactionCollection });

            this.setCard(cardCollection.get(1));

            this.phoneView.on('cardChosen', _.bind(this.setCard, this));
            this.magicView.on('cardChosen', _.bind(this.setCard, this));
        },

        resetPrototype: function () {
            resetPrototypeData();

            this.initialize();
        },

        render: function () {
            this.$el.empty().append(_.template(touch_tmpl, {}), _.template(tmpl, {}));
            this.$el.find("#task_help").append(_.template(taskhelp_tmpl, {}));
            this.$el.find("#data_help").append(_.template(datahelp_tmpl, {}));
        },

        setCard: function (card) {
            this.phoneView.setCard(card);
            this.magicView.setCard(card);
        },
    });

    return new AppView({ el: 'body' });
});

