/*!
  Vision - jQuery Interactive Image Plugin
  @name jquery.vision.js
  @description jQuery plugin for creating a responsive interactive images
  @version 1.5.2
  @author Max Lawrence
  @site http://avirtum.com
*/

/* Available callbacks
  Callback Name         Description
  onPreInit(config)     called before the vision is loaded & init, but the config is ready
  onLoad                called before firing the ready event, all structures are ready
*/

/* Available events
  Plugin events are sent to notify code of interesting things that have taken place.
  Event Name            Handler
  vision:ready          function(e, plugin)
*/

/* Changelog
  - 1.5.2 /23.03.2023/
  - Mod: close modal on esc

  - 1.5.1 /11.04.2022/
  - Fix: layer triggers "hover" & "focus"

  - 1.5.0 /24.01.2022/
  - New: 'nofollow' attribute for links

  - 1.4.1 /04.04.2021/
  - Fix: website under HTTPS (secured with SSL certificate), but scene images are under HTTP (unsecured)
  
  - 1.4.0 /01.02.2021/
  - Fix: autoHeight & autoWidth layer options
  
  - 1.3.1 /22.09.2020/
  - Fix: fix the text layer type
  
  - 1.3.0 /08.09.2020/
  - Mod: changes in DOM
  
  - 1.2.3 /01.04.2019/
  - Fix: Bug with bodyclick (FireFox, IE)
  
  - 1.2.2 /12.03.2019/
  - Fix: links do not work on firefox
  
  - 1.2.1 /11.03.2019/
  - Fix: tooltips do not show up sometimes
  
  - 1.2.0 /10.03.2019/
  - Fix: popover inbox flickering on hover
  - Fix: markup template for inbox & lightbox popover
  
  - 1.1.1 /28.01.2019/
  - Fix: change the url click handler

  - 1.0.0 /12.09.2018/
  - Initial release
*/

