define(['underscore', 'backbone', 'models/Product/ProductModel'], function(_, Backbone, ProductModel) {
	var Collection = Backbone.Collection.extend({
		model: ProductModel
	});
	return Collection;
});