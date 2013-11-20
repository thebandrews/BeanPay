define(['underscore', 'backbone', 'cachedAjax', 'ProductCollection'],
	function(_, Backbone, cachedAjax, ProductCollection) {
	// getting the proper path shouldn't exist in the model, placing it here for now
	var PROXY_SERVER = window.location.protocol + '//' + window.location.hostname + ':10008/';

	var PISA_URL = 'http://pisa.amazon.com/pisa/product/{asin}/';
	var SEARCH_URL = 'http://pisa.amazon.com/pisa/search/';
	var BRS_URL = 'http://browse-classification-na.amazon.com/bcb/BrowseAsinLadders.do?asin={asin}&marketplaceID=1&merchantID=0&filters=detail-page-ladders-truncate';
	var DPX_URL = 'http://hp-detail-na.rr.amazon.com:8080/dp/{asin}';
	var AMAZON_RELATED_SEARCH_URL = "http://www.amazon.com/s?k={query}&url=search-alias%3Dapparel&format=json&dataVersion=v0.1";

	var IMAGE_THUMB_URL = 'http://ecx.images-amazon.com/images/I/{physicalID}._SX{width}_SY{height}_CR,0,0,{width},{height}_.jpg';
	var THUMB_PIXELS_WIDE = 38;
	var THUMB_PIXELS_TALL = 50;

	// Defaults, made up from here:
	// http://www.amazon.com/dp/B00006JNK2/?isDebug=true
	// https://w.amazon.com/index.php/DpxDebugging
	// https://w.amazon.com/index.php/RCX/Buying_Experience/DPX/DataAndControlFlow#Example_set_of_request_parameters_from_RetailWebsite_to_DPX
	var DPX_DEFAULTS = {
		"_encoding": "UTF8",
		"marketplaceId":"ATVPDKIKX0DER"
	};

	var SEP = "(\\s+(.+\\s+)*)";

	var DPX_FEATURES = [
		"twister"
		// , "price"
		// , "availability"
	];

	var PER_PAGE = 10;

	var MINIMUM_SIMILAR_ITEMS = 3;

	var REQUIRED_DATA = [
		"title"
	];

	/*
	"http://www.amazon.com/b/?node=7454880011"
	"search-alias=shoes";
	"search-alias=apparel";
	"search-alias=jewelry";
	"node=3367581";  // womens jewelry
		"node=7454939011"; // fashion rings
		"node=7454927011"; // fashion necklaces
		"node=7454917011"; // fashion earrings
		"node=7454898011"; // fashion bracelets
	"node=1040660";  // womens clothing
	"node=1045024";  // womens dresses
	"node=1044646";  // womens coats
	"node=1044886";  // womens socks and hosiery
	"node=679337011";// womens shoes
		"node=679399011"; // flats
		"node=679416011"; // pumps
		"node=679380011"; // boots
		"node=679425011"; // sandals
		"node=679394011"; // fashion sneakers
	"node=15743631"; // womens handbags
	"node=6358543011"; //womens watches
	"node=3091450011"; //womens contemporary
	"node=7463390011"; //womens standouts
	"node=14333511"; //womens intimate apparel
	"node=7072322011"; // gloves and mittens
	"node=7072324011"; // scarves and wraps
	"node=2474940011"; // belts
	"node=2474945011"; // hats
	"node=15744111";  // umbrellas
	"node=7454907011"; //pins, brooches
	*/

	var NODE_TO_CATEGORY_NAME = {
		"node=3367581":    "Jewelry",
		"node=7454939011": "Rings",
		"node=7454927011": "Necklaces",
		"node=7454917011": "Earrings",
		"node=7454898011": "Bracelets",
		"node=1040660":    "Clothing",
		"node=1045024":    "Dresses",
		"node=1044646":    "Coats",
		"node=1044886":    "Socks and hosiery",
		"node=679337011":  "Shoes",
		"node=679399011":  "Flats",
		"node=679416011":  "Pumps",
		"node=679380011":  "Boots",
		"node=679425011":  "Sandals",
		"node=679394011":  "Sneakers",
		"node=15743631":   "Handbags",
		"node=6358543011": "Watches",
		"node=3091450011": "Contemporary",
		"node=7463390011": "Standouts",
		"node=14333511":   "Intimate apparel",
		"node=7072322011": "Gloves",
		"node=7072324011": "Scarves",
		"node=2474940011": "Belts",
		"node=2474945011": "Hats",
		"node=15744111":   "Umbrellas",
		"node=7454907011": "Pins",
		"node=2475898011": "Wallets",
		"node=2348892011": "Leather Jackets",
		"node=2348891011": "Wool Coats",
		"node=7132357011": "Denim Jackets",
		"node=7132356011": "Anoraks",
		"node=2348898011": "Light Jackets",
		"node=2348893011": "Performance Coats",
		"node=2348895011": "Rain Coats",
		"node=2348894011": "Down Coats",
		"node=7132358011": "Quilted Jackets"
	};

	var NODE_TO_CATEGORY_MAP = {};

	$.each(NODE_TO_CATEGORY_NAME, function (idx, el) {
		NODE_TO_CATEGORY_MAP[idx.split('=').pop()] = el;
	});

	var NODE_HEIRARCHY_TO_CATEGORY_MAP = {
		"3367581":    "Jewelry",
		"7454939011": "Rings",
		"7454927011": "Necklaces",
		"7454917011": "Earrings",
		"7454898011": "Bracelets",
		"1040660":    "Clothing",
		"1045024":    "Dresses",
		"1044646":    "Coats",
		"1044886":    "Socks and hosiery",
		"679337011":  "Shoes",
		"15743631":   "Handbags",
		"6358543011": "Watches",
		"14333511":   "Intimate apparel",
		"7072322011": "Gloves",
		"7072324011": "Scarves",
		"2474940011": "Belts",
		"2474945011": "Hats",
		"15744111":   "Umbrellas",
		"7454907011": "Pins",
		"2475898011": "Wallets"
	};



	var CATEGORY_MAP = {
		'Coats': [
			"node=679380011",   // boots
			"node=15743631",    // handbags
			"node=15744111",	// umbrellas
			"node=7072324011",	// scarves
			"node=2474945011",	// hats
			"node=679416011",   // pumps
			"node=7454917011", 	// fashion earrings
			"node=7072324011" 	// gloves
		],
		'Handbags': [
			"node=2474940011",  // belts
			"node=7454927011", 	// fashion necklaces
			"node=679416011",   // pumps
			"node=7454898011", 	// fashion bracelets
			"node=679380011",   // boots
			"node=7454917011", 	// fashion earrings
			"node=1045024", 	// dresses
			"node=6358543011", 	// watches
			"node=1044646",  	// coats
			"node=7454939011",  // fashion rings
			"node=2474945011" 	// hats
		],
		'Wallets': [
			"node=2474940011",  // belts
			"node=679416011",   // pumps
			"node=7454898011", 	// fashion bracelets
			"node=679380011",   // boots
			"node=7454917011", 	// fashion earrings
			"node=6358543011", 	// watches
			"node=7454939011",  // fashion rings
		],
		'Shoes': [
			"node=6358543011", 	// womens watches
			"node=1045024", 	// dresses
			"node=15743631",    // womens handbags
			"node=7454898011", 	// fashion bracelets
			"node=1044886",		// socks and hosiery
			"node=1044646",  	// coats
			"node=7454917011", 	// fashion earrings
			"node=2474940011"	// belts
		],
		'Dresses': [
			"node=679380011",   // boots
			"node=7454917011", 	// fashion earrings
			"node=2474940011",  // belts
			"node=7454927011", 	// fashion necklaces
			"node=679416011",   // pumps
			"node=7454898011", 	// fashion bracelets
			"node=6358543011" 	// watches
		],
		'Rings': [
			"node=7454927011", 	// fashion necklaces
			"node=7454917011", 	// fashion earrings
			"node=7454898011", 	// fashion bracelets
			"node=6358543011", 	// watches
			"node=7454939011",  // fashion rings
			"node=7454907011"   // pins, brooches
								// hair berets / things
		],
		'Earrings': [
			"node=7454927011", 	// fashion necklaces
			"node=7454939011",  // fashion rings
			"node=7454898011", 	// fashion bracelets
			"node=6358543011", 	// womens watches
			"node=7454907011"   // pins, brooches
								// hair berets / things
		],
		'Necklaces': [
			"node=7454917011", 	// fashion earrings
			"node=7454939011",  // fashion rings
			"node=7454898011", 	// fashion bracelets
			"node=6358543011", 	// watches
			"node=7454907011"   // pins, brooches
								// hair berets / things
		],
		'Bracelets': [
			"node=7454927011", 	// fashion necklaces
			"node=7454939011",  // fashion rings
			"node=7454917011", 	// fashion earrings
			"node=7454898011", 	// fashion bracelets
			"node=7454907011"   // pins, brooches
								// hair berets / things
		],
		'Watches': [
			"node=7454927011", 	// fashion necklaces
			"node=7454939011",  // fashion rings
			"node=7454917011", 	// fashion earrings
			"node=6358543011", 	// womens watches
			"node=7454907011"   // pins, brooches
								// hair berets / things
		],
		"Scarves": [
			"node=2474945011",	// hats
			"node=15744111",	// umbrellas
			"node=7072324011", 	// gloves
			"node=15743631"     // handbags
		],
		"Hats": [
			"node=7072324011",	// scarves
			"node=15744111",	// umbrellas
			"node=7072324011", 	// gloves
			"node=15743631"     // handbags
		],
		"Umbrellas": [
			"node=7072324011",	// scarves
			"node=2474945011",	// hats
			"node=7072324011", 	// gloves
			"node=15743631",    // handbags
			"node=679380011"    // boots
		],
		"Belts": [
			"node=679416011",   // pumps
			"node=7454939011",  // fashion rings
			"node=7072324011", 	// gloves
			"node=7454927011", 	// fashion necklaces
			"node=679380011",   // boots
			"node=7454917011", 	// fashion earrings
			"node=15743631",    // handbags
			"node=7072324011" 	// scarves
		]
	};

	// Add variables into a url string
	var urlTmpl = function (url, data) {
		if(typeof data === 'object') {
			for(var key in data) {
				if(Object.prototype.hasOwnProperty.call(data, key)) {
					url = url.replace(new RegExp('\\{'+key+'\\}', 'g'), encodeURIComponent(data[key]));
				}
			}
		}
		return url;
	};

	// Keep trying to get data.  Don't resolve until we succeed or run out of tries (10 by default)
	var getDataOrRetry = function(url, data, $df, numTries) {
		if(numTries===undefined) {
			numTries = 10;
		}

		var $innerDf = $df || $.Deferred();

		cachedAjax.get(url, data, 'json').done(function (data) {
			$innerDf.resolve(data);
		}).fail(function () {
			var $tmpDf = $innerDf;
			return function (err) {
				numTries--;
				if(numTries>=0) {
					console.log("Retrying URL (" + numTries + " tries left): " + url);
					setTimeout(function () {
						getDataOrRetry(url, data, $tmpDf, numTries);
					}, 100*Math.pow(2,10-numTries));
				}
				else {
					$tmpDf.reject(err);
					console.log("Failing URL " + url);
				}
			}
		}());

		return $innerDf;
	};

	var hasRequiredMinimumData = function(dataToCheck, minimumData) {
		for(var i=0,len=minimumData.length;i<len;i++) {
			if(dataToCheck[minimumData[i]]===undefined) {
				return false;
			}
		}
		return true;
	};

	var removeInsufficientData = function(dataArr) {
		if(dataArr && dataArr.length) {
			for(var i=dataArr.length-1;i>=0;i--) {
				if(!hasRequiredMinimumData(dataArr[i], REQUIRED_DATA)) {
					dataArr.splice(i,1);
				}
			}
		}
		return dataArr;
	};


	return Backbone.Model.extend({

		initialize: function() {
			// ensure image url consistency
			if(this.get('imageUrl') && !this.get('image')) {
				this.set('image', {url: this.get('imageUrl')});
			}

			var self = this;
			this.dataIsRequested = [];
			this.dataIsReady = [];

			this.fetch('initialData');
		},

		dataReady: function(type) {
			return this.dataIsReady[type];
		},

		dataRequested: function(type) {
			return this.dataIsRequested[type];
		},

		toJSON: function() {
			var jsonData = Backbone.Model.prototype.toJSON.call(this);
			var price = jsonData.price ? parseFloat(jsonData.price.substr(1),10) : false;
			return _.extend(jsonData, {
				price: price ? (!(price - Math.floor(price)) ? '$'+Math.floor(price) : jsonData.price) : undefined,
				listPrice: jsonData.savingsPercentage ? '$'+Math.round(price/((100-parseFloat(jsonData.savingsPercentage,10))/100)) : undefined,
			});
		},

		browseNodeReady: function() {
			return !!this.get('browseNode');
		},

		addToCategoryMap: function(node, name) {
			if(!NODE_TO_CATEGORY_MAP[node]) {
				NODE_TO_CATEGORY_MAP[node] = name;
			}
		},

		convertBrowseNodeToCategoryMap: function() {
			var bn = this.get('browseNode').slice(0);
			var current = bn.pop();

			while(!NODE_TO_CATEGORY_MAP[current] && bn.length) {
				current = bn.pop();
			}

			return NODE_TO_CATEGORY_MAP[current];
		},

		convertBrowseNodeHierarchyToCategoryMap: function() {
			var bn = this.get('browseNode').slice(0);
			var current = bn.pop();

			while(!NODE_HEIRARCHY_TO_CATEGORY_MAP[current] && bn.length) {
				current = bn.pop();
			}

			return NODE_HEIRARCHY_TO_CATEGORY_MAP[current];
		},

		getPisaData: function() {
			var self = this;
			var url = PROXY_SERVER + urlTmpl(PISA_URL, {asin: this.get('asin')});

			getDataOrRetry(url).done(function(data) {
				self.set(data.product);
			});
		},

		getBrowseNode: function() {
			var self = this;
			var url = PROXY_SERVER + urlTmpl(BRS_URL, {asin: this.get('asin')});

			getDataOrRetry(url).done(function(data) {
				var $html = $(data);
				var tmp = $html.find('table').last();
				tmp = tmp.find('a');
				tmp.each(function(i,e){
					var $e = $(e);
					tmp[i] = $e.attr('href').split('nodeID=')[1].split('&')[0];
					self.addToCategoryMap(tmp[i], $e.text());
				});
				self.set('browseNode', tmp.toArray());
			});
		},

		getRelatedSearchTerms: function(attribute) {
			var self = this;
			var queryAttribute = attribute || 'brand';

			this.set('queryAttribute', queryAttribute);

			var doSearchFetch = function () {
				var search = self.get(queryAttribute);
				var url = PROXY_SERVER + urlTmpl(AMAZON_RELATED_SEARCH_URL, {query: search});

				getDataOrRetry(url).done(function(data) {
					var i, len, queries, searches = [], regexpArr = [], tmpArr, terms, accept;

					var getRegExp = function(termsArr) {
						return new RegExp(termsArr.join(SEP+"+") + SEP + "*",'i');
					}

					if(data.relatedSearches && data.relatedSearches.altQueries && data.relatedSearches.altQueries.length) {
						terms = _.unique(search.toLowerCase().split(' '));
						terms.forEach(function (el) {
							tmpArr = [[el]];
							regexpArr.forEach(function (el2) {
								tmpArr.push(el2.concat(el));
							});
							regexpArr = regexpArr.concat(tmpArr);
						});

						regexpArr = regexpArr.map(function (el) { return getRegExp(el); });

						queries = data.relatedSearches.altQueries;
						for(i=0,len=queries.length;i<len;i++) {
							accept = true;
							regexpArr.forEach(function (r) {
								if(accept && r.test(queries[i].text)) {
									accept = false;
								}
							});
							if(accept) {
								searches.push(queries[i].text);
							}
						}
					}
					if(searches.length) {
						self.set('relatedSearchTerms', searches);
					}
					else {
						self.set('relatedSearchTerms', false);
					}
				});
			};

			this.execOnRequiredData([queryAttribute], doSearchFetch);
		},

		fetch: function(type) {
			var self = this;
			var $dfArr = [];

			if(!this.dataIsRequested[type]) {
				this.dataIsRequested[type] = true;

				switch(type) {
					case 'initialData':
						$dfArr = $dfArr.concat(
							this.getPisaData(),
							this.getBrowseNode(),
							this.getVariationData()
						);
						break;
					case 'similarAndComplementary':
						$dfArr = $dfArr.concat(
							this.getSimilarItemsSameCategory(),
							this.getSimilarItemsDifferentCategory()
						);
						break;				
					default:
						$dfArr = $dfArr.concat(
							this.getSimilarItemsSameCategory(),
							this.getSimilarItemsDifferentCategory()
						);
						break;
				}

				return $.when.apply($,$dfArr).done(function () {
					self.trigger(type || 'fetchAll');
					self.trigger('dataReady');
					self.dataIsReady[type] = true;
				}).fail(function () {
					this.dataIsRequested[type] = false;
				});
			}
			else if(type && this.dataReady(type)) {
				self.trigger(type);
			}
		},

		getFlatData: function(key, dontShuffle) {
			var flatData;

			var flattenData = function (data) {
				var arrayOfData;
				if(!data) {
					arrayOfData = [];
				}
				else if(_.isArray(data)) {
					arrayOfData = data;
				} else {
					arrayOfData = _.map(dontShuffle ? data : _.shuffle(data), function(d) { return d; });
				}
				return _.flatten(arrayOfData);
			}

			if(typeof key==="string") {
				flatData = flattenData(this.get(key));
			}
			else {
				flatData = flattenData(key);
			}

			return flatData;
		},

		getInterleavedFlatData:  function(key) {
			var arrayOfData, tmpArr, totalCount;
			if(!this.interleaveCache) {
				this.interleaveCache = {};
			}
			if(!this.interleaveCache[key]) {
				if(_.isArray(this.get(key))) {
					arrayOfData = this.get(key);
				} else {
					arrayOfData = [];
					tmpArr = _.map(this.get(key), function(d) { return d; });
					totalCount = 0;
					tmpArr.forEach(function (el, idx) {
						totalCount += el.length;
						tmpArr[idx] = _.shuffle(el);
					});
					while(totalCount) {
						tmpArr.forEach(function (el) {
							if(el.length) {
								arrayOfData.push(el.pop());
								totalCount--;
							}
						});
					}
				}
				this.interleaveCache[key] = arrayOfData;
			}
			return this.interleaveCache[key];
		},

		execOnRequiredData: function(dataNameArray, func, fetchDataFunc) {
			var notReadyArr = [], $dfArr = [];
			var i, len, $tmpDf;

			for(i=0,len=dataNameArray.length;i<len;i++) {
				if(!this.has(dataNameArray[i])) {
					notReadyArr.push(dataNameArray[i]);
				}
			}

			if(notReadyArr.length===0) {
				func();
			}
			else {
				for(i=0,len=notReadyArr.length;i<len;i++) {
					$tmpDf = $.Deferred();
					$dfArr.push($tmpDf.promise());
					this.once('change:' + notReadyArr[i], $tmpDf.resolve);
					// this.once('change:' + notReadyArr[i], (function () {
					// 	var $cachedDf = $tmpDf;
					// 	return function () {
					// 		$cachedDf.resolve();
					// 	};
					// }()));
				}
				fetchDataFunc();
				$.when.apply($,$dfArr).done(func);
			}
		},

		execOnInitialDataReady: function(func) {
			if(this.dataReady('initialData')) {
				func();
			}
			else {
				this.once('initialData', func);
			}
		},

		getVariationData: function() {
			var self = this;
			var url = PROXY_SERVER + urlTmpl(DPX_URL, {asin: this.get('asin')});

			var $df = $.Deferred();

			getDataOrRetry(url, $.extend({showFeatures:DPX_FEATURES.join()},DPX_DEFAULTS)).done(function(data) {
				var i, ilen, jlen, colorName, imageURL, currentVariation, variations = {};
				self.set('DPX', data);
				if(data && data.twister && data.twister.dimensionList && data.twister.dimensionList.length) {
					for(i=0,ilen=data.twister.dimensionList.length;i<ilen;i++) {
						if(data.twister.dimensionList[i].dimensionDisplayText.toLowerCase()==="color") {
							if(data.twister.dimensionList[i].dimensionValues.length>1) {
								for(j=0,jlen=data.twister.dimensionList[i].dimensionValues.length;j<jlen;j++) {
									colorName = data.twister.dimensionList[i].dimensionValues[j].dimensionValueDisplayText;
									variations[colorName] = data.twister.dimensionList[i].dimensionValues[j];
									imageURL = urlTmpl(IMAGE_THUMB_URL, $.extend({}, data.twister.dimensionList[i].dimensionValues[j].imageAttribute, {width:THUMB_PIXELS_WIDE,height:THUMB_PIXELS_TALL}));
									variations[colorName].imageURL = imageURL;
									variations[colorName].asin = variations[colorName].defaultAsin;
								}
								self.set('variations', variations);
							}
							break;
						}
					}
				}
				if(!self.has('variations')) {
					self.set('variations', false);
				}
				$df.resolve();
			});

			return $df.promise();
		},

		getSimilarItemsSameCategory: function(attribute) {

			var queryAttribute = attribute || 'brand';
			var self = this;

			var $df = $.Deferred();

			var doSimsFetch = function (indexPlusOne) {
				if(indexPlusOne===0) {
					self.set('similar', {});
					$df.resolve();	
					return;
				}

				var browseNode = self.get('browseNode');
				var browseNodeIdxPlusOne = ((typeof indexPlusOne)==="number" ? indexPlusOne : browseNode.length);

				if(browseNode === undefined || browseNode[browseNodeIdxPlusOne - 1] === undefined) {
					debugger;
				}

				var url = PROXY_SERVER +
							SEARCH_URL +
							"{query}" +
							"?pageNumber=1&pageSize=" + PER_PAGE +
							"&node=" + browseNode[browseNodeIdxPlusOne - 1];

				var $dfArray = [];
				var $tmpDf;

				var queries = (self.get('relatedSearchTerms') || []).concat(self.get(queryAttribute));//.map(encodeURIComponent);

				if(queries.length > 1) {
					self.set('similarUsingRelatedSearchTerms', true);
				}

				for(var i=0,len=queries.length;i<len;i++) {
					$tmpDf = $.Deferred();
					$dfArray.push($tmpDf.promise());

					getDataOrRetry(urlTmpl(url,{query:queries[i]}), {}, $tmpDf).done((function () {
						var cachedDf = $tmpDf;
						return function (data) {
							cachedDf.resolve(data.result);
						};
					}()));
				}

				$.when.apply($, $dfArray).done(function () {
					var map = {};
					var totalCount = 0;
					_.each(Array.prototype.slice.call(arguments), function(data, i) {
						removeInsufficientData(data.result);
						totalCount += (data.result ? data.result.length : 0);
						if(data.result && data.result.length) {
							for(var i=data.result.length-1;i>=0;i--) {
								if(data.result[i].variationalParentAsin === self.get('variationalParentAsin')) {
									data.result.splice(i, 1);
								}
								else {
									data.result[i].imageUrl = data.result[i].imageUrl;
								}
							}
						}
						map[decodeURIComponent(queries[i])] = data.result || [];
					});
					if(totalCount >= MINIMUM_SIMILAR_ITEMS || browseNodeIdxPlusOne===1) {
						self.set('similar', map);
						if(NODE_TO_CATEGORY_MAP[browseNode[browseNodeIdxPlusOne - 1]]) {
							self.set('similarNode', NODE_TO_CATEGORY_MAP[browseNode[browseNodeIdxPlusOne - 1]]);
						}
						else {
							self.set('similarNode', self.convertBrowseNodeToCategoryMap());
						}
						$df.resolve();
					}
					else {
						doSimsFetch(browseNodeIdxPlusOne - 1);
					}
				});







				// getDataOrRetry(urlTmpl(url,{query:encodeURIComponent()})).done(function (data) {
				// 	if(data.result && data.result.length >= MINIMUM_SIMILAR_ITEMS) {
				// 		self.set('similar', data.result.filter(function(el){return el.asin!==self.get('asin') && el.asin!==self.get('currentVariation');}));
				// 		$df.resolve();
				// 	} else {
				// 		doSimsFetch(browseNodeIdxPlusOne - 1);
				// 	}
				// });
			};

			this.execOnRequiredData(['browseNode', 'relatedSearchTerms', queryAttribute], doSimsFetch, this.getRelatedSearchTerms.bind(this));

			return $df.promise();
		},

		getSimilarItemsDifferentCategory: function(attribute) {

			var queryAttribute = attribute || 'brand';
			var self = this;

			var $df = $.Deferred();

			var doComplementaryFetch = function (additionalSearch) {
				var cat = self.convertBrowseNodeHierarchyToCategoryMap();

				var url = PROXY_SERVER +
							SEARCH_URL +
							"{query}?pageNumber=1&pageSize=" +
							PER_PAGE +
							"&";

				var $dfArray = [];
				var $tmpDf;

				for(var i=0,ilen=CATEGORY_MAP[cat] ? CATEGORY_MAP[cat].length : 0;i<ilen;i++) {
					var queries = [self.get(queryAttribute)];
					var relatedSearchTerms = self.get('relatedSearchTerms')

					if(additionalSearch && relatedSearchTerms) {
						queries = queries.concat(relatedSearchTerms);
						self.set('complementaryUsingRelatedSearchTerms', true);
					}

					for(var j=0,jlen=queries.length;j<jlen;j++) {
						$tmpDf = $.Deferred();
						$dfArray.push($tmpDf.promise());

						getDataOrRetry(urlTmpl(url,{query:queries[j]}) + CATEGORY_MAP[cat][i], {}, $tmpDf).done((function () {
							var cachedDf = $tmpDf;
							return function (data) {
								if(data.result && data.result.length) {
									for(var i=0,len=data.result.length;i<len;i++) {
										data.result[i].imageUrl = data.result[i].imageUrl;
									}
								}
								cachedDf.resolve(data.result);
							};
						}()));
					}
				}

				$.when.apply($, $dfArray).done(function () {
					var map = {};
					_.each(Array.prototype.slice.call(arguments), function(data, i) {
						removeInsufficientData(data.result);
						if(data.result && data.result.length) {
							map[NODE_TO_CATEGORY_NAME[CATEGORY_MAP[cat][i]]] = data.result;
						}
					});
					if(JSON.stringify(map)!=="{}" || additionalSearch) {
						self.set('complementary', map);
						$df.resolve();
					}
					else {
						doComplementaryFetch(true);
					}
				});
			};

			this.execOnRequiredData(['category', queryAttribute], doComplementaryFetch);

			return $df.promise();
		}

	});
});