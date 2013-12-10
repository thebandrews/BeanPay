define(['underscore', 'backbone', 'models/Budget/BudgetModel'], function(_, Backbone, BudgetModel) {
	var getNextID = function() {
		if(!window.nextBudgetID) {
			window.nextBudgetID = 1;
		}
		return window.nextBudgetID++;
	};

    var Collection = Backbone.Collection.extend({
        model: BudgetModel,

        initialize: function (data) {
        	var max = 0;

        	data && data.length && data.forEach(function (e,i) {
        		max = Math.max(max, parseInt(e.id, 10));
        	});

        	window.nextBudgetID = max + 1;

        	data && data.length && data.forEach(function (e,i) {
        		if(!e.id) {
        			data[i].id = getNextID();
        		}
        	});
        },

        getBudgetsMatchingMerchantName: function (merchant) {
        	var models = [];
        	this.models.forEach(function (model) {
        		var categories = model.get("categories");
                try {
                    categories.forEach(function (category) {
                        var names = getBudgetCategoryByName(category).generic;
                        for(var i=0,len=names.length;i<len;i++) {
                            if(merchant.match(new RegExp(names[i]))) {
                                models.push(model);
                                throw BreakException;
                            }                            
                        }
                    });
                }
                catch(ex) {
                    if (ex!==BreakException) throw ex;
                }
        	});
        	return models;
        },

        add: function(obj) {
        	if(!obj.id) {
        		obj.id = getNextID();
        	}
        	return Backbone.Collection.prototype.add.call(this, obj);
        }
    });
    return Collection;
});