define(['underscore', 'backbone', 'models/Transaction/TransactionModel'], function(_, Backbone, TransactionModel) {
	var getNextID = function() {
		if(!window.nextTransactionID) {
			window.nextTransactionID = 1;
		}
		return window.nextTransactionID++;
	};

    var Collection = Backbone.Collection.extend({
        model: TransactionModel,

        initialize:function (data) {
        	var max = 0;
        	data && data.length && data.forEach(function (e) {
        		if(e.id) {
	        		max = Math.max(max, parseInt(e.id, 10));
        		}
        	});
        	window.nextTransactionID = max + 1;

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
        	return Backbone.Collection.prototype.add.call(this, obj);
        }
    });
    return Collection;
});