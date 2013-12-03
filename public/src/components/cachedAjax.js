define(['jquery'], function($) {
	var ajaxCache = {};
	return {
		get: function() {
			var $prom, $df;
			var args = Array.prototype.slice.call(arguments,0);
			var cacheKey = JSON.stringify(args);

			var doAjaxRequest = function () {
				ajaxCache[cacheKey] = $prom = $.get.apply($,args).done(function (data) {
					ajaxCache[cacheKey] = data;
				});
			};

			if(!ajaxCache[cacheKey]) {
				doAjaxRequest();
			}
			else if(ajaxCache[cacheKey].state && ajaxCache[cacheKey].state()==="rejected") {
				doAjaxRequest();
			}
			else if(ajaxCache[cacheKey].state && ajaxCache[cacheKey].state()==="pending") {
				$prom = ajaxCache[cacheKey];
			}
			else {
				$df = $.Deferred();
				$df.resolve(ajaxCache[cacheKey]);
				$prom = $df.promise();
			}

			return $prom;
		}
	};
});