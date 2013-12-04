define(['underscore', 'backbone', 'models/Transaction/TransactionModel'], function(_, Backbone, TransactionModel) {
    var Collection = Backbone.Collection.extend({
        model: TransactionModel
    });
    return Collection;
});