;(function($, window, document, undefined) {
	'use strict';
	
	//=============================================
	// Utils
	//=============================================
	var Utils = {
		getBaseUrl: function() {
			var baseUrl = null,
			scripts = document.getElementsByTagName('script');
			for(var i=0;i<scripts.length;i++) {
				if(/jquery.vision/.test(scripts[i].src)) {
					baseUrl = scripts[i].src.substring(scripts[i].src.lastIndexOf('/'));
					baseUrl = scripts[i].src.replace(baseUrl,'');
					break;
				}
			}
			return baseUrl;
		},
		isMobile: function() {
			return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		},
		transitionEvent: function() {
			var el = document.createElement('fakeelement');
			
			var transitions = {
				'transition': 'transitionend',
				'OTransition': 'otransitionend',
				'MozTransition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			};
			
			for(var i in transitions){
				if (el.style[i] !== undefined){
					return transitions[i];
				}
			}
			
			return null;
		},
		animationEvent: function() {
			var el = document.createElement('fakeelement');
			
			var animations = {
				'animation'      : 'animationend',
				'MSAnimationEnd' : 'msAnimationEnd',
				'OAnimation'     : 'oAnimationEnd',
				'MozAnimation'   : 'mozAnimationEnd',
				'WebkitAnimation': 'webkitAnimationEnd'
			}
			
			for (var i in animations){
				if (el.style[i] !== undefined){
					return animations[i];
				}
			}
			
			return null;
		},
		changeProtocol: function(href) {
			try {
				if(href && typeof URL === 'function') {
					var url = new URL(window.location.href),
					protocol = 'https:';
					if(url.protocol == protocol) {
						url = new URL(href);
						url.protocol = protocol;
						return url.href
					}
				}
			} catch(ex) {};
			
			return href;
		}
	}
	
	//=============================================
	// Data
	//=============================================
	var ITEM_DATA_INSTANCE = 'vision-instance',
	ITEM_DATA_ID = 'vision-id',
	INSTANCE_COUNTER = 0,
	BASE_URL = Utils.getBaseUrl();
	
	function vision($container, config) {
		INSTANCE_COUNTER++;
		
		this.$container = null;
		this.config = null;
		this.controls = {};
		this.imageWidth = 0; // original image width
		this.imageHeight = 0; // original image height
		this.layers = [];
		this.bodyClick = false;
		this.themeClass = null;
		this.lightboxThemeClass = null;
		this.timerIdResize = null;
		this.timerIdScroll = null;
		this.elementZindex = [];
		this.inboxLayer = null;
		this.lightboxLayer = null;
		this.ready = false;
		
		this._init($container, config);
	}
	vision.prototype = {
		VERSION: '1.5.2',
		
		//=============================================
		// Properties & methods (shared for all instances)
		//=============================================
		defaults: {
			theme: 'default',// theme name, you can create your own (see vision.css file, the theme section)
			width: null, // the width of the container  (can be any of valid css units)
			height: null, // the height of the container (can be any of valid css units)
			imgSrc: null, // source for the background image
			delayResize: 50, // default time (ms) for onResize event timeout
			layers: [], // array of layers
			fonts: [],
			className: null, // additional css classes for the container
			onPreInit: null, // callback function(config) {...} fires before the vision is loaded, but the config is ready
			onLoad: null, // callback function() {...} fires after the vision is loaded
		},
		
		defaultsLayer: {
			id: null, // layer ID (allow numbers, chars & specials: "_","-"), should be unique and not empty
			type: null, // layer type
			x: 0, // x position of the layer in %
			y: 0, // y position  of the layer in %
			width: null, // the width of the layer (can be any of valid css units)
			height: null, // the height of the layer (can be any of valid css units)
			angle: null, // defines an angle (deg) that rotates the layer around a fixed point
			autoWidth: false,
			autoHeight: false,
			url: null, // if set, the layer is a url
			urlNewWindow: false, // if set, open url in new window
			urlNoFollow: false,
			scaling: false, // sets the layer scaling depending on the size of the container
			noevents: false, // the layer is never the target of mouse events
			tooltip: null, // specify the config for the tooltip
			popover: null, // specify the config for the popover
			data: null, // the content of the layer
			dataSelector: null, // we will use this selector to fill the content of the layer
			className: null, // additional css classes for the layer which may enable additional styling for example
		},
		
		defaultsTooltip: {
			active: true, // the active state of the tooltip
			placement: 'top', // preferred position of the tooltip
			offset: {top:0, left:0}, // adjust the top & left offset of the tooltip
			width: null, // the width of the tooltip (can be any of valid css unit)
			widthFromCSS: false, // the width of the tooltip will be taken from css
			trigger: 'hover', // the event which causes the tooltip to show, can be: hover, click, clickbody, focus, sticky (will be shown on load)
			followCursor: false, // determines if the tooltip follows the user's mouse cursor while showing (only for the hover trigger)
			scaling: false, // sets the tooltip scaling depending on the size of the container
			interactive: true, // determines if the tooltip should be interactive, i.e. able to be hovered over or clicked without hiding
			smart: false, // determines if the tooltip is placed within the viewport as best it can be if there is not enough space
			showOnInit: false, // automatically show tooltip on load (stickies will be shown anyway)
			showAnimation: null, // the type of show transition animation
			hideAnimation: null, // the type of hide transition animation
			duration: 200, // define animation duration in ms
			data: null, // the content of the tooltip
			dataSelector: null, // we will use this selector to fill the content of the tooltip
			className: null, // additional css classes for the tooltip which may enable additional styling for example
		},
		
		defaultsPopover: {
			active: true, // the active state of the popover
			type: 'tooltip', // preferred type of the popover: tooltip, inbox, lightbox
			placement: 'top', // preferred position of the popover (for the tooltip type)
			offset: {x:0, y:0}, // adjust the x & y offset of the popover (for the tooltip type)
			scaling: false, // only for the popover with type = tooltip
			interactive: true, // determines if the popover should be interactive, i.e. able to be hovered over or clicked without hiding
			smart: true, // determines if the popover is placed within the viewport as best it can be if there is not enough space
			mobileType: 'lightbox', // preferred mobile type of the popover: tooltip, inbox, lightbox
			trigger: 'hover', // values: hover, click, dblclick, focus & touch
			showAnimation: null, // the type of show transition animation
			hideAnimation: null, // the type of hide transition animation
			duration: 300, // define animation duration in ms
			className: null
		},
		
		lightbox: {
			layer: null,
			theme: null,
			controls: {}
		},
		
		//=============================================
		// Private Methods
		//=============================================
		_init: function($container, config) {
			this.$container = $container;
			this.config = config;
			
			this._create();
		},
		
		_create: function() {
			var _self = this;
			function init() {
				_self._buildDOM();
				_self._setTheme(_self.config.theme);
				_self._bind();
				
				_self._initLayers();
				_self._beforeReady();
				_self._updateSize();
				_self._ready();
			}
			
			var image = new Image();
			image.onload = $.proxy(function(xhr) {
				_self.imageWidth = image.width;
				_self.imageHeight = image.height;
				
				setTimeout(init, 300); // wait some time
			}, this);
			image.onerror = $.proxy(function(xhr) {
				console.error('Cannot load image "' + _self.config.imgSrc + '"');
			}, this);
			image.src = _self.config.imgSrc;
		},
		
		_setTheme: function(theme) {
			this.$container.removeClass(this.themeClass);
			
			this.themeClass = (theme ? 'vision-theme-' + theme.toLowerCase() : null),
			this.lightboxThemeClass = (theme ? 'vision-lightbox-theme-' + theme.toLowerCase() : null);
			
			this.$container.addClass(this.themeClass);
		},
		
		_buildDOM: function() {
			this.controls.$image = $('<div>').addClass('vision-image').css({'background-image':'url(' + this.config.imgSrc + ')'});
			this.controls.$stage = $('<div>').addClass('vision-stage');
			this.controls.$layers = $('<div>').addClass('vision-layers');
			this.controls.$tooltips = $('<div>').addClass('vision-tooltips');
			this.controls.$popovers = $('<div>').addClass('vision-popovers');
			this.controls.$lastLayer = $('<div>').addClass('vision-layer-last').attr('tabindex',1);
			
			// Inbox
			this.controls.$inbox = $('<div>').addClass('vision-inbox').addClass('vision-hide').attr('tabindex', 1); // we add tabindex to work focus properly
			this.controls.$inboxInner = $('<div>').addClass('vision-inner');
			this.controls.$inboxForm = $('<div>').addClass('vision-form');
			this.controls.$inboxFrame = $('<div>').addClass('vision-frame');
			this.controls.$inboxClose = $('<div>').addClass('vision-close');
			this.controls.$inbox.append(this.controls.$inboxInner.append(this.controls.$inboxForm.append(this.controls.$inboxFrame, this.controls.$inboxClose)));
			
			// Lightbox (singleton)
			if(!this.lightbox.controls.$lightbox) {
				this.lightbox.controls.$lightbox = $('<div>').addClass('vision-lightbox').addClass('vision-hide').attr('tabindex', 1); // we add tabindex to work focus properly
				this.lightbox.controls.$lightboxInner = $('<div>').addClass('vision-inner');
				this.lightbox.controls.$lightboxForm = $('<div>').addClass('vision-form');
				this.lightbox.controls.$lightboxFrame = $('<div>').addClass('vision-frame');
				this.lightbox.controls.$lightboxClose = $('<div>').addClass('vision-close');
				
				this.lightbox.controls.$lightbox.append(this.lightbox.controls.$lightboxInner.append(this.lightbox.controls.$lightboxForm.append(this.lightbox.controls.$lightboxFrame, this.lightbox.controls.$lightboxClose)));
				$('body').append(this.lightbox.controls.$lightbox);
				
				this.lightbox.controls.$lightboxClose.on('click', $.proxy(this._onLightboxCloseClick, this));
				this.lightbox.controls.$lightbox.on('keydown', $.proxy(this._onLightboxKeyboard, this));
			}
			
			// Main
			this.controls.$stage.append(this.controls.$layers.append(this.controls.$lastLayer), this.controls.$tooltips, this.controls.$popovers);
			this.controls.$image.append(this.controls.$stage);
			
			this.$container.prepend(this.controls.$image, this.controls.$inbox).addClass('vision-map').addClass(this.config.className);
			
			if(this.config.width!=null) {
				this.$container.css({'width': this.config.width});
			}
			
			if(this.config.height!=null) {
				this.$container.css({'height': this.config.height});
			}
			
			// add dynamic fonts
			if(this.config.fonts) {
				for(var i=0;i<this.config.fonts.length;i++) {
					var font = this.config.fonts[i],
					selector = font.replace(new RegExp('[+]|[:]', 'g'),'');
					
					if($('#' + selector).length == 0) {
						var head = document.getElementsByTagName('head')[0],
						linkFont = document.createElement('link');
						
						linkFont.setAttribute('id', selector);
						linkFont.setAttribute('rel', 'stylesheet');
						linkFont.setAttribute('href', 'https://fonts.googleapis.com/css?family=' + font);
						head.appendChild(linkFont);
					}
				}
			}
		},
		
		_bind: function() {
			$(window).on('resize', $.proxy(this._onResize, this));
			$(window).on('scroll', $.proxy(this._onScroll, this));
			$('body').on('click', $.proxy(this._onBodyClickTooltip, this));
			
			this.controls.$lastLayer.on('focus', $.proxy(this._onLastLayerFocus, this));
			
			this.controls.$inboxClose.on('click', $.proxy(this._onInboxCloseClick, this));
			this.controls.$inbox.on('keydown', $.proxy(this._onInboxKeyboard, this));
		},
		
		_unbind: function() {
			$(window).off('resize', $.proxy(this._onResize, this));
			$(window).off('scroll', $.proxy(this._onScroll, this));
			$('body').off('click', $.proxy(this._onBodyClickTooltip, this));
			
			this.controls.$lastLayer.off('focus', $.proxy(this._onLastLayerFocus, this));
			
			this.controls.$inboxClose.off('click', $.proxy(this._onInboxCloseClick, this));
			this.controls.$inbox.off('keydown', $.proxy(this._onInboxKeyboard, this));
		},
		
		_beforeReady: function() {
			this.$container.addClass('vision-before-ready');
			this.$container.get(0).offsetHeight;
			
			if(this.$container.is(':hidden')) {
				this.$container.css('display','block');
			}
			
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				
				// prepare tooltips
				if(!layer.cfg.tooltip.widthFromCSS) {
					var rect = layer.$tooltipData.get(0).getBoundingClientRect(),
					width = (layer.cfg.tooltip.width ? layer.cfg.tooltip.width : rect.width + 1);
					layer.$tooltipData.css({'width':width});
				}
				layer.$tooltipPos.css({'width':'auto'});
				
				// prepare popovers
				if(!layer.cfg.popover.widthFromCSS) {
					var rect = layer.$popover.get(0).getBoundingClientRect(),
					width = (layer.cfg.popover.width ? layer.cfg.popover.width : rect.width + 1);
					layer.$popover.css({'width':width});
				}
				layer.$popoverPos.css({'width':'auto'});
				
				if(layer.cfg.tooltip.showOnInit || layer.cfg.tooltip.trigger == 'sticky') {
					this._showTooltip(layer);
				}
				
				if(layer.cfg.popover.showOnInit) {
					this._showPopover(layer);
				}
			}
			
			this.$container.removeClass('vision-before-ready');
		},
		
		_ready: function() {
			if(this.config.onLoad) {
				var fn = null;
				if(typeof this.config.onLoad == 'string') {
					try {
						fn = new Function(this.config.onLoad);
					} catch(ex) {
						console.error('Can not compile onLoad function: ' + ex.message);
					}
				} else if(typeof this.config.onLoad == 'function') {
					fn = this.config.onLoad;
				}
				
				if(fn) {
					fn.call(this);
				}
			}


			this.$container.addClass('vision-ready');
			this.ready = true;
			this.$container.trigger('vision:ready', [this]);
		},
		
		_destroy: function() {
			this._unbind();
			this.controls.$image.remove();
			this.controls.$inbox.remove();
			this.$container.removeClass('vision-ready').removeClass('vision-map').removeClass(this.config.className);
			this._setTheme(null);
			
			INSTANCE_COUNTER--;
			if(INSTANCE_COUNTER == 0) {
				this.lightbox.controls.$lightbox.remove();
				$('body').removeClass('vision-lightbox-active');
			}
		},
		
		_updateSize: function() {
			var ratio = this.imageHeight / this.imageWidth,
			imageWidth = this.$container.width(),
			imageHeight = (this.config.height==null ? ratio * imageWidth : this.$container.height());
			
			if(this.config.height==null) {
				this.controls.$image.css({'height': imageHeight});
			}
			
			var ratioWidth = imageWidth/this.imageWidth,
			ratioHeight = imageHeight/this.imageHeight;
			
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				
				if(layer.cfg.scaling) {
					layer.$layerZoom.css({'transform':'scale(' + ratioWidth + ',' + ratioHeight + ')'});
				}
				
				if(layer.cfg.tooltip.scaling) {
					layer.$tooltipZoom.css({'transform':'scale(' + ratioWidth + ',' + ratioHeight + ')'});
				}
				
				if(layer.tooltipVisible) {
					this._showTooltip(layer);
				}
				
				if(layer.cfg.popover.scaling && layer.cfg.popover.type == 'tooltip') {
					layer.$popoverZoom.css({'transform':'scale(' + ratioWidth + ',' + ratioHeight + ')'});
					
					if(layer.popoverVisible) {
						this._showPopover(layer);
					}
				}
			}
		},
		
		_updatePlacement: function() {
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				
				if(layer.tooltipVisible) {
					this._showTooltip(layer);
				}
				
				if(layer.popoverVisible) {
					this._showPopover(layer);
				}
			}
		},
		
		_initLayers: function() {
			if(this.config.layers) {
				for(var i=0; i<this.config.layers.length; i++) {
					var layer = this.config.layers[i];
					this._addLayer(layer);
				}
			}
			
			var $store = this.$container.find('.vision-store');
			$store.remove();

			var $placeholder = this.$container.find('.vision-img-placeholder');
			$placeholder.remove();
		},
		
		_addLayer: function(layer) {
			layer.tooltip = $.extend(true, {}, this.defaultsTooltip, layer.tooltip);
			layer.popover = $.extend(true, {}, this.defaultsPopover, layer.popover);
			
			var layer = $.extend(true, {}, this.defaultsLayer, layer),
			$layer = $('<div>').addClass('vision-layer').addClass(layer.className),
			$layerPos = $('<div>').addClass('vision-pos').css({'top':layer.y + '%', 'left':layer.x + '%'}),
			$layerZoom = $('<div>').addClass('vision-zoom'),
			$layerOffset = $('<div>').addClass('vision-offset'),
			$layerBody = $(layer.type == 'link' ? '<a>' : '<div>').addClass('vision-body');
			
			if(!layer.id) {
				layer.id = this.uuid();
			}
			
			if(layer.noevents) {
				$layer.addClass('vision-noevents');
			}
			
			$layer.attr('data-layer-id', layer.id);
			$layer.attr('data-layer-type', layer.type);
			$layer.attr('data-layer-title', layer.title);
			
			if(layer.url) {
				$layer.addClass('vision-url');
			}

			if(layer.type == 'link') {
				$layerBody.addClass('vision-link').attr({
					'href': layer.url,
					'rel': (layer.urlNoFollow ? 'nofollow' : null),
					'target': (layer.urlNewWindow ? '_blank' : null)
				});
			}

			if(layer.tooltip.trigger == 'focus' || layer.popover.trigger == 'focus') {
				$layer.attr('tabindex',1);
			}
			
			if(!layer.autoWidth && layer.width!=null) {
				$layerBody.css({'width':layer.width});
			}
			if(!layer.autoHeight && layer.height!=null) {
				$layerBody.css({'height':layer.height});
			}
			if(layer.angle!=null) {
				$layerBody.css({'transform':'rotate(' + layer.angle + 'deg)'});
			}
			
			if(layer.data) {
				$layerBody.html(layer.data);
			} else if(layer.dataSelector) {
				var $el = $(layer.dataSelector);
				
				if($el.length) {
					$el.detach();
					$layerBody.append($el);
				}
			} else {
				//================================
				// special for wp version
				//================================
				var $el = this.$container.find('.vision-store .vision-layers-data [data-layer-id="' + layer.id + '"]');
				if($el.length) {
					var $data = $el.contents();
					$data.detach();
					$layerBody.append($data);
					$el.remove();
				}
			}
			
			$layer.append($layerPos.append($layerZoom.append($layerOffset.append($layerBody))));
			this.controls.$layers.append($layer);
			
			this.controls.$lastLayer.detach();
			this.controls.$layers.append(this.controls.$lastLayer);
			
			//================================
			// TOOLTIP BEGIN
			var $tooltip = $('<div>').addClass('vision-tooltip').addClass('vision-hide').addClass(layer.tooltip.className),
			$tooltipPos = $('<div>').addClass('vision-pos').css({'top':layer.y + '%', 'left':layer.x + '%'}),
			$tooltipZoom = $('<div>').addClass('vision-zoom'),
			$tooltipOffset = $('<div>').addClass('vision-offset'),
			$tooltipForm = $('<div>').addClass('vision-form'),
			$tooltipArrow = $('<div>').addClass('vision-arrow'),
			$tooltipBody = $('<div>').addClass('vision-body'),
			$tooltipData = $('<div>').addClass('vision-data');
			
			$tooltip.attr('data-layer-id', layer.id);
			
			// set animation duration
			if((layer.tooltip.showAnimation || layer.tooltip.hideAnimation) && layer.tooltip.duration) {
				$tooltipForm.css({
					'animation-duration': layer.tooltip.duration + 'ms',
					'-webkit-animation-duration': layer.tooltip.duration + 'ms'
				});
			}
			
			if(layer.tooltip.data) {
				$tooltipData.html(layer.tooltip.data);
			} else if(layer.tooltip.dataSelector) {
				var $el = $(layer.tooltip.dataSelector);
				if($el.length) {
					$el.detach();
					$tooltipData.append($el);
				}
			} else {
				//================================
				// special for wp version
				//================================
				var $el = this.$container.find('.vision-store .vision-tooltips-data [data-layer-id="' + layer.id + '"]');
				if($el.length) {
					var $data = $el.contents();
					$data.detach();
					$tooltipData.append($data);
					$el.remove();
				}
			}
			
			$tooltip.append($tooltipPos.append($tooltipZoom.append($tooltipOffset.append($tooltipForm.append($tooltipBody.append($tooltipData), $tooltipArrow)))));
			this.controls.$tooltips.append($tooltip);
			// TOOLTIP END
			//================================
			
			//================================
			// POPOVER BEGIN
			var $popover = $('<div>').addClass('vision-popover').addClass('vision-hide').addClass(layer.popover.className),
			$popoverPos = $('<div>').addClass('vision-pos').css({'top':layer.y + '%', 'left':layer.x + '%'}),
			$popoverZoom = $('<div>').addClass('vision-zoom'),
			$popoverOffset = $('<div>').addClass('vision-offset'),
			$popoverForm = $('<div>').addClass('vision-form'),
			$popoverArrow = $('<div>').addClass('vision-arrow'),
			$popoverBody = $('<div>').addClass('vision-body'),
			$popoverData = $('<div>').addClass('vision-data');
			
			$popover.attr('data-layer-id', layer.id);
			
			var popoverType = (Utils.isMobile() ? layer.popover.mobileType : layer.popover.type);
			$popover.attr('data-type', popoverType);
			
			if(layer.popover.data) {
				$popover.html(layer.popover.data);
			} else if(layer.popover.dataSelector) {
				var $el = $(layer.popover.dataSelector);
				if($el.length) {
					$el.detach();
					$popover.append($el);
				}
			} else {
				//================================
				// special for wp version
				//================================
				var $el = this.$container.find('.vision-store .vision-popovers-data [data-layer-id="' + layer.id + '"]');
				if($el.length) {
					var $data = $el.contents();
					$data.detach();
					$popoverData.append($data);
					$el.remove();
				}
			}
			
			$popover.append($popoverPos.append($popoverZoom.append($popoverOffset.append($popoverForm.append($popoverBody.append($popoverData), $popoverArrow)))));
			this.controls.$popovers.append($popover);
			// POPOVER END
			//================================
			
			var layer = {
				$layer: $layer,
				$layerPos: $layerPos,
				$layerZoom: $layerZoom,
				$layerOffset: $layerOffset,
				$layerBody: $layerBody,
				$tooltip: $tooltip,
				$tooltipPos: $tooltipPos,
				$tooltipZoom: $tooltipZoom,
				$tooltipOffset: $tooltipOffset,
				$tooltipForm: $tooltipForm,
				$tooltipBody: $tooltipBody,
				$tooltipData: $tooltipData,
				tooltipVisible: false,
				$popover: $popover,
				$popoverPos: $popoverPos,
				$popoverZoom: $popoverZoom,
				$popoverOffset: $popoverOffset,
				$popoverForm: $popoverForm,
				$popoverBody: $popoverBody,
				$popoverData: $popoverData,
				popoverVisible: false,
				cfg: layer
			};
			
			this._bindLayer(layer);
			this.layers.push(layer);
			
			this._updateBodyClick();
			
			return layer.id;
		},
		
		_bindLayer: function(layer) {
			if(layer.cfg.url && layer.cfg.type != 'link') {
				layer.$layer.on('click', $.proxy(this._onLayerClickLink, this, layer));
			}
			
			switch(layer.cfg.tooltip.trigger) {
				case 'hover': {
					layer.$layer.on('mouseenter', $.proxy(this._onLayerEnterTooltip, this, layer));
					layer.$layer.on('mouseleave', $.proxy(this._onLayerLeaveTooltip, this, layer));
					
					if(Utils.isMobile()) {
						layer.$layer.on('focus', $.proxy(this._onLayerFocusTooltip, this, layer)); //???
						layer.$layer.on('blur', $.proxy(this._onLayerBlurTooltip, this, layer));
					}
				} break;
				case 'focus': {
					layer.$layer.on('focus', $.proxy(this._onLayerFocusTooltip, this, layer));
					layer.$layer.on('blur', $.proxy(this._onLayerBlurTooltip, this, layer));
				} break;
				case 'click':
				case 'clickbody': {
					layer.$layer.on('click', $.proxy(this._onLayerClickTooltip, this, layer));
				} break;
			}
			
			switch(layer.cfg.popover.trigger) {
				case 'hover': {
					layer.$layer.on('mouseenter', $.proxy(this._onLayerEnterPopover, this, layer));
					//layer.$layer.on('mouseleave', $.proxy(this._onLayerLeavePopover, this, layer)); // fix for popovers
					
					if(Utils.isMobile()) {
						layer.$layer.on('focus', $.proxy(this._onLayerFocusPopover, this, layer));
						layer.$layer.on('blur', $.proxy(this._onLayerBlurPopover, this, layer));
					}
				} break;
				case 'focus': {
					layer.$layer.on('focus', $.proxy(this._onLayerFocusPopover, this, layer));
					layer.$layer.on('blur', $.proxy(this._onLayerBlurPopover, this, layer));
				} break;
				case 'click': {
					layer.$layer.on('click', $.proxy(this._onLayerClickPopover, this, layer));
				} break;
				case 'dblclick': {
					layer.$layer.on('dblclick', $.proxy(this._onLayerClickPopover, this, layer));
				} break;
			}
		},
		
		_deleteLayer: function(layerIndex) {
			if(layerIndex>=0 && layerIndex<this.layers.length) {
				var layer = this.layers[layerIndex];
				
				layer.$layer.remove();
				layer.$tooltip.remove();
				
				this.layers.splice(layerIndex, 1);
				
				return true;
			}
			return false;
		},
		
		_updateBodyClick: function() {
			this.bodyClick = false;
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				if(layer.cfg.tooltip.trigger == 'clickbody' || layer.cfg.tooltip.trigger == 'focus') {
					this.bodyClick = true;
					break;
				}
			}
		},
		
		_getViewportOffset: function($el) {
			var $window = $(window),
			scrollLeft = $window.scrollLeft(),
			scrollTop = $window.scrollTop(),
			rect = $el.get(0).getBoundingClientRect(),
			offset = $el.offset();
			
			return {
				left: offset.left - scrollLeft,
				top: offset.top - scrollTop,
				bottom: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - offset.top + scrollTop - rect.height,
				right: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - offset.left + scrollLeft - rect.width
			};
		},
		
		_showTooltip: function(layer, animate, placement, force) {
			if(!layer.cfg.tooltip.active) {
				return;
			}
			
			var ratio = this.imageHeight / this.imageWidth,
			imageWidth = this.$container.width(),
			imageHeight = (this.config.height==null ? ratio * imageWidth : this.$container.height()),
			ratioWidth = imageWidth/this.imageWidth,
			ratioHeight = imageHeight/this.imageHeight,
			offsetTop  = (layer.cfg.tooltip.trigger == 'hover' && layer.cfg.tooltip.followCursor ? 5 : layer.cfg.height * (layer.cfg.scaling && !layer.cfg.tooltip.scaling ? ratioHeight : 1)/2),
			offsetLeft = (layer.cfg.tooltip.trigger == 'hover' && layer.cfg.tooltip.followCursor ? 5 : layer.cfg.width  * (layer.cfg.scaling && !layer.cfg.tooltip.scaling ? ratioWidth  : 1)/2),
			marginTop = layer.cfg.tooltip.offset.top,
			marginLeft = layer.cfg.tooltip.offset.left;
			
			animate = animate || false;
			placement = placement || layer.cfg.tooltip.placement;
			force = force || false;
			
			layer.$tooltip.removeClass(layer.$tooltip.data('placement'));
			if(placement) {
				layer.$tooltip.addClass('vision-' + placement).data('placement', 'vision-' + placement);
			}
			
			switch(placement) {
				case 'top': {
					offsetTop  = -offsetTop;
					offsetLeft = 0;
				} break;
				case 'right': {
					offsetTop  = 0;
					offsetLeft = offsetLeft;
				} break;
				case 'bottom': {
					offsetTop  = offsetTop;
					offsetLeft = 0;
				} break;
				case 'left': {
					offsetTop  =  0;
					offsetLeft = -offsetLeft;
				} break;
				case 'top-left': {
					offsetTop  = -offsetTop;
					offsetLeft = -offsetLeft;
				} break;
				case 'top-right': {
					offsetTop  = -offsetTop;
					offsetLeft =  offsetLeft;
				} break;
				case 'right-top': {
					offsetTop  = -offsetTop;
					offsetLeft =  offsetLeft;
				} break;
				case 'right-bottom': {
					offsetTop  =  offsetTop;
					offsetLeft =  offsetLeft;
				} break;
				case 'bottom-left': {
					offsetTop  =  offsetTop;
					offsetLeft = -offsetLeft;
				} break;
				case 'bottom-right': {
					offsetTop  =  offsetTop;
					offsetLeft =  offsetLeft;
				} break;
				case 'left-top': {
					offsetTop  = -offsetTop;
					offsetLeft = -offsetLeft;
				} break;
				case 'left-bottom': {
					offsetTop  =  offsetTop;
					offsetLeft = -offsetLeft;
				} break;
				default: {
					offsetTop = offsetLeft = (layer.cfg.tooltip.followCursor ? 5 : 0);
				}
				break;
			}
			layer.$tooltipOffset.css({'margin-top':offsetTop, 'margin-left':offsetLeft});
			
			if(layer.cfg.tooltip.followCursor && layer.cfg.tooltip.trigger == 'hover') {
				layer.$layer.on('mousemove', $.proxy(this._onLayerMouseMoveTooltip, this, layer));
				//layer.$tooltip.on('mousemove', $.proxy(this._onTooltipMouseMove, this, layer));
				layer.$tooltip.addClass('vision-noevents-hard');
			}
			
			layer.$tooltipPos.css({'top':layer.cfg.y + '%','left':layer.cfg.x + '%','margin-top':marginTop,'margin-left':marginLeft});
			
			if(!layer.tooltipVisible) {
				layer.tooltipVisible = true;
				layer.$tooltip.addClass('vision-show').removeClass('vision-hide');
				
				var zindex = (this.elementZindex.length > 0 ? Math.max.apply(null, this.elementZindex) + 1 : 1);
				this.elementZindex.push(zindex);
				layer.$tooltipPos.css('z-index', zindex);
				
				if(animate && layer.cfg.tooltip.showAnimation) {
					layer.$tooltipForm.removeClass(layer.cfg.tooltip.showAnimation).removeClass(layer.cfg.tooltip.hideAnimation);
					layer.$tooltipForm.addClass(layer.cfg.tooltip.showAnimation);
					
					layer.$tooltipForm.one(Utils.animationEvent(), $.proxy(function(layer, e) {
						var $tooltipForm = $(e.target);
						$tooltipForm.removeClass(layer.cfg.tooltip.showAnimation);
					}, this, layer));
				}
			}
			
			if(!force && layer.cfg.tooltip.smart) {
				var layerOffset = this._getViewportOffset(layer.$layerOffset),
				tooltipOffset = this._getViewportOffset(layer.$tooltipOffset),
				layerRect = layer.$layerOffset.get(0).getBoundingClientRect(),
				tooltipRect = layer.$tooltipOffset.get(0).getBoundingClientRect();
				
				switch(placement) {
					case 'top-left': {
						if(tooltipOffset.right<0) {
							if(layerOffset.left + layerRect.width - tooltipRect.width > 0) {
								placement = placement.replace('-left', '-right');
							} else {
								placement = placement.replace('-left', '');
							}
						}
						if(tooltipOffset.top<0) {
							placement = placement.replace('top', 'bottom');
						}
					} break;
					case 'top': {
						if(tooltipOffset.right<0) {
							if(layerOffset.left + layerRect.width - tooltipRect.width > 0) {
								placement = placement + '-right';
							}
						}
						if(tooltipOffset.left<0) {
							if(layerOffset.right + layerRect.width - tooltipRect.width > 0) {
								placement = placement + '-left';
							}
						}
						if(tooltipOffset.top<0) {
							placement = placement.replace('top', 'bottom');
						}
					} break;
					case 'top-right': {
						if(tooltipOffset.left<0) {
							if(layerOffset.right + layerRect.width - tooltipRect.width > 0) {
								placement = placement.replace('-right', '-left');
							} else {
								placement = placement.replace('-right', '');
							}
						}
						if(tooltipOffset.top<0) {
							placement = placement.replace('top', 'bottom');
						}
					} break;
					case 'right-top': {
						if(tooltipOffset.top<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement.replace('-top', '-bottom');
							}
						}
						if(tooltipOffset.right<0) {
							placement = placement.replace('right', 'left');
						}
					} break;
					case 'right': {
						if(tooltipOffset.top<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement + '-bottom';
							} else {
								placement = placement + '-top';
							}
						}
						if(tooltipOffset.bottom<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement + '-top';
							} else {
								placement = placement + '-bottom';
							}
						}
						if(tooltipOffset.right<0) {
							placement = placement.replace('right', 'left');
						}
					} break;
					case 'right-bottom': {
						if(tooltipOffset.bottom<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement.replace('-bottom', '-top');
							}
						}
						if(tooltipOffset.right<0) {
							placement = placement.replace('right', 'left');
						}
					} break;
					case 'bottom-right': {
						if(tooltipOffset.left<0) {
							if(layerOffset.right + layerRect.width - tooltipRect.width > 0) {
								placement = placement.replace('-right', '-left');
							} else {
								placement = placement.replace('-right', '');
							}
						}
						if(tooltipOffset.bottom<0) {
							placement = placement.replace('bottom', 'top');
						}
					} break;
					case 'bottom': {
						if(tooltipOffset.right<0) {
							if(layerOffset.left + layerRect.width - tooltipRect.width > 0) {
								placement = placement + '-right';
							}
						}
						if(tooltipOffset.left<0) {
							if(layerOffset.right + layerRect.width - tooltipRect.width > 0) {
								placement = placement + '-left';
							}
						}
						if(tooltipOffset.top<0) {
							placement = placement.replace('bottom', 'top');
						}
					} break;
					case 'bottom-left': {
						if(tooltipOffset.right<0) {
							if(layerOffset.left + layerRect.width - tooltipRect.width > 0) {
								placement = placement.replace('-left', '-right');
							} else {
								placement = placement.replace('-left', '');
							}
						}
						if(tooltipOffset.bottom<0) {
							placement = placement.replace('bottom', 'top');
						}
					} break;
					case 'left-bottom': {
						if(tooltipOffset.bottom<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement.replace('-bottom', '-top');
							}
						}
						if(tooltipOffset.left<0) {
							placement = placement.replace('left', 'right');
						}
					} break;
					case 'left': {
						if(tooltipOffset.top<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement + '-bottom';
							} else {
								placement = placement + '-top';
							}
						}
						if(tooltipOffset.bottom<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement + '-top';
							} else {
								placement = placement + '-bottom';
							}
						}
						if(tooltipOffset.left<0) {
							placement = placement.replace('left', 'right');
						}
					} break;
					case 'left-top': {
						if(tooltipOffset.top<0) {
							if(layerRect.height > tooltipRect.height) {
								placement = placement.replace('-top', '-bottom');
							}
						}
						if(tooltipOffset.left<0) {
							placement = placement.replace('left', 'right');
						}
					} break;
				}
				this._showTooltip(layer, false, placement, true);
			}
		},
		
		_hideTooltip: function(layer) {
			layer.$layer.off('mousemove', $.proxy(this._onLayerMouseMoveTooltip, layer, this));
			layer.$tooltip.removeClass('vision-noevents-hard');
			
			if(layer.tooltipVisible) {
				layer.tooltipVisible = false;
				
				if(layer.cfg.tooltip.hideAnimation) {
					layer.$tooltipForm.removeClass(layer.cfg.tooltip.showAnimation).removeClass(layer.cfg.tooltip.hideAnimation);
					layer.$tooltipForm.addClass(layer.cfg.tooltip.hideAnimation);
					
					layer.$tooltipForm.one(Utils.animationEvent(), $.proxy(function(layer, e) {
						var $tooltipForm = $(e.target);
						$tooltipForm.removeClass(layer.cfg.tooltip.hideAnimation);
						if(!layer.tooltipVisible) {
							this.__hideTooltip(layer);
						}
					}, this, layer));
				} else {
					this.__hideTooltip(layer);
				}
			}
		},
		
		__hideTooltip: function(layer) {
			layer.$tooltip.addClass('vision-hide').removeClass('vision-show');
			layer.$tooltip.removeClass(layer.$tooltip.data('placement'));
			
			var index = this.elementZindex.indexOf(parseInt(layer.$tooltipPos.css('z-index'),10));
			if(index > -1) {this.elementZindex.splice(index, 1);}
			layer.$tooltipPos.css('z-index','');
			
			// if we want to disable media content fully
			layer.$tooltipData.detach();
			layer.$tooltipData.get(0).offsetHeight;
			layer.$tooltipData.appendTo(layer.$tooltipBody);
		},
		
		_onLayerClickLink: function(layer, e) {
			if(layer.cfg.url) {
				window.open(layer.cfg.url, (layer.cfg.urlNewWindow ? '_blank' : '_self'));
				/*
				var $link = $('<a>');
				$link.attr({
					'href': layer.cfg.url,
					'target': (layer.cfg.urlNewWindow ? '_blank' : '_self'),
					'rel': 'nofollow',
					'style': 'display:none'
				}).appendTo($('body'));
				$link.get(0).click();
				setTimeout(function() {
					$link.remove();
				},1000);
				*/
			}
		},
		
		_onLayerEnterTooltip: function(layer, e) {
			this._showTooltip(layer, true);
		},
		
		_onLayerLeaveTooltip: function(layer, e) {
			var from = e.relatedTarget || e.toElement;
			
			if((!layer.cfg.tooltip.interactive || layer.$tooltip.has(from).length === 0 && !layer.$tooltip.is(from)) && !layer.$layer.is(from) ) {
				this._hideTooltip(layer);
			} else {
				layer.$tooltip.one('mouseleave', $.proxy(this._onLayerLeaveTooltip, this, layer));
			}
		},
		
		_onLayerMouseMoveTooltip: function(layer, e) {
			var rc = this.controls.$stage.get(0).getBoundingClientRect(),
			y = ((e.clientY - rc.y) / rc.height)*100,
			x = ((e.clientX - rc.x) / rc.width)*100;
			
			layer.$tooltipPos.css({'top':y + '%', 'left':x + '%'});
		},
		
		_onLayerFocusTooltip: function(layer, e) {
			this._showTooltip(layer, true);
		},
		
		_onLayerBlurTooltip: function(layer, e) {
			this._hideTooltip(layer);
		},
		
		_onLayerClickTooltip: function(layer, e) {
			if(layer.tooltipVisible) {
				this._hideTooltip(layer);
			} else {
				this._showTooltip(layer, true);
			}
		},
		
		_onBodyClickTooltip: function(e) {
			if(!this.bodyClick) {
				return;
			}
			
			var from = e.target || e.relatedTarget || e.toElement;
			
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				
				if(layer.$layer.has(from).length > 0 || layer.$layer.is(from)) {
					continue;
				}
				
				if(layer.tooltipVisible && (layer.cfg.tooltip.trigger == 'clickbody' || (layer.cfg.tooltip.trigger == 'focus' && !layer.$layer.is(':focus')))) {
					if(layer.tooltipVisible && (!layer.cfg.tooltip.interactive || layer.$tooltip.has(from).length === 0 && !layer.$tooltip.is(from))) {
						this._hideTooltip(layer);
					}
				}
			}
		},
		
		_onLastLayerFocus: function(e) {
			if(this.layers.length) {
				this.layers[0].$layer.focus();
			}
		},
		
		_showPopover: function(layer, animate, placement, force) {
			if(!layer || !layer.cfg.popover.active) {
				return;
			}
			
			var popoverType = (Utils.isMobile() ? layer.cfg.popover.mobileType : layer.cfg.popover.type);
			
			if(popoverType == 'tooltip') {
				var ratio = this.imageHeight / this.imageWidth,
				imageWidth = this.$container.width(),
				imageHeight = (this.config.height==null ? ratio * imageWidth : this.$container.height()),
				ratioWidth = imageWidth/this.imageWidth,
				ratioHeight = imageHeight/this.imageHeight,
				offsetTop  = (layer.cfg.height * (layer.cfg.scaling && !layer.cfg.popover.scaling ? ratioHeight : 1)/2),
				offsetLeft = (layer.cfg.width  * (layer.cfg.scaling && !layer.cfg.popover.scaling ? ratioWidth  : 1)/2),
				marginTop = layer.cfg.popover.offset.top,
				marginLeft = layer.cfg.popover.offset.left;
				
				animate = animate || false;
				placement = placement || layer.cfg.popover.placement;
				force = force || false;
				
				layer.$popover.removeClass(layer.$popover.data('placement'));
				if(placement) {
					layer.$popover.addClass('vision-' + placement).data('placement', 'vision-' + placement);
				}
				
				switch(placement) {
					case 'top-left': {
						offsetTop  = -offsetTop;
						offsetLeft = -offsetLeft;
					} break;
					case 'top': {
						offsetTop  = -offsetTop;
						offsetLeft = 0;
					} break;
					case 'top-right': {
						offsetTop  = -offsetTop;
						offsetLeft =  offsetLeft;
					} break;
					case 'right-top': {
						offsetTop  = -offsetTop;
						offsetLeft =  offsetLeft;
					} break;
					case 'right': {
						offsetTop  = 0;
						offsetLeft = offsetLeft;
					} break;
					case 'right-bottom': {
						offsetTop  =  offsetTop;
						offsetLeft =  offsetLeft;
					} break;
					case 'bottom-right': {
						offsetTop  =  offsetTop;
						offsetLeft =  offsetLeft;
					} break;
					case 'bottom': {
						offsetTop  = offsetTop;
						offsetLeft = 0;
					} break;
					case 'bottom-left': {
						offsetTop  =  offsetTop;
						offsetLeft = -offsetLeft;
					} break;
					case 'left-bottom': {
						offsetTop  =  offsetTop;
						offsetLeft = -offsetLeft;
					} break;
					case 'left': {
						offsetTop  =  0;
						offsetLeft = -offsetLeft;
					} break;
					case 'left-top': {
						offsetTop  = -offsetTop;
						offsetLeft = -offsetLeft;
					} break;
					default: {
						offsetTop = offsetLeft = 0;
					}
					break;
				}
				layer.$popoverOffset.css({'margin-top':offsetTop, 'margin-left':offsetLeft});
				layer.$popoverPos.css({'top':layer.cfg.y + '%','left':layer.cfg.x + '%','margin-top':marginTop,'margin-left':marginLeft});
				
				if(!layer.popoverVisible) {
					layer.popoverVisible = true;
					layer.$popover.addClass('vision-show').removeClass('vision-hide');
					
					var zindex = (this.elementZindex.length > 0 ? Math.max.apply(null, this.elementZindex) + 1 : 1);
					this.elementZindex.push(zindex);
					layer.$popoverPos.css('z-index', zindex);
				}
				
				if(!force && layer.cfg.popover.smart) {
					var layerOffset = this._getViewportOffset(layer.$layerOffset),
					popoverOffset = this._getViewportOffset(layer.$popoverOffset),
					layerRect = layer.$layerOffset.get(0).getBoundingClientRect(),
					popoverRect = layer.$popoverOffset.get(0).getBoundingClientRect();
					
					switch(placement) {
						case 'top-left': {
							if(popoverOffset.right<0) {
								if(layerOffset.left + layerRect.width - popoverRect.width > 0) {
									placement = placement.replace('-left', '-right');
								} else {
									placement = placement.replace('-left', '');
								}
							}
							if(popoverOffset.top<0) {
								placement = placement.replace('top', 'bottom');
							}
						} break;
						case 'top': {
							if(popoverOffset.right<0) {
								if(layerOffset.left + layerRect.width - popoverRect.width > 0) {
									placement = placement + '-right';
								}
							}
							if(popoverOffset.left<0) {
								if(layerOffset.right + layerRect.width - popoverRect.width > 0) {
									placement = placement + '-left';
								}
							}
							if(popoverOffset.top<0) {
								placement = placement.replace('top', 'bottom');
							}
						} break;
						case 'top-right': {
							if(popoverOffset.left<0) {
								if(layerOffset.right + layerRect.width - popoverRect.width > 0) {
									placement = placement.replace('-right', '-left');
								} else {
									placement = placement.replace('-right', '');
								}
							}
							if(popoverOffset.top<0) {
								placement = placement.replace('top', 'bottom');
							}
						} break;
						case 'right-top': {
							if(popoverOffset.top<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement.replace('-top', '-bottom');
								}
							}
							if(popoverOffset.right<0) {
								placement = placement.replace('right', 'left');
							}
						} break;
						case 'right': {
							if(popoverOffset.top<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement + '-bottom';
								} else {
									placement = placement + '-top';
								}
							}
							if(popoverOffset.bottom<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement + '-top';
								} else {
									placement = placement + '-bottom';
								}
							}
							if(popoverOffset.right<0) {
								placement = placement.replace('right', 'left');
							}
						} break;
						case 'right-bottom': {
							if(popoverOffset.bottom<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement.replace('-bottom', '-top');
								}
							}
							if(popoverOffset.right<0) {
								placement = placement.replace('right', 'left');
							}
						} break;
						case 'bottom-right': {
							if(popoverOffset.left<0) {
								if(layerOffset.right + layerRect.width - popoverRect.width > 0) {
									placement = placement.replace('-right', '-left');
								} else {
									placement = placement.replace('-right', '');
								}
							}
							if(popoverOffset.bottom<0) {
								placement = placement.replace('bottom', 'top');
							}
						} break;
						case 'bottom': {
							if(popoverOffset.right<0) {
								if(layerOffset.left + layerRect.width - popoverRect.width > 0) {
									placement = placement + '-right';
								}
							}
							if(popoverOffset.left<0) {
								if(layerOffset.right + layerRect.width - popoverRect.width > 0) {
									placement = placement + '-left';
								}
							}
							if(popoverOffset.top<0) {
								placement = placement.replace('bottom', 'top');
							}
						} break;
						case 'bottom-left': {
							if(popoverOffset.right<0) {
								if(layerOffset.left + layerRect.width - popoverRect.width > 0) {
									placement = placement.replace('-left', '-right');
								} else {
									placement = placement.replace('-left', '');
								}
							}
							if(popoverOffset.bottom<0) {
								placement = placement.replace('bottom', 'top');
							}
						} break;
						case 'left-bottom': {
							if(popoverOffset.bottom<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement.replace('-bottom', '-top');
								}
							}
							if(popoverOffset.left<0) {
								placement = placement.replace('left', 'right');
							}
						} break;
						case 'left': {
							if(popoverOffset.top<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement + '-bottom';
								} else {
									placement = placement + '-top';
								}
							}
							if(popoverOffset.bottom<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement + '-top';
								} else {
									placement = placement + '-bottom';
								}
							}
							if(popoverOffset.left<0) {
								placement = placement.replace('left', 'right');
							}
						} break;
						case 'left-top': {
							if(popoverOffset.top<0) {
								if(layerRect.height > popoverRect.height) {
									placement = placement.replace('-top', '-bottom');
								}
							}
							if(popoverOffset.left<0) {
								placement = placement.replace('left', 'right');
							}
						} break;
					}
					this._showPopover(layer, false, placement, true);
				}
			} else if(popoverType == 'inbox') {
				this._showPopoverInbox(layer);
			} else if(popoverType == 'lightbox') {
				this._showPopoverLightbox(layer);
			}
		},
		
		_hidePopover: function(layer) {
			if(!layer) {
				return;
			}
			
			var popoverType = (Utils.isMobile() ? layer.cfg.popover.mobileType : layer.cfg.popover.type);
			switch(popoverType) {
				case 'tooltip' : { this.__hidePopover(layer); } break;
				case 'inbox'   : { this._hidePopoverInbox(); } break;
				case 'lightbox': { this._hidePopoverLightbox(); } break;
			}
		},
		
		__hidePopover: function(layer) {
			if(!layer.popoverVisible) {
				return;
			}
			layer.popoverVisible = false;
			
			layer.$popover.addClass('vision-hide').removeClass('vision-show');
			layer.$popover.removeClass(layer.$popover.data('placement'));
			
			var index = this.elementZindex.indexOf(parseInt(layer.$popoverPos.css('z-index'),10));
			if(index > -1) {this.elementZindex.splice(index, 1);}
			layer.$popoverPos.css('z-index','');
			
			// if we want to disable media content fully
			layer.$popoverData.detach();
			layer.$popoverData.get(0).offsetHeight;
			layer.$popoverData.appendTo(layer.$popoverBody);
		},
		
		_onLayerEnterPopover: function(layer, e) {
			this._showPopover(layer, true);
		},
		
		_onLayerLeavePopover: function(layer, e) {
			var from = e.relatedTarget || e.toElement;
			
			if((!layer.cfg.popover.interactive || layer.$popover.has(from).length === 0 && !layer.$popover.is(from)) && !layer.$layer.is(from) ) {
				this._hidePopover(layer);
			} else {
				layer.$popover.one('mouseleave', $.proxy(this._onLayerLeavePopover, this, layer));
			}
		},
		
		_onLayerFocusPopover: function(layer, e) {
			this._showPopover(layer, true);
		},
		
		_onLayerBlurPopover: function(layer, e) {
			this._hidePopover(layer);
		},
		
		_onLayerClickPopover: function(layer, e) {
			if(layer.popoverVisible) {
				this._hidePopover(layer);
			} else {
				this._showPopover(layer, true);
			}
		},
		
		_onInboxCloseClick: function(e) {
			this._hidePopoverInbox();
		},
		
		_onInboxKeyboard: function(e) {
			if(e.keyCode === 27) { // ESC
				this._hidePopoverInbox();
				return;
			}
		},
		
		_onLightboxCloseClick: function(e) {
			this._hidePopoverLightbox();
		},
		
		_onLightboxKeyboard: function(e) {
			if(e.keyCode === 27) { // ESC
				this._hidePopoverLightbox();
				return;
			}
		},
		
		_showPopoverInbox: function(layer) {
			if(this.inboxLayer) {
				this._hidePopover(this.inboxLayer);
			}
			this.inboxLayer = layer;
			
			this.inboxLayer.$popoverData.detach();
			
			var style = this.inboxLayer.$popoverData.attr('style');
			this.inboxLayer.$popoverData.data('style', style);
			this.inboxLayer.$popoverData.attr('style', '');
			
			this.controls.$inbox.addClass(this.inboxLayer.cfg.popover.className);
			this.controls.$inboxFrame.append(layer.$popoverData);
			this.controls.$inboxFrame.get(0).offsetHeight; // repaint
			
			if(this.controls.$inboxFrame.height() > this.controls.$inboxForm.height()) {
				this.controls.$inboxForm.addClass('vision-inbox-form-overflow');
			}
			
			this.controls.$inbox.addClass('vision-show').removeClass('vision-hide').focus();
		},
		
		_hidePopoverInbox: function() {
			if(this.inboxLayer) {
				this.inboxLayer.$popoverData.detach();
				
				var style = this.inboxLayer.$popoverData.data('style');
				this.inboxLayer.$popoverData.attr('style', style);
				this.inboxLayer.$popoverData.data('style', '');
				
				this.controls.$inbox.removeClass(this.inboxLayer.cfg.popover.className);
				this.inboxLayer.$popoverBody.append(this.inboxLayer.$popoverData);
				
				this.inboxLayer = null;
			}
			
			this.controls.$inbox.addClass('vision-hide').removeClass('vision-show');
			this.controls.$inboxForm.removeClass('vision-inbox-form-overflow');
		},
		
		_showPopoverLightbox: function(layer) {
			this._hidePopoverLightbox();
			
			this.lightbox.layer = layer;
			this.lightbox.theme = this.lightboxThemeClass;
			
			this.lightbox.layer.$popoverData.detach();
			
			var style = this.lightbox.layer.$popoverData.attr('style');
			this.lightbox.layer.$popoverData.data('style', style);
			this.lightbox.layer.$popoverData.attr('style', '');
			
			this.lightbox.controls.$lightbox.addClass(this.lightbox.layer.cfg.popover.className).addClass(this.lightbox.theme);
			this.lightbox.controls.$lightboxFrame.append(this.lightbox.layer.$popoverData);
			this.lightbox.controls.$lightboxFrame.get(0).offsetHeight;
			
			if(this.lightbox.controls.$lightboxFrame.height() > this.lightbox.controls.$lightboxForm.height()) {
				this.lightbox.controls.$lightboxForm.addClass('vision-lightbox-form-overflow');
			}
			
			this.lightbox.controls.$lightbox.addClass('vision-show').removeClass('vision-hide').focus();
			$('body').addClass('vision-lightbox-active');
		},
		
		_hidePopoverLightbox: function() {
			$('body').removeClass('vision-lightbox-active');
			this.lightbox.controls.$lightbox.removeClass(this.lightbox.theme).addClass('vision-hide').removeClass('vision-show');
			this.lightbox.controls.$lightboxForm.removeClass('vision-lightbox-form-overflow');
			this.lightbox.theme = null;
			
			if(this.lightbox.layer) {
				this.lightbox.layer.$popoverData.detach();
				
				var style = this.lightbox.layer.$popoverData.data('style');
				this.lightbox.layer.$popoverData.attr('style', style);
				this.lightbox.layer.$popoverData.data('style', '');
				
				this.lightbox.controls.$lightbox.removeClass(this.lightbox.layer.cfg.popover.className);
				this.lightbox.layer.$popoverBody.append(this.lightbox.layer.$popoverData);
				
				this.lightbox.layer = null;
			}
		},
		
		_onResize: function() {
			if(this.ready) {
				var _self = this;
				
				clearTimeout(this.timerIdResize);
				this.timerIdResize = setTimeout(function() {_self._updateSize();}, this.config.delayResize);
			}
		},
		
		_onScroll: function() {
			if(this.ready) {
				var _self = this;
				
				clearTimeout(this.timerIdScroll);
				this.timerIdScroll = setTimeout(function() {_self._updatePlacement();}, 100);
			}
		},
		//=============================================
		// Public Methods
		//=============================================
		uuid: function(limit) {
			var result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
			
			return (limit > 0 ? result.substring(0,limit) : result);
		},
		
		setTheme: function(theme) {
			this._setTheme(theme);
		},
		
		addLayer: function(layer) {
			return this._addLayer(layer);
		},
		
		getLayer: function(layerId) {
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				if(layer.cfg.id == layerId) {
					return layer;
				}
			}
			return null;
		},
		
		deleteLayer: function(layerId) {
			for(var i=0;i<this.layers.length;i++) {
				var layer = this.layers[i];
				if(layer.cfg.id == layerId) {
					return this._deleteLayer(i)
				}
			}
			return false;
		},
		
		showPopover: function(layerId) {
			var layer = this.getLayer(layerId);
			layer && this._showPopover(layer);
		},
		
		hidePopover: function(layerId) {
			var layer = this.getLayer(layerId);
			layer && this._hidePopover(layer);
		},
		
		showTooltip: function(layerId, animate, placement, force) {
			var layer = this.getLayer(layerId);
			layer && this._showTooltip(layer, animate, placement, force);
		},
		
		hideTooltip: function(layerId) {
			var layer = this.getLayer(layerId);
			layer && this._hideTooltip(layer);
		},
		
		resize: function() {
			this._updateSize();
		}
	}
	
	//=============================================
	// Init jQuery Plugin
	//=============================================
	/**
	 * @param CfgOrCmd - config object or command name
	 * @param CmdArgs - some commands may require an argument
	 * List of methods:
	 * $("#vision").vision("destroy")
	 * $("#vision").vision("instance")
	 */
	$.fn.vision = function(CfgOrCmd, CmdArgs) {
		if (CfgOrCmd == 'instance') {
			var $container = $(this),
			instance = $container.data(ITEM_DATA_INSTANCE);
			
			if (!instance) {
				console.error('Calling "instance" method on not initialized instance is forbidden');
				return;
			}
			
			return instance;
		}
		
		return this.each(function() {
			var $container = $(this),
			instance = $container.data(ITEM_DATA_INSTANCE),
			jsonUrl = $container.data('json-src'),
			imgSrc = $container.data('img-src'),
			options = $.isPlainObject(CfgOrCmd) ? CfgOrCmd : (jsonUrl ? null : {});
			
			if(CfgOrCmd == 'destroy') {
				if (!instance) {
					console.error('Calling "destroy" method on not initialized instance is forbidden');
					return;
				}
				
				$container.removeData(ITEM_DATA_INSTANCE);
				instance._destroy();
				
				return;
			}
			
			if(instance) {
				$container.removeData(ITEM_DATA_INSTANCE);
				instance._destroy();
				instance = null;
			}
			
			function init() {
				console.log('VISION ' + vision.prototype.VERSION);

				var config = $.extend(true, {}, vision.prototype.defaults, options);
				
				if(config.baseUrl) {
					BASE_URL = config.baseUrl;
				}
				
				if(config.imgSrc == null && imgSrc) {
					config.imgSrc = imgSrc;
				}
				
				if(config.onPreInit) {
					var fn = null;
					if(typeof config.onPreInit == 'string') {
						try {
							fn = new Function('config', config.onPreInit);
						} catch(ex) {
							console.error('Can not compile "onPreInit" function: ' + ex.message);
						}
					} else if(typeof config.onPreInit == 'function') {
						fn = config.onPreInit;
					}
					
					if(fn) {
						fn.call(this, config);
					}
				}
				
				instance = new vision($container, config);
				$container.data(ITEM_DATA_INSTANCE, instance);
			}
			
			// options have more priority than json
			if(options == null) {
				// let's change HTTP to HTTPS if the current location has SSL on
				jsonUrl = Utils.changeProtocol(jsonUrl);
				
				$.ajax({
					url: jsonUrl,
					type: 'GET',
					dataType: 'json',
					contentType: 'application/json',
					headers: { 'X-WP-Nonce': vision_globals.api.nonce },
				}).done(function(data) {
					options = $.isPlainObject(data) ? data : {};
				}).fail(function(data) {
					options = {};
				}).always(function() {
					init();
				});
			} else {
				init();
			}
		});
	}
	
	$('.vision-map').vision();
})(jQuery, window, document);