;(function($, window, document, undefined) {
	'use strict';
	
	$(document).ready(function($) {
		if(window.VISION && window.VISION.WordPressLoaderInit) {
			return;
		} else {
			if(window.VISION) window.VISION.WordPressLoaderInit = true;
			else window.VISION = { WordPressLoaderInit:true };
		}

		var head = document.getElementsByTagName('head').item(0),
		effectsId = 'vision-effects-css',
		$vision_css = $('<link>'),
		$vision_js = $('<script>');
		
		$vision_css.attr({
			'rel' : 'stylesheet',
			'type': 'text/css',
			'href': vision_globals.plugin_base_url + 'vision.css' + '?ver=' + vision_globals.plugin_version
		}).appendTo(head);
		
		$vision_js.appendTo(head); // note: important to add to body first!!!
		$vision_js.on('load', function() {
			if(vision_globals.plan == 'pro') {
				return;
			}
			
			function infobox() {
				var $el = $('.vision-map.vision-ready');
				if($el.length == 0) {
					return false;
				}

				return true;
			}
			
			var timerId = setInterval(function() {
				if(infobox()) {
					clearInterval(timerId);
				}
			}, 3000);
		});
		$vision_js.attr({
			'type': 'text/javascript',
			'src' : vision_globals.plugin_base_url + 'jquery.vision.js' + '?ver=' + vision_globals.plugin_version
		});
		
		//=============================================
		// Item Styles
		//=============================================
		$('.vision-map').each(function(index, el) {
			var jsonSrc = $(el).data('json-src');

			$.ajax({
				url: jsonSrc,
				type: 'GET',
				dataType: 'json',
				contentType: 'application/json',
				headers: { 'X-WP-Nonce': vision_globals.api.nonce },
			}).done(function(data) {
				//=============================================
				// Effects
				//=============================================
				if(data.flags.effects && document.getElementById(effectsId) == null) {
					var $effects_css = $('<link>');
					
					$effects_css.attr({
						'id'  : effectsId,
						'rel' : 'stylesheet',
						'type': 'text/css',
						'href': vision_globals.effects_url + '?ver=' + vision_globals.plugin_version
					}).appendTo(head);
				}
				
				//=============================================
				// Theme
				//=============================================
				if(data.theme && document.getElementById('vision-theme-' + data.theme + '-css') == null) {
					var $theme_css = $('<link>'),
					theme_url = vision_globals.theme_base_url + data.theme + '.css?ver=' + vision_globals.version;
					
					$theme_css.attr({
						'id'  : 'vision-theme-' + data.theme + '-css',
						'rel' : 'stylesheet',
						'type': 'text/css',
						'href': theme_url
					}).appendTo(head);
				}
				
				//=============================================
				// Main & Custom Styles
				//=============================================
				var itemId = $(el).data('item-id');
				
				if(document.getElementById('vision-main-' + itemId + '-css') == null) {
					var $main_css = $('<link>'),
					main_css_url = vision_globals.plugin_upload_base_url + itemId + '/main.css?ver=' + vision_globals.version;
					
					$main_css.attr({
						'id'  : 'vision-main-' + itemId + '-css',
						'rel' : 'stylesheet',
						'type': 'text/css',
						'href': main_css_url
					}).appendTo(head);
				}
				
				if(data.flags.customCSS && document.getElementById('vision-custom-' + itemId + '-css') == null) {
					var $custom_css = $('<link>'),
					custom_css_url = vision_globals.plugin_upload_base_url + itemId + '/custom.css?ver=' + vision_globals.version;
					
					$custom_css.attr({
						'id'  : 'vision-custom-' + itemId + '-css',
						'rel' : 'stylesheet',
						'type': 'text/css',
						'href': custom_css_url
					}).appendTo(head);
				}
			});
		});
	});
})(jQuery, window, document);
