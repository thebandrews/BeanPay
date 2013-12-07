define(['underscore', 'backbone', 'models/Card/CardModel'], function(_, Backbone, CardModel) {
    var Collection = Backbone.Collection.extend({
        model: CardModel,
        initialize:function (){
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
            this.setElement(this.at(this.indexOf(this.getElement()) - 1));
            return this;
        }
    });
    return Collection;
});