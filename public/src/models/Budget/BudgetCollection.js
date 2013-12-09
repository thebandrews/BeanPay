define(['underscore', 'backbone', 'models/Budget/BudgetModel'], function(_, Backbone, BudgetModel) {
	var getNextID = function() {
		if(!window.nextBudgetID) {
			window.nextBudgetID = 1;
		}
		return window.nextBudgetID++;
	};

    var Collection = Backbone.Collection.extend({
        model: BudgetModel,

        initialize:function (data) {
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

        add: function(obj) {
        	if(!obj.id) {
        		obj.id = getNextID();
        	}
        	Backbone.Collection.prototype.add.call(this, obj);
        }
    });
    return Collection;
});