define(['underscore', 'backbone', 'models/Budget/BudgetModel'], function(_, Backbone, BudgetModel) {
	var Collection = Backbone.Collection.extend({
		model: BudgetModel
	});
	return Collection;
});