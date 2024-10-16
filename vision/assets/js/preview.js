;(function($, window, document, undefined) {
	'use strict';
	
	$(document).ready(function($) {
		var $styles = $('head').find('style');
		$styles.each(function() {
			$(this).remove();
		});
		
		function updateDevice(device, instance) {
			var $canvas = $('#vision-preview-canvas');
			var instance = $('.vision-map').vision('instance');
			
			switch(device) {
				case 'image'  : $canvas.css({'min-width': instance.imageWidth + 'px'}); break;
				case 'desktop': $canvas.css({'min-width':'100%'}); break;
				case 'tablet' : $canvas.css({'min-width':'768px'}); break;
				case 'mobile' : $canvas.css({'min-width':'320px'}); break;
			}
			
			instance.resize();
			
			$('.vision-preview-header').find('.vision-preview-btn').removeClass('vision-active');
			$('.vision-preview-header').find('.vision-preview-btn[data-device="' + device + '"]').addClass('vision-active');
		}
		
		$('.vision-preview-header').on('click', '.vision-preview-btn', function(e) {
			var device = $(this).data('device');
			updateDevice(device);
		});
		
		$('.vision-map').on('vision:ready', function() {
			updateDevice('image');
		});
	});
})(jQuery, window, document);