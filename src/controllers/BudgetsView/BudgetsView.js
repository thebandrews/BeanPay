define([
	'underscore',
	'backbone',
	'jquery',
	'ProductCollection',
	'controllers/VariationsView/VariationsView',
	'text!controllers/ProductView/tmpl.html',
	'text!controllers/ProductView/drawer.html'
], function(_, Backbone, $, ProductCollection, VariationsView, tmpl, drawerTmpl) {
	var MIN_TIMER_NOT_NOTICABLE = 10;
	var HOVER_TIME_FETCH_DATA = 100;
	var HOVER_TIME_SHOW_DATA = 200;
	var DATA_TYPE_REQUEST = 'similarAndComplementary';

	window.getImage = function (imageUrl, mediaCommand) {
		var tmp = imageUrl.replace(/\._(([^\.]+)_)+\./,".").split(".");
		tmp.splice(-1,0,mediaCommand);
		tmp = tmp.join(".");
		return tmp;
	};

	window.getImageThumbnail = function (imageUrl) {
		return window.getImage(imageUrl,"_AC_UY190_");
	};

	window.getImageView = function (imageUrl) {
		return window.getImage(imageUrl,"_AC_UY640_");
	};


	return Backbone.View.extend({
		events: _.extend({
			'click .img_preview': 'detailsClick',

			'click .product_sims_right': 'rightSimsClick',
			'click .product_sims_left': 'leftSimsClick',

			'click .expand-trigger': 'toggleDrawer'
		},
		(!window.mobilecheck() && !desktopWorksLikeMobile ? {
			// unbinding these events based on feedback with Jenny
			'mouseenter .product_view_container': 'previewEnter',
			'mouseleave .product_view_container': 'previewLeave',

			'mouseenter .product_drawer': 'removeDrawerNotFullyExpandedClass',
			'mouseleave .product_drawer': 'addDrawerNotFullyExpandedClass'
		} : {})
		),

		className: 'item product_view',

		initialize: function() {
			var self = this;

			this.model.on(DATA_TYPE_REQUEST || 'fetchAll', function() {
				var resolve = function () {
					if(self.isReadyToExpand()) {
						$.each(self.$dfArr, function(i,e) {
							e.resolve();
						});
					}
					else {
						self.once('readyToExpand',resolve);
					}
				};

				resolve();

				this.$dfArr = [];
			}, this);

			// when data is ready, render drawer
			this.model.on(DATA_TYPE_REQUEST, this.renderDrawer, this);

			this.dataFetchTimer = null;
			this.hoverRenderTimer = null;
			this.$dfArr = [];
		},

		addDrawerNotFullyExpandedClass: function() {
			this.$el.addClass('drawerNotFullyExpanded');
		},

		removeDrawerNotFullyExpandedClass: function() {
			this.$el.removeClass('drawerNotFullyExpanded');
		},

		toggleDrawer: function() {
			// show active state on trigger for a brief time
			var $t = this.$('.expand-trigger').addClass('active');
			_.delay(function(){ $t.removeClass('active'); }, 200);

			localStorage.setItem('triggerUsed', true);

			if(this.isUserExpanded()) {
				this.contractDrawer();
			} else {
				this.expandDrawer();
				this.$el.addClass('user_highlighted');
			}				
		},

		leftSimsClick: function(e) {
			this.trigger('more', {
				collection: new ProductCollection(this.model.getFlatData('similar')),
				$ref: this.$el,
				e: event
			});
		},

		rightSimsClick: function(e) {
			this.trigger('more', {
				collection: new ProductCollection(this.model.getInterleavedFlatData('complementary')),
				$ref: this.$el,
				e: event
			});
		},

		triggerMore: function(key, event) {
			this.trigger('more', {
				collection: new ProductCollection(this.model.getInterleavedFlatData(key)),
				$ref: this.$el,
				e: event
			});
		},

		detailsClick: function(e) {
			this.trigger('details', {
				model: this.model,
				$ref: this.$el
			});
		},

		focus: function() {
			this.$el.addClass('focus');
			if(localStorage.getItem('noTeaserPeek')==="true") {
				this.$el.addClass('focusFullHeight');
			}
			return this;
		},

		unfocus: function() {
			this.$el.removeClass('focus').removeClass('focusFullHeight');
			this.contractDrawerSafe();
			return this;
		},

		isUserExpanded: function() {
			return this.$el.hasClass('user_highlighted');
		},

		isExpanded: function() {
			return this.$el.hasClass('highlighted');
		},

		isReadyToExpand: function() {
			return this.expandReady;
		},

		readyToExpand: function() {
			this.expandReady = true;
			this.trigger('readyToExpand');
		},

		contractDrawer: function() {
			this.waitingForExpand = false;
			this.expandReady = false;
			this.$el.removeClass('highlighted user_highlighted');
		},

		contractDrawerSafe: function() {
			if(!this.$el.hasClass('focus') && !this.$el.hasClass('user_highlighted')) {
				this.contractDrawer();
			}
			return this;
		},

		expandDrawer: function() {
			this.$el.addClass('highlighted');
			if(!this.hasRenderedDrawer) this.dataFetch();
			return this;
		},

		expandDrawerWhenReady: function() {
			var self = this;

			this.readyToExpand();
			this.waitingForExpand = true;
			var expand = function () {
				if(self.waitingForExpand) {
					if(self.model.dataReady(DATA_TYPE_REQUEST) && self.expandReady) {
						self.expandDrawer();
						self.waitingForExpand = false;
						self.trigger('expanding');
					} else {
						setTimeout(expand, HOVER_TIME_FETCH_DATA);
					}
				}
			};
			expand();
		},

		requestExpand: function() {
			this.waitingForExpand = true;
			this.expandReady = false;

			var $df = $.Deferred();
			this.$dfArr.push($df);

			if(!this.model.dataRequested()) {
				this.dataFetch();
			}
			else if(this.model.dataReady(DATA_TYPE_REQUEST) && this.isReadyToExpand()) {
				$df.resolve();
			}

			return $df.promise();
		},

		previewEnter: function(e) {
			this.dataFetchTimer = setTimeout(this.dataFetch.bind(this), HOVER_TIME_FETCH_DATA);
			this.hoverRenderTimer = setTimeout(this.expandDrawerWhenReady.bind(this), HOVER_TIME_SHOW_DATA);
			this.addDrawerNotFullyExpandedClass();
		},

		previewLeave: function(e) {
			clearTimeout(this.dataFetchTimer);
			clearTimeout(this.hoverRenderTimer);
			this.contractDrawerSafe();
		},

		switchVariation: function(attributes) {
			this.$el.attr('data-asin',attributes.asin);
			this.model.set(attributes);

			var imageURL = attributes.imageURL.replace(/\._(([^\.]+)_)+\./,".");
			this.$('.img_preview').attr('src',imageURL);
		},

		dataFetch: function(e) {
			this.model.fetch(DATA_TYPE_REQUEST);
		},

		renderDrawer: function() {
			// if(!this.hasRenderedDrawer) {
				this.$('.pivots').html(_.template(drawerTmpl, {
					left: {
						label: this.model.get('similarNode'), //'More ' + (this.model.get('similarUsingRelatedSearchTerms') ? 'like' : 'by' ) + " '" + this.model.get(this.model.get('queryAttribute')) + "'",
						data: this.model.getFlatData('similar').slice(0,localStorage.getItem('numSimilar') || 3)
					},
					right: {
						label: 'Accessories', //'Matching ' + (this.model.get('complementaryUsingRelatedSearchTerms') ? 'like' : 'by' ) + " '" + this.model.get(this.model.get('queryAttribute')) + "'",
						data: this.model.getInterleavedFlatData('complementary').slice(0,localStorage.getItem('numComplementary') || 1)
					}
				}));
				// this.hasRenderedDrawer = true;
				this.$el.addClass('drawer_loaded');
			// }
		},

		renderVariations: function () {
			var variations = this.model.getFlatData('variations', true);
			this.variationsView = new VariationsView({'collection': new (require('ProductCollection'))(variations), el: this.$('.variations')});
			this.variationsView.render(this.model.get('image'));
			this.variationsView.on('variationChange', _.bind(this.switchVariation, this));
		},

		render: function() {
			this.model.execOnInitialDataReady(_.bind(function () {
				var modelData = this.model.toJSON();
				this.$el.append(_.template(tmpl, modelData));
				this.$el.attr('data-asin', this.model.get('asin'));
				this.model.execOnRequiredData(['variations'], _.bind(this.renderVariations, this), _.bind(this.model.getVariationData, this.model));
			},this));
			return this;
		}
	});
});

