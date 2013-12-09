define(['underscore', 'backbone', 'models/Card/CardModel'], function(_, Backbone, CardModel) {
	var getNextID = function() {
		if(!window.nextCardID) {
			window.nextCardID = 1;
		}
		return window.nextCardID++;
	};

    var Collection = Backbone.Collection.extend({
        model: CardModel,
        initialize:function (data) {
        	var max = 0;
        	data.forEach(function (e) {
        		max = Math.max(max, parseInt(e.id, 10));
        	});
        	window.nextCardID = max + 1;

        	data.forEach(function (e,i) {
        		if(!e.id) {
        			data[i].id = getNextID();
        		}
        	});

            this.init();
            this.bind('reset', this.init, this);
        },
        init: function(){
            this.currentElement = this.at(0);
        },
        comparator: function(model) {
            return model.get("id");
        },
        getElement: function() {
            if(!this.currentElement) {
	            this.init();
	        	this.currentElement && this.trigger('cardSelected');
            }
            return this.currentElement;
        },
        setElement: function(model) {
            this.currentElement = model;
        	this.trigger('cardSelected');
        },
        next: function (){
            this.setElement(this.at(this.indexOf(this.getElement()) + 1));
            return this;
        },
        prev: function() {
        	var index = this.indexOf(this.getElement()) - 1;
        	if (index===-1) {
        		index = this.length - 1;
        	}
            this.setElement(this.at(index));
            return this;
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