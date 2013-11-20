define([
	'underscore',
	'backbone',
	'jquery',
	'text!controllers/AppView/app.html',
	'BudgetsView',
	'BudgetView',
	'CardsView',
	'SearchView',
	'TransactionsView',
	'TransactionView',
	'BudgetCollection',
	'models/sampleBudgetCollection'
], function(_, Backbone, $, tmpl, BudgetsView, BudgetView, CardsView, SearchView, TransactionsView, TransactionView, budgets) {

	var collection = new BudgetCollection(products);

	// fill in some relevance data about the product
	collection.each(function(model) { model.set('relevance', Math.random()); });

	var AppView = Backbone.View.extend({
		// how long to wait until we think user stopped scrolling
		SCROLLCHECK_LOAD_DATA_TIMEOUT: 0,
		SCROLLCHECK_SHOW_DRAWER_TIMEOUT: 600,

		// minimum pixel we should see when considering product is in view
		SCROLL_CHECK_PAD: 100,

		// percentage range of viewport height to be considered "infocus"
		INFOCUS_RANGE: [0.3,0.55],

		events: {
			'click .merchSlots': 'optionsClick',
			'click .fashion': 	 'switchMode'
		},

		initialize: function() {
			var self = this;

			this.productViews = {};

			localStorage.setItem('triggerUsed', false);

			this.renderFirst();

			this.$window = $(window)
			//.on('resize', _.bind(this.fixInlineView, this))
			.on('scroll', _.throttle(_.bind(this.bodyScroll, this), 100));

			this.$dfArrRowDisplay = [];

			this.on('rowFocus', function(productViews) {
				_.each(this.productViews, function(view) { view.unfocus(); });
				if(localStorage.getItem('singleShow')==="true") {
					productViews = [productViews[Math.floor(Math.random()*productViews.length)]];
				}
				_.each(productViews, function(view) { view.focus(); view.expandDrawer(); });
				if(parseInt(localStorage.getItem('autoHide'), 10)) {
					setTimeout(function () {
						_.each(productViews, function(view) { view.unfocus(); });
					}, parseInt(localStorage.getItem('autoHide'), 10));
				}
			}, this);

			this.on('loadRowData', function(productViews) {
				$.when.apply($, _.map(productViews, function(view) { return view.requestExpand(); })).done(function () {
					_.each(productViews, function(view) { view.expandDrawer(); });
				});
			}, this);
		},

		optionsClick: function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(document.body).append($(_.template(optionsTmpl, {
				noTeaserPeek: 		localStorage.getItem('noTeaserPeek')==="true",
				stopOnTriggerUsed: 	localStorage.getItem('stopOnTriggerUsed')==="true",
				singleShow: 		localStorage.getItem('singleShow')==="true",
				numSimilar: 		localStorage.getItem('numSimilar'),
				numComplementary: 	localStorage.getItem('numComplementary'),
				autoShow: 			localStorage.getItem('autoShow'),
				autoHide: 			localStorage.getItem('autoHide')
			})).one('click', 'input[type=button]', function () {
				$(".optionsBox input[name]").each(function (i, e) {
					var $e = $(e);
					localStorage.setItem($e.attr('name'), $e.attr('type')==="checkbox" ? $e.is(":checked") : $e.val());
				});
				$(".optionsBox").remove();
			}));
			return false;
		},

		bodyScroll: function(e) {
			// if(window.mobilecheck()) {
				// no longer doing 
				// if(this.relevantProductTimeout) clearTimeout(this.relevantProductTimeout);
				// this.relevantProductTimeout = setTimeout(_.bind(this.checkRelevantProductsInView, this), this.SCROLLCHECK_SHOW_DRAWER_TIMEOUT);

				// no longer doing 
				if(localStorage.getItem('stopOnTriggerUsed')!=="true" || localStorage.getItem('triggerUsed')!=="true") {
					if(this.infocusProductRowTimeout) clearTimeout(this.infocusProductRowTimeout);
					this.infocusProductRowTimeout = setTimeout(_.bind(this.checkRowInFocus, this), parseInt(localStorage.getItem('autoShow') || 0, 10));					
				}

				// no longer loading data ahead of time, just show drawer
				// if(this.infocusProductRowLoadDataTimeout) clearTimeout(this.infocusProductRowLoadDataTimeout);
				// this.infocusProductRowLoadDataTimeout = setTimeout(_.bind(this.checkRowInFocus, this, 'loadRowData'), this.SCROLLCHECK_LOAD_DATA_TIMEOUT);				
			// }
		},

		/**
		 * checks first product row between some portion of the viewport
		 */
		checkRowInFocus: function(type) {
			// figures out the left-most product_view for the active column
			var $c = this.$products.children();
			var wtop = window.pageYOffset + window.innerHeight*this.INFOCUS_RANGE[0];
			var wbot = window.pageYOffset + window.innerHeight*this.INFOCUS_RANGE[1];
			var $product, ptop, pbot;
			for(var i=0, len = $c.length; i<len; i++) {
				$product = $c.eq(i);
				ptop = $product.offset().top;
				pbot = ptop + $product.height();

				if(ptop < wbot && pbot > wtop) break;
			}

			// figures out all products in the row starting for $product
			var productViewsInFocus = [];
			var refOffset = $product.offset();
			var top = ptop+40, $next = $product, $curr;
			do {
				var controller = this.getProductController($next);
				if(controller) productViewsInFocus.push(controller);
				$curr = $next;
				$next = $curr.next();
			} while($next[0] && $next.offset().top <= top);

			if(!type) {
				this.trigger('rowFocus', productViewsInFocus);
			} else if(type==='loadRowData') {
				this.trigger('loadRowData', productViewsInFocus);
			}
		},

		/**
		 * checks all products inside viewport and triggers an event with the
		 * collection of product models in relevance order
		 */
		checkRelevantProductsInView: function() {
			var matchedCollection = new (Backbone.Collection.extend({
				comparator: function(model) { return 1-model.get('relevance'); }
			}))();

			var $c = this.$products.children();
			var wtop = window.pageYOffset + this.SCROLL_CHECK_PAD;
			var wbot = wtop + window.innerHeight - 2*this.SCROLL_CHECK_PAD;
			var $product, ptop, pbot;
			for(var i=0, len = $c.length; i<len; i++) {
				$product = $c.eq(i);
				ptop = $product.offset().top;
				pbot = ptop + $product.height();
				if(ptop > wbot) break;

				if((pbot > wtop && pbot < wbot) || ptop > wtop) {
					matchedCollection.add(this.collection.findWhere({asin: $product.data('asin')}));
				}
			}
			this.trigger('scrollCheck', matchedCollection);
		},

		bindNewInlineView: function(info) {

			var $inline = this.inlineView.$el.css('max-height',0);
			this.inlineView.on('destroy', this.inlineDestroyed, this.inlineView);
			this.$inlineRef = info.$ref;
			this.$inlineRef.siblings('.inline_active').removeClass('inline_active');
			this.$inlineRef.addClass('inline_active');

			if(this.$inlineRef.parent().is(this.$products)) {
				// top/app level inline views
				this.$inlineRef.siblings('.inline_view').remove();
				this.topLevelInlineView = this.inlineView;
				this.$topLevelInlineRef = this.$inlineRef;
				this.fixInlineView();
			} else {
				// sub-level inline views
				var $p = this.$inlineRef.parents('.inline_view_container');
				$p.siblings('.inline_view').remove();
				$p.after(this.inlineView.el);

				this.scrollShowInline($inline);
			}
			$inline.css('max-height','');
		},

		showInlineShoveler: function(info) {
			this.inlineView = new ShovelerView({collection: info.collection, $ref: info.$ref});
			this.bindNewInlineView(info);

			// point to the correct side
			if(info.e) {
				var $productSideContainer = $(info.e.target).closest('.product_sims_container');
				var percent = ($productSideContainer.position().left + $productSideContainer.width()/2)/info.$ref.width();
				info.$ref.find('.arrow').css('left', percent*100 + '%');
			}
		},

		showInlineView: function(info) {
			this.inlineView = new InlineView({model: info.model, $ref: info.$ref});
			this.inlineView.$('.inline_view_frame').html(
				'<iframe class="idpFrame" scrolling="no" height="550" width="100%" seamless="seamless" src="http://www.amazon.com/gp/product/'+info.model.get('asin')+'/?dpMode=embed"></iframe>'
			);
			this.bindNewInlineView(info);

			info.$ref.find('.arrow').css('left','');
		},

		inlineDestroyed: function() {
			this.$ref.removeClass('active inline_active');

		},

		fixInlineView: function() {
			var view = this.topLevelInlineView;
			if(!view) return;

			this.$products.prepend(view.$el);

			// place inline view below the line that contains $ref
			// after the loop below, $curr will be the right-most element on
			// the same line as $ref. 40px padding for possible height difference
			var $ref = this.$topLevelInlineRef;
			var refOffset = $ref.offset();
			var top = refOffset.top, $curr, $next = $ref;
			do {
				$curr = $next;
				$next = $curr.next();
			} while($next[0] && $next.offset().top <= top+40);
			$curr.after(view.el);
			this.scrollShowInline(view.$el);
		},

		scrollShowInline: function($inline) {
			var y = $inline.offset().top - window.innerHeight + ($inline.hasClass('shoveler_view') ? 450 : 610);
			this.scrollTo(y);
		},

		scrollTo: function(y) {
			// forcing jQuery scrollTop animate
			var isMobile = false;

			if(isMobile) {
				var $body = this.$el
				.addClass('fake_scrolling')
				.css('transition', '.5s')
				.css('-webkit-transform', 'translate3d(0, ' + (this.$el.scrollTop() - y) + 'px, 0)');
				setTimeout(function() {
					$body.css({'transition': '', '-webkit-transform':''}).removeClass('fake_scrolling');
					_.defer(function(){ $body.scrollTop(y); });
				}, 510);
			} else {
				this.$el.animate({scrollTop: y});
			}
		},

		getProductController: function($node) {
			return this.productViews[$node.attr('data-asin')];
		},

		switchMode: function () {
			$('.overlay').html('');
			this.render();
			$('.overlay').remove();
		},

		renderFirst: function() {
			this.$el.append(_.template(overlayTmpl));
		},

		render: function() {
			this.$el.append(_.template(headerTmpl, {name: 'Jenny'}), _.template(tmpl, {}));
			this.$products = this.$('.products');

			if(desktopWorksLikeMobile || window.mobilecheck()) {
				this.$el.addClass('mobile');
			}

			this.collection.each(function(product) {
				var productView = new ProductView({model: product});
				this.$products.append(productView.render().el);
				productView.on('more', this.showInlineShoveler, this);
				productView.on('details', this.showInlineView, this);

				this.productViews[product.get('asin')] = productView;
			}, this);
			this.$productViews = this.$('.product_view');
		}
	});
	return new AppView({el: 'body', collection: collection});
});
