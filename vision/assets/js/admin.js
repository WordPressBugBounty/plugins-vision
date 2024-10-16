;(function($) {
	'use strict';
	//=========================================================
	// Shim
	//=========================================================
	if (!Object.is) {
		Object.is = function is(x, y) { // eslint-disable-next-line no-self-compare
			return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
		};
	}
	
	if('function' !== typeof DataTransfer.prototype.setDragImage) {
		DataTransfer.prototype.setDragImage = function(image, offsetX, offsetY) {
		};
	}
	
	//=========================================================
	// Storage
	//=========================================================
	function Storage() {
		this.storage = {};
		
		this.get = function(key) {
			if(key in this.storage) {
				return this.storage[key];
			}
			return null;
		}
		this.set = function(key, item) {
			this.storage[key] = item;
		}
		this.del = function(key) {
			delete this.storage[key];
		}
		this.len = function() {
			return Object.keys(this.storage).length;
		}
	};

	//=========================================================
	// FileSaver
	// @source https://github.com/eligrey/FileSaver.js
	//=========================================================
	var saveAs = saveAs || function() {
		// The one and only way of getting global scope in all environments
		// https://stackoverflow.com/q/3277182/1008999
		var _global = typeof window === 'object' && window.window === window
		? window : typeof self === 'object' && self.self === self
		? self : typeof global === 'object' && global.global === global
		? global
		: this
		
		function bom (blob, opts) {
			if (typeof opts === 'undefined') opts = { autoBom: false }
			else if (typeof opts !== 'object') {
				console.warn('Deprecated: Expected third argument to be a object')
				opts = { autoBom: !opts }
			}
			
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type })
			}
			return blob
		}
		
		function download (url, name, opts) {
			var xhr = new XMLHttpRequest()
			xhr.open('GET', url)
			xhr.responseType = 'blob'
			xhr.onload = function () {
				saveAs(xhr.response, name, opts)
			}
			xhr.onerror = function () {
				console.error('could not download file')
			}
			xhr.send()
		}
		
		function corsEnabled (url) {
			var xhr = new XMLHttpRequest()
			// use sync to avoid popup blocker
			xhr.open('HEAD', url, false)
			try {
				xhr.send()
			} catch (e) {}
			return xhr.status >= 200 && xhr.status <= 299
		}
		
		// `a.click()` doesn't work for all browsers (#465)
		function click (node) {
			try {
				node.dispatchEvent(new MouseEvent('click'))
			} catch (e) {
				var evt = document.createEvent('MouseEvents')
				evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null)
				node.dispatchEvent(evt)
			}
		}
		
		var saveAs = _global.saveAs || (
			// probably in some web worker
			(typeof window !== 'object' || window !== _global)
			? function saveAs () { /* noop */ }
				// Use download attribute first if possible (#193 Lumia mobile)
			: 'download' in HTMLAnchorElement.prototype
			? function saveAs (blob, name, opts) {
				var URL = _global.URL || _global.webkitURL
				var a = document.createElement('a')
				name = name || blob.name || 'download'
				
				a.download = name
				a.rel = 'noopener' // tabnabbing
				
				// TODO: detect chrome extensions & packaged apps
				// a.target = '_blank'
				
				if (typeof blob === 'string') {
					// Support regular links
					a.href = blob
					if (a.origin !== location.origin) {
						corsEnabled(a.href)
						? download(blob, name, opts)
						: click(a, a.target = '_blank')
					} else {
						click(a)
					}
				} else {
					// Support blobs
					a.href = URL.createObjectURL(blob)
					setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
					setTimeout(function () { click(a) }, 0)
				}
			}
			
			// Use msSaveOrOpenBlob as a second approach
			: 'msSaveOrOpenBlob' in navigator
			? function saveAs (blob, name, opts) {
				name = name || blob.name || 'download'
				
				if (typeof blob === 'string') {
					if (corsEnabled(blob)) {
						download(blob, name, opts)
					} else {
						var a = document.createElement('a')
						a.href = blob
						a.target = '_blank'
						setTimeout(function () { click(a) })
					}
				} else {
					navigator.msSaveOrOpenBlob(bom(blob, opts), name)
				}
			}
			
			// Fallback to using FileReader and a popup
			: function saveAs (blob, name, opts, popup) {
				// Open a popup immediately do go around popup blocker
				// Mostly only available on user interaction and the fileReader is async so...
				popup = popup || open('', '_blank')
				if (popup) {
					popup.document.title =
					popup.document.body.innerText = 'downloading...'
				}
				
				if (typeof blob === 'string') return download(blob, name, opts)
				
				var force = blob.type === 'application/octet-stream'
				var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari
				var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent)
				
				if ((isChromeIOS || (force && isSafari)) && typeof FileReader === 'object') {
					// Safari doesn't allow downloading of blob URLs
					var reader = new FileReader()
					reader.onloadend = function () {
						var url = reader.result
						url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;')
						if (popup) popup.location.href = url
						else location = url
						popup = null // reverse-tabnabbing #460
					}
					reader.readAsDataURL(blob)
				} else {
					var URL = _global.URL || _global.webkitURL
					var url = URL.createObjectURL(blob)
					if (popup) popup.location = url
					else location.href = url
					popup = null // reverse-tabnabbing #460
					setTimeout(function () { URL.revokeObjectURL(url) }, 4E4) // 40s
				}
			}
		)
		
		_global.saveAs = saveAs.saveAs = saveAs;
		
		return saveAs;
	}();

	//=============================================
	// Matrix & Point
	//=============================================
	var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array,
	DEG = function(rad) {return rad * 180 / Math.PI;},
	RAD = function(deg) {return deg * Math.PI / 180;},
	DEGNORM = function(deg) {return (deg < 0 ? 360 : 0) + deg % 360;};

	var MATRIX = function(a, b, c, d, tx, ty) {
		this.reset().set(a, b, c, d, tx, ty);
	};
	MATRIX.prototype = {
		get x() {
			return this.m[4];
		},
		get y() {
			return this.m[5];
		},
		get zoom() {
			return this.m[0];
		},
		reset: function() {
			this.m = new ARRAY_TYPE(6);

			if(ARRAY_TYPE != Float32Array) {
				this.m[1] = 0;
				this.m[2] = 0;
				this.m[4] = 0;
				this.m[5] = 0;
			}
			this.m[0] = 1;
			this.m[3] = 1;

			return this;
		},
		set: function(a, b, c, d, tx, ty) {
			this.m[0] = a || 1;
			this.m[1] = b || 0;
			this.m[2] = c || 0;
			this.m[3] = d || 1;
			this.m[4] = tx || 0;
			this.m[5] = ty || 0;
			return this;
		},
		clone: function() {
			var matrix = new MATRIX();
			matrix.m = this.m.slice(0);
			return matrix;
		},
		multiply: function(matrix) {
			var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1],
				m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1],
				m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3],
				m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

			var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4],
				dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

			this.m[0] = m11;
			this.m[1] = m12;
			this.m[2] = m21;
			this.m[3] = m22;
			this.m[4] = dx;
			this.m[5] = dy;

			return this;
		},
		inverse: function() {
			var inv = new MATRIX();
			inv.m = this.m.slice(0);

			var d = 1 / (inv.m[0] * inv.m[3] - inv.m[1] * inv.m[2]),
				m0 = inv.m[3] * d,
				m1 = -inv.m[1] * d,
				m2 = -inv.m[2] * d,
				m3 = inv.m[0] * d,
				m4 = d * (inv.m[2] * inv.m[5] - inv.m[3] * inv.m[4]),
				m5 = d * (inv.m[1] * inv.m[4] - inv.m[0] * inv.m[5]);

			inv.m[0] = m0;
			inv.m[1] = m1;
			inv.m[2] = m2;
			inv.m[3] = m3;
			inv.m[4] = m4;
			inv.m[5] = m5;

			return inv;
		},
		rotate: function(rad) {
			var c = Math.cos(rad),
				s = Math.sin(rad),
				m11 = this.m[0] * c + this.m[2] * s,
				m12 = this.m[1] * c + this.m[3] * s,
				m21 = this.m[0] * -s + this.m[2] * c,
				m22 = this.m[1] * -s + this.m[3] * c;

			this.m[0] = m11;
			this.m[1] = m12;
			this.m[2] = m21;
			this.m[3] = m22;

			return this;
		},
		move: function(point) {
			this.m[4] = point.x;
			this.m[5] = point.y;

			return this;
		},
		translate: function(point) {
			this.m[4] += this.m[0] * point.x + this.m[2] * point.y;
			this.m[5] += this.m[1] * point.x + this.m[3] * point.y;

			return this;
		},
		scale: function(sx, sy) {
			this.m[0] *= sx;
			this.m[1] *= sx;
			this.m[2] *= sy;
			this.m[3] *= sy;

			return this;
		},
		transformPoint: function(point) {
			var x = point.x * this.m[0] + point.y * this.m[2] + this.m[4],
				y = point.x * this.m[1] + point.y * this.m[3] + this.m[5];

			return {x:x, y:y};
		}
	};

	var POINT = function(x,y) {
		this.reset().set(x, y);
	};
	POINT.prototype = {
		get x() {
			return this.p[0];
		},
		get y() {
			return this.p[1];
		},
		set x(value) {
			this.p[0] = value;
		},
		set y(value) {
			this.p[1] = value;
		},
		reset: function() {
			this.p = new ARRAY_TYPE(2);
			this.p[0] = 0;
			this.p[1] = 0;
			return this;
		},
		set: function(x, y) {
			this.p[0] = x || 0;
			this.p[1] = y || 0;
			return this;
		},
		clone: function() {
			var point = new POINT();
			point.p = this.p.slice(0);
			return point;
		},
		add: function(point) {
			this.p[0] = this.p[0] + point.x;
			this.p[1] = this.p[1] + point.y;
			return this;
		},
		sub: function(point) {
			this.p[0] = this.p[0] - point.x;
			this.p[1] = this.p[1] - point.y;
			return this;
		},
		scale: function(s) {
			this.p[0] *= s;
			this.p[1] *= s;
			return this;
		},
		distance: function(point) {
			var x = point.x - this.p[0],
				y = point.y - this.p[1];
			return Math.hypot(x, y);
		},
		length: function() {
			var x = this.p[0],
				y = this.p[1];
			return Math.hypot(x, y);
		},
		rotate: function(center, rad) {
			var s = Math.sin(rad),
				c = Math.cos(rad);

			this.p[0] -= center.x;
			this.p[1] -= center.y;

			var xnew = this.p[0] * c - this.p[1] * s,
				ynew = this.p[0] * s + this.p[1] * c;

			this.p[0] = xnew + center.x;
			this.p[1] = ynew + center.y;

			return this;
		}
	};

	//=============================================
	// Transform Tool
	//=============================================
	function TransformTool(plugin, $container) {
		this.plugin = null;
		this.$container = null;
		this.dom = {};

		this.area = $.extend(true, {}, this.defaultArea);
		this.visible = false;
		this.drag = false;

		this.points = [
			new POINT(), // tl [0]
			new POINT(), // tr [1]
			new POINT(), // br [2]
			new POINT(), // bl [3]
			new POINT(), // mt [4]*
			new POINT(), // mr [5]
			new POINT(), // mb [6]
			new POINT(), // ml [7]
			new POINT(), // rotate [8]*
			new POINT()  // center [9]
		];
		this.type = null;
		this.tl_off = null;
		this.tr_off = null;
		this.br_off = null;
		this.bl_off = null;
		this.center_off = null;

		this.dblclick = {
			clicks: 0,
			timer: 0,
			time: 300
		};

		this._init(plugin, $container);
	};
	TransformTool.prototype = {
		defaultArea: {
			x:0,
			y:0,
			width:0,
			height:0,
			cx:0,
			cy:0,
			angle:0
		},
		//=============================================
		// Private Methods
		//=============================================
		_init: function(plugin, $container) {
			this.plugin = plugin;
			this.$container = $container;

			this._create();
		},
		_create: function() {
			this._buildDOM();
			this._bind();
		},
		_buildDOM: function() {
			this.dom = {
				$tool: $('<div>').addClass('vision-tool-transform'),
				$shape: $(document.createElementNS('http://www.w3.org/2000/svg', 'svg')).attr({'class':'vision-shape','overflow':'visible'}),
				$tl: $('<div>').addClass('vision-pointer').attr({'data-type':'tl'}),
				$tr: $('<div>').addClass('vision-pointer').attr({'data-type':'tr'}),
				$bl: $('<div>').addClass('vision-pointer').attr({'data-type':'bl'}),
				$br: $('<div>').addClass('vision-pointer').attr({'data-type':'br'}),
				$mt: $('<div>').addClass('vision-pointer').attr({'data-type':'mt'}),
				$mr: $('<div>').addClass('vision-pointer').attr({'data-type':'mr'}),
				$mb: $('<div>').addClass('vision-pointer').attr({'data-type':'mb'}),
				$ml: $('<div>').addClass('vision-pointer').attr({'data-type':'ml'}),
				$rotate: $('<div>').addClass('vision-pointer').attr({'data-type':'rotate'}),
				$center: $('<div>').addClass('vision-center').attr({'data-type':'center'})
			}
			this.dom.$tool.append(
				this.dom.$shape,
				this.dom.$center,
				this.dom.$rotate,
				this.dom.$mt,
				this.dom.$mr,
				this.dom.$mb,
				this.dom.$ml,
				this.dom.$tl,
				this.dom.$tr,
				this.dom.$bl,
				this.dom.$br
			);
			this.$container.append(this.dom.$tool);
		},
		_bind: function() {
			this.dom.$tool.on('mousedown', $.proxy(this._onToolMouseDown, this));
		},
		_unbind: function() {
			this.dom.$tool.off('mousedown', $.proxy(this._onToolMouseDown, this));
		},
		_initPoints: function() {
			var zoom = this.plugin.fn.getCanvasZoom(this.plugin),
				pos = this.plugin.fn.getCanvasPosition(this.plugin),
				rcViewPane = this.$container.get(0).getBoundingClientRect(),
				xOffset = rcViewPane.width / 2 + pos.x - (this.area.width * zoom)/2,
				yOffset = rcViewPane.height / 2 + pos.y - (this.area.height * zoom)/2,
				x = this.area.x * zoom + xOffset,
				y = this.area.y * zoom + yOffset,
				w = this.area.width * zoom,
				h = this.area.height * zoom,
				angle = DEGNORM(this.area.angle);

			var tl = new POINT(x, y), // hack (+ zoom/2.5) 125% Windows
				tr = new POINT(tl.x + w, tl.y),
				br = new POINT(tr.x, tr.y + h),
				bl = new POINT(br.x - w, br.y),
				center = new POINT((tl.x + tr.x)/2, (tl.y + bl.y)/2),
				rad = RAD(angle);

			this.points[0] = tl;
			this.points[1] = tr;
			this.points[2] = br;
			this.points[3] = bl;
			this.points[9] = center;

			for(var i=0;i<4;i++) {
				this.points[i].rotate(center, rad);
			}

			this._updateMiddlePoints();
		},
		_updateMiddlePoints: function() {
			var tl = this.points[0],
				tr = this.points[1],
				br = this.points[2],
				bl = this.points[3],
				mt = new POINT((tl.x + tr.x)/2, (tl.y + tr.y)/2), // middle top point
				mr = new POINT((tr.x + br.x)/2, (tr.y + br.y)/2),
				mb = new POINT((br.x + bl.x)/2, (br.y + bl.y)/2),
				ml = new POINT((bl.x + tl.x)/2, (bl.y + tl.y)/2),
				dy = tr.y - tl.y,
				dx = tr.x - tl.x,
				normal = {
					x:  dy / Math.sqrt(dx*dx + dy*dy),
					y: -dx / Math.sqrt(dx*dx + dy*dy)
				};

			this.points[4] = mt;
			this.points[5] = mr;
			this.points[6] = mb;
			this.points[7] = ml;
			this.points[8] = new POINT(mt.x + 25 * normal.x, mt.y + 25 * normal.y);
		},
		_draw: function() {
			if(this.visible) {
				var points = this.points;
				this.dom.$shape.html(`<path data-type="shape" d="
					M ${points[0].x}, ${points[0].y}
					L ${points[1].x}, ${points[1].y}
					L ${points[2].x}, ${points[2].y}
					L ${points[3].x}, ${points[3].y}
					L ${points[0].x}, ${points[0].y}
					M ${points[4].x}, ${points[4].y}
					L ${points[8].x}, ${points[8].y}
					Z" />`);
				this.dom.$tl.css({'transform':'translate(' + points[0].x + 'px,' + points[0].y + 'px)'});
				this.dom.$tr.css({'transform':'translate(' + points[1].x + 'px,' + points[1].y + 'px)'});
				this.dom.$br.css({'transform':'translate(' + points[2].x + 'px,' + points[2].y + 'px)'});
				this.dom.$bl.css({'transform':'translate(' + points[3].x + 'px,' + points[3].y + 'px)'});

				this.dom.$mt.css({'transform':'translate(' + points[4].x + 'px,' + points[4].y + 'px) rotate(' + this.area.angle + 'deg)'});
				this.dom.$mr.css({'transform':'translate(' + points[5].x + 'px,' + points[5].y + 'px) rotate(' + this.area.angle + 'deg)'});
				this.dom.$mb.css({'transform':'translate(' + points[6].x + 'px,' + points[6].y + 'px) rotate(' + this.area.angle + 'deg)'});
				this.dom.$ml.css({'transform':'translate(' + points[7].x + 'px,' + points[7].y + 'px) rotate(' + this.area.angle + 'deg)'});

				this.dom.$rotate.css({'transform':'translate(' + points[8].x + 'px,' + points[8].y + 'px)'});
				this.dom.$center.css({'transform':'translate(' + points[9].x + 'px,' + points[9].y + 'px)'});

				this.dom.$tool.addClass('vision-active');
			} else {
				this.dom.$tool.removeClass('vision-active');
			}
		},
		_drag: function(dx, dy) {
			for(var i=0;i<this.points.length;i++) {
				this.points[i].add({x: dx, y: dy});
			}

			var tl = this.points[0],
				br = this.points[2],
				zoom = this.plugin.fn.getCanvasZoom(this.plugin),
				pos = this.plugin.fn.getCanvasPosition(this.plugin),
				rcViewPane = this.$container.get(0).getBoundingClientRect(),
				xOffset = rcViewPane.width / 2 + pos.x,
				yOffset = rcViewPane.height / 2 + pos.y;

			this.area.x = (tl.x - xOffset) / zoom;
			this.area.y = (tl.y - yOffset) / zoom;
			this.area.cx = ((tl.x + br.x)/2 - xOffset) / zoom;
			this.area.cy = ((tl.y + br.y)/2 - yOffset) / zoom;

			this.layer.x = this.area.cx;
			this.layer.y = this.area.cy;
			this.plugin.rootScope.scan();
		},
		_rotate: function(drad) {
			for(var i=0;i<this.points.length;i++) {
				this.points[i].rotate(this.center_off, drad);
			}
			this.area.angle = DEGNORM(this.area.angle + (DEG(drad)));

			this.layer.angle = this.area.angle;
			this.plugin.rootScope.scan();
		},
		_resize: function(type, x, y) {
			var p = new POINT(x, y),
				rad = RAD(this.area.angle),
				tl = this.points[0],
				br = this.points[2],
				zoom = this.plugin.fn.getCanvasZoom(this.plugin),
				pos = this.plugin.fn.getCanvasPosition(this.plugin),
				rcViewPane = this.$container.get(0).getBoundingClientRect(),
				xOffset = rcViewPane.width / 2 + pos.x,
				yOffset = rcViewPane.height / 2 + pos.y,
				anchor, center, x, y, w, h;

			switch(type) {
				case 'tl':
				case 'ml': { anchor = this.br_off.clone(); } break;
				case 'tr':
				case 'mt': { anchor = this.bl_off.clone(); } break;
				case 'br':
				case 'mr': { anchor = this.tl_off.clone(); } break;
				case 'bl':
				case 'mb': { anchor = this.tr_off.clone(); } break;
			}

			center = new POINT((anchor.x + p.x)/2, (anchor.y + p.y)/2);

			p.rotate(center, -rad);
			anchor.rotate(center, -rad);

			switch(type) {
				case 'tl': {
					w = -p.x + anchor.x;
					h = -p.y + anchor.y;
					x = anchor.x - w;
					y = anchor.y - h;
				} break;
				case 'ml': {
					w = -p.x + anchor.x;
					p.set(anchor.x - w, anchor.y); // bl

					p.rotate(center, rad);
					anchor.rotate(center, rad);

					center.set((this.tr_off.x + p.x)/2, (this.tr_off.y + p.y)/2);

					p.rotate(center, -rad);
					anchor.rotate(center, -rad);

					w = -p.x + anchor.x;
					h = this.area.height * zoom;
					x = anchor.x - w;
					y = anchor.y - h;
				} break;
				case 'tr': {
					w =  p.x - anchor.x;
					h = -p.y + anchor.y;
					x = anchor.x;
					y = anchor.y - h;
				} break;
				case 'mt': {
					h = -p.y + anchor.y;
					p.set(anchor.x, anchor.y - h) // tl

					p.rotate(center, rad);
					anchor.rotate(center, rad);

					center.set((this.br_off.x + p.x)/2, (this.br_off.y + p.y)/2);

					p.rotate(center, -rad);
					anchor.rotate(center, -rad);

					w = this.area.width * zoom;
					h = -p.y + anchor.y;
					x = anchor.x;
					y = anchor.y - h;
				} break;
				case 'br': {
					w = p.x - anchor.x;
					h = p.y - anchor.y;
					x = anchor.x;
					y = anchor.y;
				} break;
				case 'mr': {
					w = p.x - anchor.x;
					p.set(anchor.x + w, anchor.y); // tr

					p.rotate(center, rad);
					anchor.rotate(center, rad);

					center.set((this.bl_off.x + p.x)/2, (this.bl_off.y + p.y)/2);

					p.rotate(center, -rad);
					anchor.rotate(center, -rad);

					w = p.x - anchor.x;
					h = this.area.height * zoom;
					x = anchor.x;
					y = anchor.y;
				} break;
				case 'bl': {
					w = -p.x + anchor.x;
					h =  p.y - anchor.y;
					x = anchor.x - w;
					y = anchor.y;
				} break;
				case 'mb': {
					h =  p.y - anchor.y;
					p.set(anchor.x, anchor.y + h) // br

					p.rotate(center, rad);
					anchor.rotate(center, rad);

					center.set((this.tl_off.x + p.x)/2, (this.tl_off.y + p.y)/2);

					p.rotate(center, -rad);
					anchor.rotate(center, -rad);

					w = this.area.width * zoom;
					h = p.y - anchor.y;
					x = anchor.x - w;
					y = anchor.y;
				} break;
			}

			center.set(x + w/2, y + h/2);

			this.points[0].set(x, y);         // tl
			this.points[1].set(x + w, y);     // tr
			this.points[2].set(x + w, y + h); // br
			this.points[3].set(x, y + h);     // bl
			this.points[9].set(center.x, center.y);

			for(var i=0;i<4;i++) {
				this.points[i].rotate(center, rad);
			}

			this._updateMiddlePoints();

			this.area.x = (tl.x - xOffset) / zoom;
			this.area.y = (tl.y - yOffset) / zoom;
			this.area.cx = ((tl.x + br.x)/2 - xOffset) / zoom;
			this.area.cy = ((tl.y + br.y)/2 - yOffset) / zoom;
			this.area.width = w / zoom;
			this.area.height = h / zoom;

			this.layer.x = this.area.cx;
			this.layer.y = this.area.cy;
			this.layer.width = this.area.width;
			this.layer.height = this.area.height;
			this.plugin.rootScope.scan();
		},
		_onToolMouseDown: function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			this.type = $(e.target).data('type');

			this.tl_off = this.points[0].clone();
			this.tr_off = this.points[1].clone();
			this.br_off = this.points[2].clone();
			this.bl_off = this.points[3].clone();
			this.center_off = this.points[9].clone();

			this.cursor = {
				offset:  { x: this.dom.$tool.offset().left, y: this.dom.$tool.offset().top },
				start:   { x: 0, y: 0 },
				prev:    { x: 0, y: 0 },
				current: { x: 0, y: 0 }
			};
			this.cursor.start.x = this.cursor.prev.x = this.cursor.current.x = e.pageX - this.cursor.offset.x;
			this.cursor.start.y = this.cursor.prev.y = this.cursor.current.y = e.pageY - this.cursor.offset.y;

			$(document).on('mousemove', $.proxy(this._onToolMouseMove, this));
			$(document).on('mouseup', $.proxy(this._onToolMouseUp, this));

		},
		_onToolMouseMove: function(e) {
			this.cursor.prev.x = this.cursor.current.x;
			this.cursor.prev.y = this.cursor.current.y;
			this.cursor.current.x = e.pageX - this.cursor.offset.x;
			this.cursor.current.y = e.pageY - this.cursor.offset.y;

			switch(this.type) {
				case 'tl':
				case 'tr':
				case 'br':
				case 'bl':
				case 'mt':
				case 'mr':
				case 'mb':
				case 'ml': {
					this._resize(this.type, this.cursor.current.x, this.cursor.current.y);
				} break;
				case 'shape': {
					var dx = this.cursor.current.x - this.cursor.prev.x,
						dy = this.cursor.current.y - this.cursor.prev.y;
					this._drag(dx, dy);
				} break;
				case 'rotate': {
					var prevRad = Math.atan2(this.cursor.prev.y - this.center_off.y, this.cursor.prev.x - this.center_off.x),
						currRad = Math.atan2(this.cursor.current.y - this.center_off.y, this.cursor.current.x - this.center_off.x);
					this._rotate(currRad - prevRad);
				} break;
			}

			this._draw();
		},
		_onToolMouseUp: function(e) {
			$(document).off('mousemove', $.proxy(this._onToolMouseMove, this));
			$(document).off('mouseup', $.proxy(this._onToolMouseUp, this));
		},
		//=============================================
		// Public Methods
		//=============================================
		init: function(layer) {
			this.end();

			this.layer = layer;
			this.area = $.extend(true, {}, this.defaultArea, {
				x: layer.x,
				y: layer.y,
				width: layer.width,
				height: layer.height,
				cx: 0,
				cy: 0,
				angle: layer.angle
			});
			this.area.cx = this.area.x + this.area.width / 2;
			this.area.cy = this.area.y + this.area.height / 2;

			this._initPoints();
		},
		start: function() {
			if(!this.visible) {
				this.visible = true;
				this._draw();
			}
		},
		end: function() {
			if(this.visible) {
				this.visible = false;
				this.layer = null;
				this.area = $.extend(true, {}, this.defaultArea);
				this._initPoints();
				this._draw();
			}
		},
		update: function() {
			this.init(this.layer);
			this.start();
		},
		isVisible: function() {
			return this.visible;
		}
	};

	//=========================================================
	// JavaScript Cookie v2.2.0
	// https://github.com/js-cookie/js-cookie
	//
	// Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	// Released under the MIT license
	//=========================================================
	(function (factory) {
		var registeredInModuleLoader;
		if (typeof define === 'function' && define.amd) {
			define(factory);
			registeredInModuleLoader = true;
		}
		if (typeof exports === 'object') {
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	}(function () {
		function extend () {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[ i ];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}
		function decode (s) {
			return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
		}
		function init (converter) {
			function api() {}
			function set (key, value, attributes) {
				if (typeof document === 'undefined') {
					return;
				}
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);
				if (typeof attributes.expires === 'number') {
					attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
				}
				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';
				try {
					var result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}
				value = converter.write ?
					converter.write(value, key) :
					encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				key = encodeURIComponent(String(key))
					.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
					.replace(/[\(\)]/g, escape);
				var stringifiedAttributes = '';
				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					// Considers RFC 6265 section 5.2:
					// ...
					// 3.  If the remaining unparsed-attributes contains a %x3B (";")
					//     character:
					// Consume the characters of the unparsed-attributes up to,
					// not including, the first %x3B (";") character.
					// ...
					stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}
			function get (key, json) {
				if (typeof document === 'undefined') {
					return;
				}
				var jar = {};
				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all.
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var i = 0;
				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');
					if (!json && cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}
					try {
						var name = decode(parts[0]);
						cookie = (converter.read || converter)(cookie, name) ||
							decode(cookie);
						if (json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}
						jar[name] = cookie;
						if (key === name) {
							break;
						}
					} catch (e) {}
				}
				return key ? jar[key] : jar;
			}
			
			api.set = set;
			api.get = function (key) {
				return get(key, false /* read as raw */);
			};
			api.getJSON = function (key) {
				return get(key, true /* read as json */);
			};
			api.remove = function (key, attributes) {
				set(key, '', extend(attributes, {
					expires: -1
				}));
			};
			api.defaults = {};
			api.withConverter = init;
			return api;
		}
		
		return init(function () {});
	}));
	
	//=========================================================
	// Screens
	//=========================================================
	function page_items() {
		$('.vision-root .vision-toggle').on('click touchend', function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			var $el = $(this),
			id = $el.data('id'),
			active = null;
			
			if($el.hasClass('vision-locked')) {
				return;
			}
			
			$el.addClass('vision-readonly');
			
			if($el.hasClass('vision-checked')) {
				$el.removeClass('vision-checked').addClass('vision-unchecked');
				active = false;
			} else {
				$el.removeClass('vision-unchecked').addClass('vision-checked');
				active = true;
			}
			
			
			var wp_ajax_url = vision_globals.ajax_url,
			wp_ajax_nonce = vision_globals.ajax_nonce,
			wp_ajax_action_update = vision_globals.ajax_action_update,
			wp_ajax_msg_error = vision_globals.ajax_msg_error,
			config = {
				id: id,
				active: active
			};
			
			var cfg = $.extend(true, {}, config);
			cfg = JSON.stringify(cfg);
			
			$.ajax({
				url: wp_ajax_url,
				type: 'POST',
				dataType: 'json',
				data: {
					nonce: wp_ajax_nonce,
					action: wp_ajax_action_update,
					config: cfg
				}
			}).done(function(json) {
				if(json && !json.success) {
					if(active) {
						$el.removeClass('vision-checked').addClass('vision-unchecked');
					} else {
						$el.removeClass('vision-unchecked').addClass('vision-checked');
					}
				}
			}).fail(function() {
				console.log(wp_ajax_msg_error);
			}).always(function() {
				$el.removeClass('vision-readonly');
			});
		});
	}
	
	function page_item() {
		//=========================================================
		// Application Model Data
		//=========================================================
		var appData = {
			alight: null,
			rootScope: null,
			
			wpFileFrameImage: null,
			transformTool: null,

			wp_base_url: null,
			wp_upload_url: null,
			wp_plugin_url: null,
			wp_ajax_url: null,
			wp_ajax_nonce: null,
			wp_ajax_action_update: null,
			wp_ajax_action_get: null,
			wp_ajax_action_modal: null,
			wp_ajax_msg_error: null,
			wp_item_id: null,
			
			themes: null,
			fonts: null,
			image: new Image(),
			
			embedCodeWithId: null,
			embedCodeWithSlug: null,
			
			settings: {
				themeJavaScript: null,
				themeCSS: null
			},
			
			// used for save/restore config data (user interface + plugin config)
			config: null,
			
			ui: {
				fullscreen: false,

				builder: {
					leftSidebar: true,
					leftSidebarWidth: 350,
					rightSidebar: true,
					rightSidebarWidth: 350,
				},

				canvas: {
					zoomStep: 0.05,
					zoom: 1,
					x: 0,
					y: 0
				},

				prevCanvas: {
					zoom: 1,
					x: 0,
					y: 0
				},

				moveCanvas: {
					initX: null,
					initY: null,
					lastX: null,
					lastY: null
				},

				sidebarResize: {
					initX: null,
					lastX: null,
					width: null
				},

				mapLayers: new Map(),
				activeLayer: null,

				tabs: {
					builder: true,
					customCSS: false,
					customJS: false,
					shortcode: false
				},

				generalTab: {
					main: false,
					container: false
				},

				leftSidebarTabs: {
					general: true,
					layers: false
				},

				rightSidebarTabs: {
					layer: true,
					popover: false,
					tooltip: false
				},
				
				layerTab: { // folded
					general: true,
					data: true,
					appearance: false
				},
				
				tooltipTab: { // folded
					data: false,
					appearance: true
				},
				
				popoverTab: { // folded
					data: false,
					appearance: true
				},
			},
			
			defaultConfig: {
				active: true,
				title: null,
				slug: null,
				image: {
					relative: false,
					url: null
				},
				imageWidth: 0,
				imageHeight: 0,
				autoWidth: true,
				autoHeight: true,
				containerWidth: null,
				containerHeight: null,
				
				theme: 'light',
				class: null, // additional css class
				containerId: null,
				
				background: {
					color: null,
					image: {
						relative: false,
						url: null
					},
					size: null,
					repeat: null,
					position: null,
					//scroll: null, //???
				},
				
				customCSS: {
					active: false,
					data: null
				},
				
				customJS: {
					active: false,
					data: null
				},
				
				layers: []
			},
			
			defaultLayer: {
				guid: null,
				id: null,
				type: 'link', // link, image, text
				title: null,
				x: 0,
				y: 0,
				width: 150,
				height: 100,
				angle: 0,
				autoWidth: false,
				autoHeight: false,
				lock: false,
				visible: true,
				scaling: true,
				noevents: false,
				className: null,
				
				url: null,
				urlNewWindow: false,
				urlNoFollow: true,
				contentData: null,
				userData: null,
				
				link: {
					normalColor: null,
					hoverColor: null,
					radius: 0
				},
				
				text: {
					data: null,
					font: null,
					color: '#000',
					size: 18,
					lineHeight: 18,
					align: null,
					letterSpacing: null,
					background: {
						file: {
							url: null
						},
						color: null,
						size: 'contain',
						repeat: 'no-repeat',
						position: '50% 50%'
					}
				},
				
				image: {
					background: {
						file: {
							url: null,
							inlineEmbed: false
						},
						color: null,
						size: 'contain',
						repeat: 'no-repeat',
						position: '50% 50%'
					}
				},
				
				svg: {
					file: {
						url: null,
						relative: false
					}
				},
				
				tooltip: {
					active: false,
					data: null,
					placement: 'top',
					offset: {x:0, y:0},
					width: null,
					widthFromCSS: false,
					trigger: 'hover', // values: hover, click, focus & touch, sticky (will be shown on load)
					followCursor: false, // only for hover trigger
					scaling: false,
					interactive: true,
					smart: false, // determines if the tooltip is placed within the viewport as best it can be if there is not enough space
					showOnInit: false, // the tooltip will be shown immediately once the instance is created
					className: null,
					showAnimation: null,
					hideAnimation: null,
					duration: null // define animation durection
				},
				
				popover: {
					active: false,
					data: null,
					type: 'inbox', // values: tooltip, inbox, lightbox
					placement: 'top', // only for tooltip type
					offset: {x:0, y:0}, // only for tooltip type
					width: null,
					widthFromCSS: false,
					trigger: 'click', // values: hover, click, dblclick, focus & touch
					followCursor: false, // only for hover trigger
					scaling: false, // only for tooltip type
					interactive: true,
					smart: false, // determines if the popover is placed within the viewport as best it can be if there is not enough space
					showOnInit: false, // the popover will be shown immediately once the instance is created
					mobileType: 'inbox', // values: tooltip, inbox, lightbox
					className: null
				}
			},
			
			fn: {
				init: function(appData) {
					appData.fn.enableLoading(appData);
					
					var $app = $('#vision-app-item');
					
					$app.removeAttr('style');
					$(window).on('resize', $.proxy(appData.fn.onResize, this, appData));

					// init ajax
					appData.plan = vision_globals.plan;
					appData.transformTool = new TransformTool(appData, $('#vision-layers-canvas-wrap'));
					appData.wp_base_url = vision_globals.wp_base_url;
					appData.wp_upload_url = vision_globals.upload_base_url;
					appData.wp_plugin_url = vision_globals.plugin_base_url;
					appData.wp_ajax_url = vision_globals.ajax_url;
					appData.wp_ajax_nonce = vision_globals.ajax_nonce;
					appData.wp_ajax_action_update = vision_globals.ajax_action_update;
					appData.wp_ajax_action_get = vision_globals.ajax_action_get;
					appData.wp_ajax_action_modal = vision_globals.ajax_action_modal,
					appData.wp_ajax_msg_error = vision_globals.ajax_msg_error;
					appData.msg_pro_title = vision_globals.msg_pro_title;
					appData.msg_edit_text = vision_globals.msg_edit_text;
					appData.msg_custom_js_error = vision_globals.msg_custom_js_error;
					appData.msg_layer_id_error = vision_globals.msg_layer_id_error;
					
					appData.wp_item_id = vision_globals.ajax_item_id;
					
					if(vision_globals.config) {
						var cfg = $.extend(true, {}, appData.defaultConfig, vision_globals.config);
						if(cfg) {
							for(var i in cfg) { // copy values from one object to another
								if(appData.config.hasOwnProperty(i)) {
									appData.config[i] = cfg[i];
								}
							}
							
							// transform old config
							for(var i=0;i<appData.config.layers.length;i++) {
								var layer = $.extend(true, {}, appData.defaultLayer, appData.config.layers[i]);
								
								if(layer.image.hasOwnProperty('backgroundImage')) {
									layer.image.background.file.url = layer.image.backgroundImage.url;
									layer.image.background.file.relative = layer.image.backgroundImage.relative;
									layer.image.background.position = layer.image.backgroundPosition;
									layer.image.background.repeat = layer.image.backgroundRepeat;
									layer.image.background.size = layer.image.backgroundSize;
									
									delete layer.image.backgroundImage;
									delete layer.image.backgroundPosition;
									delete layer.image.backgroundRepeat;
									delete layer.image.backgroundSize;
								}
								if(layer.link.hasOwnProperty('url')) {
									layer.url = layer.link.url;
									layer.urlNewWindow = layer.link.newWindow;
									
									delete layer.link.url;
									delete layer.link.newWindow;
									delete layer.link.clickColor;
								}
								
								if(!layer.guid) {
									layer.guid = appData.fn.uuid();
								}
								
								if(!layer.id) {
									layer.id = appData.fn.uuid(8);
								}
								
								if(layer.tooltip.offset.hasOwnProperty('x') || layer.tooltip.offset.hasOwnProperty('y')) {
									layer.tooltip.offset.top = layer.tooltip.offset.y;
									layer.tooltip.offset.left = layer.tooltip.offset.x;
								}
								
								if(layer.popover.offset.hasOwnProperty('x') || layer.popover.offset.hasOwnProperty('y')) {
									layer.popover.offset.top = layer.popover.offset.y;
									layer.popover.offset.left = layer.popover.offset.x;
								}
								
								appData.config.layers[i] = layer;
							}
						}
					}
					
					if(vision_globals.settings) {
						var cfg = $.extend(true, {}, vision_globals.settings);
						if(cfg) {
							for(var i in cfg) { // copy values from one object to another
								if(appData.settings.hasOwnProperty(i)) {
									appData.settings[i] = cfg[i];
								}
							}
						}
					}
					
					appData.image.onload = function(xhr) {
						var $img = $('#vision-layers-image'),
						image = this;
						
						appData.config.imageWidth = image.width;
						appData.config.imageHeight = image.height;
						
						$img.css({
							'background-image':'url(' + image.src + ')',
							'width': image.width,
							'height': image.height
						});
						$img.get(0).offsetHeight;
						
						appData.fn.canvasZoomDefault(appData);
						//appData.fn.canvasZoomFit(appData);
						appData.rootScope.scan();
					}
					appData.image.onerror = function(xhr) {
						var $img = $('#vision-layers-image'),
						image = this;
						
						appData.config.imageWidth = 0;
						appData.config.imageHeight = 0;
						
						$img.css({
							'background-image':'url(' + image.src + ')',
							'width': 0,
							'height': 0
						});
						
						appData.fn.canvasZoomFit(appData);
						appData.rootScope.scan();
					}
					
					appData.rootScope.watch('appData.config.image', function(image) {
						var imageSrc = appData.fn.getImageUrl(appData, image);
						appData.image.src = ''; // destroy prev request
						appData.image.src = imageSrc;
					}, {deep: 2});

					appData.rootScope.watch('appData.ui.canvas', function(canvas) {
						var $canvas = $('#vision-layers-canvas');
						$canvas.css({'transform':'translate3d(' + canvas.x + 'px,' + canvas.y + 'px,0) scale(' + canvas.zoom + ')'});
						appData.fn.updateTransformTool();
					}, {deep: 2});
					
					appData.rootScope.watch('appData.ui.activeLayer', function(layerNew, layerOld) {
						if(layerOld) {
							if($('#wp-vision-tooltip-editor-wrap').hasClass('html-active')){ // We are in text mode
								layerOld.tooltip.data = $('#vision-tooltip-editor').val();
							} else { // We are in tinyMCE mode
								var activeEditor = tinyMCE.get('vision-tooltip-editor');
								if(activeEditor !== null) { // Make sure we're not calling setContent on null
									layerOld.tooltip.data = activeEditor.getContent();
								}
							}
							
							if($('#wp-vision-popover-editor-wrap').hasClass('html-active')){ // We are in text mode
								layerOld.popover.data = $('#vision-popover-editor').val();
							} else { // We are in tinyMCE mode
								var activeEditor = tinyMCE.get('vision-popover-editor');
								if(activeEditor !== null) { // Make sure we're not calling setContent on null
									layerOld.popover.data = activeEditor.getContent();
								}
							}
						}
						
						var data = (layerNew && layerNew.tooltip.data ? layerNew.tooltip.data : '');
						if($('#wp-vision-tooltip-editor-wrap').hasClass('html-active')) { // We are in text mode
							$('#vision-tooltip-editor').val(data);
						} else {
							var activeEditor = tinyMCE.get('vision-tooltip-editor');
							if(activeEditor !== null) { // Make sure we're not calling setContent on null
								activeEditor.setContent(data); // Update tinyMCE's content
							}
						}
						
						var data = (layerNew && layerNew.popover.data ? layerNew.popover.data : '');
						if($('#wp-vision-popover-editor-wrap').hasClass('html-active')) { // We are in text mode
							$('#vision-popover-editor').val(data);
						} else {
							var activeEditor = tinyMCE.get('vision-popover-editor');
							if(activeEditor !== null) { // Make sure we're not calling setContent on null
								activeEditor.setContent(data); // Update tinyMCE's content
							}
						}
					});

					appData.rootScope.watch('appData.ui.activeLayer', function(cur, old) {
						if( cur && old && (
							cur.x != old.x ||
						 	cur.y != old.y ||
							cur.width != old.width ||
							cur.height != old.height ||
							cur.angle != old.angle )) {
						 	appData.fn.updateTransformTool();
						}
					}, {deep:2});

					appData.fn.loadData(appData, 'fonts').done(function(data) {
						appData.fonts = data.list;
					}).always(function(){
						appData.fn.loadData(appData, 'themes').done(function(data) {
							appData.themes = data.list;
						}).always(function(){
							appData.rootScope.scan();
							appData.fn.disableLoading(appData);
						});
					});
				},
				
				enableLoading: function(appData) {
					$('#vision-app-item').removeClass('vision-active');
				},
				
				disableLoading: function(appData) {
					setTimeout(function() {
						$('#vision-app-item').addClass('vision-active');
					}, 1000);
				},
				
				loadData: function(appData, dataName, dataId) {
					var def = $.Deferred();
					
					$.ajax({
						url: appData.wp_ajax_url,
						type: 'POST',
						dataType: 'json',
						data: {
							nonce: appData.wp_ajax_nonce,
							action: appData.wp_ajax_action_get,
							type: dataName,
							id: dataId
						},
						success: function(json){
							if(json && json.success) {
								def.resolve(json.data);
								return;
							}
							this.error();
						},
						error: function (xhr, ajaxOptions, thrownError) {
							appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
							def.resolve(null);
						}
					});
					
					return def.promise();
				},
				
				getPrewiewPageUrl: function(appData) {
					var url = new Url(appData.wp_base_url + '/vision/map/' + appData.wp_item_id + '?preview=1');
					return url.toString();
				},
				
				preview: function(appData) {
					window.open(appData.fn.getPrewiewPageUrl(appData), '_blank');
				},
				
				getPluginConfig: function(appData) {
					var cfg = {};
					
					cfg.title = appData.config.title;
					cfg.imgSrc = appData.fn.getImageUrl(appData, appData.config.image);
					
					if(!appData.config.autoWidth && appData.config.containerWidth) {
						cfg.width = appData.config.containerWidth;
					}
					
					if(!appData.config.autoHeight && appData.config.containerHeight) {
						cfg.height = appData.config.containerHeight;
					}
					
					cfg.theme = appData.config.theme;
					cfg.className = appData.config.class;
					
					// special flags for loader.js, used for quick checks
					cfg.flags = {
						customCSS: appData.config.customCSS.active,
						effects: false
					};
					
					var fonts = [],
					layers = [];
					for(var i=0;i<appData.config.layers.length;i++) {
						var layer = appData.config.layers[i];
						
						if(!layer.visible) {
							continue;
						}
						
						layers.push({
							id: layer.id,
							type: layer.type,
							title: layer.title,
							//data: null,
							x: (appData.config.imageWidth  ? (layer.x / (appData.config.imageWidth/2))*100 : 0),
							y: (appData.config.imageHeight ? (layer.y / (appData.config.imageHeight/2))*100 : 0),
							width: layer.width,
							height: layer.height,
							angle: layer.angle,
							autoWidth: layer.autoWidth,
							autoHeight: layer.autoHeight,
							scaling: layer.scaling,
							noevents: layer.noevents,
							className: layer.className,
							
							url: layer.url,
							urlNewWindow: layer.urlNewWindow,
							urlNoFollow: layer.urlNoFollow,
							//contentData: layer.contentData,
							userData: layer.userData,
							
							tooltip: {
								active: layer.tooltip.active,
								//data: null, // inside markup, because we should use shortcodes
								trigger: layer.tooltip.trigger,
								placement: layer.tooltip.placement,
								offset: {
									top: layer.tooltip.offset.top,
									left: layer.tooltip.offset.left
								},
								width: layer.tooltip.width,
								widthFromCSS: layer.tooltip.widthFromCSS,
								followCursor: layer.tooltip.followCursor,
								scaling: layer.tooltip.scaling,
								interactive: layer.tooltip.interactive,
								smart: layer.tooltip.smart,
								showOnInit: layer.tooltip.showOnInit,
								showAnimation: layer.tooltip.showAnimation,
								hideAnimation: layer.tooltip.hideAnimation,
								duration: layer.tooltip.duration,
								className: layer.tooltip.className
							},
							
							popover: {
								active: layer.popover.active,
								//data: null, // inside markup, because we should use shortcodes
								type: layer.popover.type,
								mobileType: layer.popover.mobileType,
								trigger: layer.popover.trigger,
								placement: layer.popover.placement,
								offset: {
									top: layer.popover.offset.top,
									left: layer.popover.offset.left
								},
								width: layer.popover.width,
								widthFromCSS: layer.popover.widthFromCSS,
								followCursor: layer.popover.followCursor,
								scaling: layer.popover.scaling,
								interactive: layer.popover.interactive,
								smart: layer.popover.smart,
								showOnInit: layer.popover.showOnInit,
								className: layer.popover.className
							}
						});
						
						if(layer.type == 'text' && layer.text.font) {
							fonts.push(layer.text.font);
						}
						
						if(layer.tooltip.showAnimation || layer.tooltip.hideAnimation) {
							cfg.flags.effects = true;
						}
					}
					cfg.fonts = (fonts.length > 0 ? fonts : null);
					cfg.layers = (layers.length > 0 ? layers : null);
					
					if(appData.config.customJS.active) {
						cfg.onLoad = appData.config.customJS.data;
						
						try {
							var fn = new Function(cfg.onLoad);
						} catch(ex) {
							appData.fn.showNotice(appData, appData.msg_custom_js_error + ': ' + ex.message, 'notice-error');
						}
					}
					
					return cfg;
				},
				
				saveConfig: function(appData) {
					appData.fn.enableLoading(appData);
					appData.fn.saveEditorsData(appData);
					
					var data = $.extend(true, {}, appData.config),
					jsonData = JSON.stringify(data),
					config = appData.fn.getPluginConfig(appData),
					jsonConfig = JSON.stringify(config);
					
					// the layer ID should be unique
					for(var i=0;i<appData.config.layers.length;i++) {
						var id = appData.config.layers[i].id;
						for(var j=i+1;j<appData.config.layers.length;j++) {
							if(appData.config.layers[j].id == id) {
								appData.fn.showNotice(appData, appData.msg_layer_id_error, 'notice-error');
								appData.fn.showNotice(appData, 'layer.id = ' + id, 'notice-error');
								appData.fn.disableLoading(appData);
								return;
							}
						}
					}
					
					$.ajax({
						url: appData.wp_ajax_url,
						type: 'POST',
						dataType: 'json',
						data: {
							nonce: appData.wp_ajax_nonce,
							action: appData.wp_ajax_action_update,
							id: appData.wp_item_id,
							data: jsonData,
							config: jsonConfig
						}
					}).done(function(json) {
						if(json) {
							appData.wp_item_id = json.data.id;
							appData.fn.showNotice(appData, json.data.msg, (json.success ? 'notice-success' : 'notice-error'));
							appData.rootScope.scan();
							return;
						}
						appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
					}).fail(function() {
						appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
					}).always(function() {
						appData.fn.disableLoading(appData);
					});
				},
				
				loadConfigFromJson: function(appData, json) {
					if(json) {
						var cfg = JSON.parse(json);
						appData.config = $.extend(true, {}, cfg);
						appData.rootScope.scan();
					}
				},
				
				loadConfigFromFile: function(appData) {
					var $el = $('#vision-load-config-from-file').off('change');
					$el.one('change', $.proxy(function(appData, e) {
						var file = e.target.files[0];
						e.target.value = '';
						
						if(file) {
							var fileReader = new FileReader();
							fileReader.onload = ($.proxy(function(e) {
								var json = e.target.result;
								appData.fn.loadConfigFromJson(appData, json);
							}, this));
							fileReader.readAsText(file);
						}
						
					}, this, appData));
					$el.click();
				},
				
				saveConfigToFile: function(appData) {
					var data = $.extend(true, {}, appData.config),
					jsonData = JSON.stringify(data),
					flieName = (appData.wp_item_id ? 'vision_config_' + appData.wp_item_id + '.json' : 'vision_config.json'),
					file = new File([jsonData], flieName, {type: 'application/json;charset=utf-8'});
					saveAs(file);
				},
				
				showNotice: function(appData, data, type) { // type: notice-success, notice-error, notice-warning, notice-info
					var $messages = $('#vision-messages'),
					$msg = $('<div></div>').addClass('notice is-dismissible').addClass(type),
					$data = $('<p></p>').html(data),
					$close = $('<button></button>').attr('type', 'button').addClass('notice-dismiss').html('<span class="screen-reader-text">Dismiss this notice.</span>');
					
					function close() {
						clearTimeout($msg.data('timer'));
						
						$msg.fadeTo(100, 0, function() {
							$msg.slideUp(100, function() {
								$msg.remove();
							});
						});
					}
					
					$msg.data('timer', setTimeout(close, 5000));
					
					$close.click(function(e) {
						e.preventDefault();
						close();
					});
					
					$msg.append($data, $close);
					$messages.append($msg);
				},
				
				createBlob: function(appData, data, contentType) {
					return new Blob([data], {type: contentType});
				},
				
				createObjectURL: function(appData, data, contentType) {
					var blob = appData.fn.createBlob(appData, data, contentType);
					return URL.createObjectURL(blob);
				},

				reverse: function(appData, data) {
					const out = [];
					for(let i=0; i<data.length; i++) {
						out.unshift(data[i]);
					}
					return out;
				},

				getImageUrl: function(appData, imageObj, format) {
					var url = '';
					
					if(imageObj && imageObj.url && imageObj.url.length > 0) {
						if(imageObj.relative) {
							url = appData.wp_upload_url + imageObj.url;
						} else {
							url = imageObj.url;
						}
						
						if(format == 'style') {
							url = 'url(' + url + ')';
						}
					}
					
					return url;
				},
				
				selectImage: function(appData, rootScope, imageObj) {
					if(appData.wpFileFrameImage) {
						appData.wpFileFrameImage.detach();
						appData.wpFileFrameImage = null;
					}
					
					appData.wpFileFrameImage = wp.media.frames.file_frame = wp.media({
						library: {
							type:['image'] // image, audio, video, application/pdf
						},
						multiple: false
					});
					
					appData.wpFileFrameImage.on('select', function(e) {
						var attachment = appData.wpFileFrameImage.state().get('selection').first().toJSON(),
						url = attachment.url;
						
						if(url.indexOf(appData.wp_upload_url) !== -1) {
							url = url.replace(appData.wp_upload_url, '');
							imageObj.relative = true;
						} else {
							imageObj.relative = false;
						}
						imageObj.url = url;
						
						rootScope.scan();
					});
					
					appData.wpFileFrameImage.open();
				},
				
				saveEditorsData: function(appData) {
					if(appData.ui.activeLayer) {
						if($('#wp-vision-tooltip-editor-wrap').hasClass('html-active')){ // We are in text mode
							appData.ui.activeLayer.tooltip.data = $('#vision-tooltip-editor').val();
						} else { // We are in tinyMCE mode
							var activeEditor = tinyMCE.get('vision-tooltip-editor');
							if(activeEditor !== null) { // Make sure we're not calling setContent on null
								appData.ui.activeLayer.tooltip.data = activeEditor.getContent();
							}
						}
						
						if($('#wp-vision-popover-editor-wrap').hasClass('html-active')){ // We are in text mode
							appData.ui.activeLayer.popover.data = $('#vision-popover-editor').val();
						} else { // We are in tinyMCE mode
							var activeEditor = tinyMCE.get('vision-popover-editor');
							if(activeEditor !== null) { // Make sure we're not calling setContent on null
								appData.ui.activeLayer.popover.data = activeEditor.getContent();
							}
						}
					}
					
					var $editorCSS = $('#vision-notepad-css');
					if($editorCSS.length) {
						var editorCSS = ace.edit($editorCSS.get(0));
						appData.config.customCSS.data = editorCSS.getSession().getValue();
					}
					
					var $editorJS = $('#vision-notepad-js');
					if($editorJS.length) {
						var editorJS = ace.edit($editorJS.get(0));
						appData.config.customJS.data = editorJS.getSession().getValue();
					}
				},
				
				onTab: function(appData, tab) {
					if(appData.ui.tabs[tab]) {
						return;
					}
					
					var obj = appData.ui.tabs;
					for (var property in obj) {
						if (obj.hasOwnProperty(property)) {
							obj[property] = false;
						}
					}
					appData.ui.tabs[tab] = true;
					
					//---------------------------------
					// reinit ace editors
					appData.fn.saveEditorsData(appData);
					appData.rootScope.scan();
					
					switch(tab) {
						case 'builder': {
						}
						break;
						case 'customCSS': {
							var $editorCSS = $('#vision-notepad-css'),
							editorCSS = ace.edit($editorCSS.get(0));
							editorCSS.$blockScrolling = Infinity;
							editorCSS.setTheme('ace/theme/monokai'); // default theme
							editorCSS.session.setMode('ace/mode/css');
							
							if(appData.settings.themeCSS) {
								editorCSS.setTheme('ace/theme/' + appData.settings.themeCSS);
							}
							
							if(appData.config.customCSS.data) {
								editorCSS.getSession().setValue(appData.config.customCSS.data);
							}
						}
						break;
						case 'customJS': {
							var $editorJS = $('#vision-notepad-js'),
							editorJS = ace.edit($editorJS.get(0));
							editorJS.$blockScrolling = Infinity;
							editorJS.setTheme('ace/theme/monokai'); // default theme
							editorJS.session.setMode('ace/mode/javascript');
							
							if(appData.settings.themeJavaScript) {
								editorJS.setTheme('ace/theme/' + appData.settings.themeJavaScript);
							}
							
							if(appData.config.customJS.data) {
								editorJS.getSession().setValue(appData.config.customJS.data);
							}
						}
						break;
					}
					//---------------------------------
				},

				onLeftSidebarTab: function(appData, tab) {
					if(appData.ui.leftSidebarTabs[tab]) {
						return;
					}

					var obj = appData.ui.leftSidebarTabs;
					for (var property in obj) {
						if (obj.hasOwnProperty(property)) {
							obj[property] = false;
						}
					}
					appData.ui.leftSidebarTabs[tab] = true;
				},

				onRightSidebarTab: function(appData, tab) {
					if(appData.ui.rightSidebarTabs[tab]) {
						return;
					}
					
					var obj = appData.ui.rightSidebarTabs;
					for (var property in obj) {
						if (obj.hasOwnProperty(property)) {
							obj[property] = false;
						}
					}
					appData.ui.rightSidebarTabs[tab] = true;
				},
				
				onGeneralTab: function(appData, tab) {
					appData.ui.generalTab[tab] = !appData.ui.generalTab[tab];
				},
				
				onLayerTab: function(appData, tab) {
					appData.ui.layerTab[tab] = !appData.ui.layerTab[tab];
				},
				
				onTooltipTab: function(appData, tab) {
					appData.ui.tooltipTab[tab] = !appData.ui.tooltipTab[tab];
				},
				
				onPopoverTab: function(appData, tab) {
					appData.ui.popoverTab[tab] = !appData.ui.popoverTab[tab];
				},
				
				onResize: function(appData, e) {
				},
				
				toggleSidebarPanel: function(appData, type) {
					if( type === 'left' ) {
						appData.ui.builder.leftSidebar = !appData.ui.builder.leftSidebar;
					} else {
						appData.ui.builder.rightSidebar = !appData.ui.builder.rightSidebar;
					}
					appData.rootScope.scan();
				},
				
				canvasZoomIn: function(appData) {
					var zoom = (appData.ui.canvas.zoom === 0.01 ? 0 : appData.ui.canvas.zoom) + appData.ui.canvas.zoomStep;
					zoom = parseFloat(parseFloat(zoom).toFixed(2));

					appData.ui.prevCanvas.zoom = appData.ui.canvas.zoom;
					appData.ui.canvas.zoom = zoom;
				},
				
				canvasZoomOut: function(appData) {
					var zoom = appData.ui.canvas.zoom - appData.ui.canvas.zoomStep;
					zoom = parseFloat(parseFloat(zoom).toFixed(2));

					appData.ui.prevCanvas.zoom = appData.ui.canvas.zoom;
					appData.ui.canvas.zoom = (zoom <= 0 ? 0.01 : zoom);
				},
				
				canvasZoomDefault: function(appData) {
					appData.ui.prevCanvas.zoom = appData.ui.canvas.zoom;
					appData.ui.canvas.zoom = 1;
				},
				
				canvasZoomFit: function(appData) {
					var $img = $('#vision-layers-image'),
					$parent = $('#vision-layers-canvas-wrap');
					
					var widthRatio = ($img.width() ? $parent.width() / $img.width() : 0),
					heightRatio = ($img.height() ? $parent.height() / $img.height() : 0),
					ratio = 1;
					
					if(widthRatio > heightRatio) {
						ratio = heightRatio;
					} else {
						ratio = widthRatio;
					}

					appData.ui.prevCanvas.zoom = appData.ui.canvas.zoom;
					appData.ui.canvas.zoom = ratio;

					appData.ui.prevCanvas.x = appData.ui.canvas.x;
					appData.ui.prevCanvas.y = appData.ui.canvas.y;
					appData.ui.canvas.x = appData.ui.canvas.y = 0;
				},
				
				canvasMoveDefault: function(appData) {
					appData.ui.prevCanvas.x = appData.ui.canvas.x;
					appData.ui.prevCanvas.y = appData.ui.canvas.y;

					appData.ui.canvas.x = 0;
					appData.ui.canvas.y = 0;
				},

				getCanvasZoomForLabel: function(appData) {
					var zoom = parseFloat(parseFloat(appData.ui.canvas.zoom*100).toFixed(2));
					return parseInt(zoom,10);
				},

				getCanvasZoom: function(appData) {
					return appData.ui.canvas.zoom;
				},

				getCanvasPosition: function(appData) {
					return {x: appData.ui.canvas.x, y: appData.ui.canvas.y};
				},
				
				initLayer: function(appData, layer, el) {
					appData.ui.mapLayers.set(layer, $(el));
				},
				
				initLayerInner: function(appData, layer, el) {
					if(layer.type != 'text' || !layer.text.data) {
						return;
					}
					
					$(el).html(layer.text.data);
				},
				
				selectLayer: function(appData, layer) {
					appData.ui.activeLayer = layer;
					appData.rootScope.scan();
					
					var $layer = appData.ui.mapLayers.get(layer);
					if($layer) {
						$layer.trigger('focus');
					}

					appData.fn.hideTransformTool();

					if(layer.lock || !layer.visible || $layer.hasClass('vision-editing')) {
						return;
					}

					appData.fn.showTransformTool(layer);
				},
				
				isLayerActive: function(appData, layer) {
					return Object.is(appData.ui.activeLayer, layer);
				},
				
				onLayerItemClick: function(appData, layer) {
					console.log(layer);
					if(appData.fn.isLayerActive(appData, layer)) {
						appData.ui.activeLayer = null;
					} else {
						appData.fn.selectLayer(appData, layer);
					}
				},
				
				onLayerClick: function(appData, layer) {
					if(!appData.fn.isLayerActive(appData, layer)) {
						appData.fn.selectLayer(appData, layer);
					} else {
						var $layer = appData.ui.mapLayers.get(layer);
						if($layer) {
							$layer.trigger('focus');
						}
					}
				},

				editLayerText: function(appData, layer) {
					if(layer.lock || layer.type != 'text') {
						return;
					}

					const $layer = appData.ui.mapLayers.get(layer);
					const $el = $layer.find('.vision-layer-inner');

					let flag = false;
					if($el.text() == appData.msg_edit_text) {
						flag = true;
						$el.text('');
					}

					function onInput(e) {
						flag = false;
						layer.text.data = $el.html();
					}

					$layer.addClass('vision-editing');
					$el.attr('contenteditable', true).trigger('focus');
					let sel = window.getSelection();
					sel.selectAllChildren($el.get(0));
					sel.collapseToEnd();

					$el.on('input', onInput);

					$el.one('blur', function(e) {
						$layer.removeClass('vision-editing');
						$el.attr('contenteditable', false);
						$el.off('input', onInput);

						if(flag) {
							$el.text(appData.msg_edit_text);
						}
					});
				},

				onLayerKeyDown: function(appData, layer, e) {
					var $layer = appData.ui.mapLayers.get(layer);

					if(layer.lock || $layer.hasClass('vision-editing')) {
						return;
					}

					var flag = false;

					switch (e.which){
						case 37: { layer.x -= 1; flag=true; } break; //left arrow key
						case 38: { layer.y -= 1; flag=true; } break; //up arrow key
						case 39: { layer.x += 1; flag=true; } break; //right arrow key
						case 40: { layer.y += 1; flag=true; } break; //bottom arrow key
						case 13: {
							e.preventDefault();
							e.stopPropagation();

							appData.fn.editLayerText(appData, layer);
						} break;
					}

					if(flag) {
						e.preventDefault();
						e.stopPropagation();

						appData.rootScope.scan();
					}
				},

				prevLayer: function(appData) {
					if(appData.config.layers.length == 0) {
						return;
					}
					
					if(appData.ui.activeLayer) {
						for(var i=appData.config.layers.length-1;i>0;i--) {
							if(Object.is(appData.config.layers[i], appData.ui.activeLayer)) {
								break;
							}
						}
						i = (i - 1 < 0 ? appData.config.layers.length-1 : i - 1);
						appData.fn.selectLayer(appData, appData.config.layers[i]);
					} else if(appData.config.layers.length > 0) {
						appData.fn.selectLayer(appData, appData.config.layers[appData.config.layers.length-1]);
					}
				},
				
				nextLayer: function(appData) {
					if(appData.config.layers.length == 0) {
						return;
					}
					
					if(appData.ui.activeLayer) {
						for(var i=0;i<appData.config.layers.length;i++) {
							if(Object.is(appData.config.layers[i], appData.ui.activeLayer)) {
								break;
							}
						}
						i = (i + 1 >= appData.config.layers.length ? 0 : i + 1);
						appData.fn.selectLayer(appData, appData.config.layers[i]);
					} else if(appData.config.layers.length > 0) {
						appData.fn.selectLayer(appData, appData.config.layers[0]);
					}
				},
				
				addLayerLink: function(appData) {
					var layer = $.extend(true, {}, appData.defaultLayer);
					layer.guid = appData.fn.uuid();
					layer.id = appData.fn.uuid(8);
					layer.type = 'link';
					appData.config.layers.push(layer);
					appData.fn.selectLayer(appData, layer);
				},
				
				addLayerText: function(appData) {
					var layer = $.extend(true, {}, appData.defaultLayer);
					layer.guid = appData.fn.uuid();
					layer.id = appData.fn.uuid(8);
					layer.type = 'text';
					layer.text.data = appData.msg_edit_text;
					appData.config.layers.push(layer);
					appData.fn.selectLayer(appData, layer);
				},
				
				addLayerImage: function(appData) {
					var layer = $.extend(true, {}, appData.defaultLayer);
					layer.guid = appData.fn.uuid();
					layer.id = appData.fn.uuid(8);
					layer.type = 'image';
					appData.config.layers.push(layer);
					appData.fn.selectLayer(appData, layer);
				},
				
				addLayerSVG: function(appData) {
					var layer = $.extend(true, {}, appData.defaultLayer);
					layer.guid = appData.fn.uuid();
					layer.id = appData.fn.uuid(8);
					layer.type = 'svg';
					appData.config.layers.push(layer);
					appData.fn.selectLayer(appData, layer);
				},
				
				copyLayer: function(appData) {
					if(appData.ui.activeLayer == null) {
						return;
					}
					
					var index = null,
					len = appData.config.layers.length,
					layer = null;
					
					for(var i=0; i<len; i++) {
						layer = appData.config.layers[i];
						if(Object.is(appData.ui.activeLayer, layer)) {
							index = i;
							break;
						}
					}
					
					if(index == null) {
						return;
					}
					
					layer = $.extend(true, {}, layer);
					layer.guid = appData.fn.uuid();
					layer.id = appData.fn.uuid(8);
					layer.title = (layer.title ? layer.title : layer.type);
					layer.title = layer.title + (layer.title.includes('[copy]') ? '' : ' [copy]');
					
					appData.config.layers.splice(index+1, 0, layer);
					appData.fn.selectLayer(appData, layer);
				},
				
				updownLayer: function(appData, direction) {
					if(appData.ui.activeLayer == null) {
						return;
					}
					
					var index = null,
					len = appData.config.layers.length,
					layer = null;
					
					for(var i=0; i<len; i++) {
						layer = appData.config.layers[i];
						if(Object.is(appData.ui.activeLayer, layer)) {
							index = i;
							break;
						}
					}
					
					if(index == null) {
						return;
					}
					
					if(direction == 'up' && index > 0) {
						appData.config.layers[index] = appData.config.layers[index-1];
						appData.config.layers[index-1] = layer;
						
						index = index-1;
					} else if(direction == 'down' && index < (len-1)) {
						appData.config.layers[index] = appData.config.layers[index+1];
						appData.config.layers[index+1] = layer;
						
						index = index+1;
					} else {
						return;
					}
				},
				
				deleteLayer: function(appData) {
					if(appData.ui.activeLayer == null) {
						return;
					}
					
					var index = null,
					len = appData.config.layers.length;
					
					for(var i=0; i<len; i++) {
						var layer = appData.config.layers[i];
						if(Object.is(appData.ui.activeLayer, layer)) {
							index = i;
							break;
						}
					}
					
					if(index == null) {
						return;
					}
					
					var newIndex = index;
					if(index >= 0 && index < len) {
						appData.config.layers.splice(index,1);
						
						if(index == (len-1) && len > 1) {
							newIndex = (len-2);
						} else if(len == 1) {
							newIndex = null;
						}
					}
					
					appData.fn.selectLayer(appData, appData.config.layers[newIndex]);
				},
				
				editLayerAlign: function(appData, align) {
					if(appData.ui.activeLayer == null) {
						return;
					}
					
					var layer = appData.ui.activeLayer;
					
					switch(align) {
						case 'top':    { layer.y = -appData.config.imageHeight/2 + layer.height/2; } break;
						case 'middle': { layer.y = 0; } break;
						case 'bottom': { layer.y =  appData.config.imageHeight/2 - layer.height/2; } break;
						case 'left':   { layer.x = -appData.config.imageWidth/2 + layer.width/2; } break;
						case 'center': { layer.x = 0; } break;
						case 'right':  { layer.x =  appData.config.imageWidth/2 - layer.width/2; } break;
					}
				},
				
				toggleLayerPopover: function(appData, layer) {
					layer.popover.active = !layer.popover.active;
				},
				
				toggleLayerTooltip: function(appData, layer) {
					layer.tooltip.active = !layer.tooltip.active;
				},
				
				toggleLayerVisible: function(appData, layer) {
					layer.visible = !layer.visible;

					if(appData.ui.activeLayer && appData.ui.activeLayer.guid == layer.guid ) {
						if(!layer.visible) {
							appData.fn.hideTransformTool();
						} else {
							appData.fn.showTransformTool(layer);
						}
					}
				},
				
				toggleLayerLock: function(appData, layer) {
					layer.lock = !layer.lock;
					if(appData.ui.activeLayer && appData.ui.activeLayer.guid == layer.guid ) {
						if(layer.lock) {
							appData.fn.hideTransformTool();
						} else {
							appData.fn.showTransformTool(layer);
						}
					}
				},
				
				getLayerStyle: function(appData, layer, field) {
					switch(field) {
						case 'x': {
							return (layer.x - layer.width/2) + 'px';
						} break;
						case 'y': {
							return (layer.y - layer.height/2) + 'px';
						} break;
						case 'width': {
							return layer.width + 'px';
						} break;
						case 'height': { 
							return layer.height + 'px'; 
						} break;
						case 'angle': {
							return (layer.angle ? 'rotate(' + layer.angle + 'deg)' : 'rotate(0deg)');
						} break;
						case 'border-radius': {
							switch(layer.type) {
								case 'link': return (layer.link.radius ? layer.link.radius : '');
							}
							return null;
						} break;
						case 'background-color': {
							switch(layer.type) {
								case 'link' : return (layer.link.normalColor ? layer.link.normalColor : ''); break;
								case 'image': return (layer.image.background.color ? layer.image.background.color : ''); break;
								case 'text' : return (layer.text.background.color ? layer.text.background.color : ''); break;
							}
							return null;
						} break;
						case 'background-image': {
							switch(layer.type) {
								case 'image': return appData.fn.getImageUrl(appData, layer.image.background.file, 'style'); break;
								case 'text' : return appData.fn.getImageUrl(appData, layer.text.background.file, 'style'); break;
								case 'svg'  : return appData.fn.getImageUrl(appData, layer.svg.file, 'style'); break;
							}
							return null;
						} break;
						case 'background-size': {
							switch(layer.type) {
								case 'image': return (layer.image.background.size ? layer.image.background.size : '');
								case 'text' : return (layer.text.background.size ? layer.text.background.size : '');
								case 'svg'  : return '100% 100%';
							}
							return null;
						} break;
						case 'background-repeat': {
							switch(layer.type) {
								case 'image': return (layer.image.background.repeat ? layer.image.background.repeat : '');
								case 'text' : return (layer.text.background.repeat ? layer.text.background.repeat : '');
							}
							return null;
						} break;
						case 'background-position': {
							switch(layer.type) {
								case 'image': return (layer.image.background.position ? layer.image.background.position : '');
								case 'text' : return (layer.text.background.position ? layer.text.background.position : '');
							}
							return null;
						} break;
						case 'color': {
							switch(layer.type) {
								case 'text': return layer.text.color; break;
							}
							return null;
						} break;
						case 'font-family': {
							if(layer.type == 'text') {
								if(layer.text.font) {
									var selector = layer.text.font.replace(new RegExp('[+]|[:]', 'g'),'');
									
									if($('#' + selector).length == 0) {
										var head = document.getElementsByTagName('head')[0],
										linkFont = document.createElement('link');
										
										linkFont.setAttribute('id', selector);
										linkFont.setAttribute('rel', 'stylesheet');
										linkFont.setAttribute('href', 'https://fonts.googleapis.com/css?family=' + layer.text.font);
										head.appendChild(linkFont);
									}
									
									var fontName = layer.text.font.replace(new RegExp('[+]', 'g'),' ');
									
									return '"' + fontName + '", sans-serif';
								}
								return 'sans-serif';
							}
							return null;
						} break;
						case 'font-size': {
							if(layer.type == 'text') {
								return (layer.text.size > 0 ? layer.text.size : 0) + 'px';
							}
							return null;
						} break;
						case 'line-height': {
							if(layer.type == 'text') {
								return (layer.text.lineHeight > 0 ? layer.text.lineHeight : 0) + 'px';
							}
							return null;
						} break;
						case 'letter-spacing': {
							if(layer.type == 'text') {
								return (layer.text.letterSpacing > 0 ? layer.text.letterSpacing : 0) + 'px';
							}
							return null;
						} break;
						case 'text-align': {
							if(layer.type == 'text') {
								return (layer.text.align ? layer.text.align : '');
							}
						} break;
					}
					return null;
				},
				
				getLayerCoord: function(appData, layer, type) {
					switch(type) {
						case 'x': {
							return parseFloat(parseFloat(layer.x).toFixed(2));
						} break;
						case 'y': {
							return parseFloat(parseFloat(layer.y).toFixed(2));
						} break;
						case 'w': {
							return parseFloat(parseFloat(layer.width).toFixed(2));
						} break;
						case 'h': {
							return parseFloat(parseFloat(layer.height).toFixed(2));
						} break;
						case 'angle': {
							return Math.floor(layer.angle);
						} break;
					};
					return '';
				},

				showTransformTool: function(layer) {
					appData.transformTool.init(layer);
					appData.transformTool.start();
				},

				hideTransformTool: function() {
					appData.transformTool.end();
				},

				updateTransformTool: function() {
					if(appData.transformTool.isVisible()) {
						appData.transformTool.update();
					}
				},

				onMoveCanvasStart: function(appData, e) {
					e.preventDefault();
					e.stopPropagation();
					
					appData.ui.moveCanvas.initX = e.pageX;
					appData.ui.moveCanvas.initY = e.pageY;
					appData.ui.moveCanvas.lastX = e.pageX;
					appData.ui.moveCanvas.lastY = e.pageY;
					
					$('body').on('mousemove', $.proxy(appData.fn.onMoveCanvas, this, appData));
					$('body').on('mouseup', $.proxy(appData.fn.onMoveCanvasEnd, this, appData));
					$('body').on('mouseleave', $.proxy(appData.fn.onMoveCanvasEnd, this, appData));
				},
				
				onMoveCanvas: function(appData, e) {
					e.preventDefault();
					e.stopPropagation();
					
					var deltaX = e.pageX - appData.ui.moveCanvas.lastX,
					deltaY = e.pageY - appData.ui.moveCanvas.lastY;
					
					appData.ui.moveCanvas.lastX = e.pageX;
					appData.ui.moveCanvas.lastY = e.pageY;

					appData.ui.prevCanvas.x = appData.ui.canvas.x;
					appData.ui.prevCanvas.y = appData.ui.canvas.y;

					appData.ui.canvas.x += deltaX;
					appData.ui.canvas.y += deltaY;
					
					appData.rootScope.scan();
				},
				
				onMoveCanvasEnd: function(appData, e) {
					e.preventDefault();
					e.stopPropagation();
					
					$('body').off('mousemove', $.proxy(appData.fn.onMoveCanvas, this, appData));
					$('body').off('mouseup', $.proxy(appData.fn.onMoveCanvasEnd, this, appData));
					$('body').off('mouseleave', $.proxy(appData.fn.onMoveCanvasEnd, this, appData));
					
					appData.ui.moveCanvas.initX = null;
					appData.ui.moveCanvas.initY = null;
					appData.ui.moveCanvas.lastX = null;
					appData.ui.moveCanvas.lastY = null;
				},
				
				onSidebarResizeStart: function(appData, e, type) {
					e.preventDefault();
					e.stopPropagation();
					
					appData.ui.sidebarResize.initX = e.pageX;
					appData.ui.sidebarResize.lastX = e.pageX;
					appData.ui.sidebarResize.width = type === 'left' ? appData.ui.builder.leftSidebarWidth : appData.ui.builder.rightSidebarWidth;
					
					$('body').on('mousemove', $.proxy(appData.fn.onSidebarResize, this, appData, type));
					$('body').on('mouseup', $.proxy(appData.fn.onSidebarResizeEnd, this, appData));
					$('body').on('mouseleave', $.proxy(appData.fn.onSidebarResizeEnd, this, appData));
				},
				
				onSidebarResize: function(appData, type, e) {
					e.preventDefault();
					e.stopPropagation();

					var deltaX = e.pageX - appData.ui.sidebarResize.lastX;
					appData.ui.sidebarResize.lastX = e.pageX;

					if ( type === 'left' ) {
						appData.ui.sidebarResize.width += deltaX;
					} else {
						appData.ui.sidebarResize.width -= deltaX;
					}
					
					if(appData.ui.sidebarResize.width >= 350 && appData.ui.sidebarResize.width <= 800) {
						if ( type === 'left' ) {
							appData.ui.builder.leftSidebarWidth = appData.ui.sidebarResize.width;
						} else {
							appData.ui.builder.rightSidebarWidth = appData.ui.sidebarResize.width;
						}
						appData.rootScope.scan();
					}

					appData.fn.updateTransformTool();
				},
				
				onSidebarResizeEnd: function(appData, e) {
					e.preventDefault();
					e.stopPropagation();
					
					$('body').off('mousemove', $.proxy(appData.fn.onSidebarResize, this, appData));
					$('body').off('mouseup', $.proxy(appData.fn.onSidebarResizeEnd, this, appData));
					$('body').off('mouseleave', $.proxy(appData.fn.onSidebarResizeEnd, this, appData));
					
					appData.ui.sidebarResize.initX = null;
					appData.ui.sidebarResize.lastX = null;
					appData.ui.sidebarResize.width = null;
				},
				
				selectShowAnimation: function(appData, tooltip) {
					var modalData = {
						selectedClass: null,
					};
					
					appData.modal.fn.show(appData, 'show-effects', modalData, appData.fn.selectAnimationCallback).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							tooltip.showAnimation = modalData.selectedClass;
							appData.rootScope.scan();
						}
					});
				},
				
				selectHideAnimation: function(appData, tooltip) {
					var modalData = {
						selectedClass: null,
					};
					
					appData.modal.fn.show(appData, 'hide-effects', modalData, appData.fn.selectAnimationCallback).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							tooltip.hideAnimation = modalData.selectedClass;
							appData.rootScope.scan();
						}
					});
				},
				
				selectAnimationCallback: function(modalData) {
					var animationEvent = function() {
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
					};
					
					$('#vision-modal-' + modalData.id).find('.vision-modal-effect[data-fx-name]').on('click', function(e) {
						var $btn = $(this),
						fx = $btn.data('fx-name');
						$btn.removeClass(fx).addClass(fx);
						
						modalData.selectedClass = fx;
						modalData.rootScope.scan();
					});
					
					$('#vision-modal-' + modalData.id).find('.vision-modal-effect[data-fx-name]').on('dblclick', function(e) {
						var $btn = $(this),
						fx = $btn.data('fx-name');
						
						modalData.selectedClass = fx;
						modalData.deferred.resolve(true);
					});
					
					$('#vision-modal-' + modalData.id).find('.vision-modal-effect[data-fx-name]').on(animationEvent(), function(e) {
						var $btn = $(this),
						fx = $btn.data('fx-name');
						
						if($btn.hasClass(fx)) {
							$btn.removeClass(fx);
						}
					});
				},
				
				floor: function(appData, value) {
					return Math.floor(value);
				},
				
				assignObject: function(appData, srcObj, dstObj) {
					for(var prop in srcObj) {
						if(dstObj.hasOwnProperty(prop)) {
							dstObj[prop] = srcObj[prop];
						}
					}
				},
				
				copyToClipboard: function(appData, selector) {
					var $el = $(selector);
					if($el.length == 0) {
						return;
					}
					
					var text = $el.val();
					
					if(window.clipboardData && window.clipboardData.setData) {
						// IE specific code path to prevent textarea being shown while dialog is visible.
						return clipboardData.setData('Text', text); 
					} else if(document.queryCommandSupported && document.queryCommandSupported('copy')) {
						var textarea = document.createElement('textarea');
						textarea.textContent = text;
						textarea.style.position = 'fixed';  // prevent scrolling to bottom of page in MS Edge.
						document.body.appendChild(textarea);
						textarea.select();
						try {
							document.execCommand('copy');  // Security exception may be thrown by some browsers.
						} catch (ex) {
							console.warn('Copy to clipboard failed.', ex);
						} finally {
							document.body.removeChild(textarea);
						}
					}
					
					$el.select();
				},
				
				generateLayerId: function(appData, rootScope, layer) {
					function isUnique(id) {
						for(var i=0;i<appData.config.layers.length;i++) {
							if(appData.config.layers[i].id == id)
								return false;
						}
						return true;
					}
					var id = appData.fn.uuid(8);
					while(!isUnique(id)) {
						id = appData.fn.uuid();
					}
					layer.id = id;
					rootScope.scan();
				},
				
				uuid: function(limit) {
					var result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
						var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
						return v.toString(16);
					});
					
					return (limit > 0 ? result.substring(0,limit) : result);
				},
			},
			
			modal: {
				count: 0,
				items: [],
				
				fn: {
					resize: function(modalData) {
						var $modal = $('#vision-modal-' + modalData.id),
						$dialog = $modal.find('.vision-modal-dialog'),
						$header = $modal.find('.vision-modal-header'),
						$data = $modal.find('.vision-modal-data'),
						$footer = $modal.find('.vision-modal-footer');
						
						var h = $header.outerHeight() + $footer.outerHeight() + 50,
						wh = $(window).height(),
						dh = $data.height();
						
						if(dh > wh - h) {
							$data.outerHeight(wh - h);
						}
					},
					show: function(appData, modalName, modalData, callback) {
						var id = ++appData.modal.count,
						deferred = $.Deferred();
						
						appData.modal.items.push(id);
						appData.inprocess++;
						
						$.ajax({
							url: appData.wp_ajax_url,
							type: 'GET',
							dataType: 'html',
							data: {
								nonce: appData.wp_ajax_nonce,
								action: appData.wp_ajax_action_modal,
								name: modalName
							}
						}).done(function(html) {
							$('body').addClass('vision-modal-open');
							
							var $modal = $(html),
							scope = {};
							scope.modalData = modalData;
							scope.modalData.id = id;
							scope.modalData.deferred = deferred;
							scope.modalData.appData = appData;
							
							if(modalData.easyClose == undefined || modalData.easyClose) {
								$modal.on('click', function(e) {
									scope.modalData.deferred.resolve('close');
								});
							}
							
							$('#vision-modals').append($modal);
							
							var $dialog = $modal.find('.vision-modal-dialog');
							$dialog.on('click', function(e) {
								return false;
							});
							
							modalData.rootScope = appData.alight($modal.get(0), scope);
							
							appData.modal.fn.resize(modalData);
						}).fail(function(xhr, textStatus, thrownError) {
							appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
						}).always(function() {
							if (callback && typeof callback == 'function') { // make sure the callback is a function
								callback.call(this, modalData); // brings the scope to the callback
							}
							appData.inprocess--;
						});
						
						return deferred.promise();
					},
					close: function(appData, id) {
						$('#vision-modal-' + id).remove();
						
						var index = appData.modal.items.indexOf(id);
						appData.modal.items.splice(index, 1);
						if(appData.modal.items.length == 0) {
							jQuery('body').removeClass('vision-modal-open');
						}
					}
				}
			}
		};
		
		//=========================================================
		// Angular Light Isolate Initialization
		//=========================================================
		var alightInitCallback = function(alight) {
			delete window.alightInitCallback;
			
			//=========================================================
			// Directives
			//=========================================================
			alight.directives.al.uuid = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $(element);
					
					$value.on('input change', onValueInput);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onValueInput(e) {
						var value = $value.val(),
						isValid = true;
						
						if(isBlank(value)) {
							//value = null;
							isValid = false;
						} else {
							if(value.match('^[a-zA-Z0-9_-]+$')) { // check integer (allow the number 0 to be valid by itself but still invalid when in front of other numbers)
								value = value;
							} else {
								isValid = false;
							}
						}
						
						if(isValid) {
							env.setValue(expression, value);
							env.scan();
							callback();
							
							$el.removeClass('vision-invalid');
						} else {
							$el.addClass('vision-invalid');
						}
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val(null);
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.text = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $(element);
					
					$value.on('input change', onValueInput);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(isBlank(value)) {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
						callback();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val(null);
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.textarea = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $(element);
					
					$el.addClass('vision-textarea');
					$value.on('input change', onValueInput);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(isBlank(value)) {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
						callback();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val(null);
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.integer = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $(element);
					
					$value.on('input change', onValueInput);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onValueInput(e) {
						var value = $value.val(),
						isValid = true;
						
						if(isBlank(value)) {
							value = null;
						} else {
							if(value.match('^([+-]?[1-9]+[0-9]*|0)$')) { // check integer (allow the number 0 to be valid by itself but still invalid when in front of other numbers)
								value = parseInt(value, 10);
							} else {
								isValid = false;
							}
						}
						
						if(isValid) {
							env.setValue(expression, value);
							env.scan();
							callback();
							
							$el.removeClass('vision-invalid');
						} else {
							$el.addClass('vision-invalid');
						}
					}
					
					env.watch(expression, function(value) {
						$el.removeClass('vision-invalid');
						
						if(value == null) {
							$value.val(null);
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.float = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $(element);
					
					$value.on('input change', onValueInput);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onValueInput(e) {
						var value = $value.val(),
						isValid = true;
						
						if(isBlank(value)) {
							value = null;
						} else {
							if(value.match('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$')) { // check float
								value = parseFloat(value);
							} else {
								isValid = false;
							}
						}
						
						if(isValid) {
							env.setValue(expression, value);
							env.scan();
							callback();
							
							$el.removeClass('vision-invalid');
						} else {
							$el.addClass('vision-invalid');
						}
					}
					
					env.watch(expression, function(value) {
						$el.removeClass('vision-invalid');
						
						if(value == null) {
							$value.val(null);
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.toggle = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element);
					$el.addClass('vision-toggle').html('&nbsp;');
					$el.on('mousedown touchstart', onItemClick);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function onItemClick(e) {
						env.setValue(expression, !env.getValue(expression));
						env.scan();
						callback();
					}
					
					env.watch(expression, function(value) {
						if(value) {
							$el.addClass('vision-checked').removeClass('vision-unchecked');
						} else {
							$el.removeClass('vision-checked').addClass('vision-unchecked');
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.checkbox = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element);
					
					$el.addClass('vision-checkbox').html('<i class="vision-icon vision-icon-check"></i>');
					$el.on('mousedown touchstart', onItemClick);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function onItemClick(e) {
						env.setValue(expression, !env.getValue(expression));
						env.scan();
						callback();
					}
					
					env.watch(expression, function(value) {
						if(value) {
							$el.addClass('vision-checked').removeClass('vision-unchecked');
						} else {
							$el.removeClass('vision-checked').addClass('vision-unchecked');
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.unit = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					// template
					//.vision-unit
					//   .vision-unit-value
					//   .vision-unit-type
					var $el = $(element),
					$value = $('<input/>').addClass('vision-unit-value'),
					$dropdown = $('<select/>').addClass('vision-unit-type');
					$dropdown.append('<option value="px">px</li>');
					$dropdown.append('<option value="%">%</li>');
					$dropdown.append('<option value="em">em</li>');
					$dropdown.append('<option value="cm">cm</li>');
					$dropdown.append('<option value="mm">mm</li>');
					$dropdown.append('<option value="in">in</li>');
					$dropdown.append('<option value="pt">pt</li>');
					$dropdown.append('<option value="pc">pc</li>');
					$dropdown.append('<option value="ex">ex</li>');
					$dropdown.append('<option value="ch">ch</li>');
					$dropdown.append('<option value="rem">rem</li>');
					$dropdown.append('<option value="vw">vw</li>');
					$dropdown.append('<option value="vh">vh</li>');
					$dropdown.append('<option value="vmin">vmin</li>');
					$dropdown.append('<option value="vmax">vmax</li>');
					
					$el.append($value, $dropdown);
					$value.on('input change', onValueInput);
					$dropdown.on('change', onDropdownInput);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onValueInput(e) {
						var value = $value.val(),
						isValid = true;
						
						if(isBlank(value)) {
							value = {
								value: null,
								type: $dropdown.val()
							}
						} else {
							if(value.match('^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$')) { // check float
								value = {
									value: parseFloat(value),
									type: $dropdown.val()
								}
							} else {
								isValid = false;
							}
						}
						
						if(isValid) {
							env.setValue(expression, value);
							env.scan();
							callback();
							
							$value.removeClass('vision-invalid');
						} else {
							$value.addClass('vision-invalid');
						}
					}
					
					function onDropdownInput(e) {
						var type = $dropdown.val(),
						value = env.getValue(expression);
						
						if(value) {
							value.type = type;
							env.setValue(expression, value);
							env.scan();
							callback();
						}
					}
					
					env.watch(expression, function(value) {
						$value.removeClass('vision-invalid');
						
						if(value == null) {
							$value.val(null);
							$dropdown.val('px');
						} else {
							$value.val(value.value);
							$dropdown.val(value.type);
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.style = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					if(!env.attrArgument) {
						return;
					}
					var $el = $(element),
					styleName = env.attrArgument.split('.')[0];
					
					env.watch(expression, function(value) {
						$el.css(styleName, value);
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.backgroundrepeat = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="repeat">repeat</option>');
					$value.append('<option value="repeat-x">repeat-x</option>');
					$value.append('<option value="repeat-y">repeat-y</option>');
					$value.append('<option value="no-repeat">no-repeat</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.backgroundsize = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="auto">auto</option>');
					$value.append('<option value="cover">cover</option>');
					$value.append('<option value="contain">contain</option>');
					$value.append('<option value="100% 100%">stretch</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.textfont = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className),
					fonts = env.getValue($el.data('fonts'));
					
					for(var i=0;i<fonts.length;i++) {
						var view = fonts[i].fontname.replace(new RegExp('[+]', 'g'),' '),
						value = fonts[i].fontname;
						
						$value.append('<option value="' + value + '">' + view + '</option>');
					}
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.textalign = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="left">left</option>');
					$value.append('<option value="right">right</option>');
					$value.append('<option value="center">center</option>');
					$value.append('<option value="justify">justify</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.color = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					// template
					//.vision-color
					//   .vision-color-btn
					//   .vision-color-value
					var $el = $(element),
					$btn = $('<div></div>').addClass('vision-color-btn').append('<div><div></div></div>'),
					$value = $('<input/>').addClass('vision-color-value');
					
					$el.append($btn, $value);
					$btn.on('click touchend', onBtnClick);
					$value.on('input change', onValueInput);
					
					//=========================================================
					// colorPicker
					// a set of RE's that can match strings and generate color tuples. https://github.com/jquery/jquery-color/
					var stringParsers = [
						{
							re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
							parse: function(execResult) {
								return [
									execResult[1],
									execResult[2],
									execResult[3],
									execResult[4]
								];
							}
						},
						{
							re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
							parse: function(execResult) {
								return [
									2.55 * execResult[1],
									2.55 * execResult[2],
									2.55 * execResult[3],
									execResult[4]
								];
							}
						},
						{
							re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
							parse: function(execResult) {
								return [
									parseInt(execResult[1], 16),
									parseInt(execResult[2], 16),
									parseInt(execResult[3], 16)
								];
							}
						}
						/*
						{
							re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
							parse: function(execResult) {
								return [
									parseInt(execResult[1] + execResult[1], 16),
									parseInt(execResult[2] + execResult[2], 16),
									parseInt(execResult[3] + execResult[3], 16)
								];
							}
						}
						*/
					];
					
					function Color() {
						this.rgb = {
							r: 0, // [0: 255]
							g: 0, // [0: 255]
							b: 0  // [0: 255]
						};
						this.hsb = {
							h: 0, // [0: 360]
							s: 0, // [0: 100]
							b: 0  // [0: 100]
						};
						this.alpha = 1; // [0: 1]
					};
					Color.prototype = {
						// translate a format from Color object to a string
						rgb: function() {
							return 'rgb(' + this.rgb.r + ',' + this.rgb.g + ',' + this.rgb.b + ')';
						},
						rgba: function() {
							return 'rgba(' + this.rgb.r + ',' + this.rgb.g + ',' + this.rgb.b + ',' + this.alpha + ')';
						},
						hex: function() {
							return this.toHex();
						},
						
						RGBAtoHSBA: function(r, g, b, a) {
							var hue = 0,
							max = Math.max(r, g, b), 
							min = Math.min(r, g, b), 
							delta = max - min;
							
							var brightness = max / 255, 
							saturation = (max != 0) ? delta / max : 0;
							
							if(saturation) {
								var rr = (max - r) / delta,
								gr = (max - g) / delta, 
								br = (max - b) / delta;
								
								if (r == max) hue = br - gr;
								else if (g == max) hue = 2 + rr - br;
								else hue = 4 + gr - rr;
								
								hue /= 6;
								if (hue < 0) hue++;
							}
							
							return {
								h: Math.round(hue * 360),
								s: Math.round(saturation * 100),
								b: Math.round(brightness * 100), //b: Math.floor(brightness * 100),
								a: a || 1
							};
						},
						
						HSBAtoRGBA: function(h, s, b, a) {
							var h = h,
							s = s / 100,
							b = b / 100;
							
							var R, G, B, X, C;
							h = (h % 360) / 60;
							C = b * s;
							X = C * (1 - Math.abs(h % 2 - 1));
							R = G = B = b - C;
							
							h = ~~h;
							R += [C, X, 0, 0, X, C][h];
							G += [X, C, C, X, 0, 0][h];
							B += [0, 0, X, C, C, X][h];
							
							return {
								r: Math.round(R * 255),
								g: Math.round(G * 255),
								b: Math.round(B * 255), //Math.ceil(B * 255),
								a: a || 1
							};
						},
						
						//parse a string to HSB and RGB
						setColor: function(color) {
							color = color.toLowerCase();
							for (var key in stringParsers) {
								if (stringParsers.hasOwnProperty(key)) {
									var parser = stringParsers[key];
									var match = parser.re.exec(color),
										values = match && parser.parse(match);
									if (values) {
										var hsba = this.RGBAtoHSBA.apply(null, values);
										
										this.hsb = {
											h: hsba.h,
											s: hsba.s,
											b: hsba.b
										};
										
										this.rgb = {
											r: values[0],
											g: values[1],
											b: values[2]
										}
										
										this.alpha = hsba.a;
										
										return true;
									}
								}
							}
							return false;
						},
						
						setRed: function(r) {
							if(r > 255) { r = 255; }
							else if(r < 0) { r = 0; };
							this.rgb.r = r;
							
							var hsb = this.RGBAtoHSBA(this.rgb.r, this.rgb.g, this.rgb.b);
							this.hsb = {
								h: hsb.h,
								s: hsb.s,
								b: hsb.b
							}
						},
						
						setGreen: function(g) {
							if(g > 255) { g = 255; }
							else if(g < 0) { g = 0; };
							this.rgb.g = g;
							
							var hsb = this.RGBAtoHSBA(this.rgb.r, this.rgb.g, this.rgb.b);
							this.hsb = {
								h: hsb.h,
								s: hsb.s,
								b: hsb.b
							}
						},
						
						setBlue: function(b) {
							if(b > 255) { b = 255; }
							else if(b < 0) { b = 0; };
							this.rgb.b = b;
							
							var hsb = this.RGBAtoHSBA(this.rgb.r, this.rgb.g, this.rgb.b);
							this.hsb = {
								h: hsb.h,
								s: hsb.s,
								b: hsb.b
							}
						},
						
						setHue: function(h) {
							if(h > 360) { h = 360; }
							else if(h < 0) { h = 0; };
							this.hsb.h = h;
							
							var rgb = this.HSBAtoRGBA(this.hsb.h, this.hsb.s, this.hsb.b);
							this.rgb = {
								r: rgb.r,
								g: rgb.g,
								b: rgb.b
							}
						},
						
						setSaturation: function(s) {
							if(s > 100) { s = 100; }
							else if(s < 0) { s = 0; };
							this.hsb.s = s;
							
							var rgb = this.HSBAtoRGBA(this.hsb.h, this.hsb.s, this.hsb.b);
							this.rgb = {
								r: rgb.r,
								g: rgb.g,
								b: rgb.b
							}
						},
						
						setBrightness: function(b) {
							if(b > 100) { b = 100; }
							else if(b < 0) { b = 0; };
							this.hsb.b = b;
							
							var rgb = this.HSBAtoRGBA(this.hsb.h, this.hsb.s, this.hsb.b);
							this.rgb = {
								r: rgb.r,
								g: rgb.g,
								b: rgb.b
							}
						},
						
						setAlpha: function(a) {
							var a = parseInt(a * 100, 10) / 100;
							if(a > 1) { a = 1; }
							else if(a < 0) { a = 0; };
							this.alpha = a;
						},
						
						toRGBA: function() {
							return {
								r: this.rgb.r,
								g: this.rgb.g,
								b: this.rgb.b,
								a: this.alpha
							}
						},
						
						toHSBA: function() {
							return {
								h: this.hsb.h,
								s: this.hsb.s,
								b: this.hsb.b,
								a: this.alpha
							}
						},
						
						toHex: function() {
							return '#' + ((1 << 24) | (parseInt(this.rgb.r, 10) << 16) | (parseInt(this.rgb.g, 10) << 8) | parseInt(this.rgb.b, 10)).toString(16).substr(1);
						}
					};
					
					function ColorPicker(config) {
						this.config = null;
						this.color = new Color();
						this.controls = {};
						this.inputEdit = {
							enabled: false,
							pageY: 0,
							value: 0,
							type: null
						},
						
						this._init(config);
					};
					ColorPicker.prototype = {
						//=============================================
						// Properties & methods (shared for all instances)
						//=============================================
						defaults: {
							onSelect: null
						},
						
						//=============================================
						// Private Methods
						//=============================================
						_init: function(config) {
							this.config = $.extend(true, {}, this.defaults, config);
							this._create();
						},
						
						_create: function() {
							this._buildDOM();
							this._bind();
							this._refresh();
						},
						
						_buildDOM: function() {
							var $data = $('<div></div>').addClass('vision-data'),
							$picker = $('<div></div>').addClass('vision-color-picker'),
							$pallete_thumb = $('<div></div>').addClass('vision-thumb'),
							$pallete = $('<div></div>').addClass('vision-pallete').append($pallete_thumb),
							$hue_thumb = $('<div></div>').addClass('vision-thumb'),
							$hue = $('<div></div>').addClass('vision-hue').append($hue_thumb),
							$panel = $('<div></div>').addClass('vision-panel'),
							$input_rgb_r = $('<div></div>').addClass('vision-input').append('<span>R<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>'),
							$input_rgb_g = $('<div></div>').addClass('vision-input').append('<span>G<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>'),
							$input_rgb_b = $('<div></div>').addClass('vision-input').append('<span>B<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>'),
							$input_line = $('<div></div>').addClass('vision-line'),
							$input_hsb_h = $('<div></div>').addClass('vision-input').append('<span>H<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>'),
							$input_hsb_s = $('<div></div>').addClass('vision-input').append('<span>S<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>'),
							$input_hsb_b = $('<div></div>').addClass('vision-input').append('<span>B<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>');
							
							$panel.append($input_rgb_r, $input_rgb_g, $input_rgb_b, $input_line, $input_hsb_h, $input_hsb_s, $input_hsb_b);
							$picker.append($data.append($pallete, $hue, $panel));
							
							this.controls.$picker = $picker;
							this.controls.$pallete = $pallete;
							this.controls.$pallete_thumb = $pallete_thumb;
							this.controls.$hue = $hue;
							this.controls.$hue_thumb = $hue_thumb;
							this.controls.$input_rgb_r = $input_rgb_r.find('input');
							this.controls.$input_rgb_g = $input_rgb_g.find('input');
							this.controls.$input_rgb_b = $input_rgb_b.find('input');
							this.controls.$input_hsb_h = $input_hsb_h.find('input');
							this.controls.$input_hsb_s = $input_hsb_s.find('input');
							this.controls.$input_hsb_b = $input_hsb_b.find('input');
							this.controls.$input_rgb_r_thumb = $input_rgb_r.find('.vision-thumb');
							this.controls.$input_rgb_g_thumb = $input_rgb_g.find('.vision-thumb');
							this.controls.$input_rgb_b_thumb = $input_rgb_b.find('.vision-thumb');
							this.controls.$input_hsb_h_thumb = $input_hsb_h.find('.vision-thumb');
							this.controls.$input_hsb_s_thumb = $input_hsb_s.find('.vision-thumb');
							this.controls.$input_hsb_b_thumb = $input_hsb_b.find('.vision-thumb');
							
							
							var $data = $('<div></div>').addClass('vision-data'),
							$alpha_thumb = $('<div></div>').addClass('vision-thumb'),
							$alpha_gradient = $('<div></div>').addClass('vision-gradient'),
							$alpha = $('<div></div>').addClass('vision-alpha').append($alpha_gradient, $alpha_thumb),
							$panel = $('<div></div>').addClass('vision-panel'),
							$input_alpha = $('<div></div>').addClass('vision-input').append('<span>A<input type="text" maxlength="3" size="3"/><span class="vision-thumb"></span></span>');
							
							$panel.append($input_alpha);
							$picker.append($data.append($alpha, $panel));
							
							this.controls.$alpha = $alpha;
							this.controls.$alpha_thumb = $alpha_thumb;
							this.controls.$alpha_gradient = $alpha_gradient;
							this.controls.$input_alpha = $input_alpha.find('input');
							this.controls.$input_alpha_thumb = $input_alpha.find('.vision-thumb');
							
							var $data = $('<div></div>').addClass('vision-data'),
							$preview = $('<div></div>').addClass('vision-preview').append('<div><div></div></div>'),
							$input_color = $('<input readonly />').addClass('vision-input-color'),
							$submit = $('<div></div>').addClass('vision-submit').text('OK');
							
							$picker.append($data.append($preview, $input_color, $submit));
							
							this.controls.$preview = $preview.find('> div > div');
							this.controls.$input_color = $input_color;
							this.controls.$submit = $submit;
							
							$picker.appendTo('body');
						},
						
						_bind: function() {
							// sliders
							this.controls.$pallete.on('mousedown', $.proxy(this._onPalleteEditStart, this) );
							this.controls.$pallete.on('click', $.proxy(this._onPalleteEditMove, this) );
							this.controls.$hue.on('mousedown', $.proxy(this._onHueEditStart, this) );
							this.controls.$hue.on('click', $.proxy(this._onHueEditMove, this) );
							this.controls.$alpha.on('mousedown', $.proxy(this._onAlphaEditStart, this) );
							this.controls.$alpha.on('click', $.proxy(this._onAlphaEditMove, this) );
							
							// inputs
							this.controls.$input_rgb_r_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'rgb_r') );
							this.controls.$input_rgb_g_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'rgb_g') );
							this.controls.$input_rgb_b_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'rgb_b') );
							this.controls.$input_hsb_h_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'hsb_h') );
							this.controls.$input_hsb_s_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'hsb_s') );
							this.controls.$input_hsb_b_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'hsb_b') );
							this.controls.$input_alpha_thumb.on('mousedown', $.proxy(this._onInputEditStart, this, 'alpha') );
							
							this.controls.$input_rgb_r.on('input', $.proxy(this._onInput, this, 'rgb_r') );
							this.controls.$input_rgb_g.on('input', $.proxy(this._onInput, this, 'rgb_g') );
							this.controls.$input_rgb_b.on('input', $.proxy(this._onInput, this, 'rgb_b') );
							this.controls.$input_hsb_h.on('input', $.proxy(this._onInput, this, 'hsb_h') );
							this.controls.$input_hsb_s.on('input', $.proxy(this._onInput, this, 'hsb_s') );
							this.controls.$input_hsb_b.on('input', $.proxy(this._onInput, this, 'hsb_b') );
							this.controls.$input_alpha.on('input', $.proxy(this._onInput, this, 'alpha') );
							
							// submit
							this.controls.$submit.on('click', $.proxy(this._onSubmit, this) );
						},
						
						_refresh: function() {
							var rgb = this.color.toRGBA(),
							hsb = this.color.toHSBA();
							
							// pallete
							var h = this.controls.$pallete.outerHeight() - 2, // with correction (border 1px)
							w = this.controls.$pallete.outerWidth() - 2; // with correction (border 1px)
							this.controls.$pallete.css({'background-color': 'hsl(' + hsb.h + ', 100%, 50%)'});
							this.controls.$pallete_thumb.css({top: parseInt(h - h * hsb.b/100, 10)});
							this.controls.$pallete_thumb.css({left: parseInt(w - w * (100-hsb.s)/100, 10)});
							
							// hue
							var h = this.controls.$hue.outerHeight() - 2; // with correction (border 1px)
							this.controls.$hue_thumb.css({top: parseInt(h - h * hsb.h/360, 10)});
							
							// alpha
							var w = this.controls.$alpha.outerWidth() - 2; // with correction (border 1px)
							this.controls.$alpha_thumb.css({left: parseInt(w - w * (1 - hsb.a), 10)});
							this.controls.$alpha_gradient.css({background:'linear-gradient(to left,' + this.color.hex() + ',rgba(0,0,0,0))'});
							
							// inputs
							this.controls.$input_rgb_r.val(rgb.r); // [0:255]
							this.controls.$input_rgb_g.val(rgb.g); // [0:255]
							this.controls.$input_rgb_b.val(rgb.b); // [0:255]
							
							this.controls.$input_hsb_h.val(hsb.h); // [0 : 360]
							this.controls.$input_hsb_s.val(hsb.s); // [0 : 100]
							this.controls.$input_hsb_b.val(hsb.b); // [0 : 100]
							
							this.controls.$input_alpha.val(parseInt(rgb.a * 100, 10)); // [0:100]
							
							// preview
							this.controls.$preview.css({'background-color': this.color.rgba()});
							this.controls.$input_color.val(rgb.a != 1 ? this.color.rgba() : this.color.hex() );
						},
						
						_show: function($target) {
							var offset = $target.offset(),
							targetW = $target.outerWidth(),
							targetH = $target.outerHeight(),
							pickerW = this.controls.$picker.outerWidth(),
							pickerH = this.controls.$picker.outerHeight(),
							top = offset.top - pickerH - 1,
							left = offset.left;
							
							this.controls.$picker.offset({
								top: top,
								left: left
							});
							
							// correct layout
							var rc = this.controls.$picker.get(0).getBoundingClientRect();
							if(rc.y < 0) {
								top = offset.top + targetH + offsetH + 1;
								this.controls.$picker.offset({top: top});
							}
							if((rc.x + rc.width) > window.innerWidth) {
								left = offset.left + targetW - pickerW;
								this.controls.$picker.offset({left: left});
							}
							
							this.controls.$picker.addClass('vision-active');
							
							$('body').on('mousedown touchstart', $.proxy(this._onBodyClick, this) );
						},
						
						_hide: function() {
							this.controls.$picker.removeClass('vision-active').css({'top':'', 'left':''});
							
							$('body').off('mousedown touchstart', $.proxy(this._onBodyClick, this) );
						},
						
						_destroy: function() {
							if(this.controls.$picker) {
								this.controls.$picker.remove();
							}
							
							this.config = null;
							this.color = new Color();
							this.controls = {};
						},
						
						_onPalleteEditStart: function(e) {
							$('body').on('mouseup', $.proxy(this._onPalleteEditEnd, this) );
							$('body').on('mousemove', $.proxy(this._onPalleteEditMove, this) );
						},
						
						_onPalleteEditMove: function(e) {
							var h = this.controls.$pallete.outerHeight(),
							w = this.controls.$pallete.outerWidth(),
							s = 100 - parseInt(100*(w - Math.max(0,Math.min(w,(e.pageX - this.controls.$pallete.offset().left))))/w, 10),
							b = parseInt(100*(h - Math.max(0,Math.min(h,(e.pageY - this.controls.$pallete.offset().top))))/h, 10);
							
							this.color.setSaturation(s);
							this.color.setBrightness(b);
							
							this._refresh();
							return false;
						},
						
						_onPalleteEditEnd: function(e) {
							$('body').off('mouseup', $.proxy(this._onPalleteEditEnd, this) );
							$('body').off('mousemove', $.proxy(this._onPalleteEditMove, this) );
							
							this._refresh();
							return false;
						},
						
						_onHueEditStart: function(e) {
							$('body').on('mouseup', $.proxy(this._onHueEditEnd, this) );
							$('body').on('mousemove', $.proxy(this._onHueEditMove, this) );
						},
						
						_onHueEditMove: function(e) {
							var sliderHeight = this.controls.$hue.outerHeight(),
							hue = parseInt(360*(sliderHeight - Math.max(0,Math.min(sliderHeight,(e.pageY - this.controls.$hue.offset().top))))/sliderHeight, 10);
							
							this.color.setHue(hue);
							
							this._refresh();
							return false;
						},
						
						_onHueEditEnd: function(e) {
							$('body').off('mouseup', $.proxy(this._onHueEditEnd, this) );
							$('body').off('mousemove', $.proxy(this._onHueEditMove, this) );
							
							this._refresh();
							return false;
						},
						
						_onAlphaEditStart: function(e) {
							$('body').on('mouseup', $.proxy(this._onAlphaEditEnd, this) );
							$('body').on('mousemove', $.proxy(this._onAlphaEditMove, this) );
						},
						
						_onAlphaEditMove: function(e) {
							var sliderWidth = this.controls.$alpha.outerWidth(),
							alpha = 1 - (sliderWidth - Math.max(0,Math.min(sliderWidth,(e.pageX - this.controls.$alpha.offset().left))))/sliderWidth;
							
							this.color.setAlpha(alpha);
							
							this._refresh();
							return false;
						},
						
						_onAlphaEditEnd: function(e) {
							$('body').off('mouseup', $.proxy(this._onAlphaEditEnd, this) );
							$('body').off('mousemove', $.proxy(this._onAlphaEditMove, this) );
							
							this._refresh();
							return false;
						},
						
						_onInputEditStart: function(type, e) {
							$('body').on('mouseup', $.proxy(this._onInputEditEnd, this) );
							$('body').on('mousemove', $.proxy(this._onInputEditMove, this) );
							
							this.inputEdit.enabled = true;
							this.inputEdit.pageY = e.pageY;
							this.inputEdit.value = parseInt($(e.target).siblings('input').val(), 10);
							this.inputEdit.type = type;
						},
						
						_onInputEditMove: function(e) {
							if(this.inputEdit.enabled) {
								var delta = e.pageY - this.inputEdit.pageY,
								value = this.inputEdit.value + delta;
								
								switch(this.inputEdit.type) {
									case 'rgb_r': { this.color.setRed(value); } break;
									case 'rgb_g': { this.color.setGreen(value); } break;
									case 'rgb_b': { this.color.setBlue(value); } break;
									case 'hsb_h': { this.color.setHue(value); } break;
									case 'hsb_s': { this.color.setSaturation(value); } break;
									case 'hsb_b': { this.color.setBrightness(value); } break;
									case 'alpha': { this.color.setAlpha(value/100); } break;
								}
							}
							
							this._refresh();
							return false;
						},
						
						_onInputEditEnd: function(e) {
							$('body').off('mouseup', $.proxy(this._onInputEditEnd, this) );
							$('body').off('mousemove', $.proxy(this._onInputEditMove, this) );
							
							this.inputEdit.enabled = false;
							this.inputEdit.pageY = 0;
							this.inputEdit.value = 0;
							this.inputEdit.type = null;
							
							this._refresh();
							return false;
						},
						
						_onInput: function(type, e) {
							var value = $(e.target).val();
							value = parseInt(value, 10) || 0;
							
							switch(type) {
								case 'rgb_r': { this.color.setRed(value); } break;
								case 'rgb_g': { this.color.setGreen(value); } break;
								case 'rgb_b': { this.color.setBlue(value); } break;
								case 'hsb_h': { this.color.setHue(value); } break;
								case 'hsb_s': { this.color.setSaturation(value); } break;
								case 'hsb_b': { this.color.setBrightness(value); } break;
								case 'alpha': { this.color.setAlpha(value/100); } break;
							}
							
							this._refresh();
							return false;
						},
						
						_onSubmit: function(e) {
							this._hide();
							
							if (typeof this.config.onSelect == "function") { // make sure the callback is a function
								this.config.onSelect.call(this, this.color);
							}
						},
						
						_onBodyClick: function(e) {
							if(this.controls.$picker.has(e.target).length === 0 && !$(e.target).hasClass('vision-color-picker')) {
								this._hide();
							}
						},
						
						//=============================================
						// Public Methods
						//=============================================
						show: function($target, color) {
							if(color) {
								this.color.setColor(color);
								this._refresh();
							}
							this._show($target);
						},
						
						hide: function() {
							this._hide();
						},
						
						destroy: function() {
							this._destroy();
						}
					}
					//=========================================================
					
					var colorPicker = new ColorPicker({
						onSelect: onSelect
					});
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function isBlank(str) {
						return (!str || /^\s*$/.test(str));
					}
					
					function onSelect(color) {
						var value = (color.alpha == 1 ? color.hex() : color.rgba());
						env.setValue(expression, value);
						env.scan();
						callback();
						
						$value.val(value);
					}
					
					function onBtnClick(e) {
						colorPicker.show($btn, env.getValue(expression));
					}
					
					function onValueInput(e) {
						var $value = $(this),
						value = $value.val(),
						isValid = true;
						
						if(isBlank(value)) {
							value = null;
						} else {
							var color = new Color();
							if(!color.setColor(value)) {
								isValid = false;
							}
						}
						
						if(isValid) {
							env.setValue(expression, value);
							env.scan();
							callback();
							
							$(element).removeClass('vision-invalid');
						} else {
							$(element).addClass('vision-invalid');
						}
					}
					
					env.changeDetector.watch('$destroy', function() {
						colorPicker.destroy();
					});
					
					env.watch(expression, function(value) {
						$(element).removeClass('vision-invalid');
						
						if(value == null) {
							$value.val(null);
							$btn.find('> div > div').css({'background-color': ''});
						} else {
							var color = new Color();
							if(color.setColor(value)) {
								$btn.find('> div > div').css({'background-color': color.rgba()});
							} else {
								$btn.find('> div > div').css({'background-color': ''});
							}
							$value.val(value);
						}
						
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.tooltipplacement = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="top">top</option>');
					$value.append('<option value="right">right</option>');
					$value.append('<option value="bottom">bottom</option>');
					$value.append('<option value="left">left</option>');
					$value.append('<option value="top-left">top-left</option>');
					$value.append('<option value="top-right">top-right</option>');
					$value.append('<option value="right-top">right-top</option>');
					$value.append('<option value="right-bottom">right-bottom</option>');
					$value.append('<option value="bottom-left">bottom-left</option>');
					$value.append('<option value="bottom-right">bottom-right</option>');
					$value.append('<option value="left-top">left-top</option>');
					$value.append('<option value="left-bottom">left-bottom</option>');
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.tooltiptrigger = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="hover">hover</option>');
					$value.append('<option value="focus">focus</option>');
					$value.append('<option value="click">click</option>');
					$value.append('<option value="clickbody">click & body</option>');
					$value.append('<option value="sticky">sticky</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.popovertype = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="tooltip">tooltip</option>');
					$value.append('<option value="inbox">inbox</option>');
					$value.append('<option value="lightbox">lightbox</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'default') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('default');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.popoverplacement = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="top-left">top-left</option>');
					$value.append('<option value="top">top</option>');
					$value.append('<option value="top-right">top-right</option>');
					$value.append('<option value="right-top">right-top</option>');
					$value.append('<option value="right">right</option>');
					$value.append('<option value="right-bottom">right-bottom</option>');
					$value.append('<option value="bottom-right">bottom-right</option>');
					$value.append('<option value="bottom">bottom</option>');
					$value.append('<option value="bottom-left">bottom-left</option>');
					$value.append('<option value="left-bottom">left-bottom</option>');
					$value.append('<option value="left">left</option>');
					$value.append('<option value="left-top">left-top</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			
			alight.directives.al.popovertrigger = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element),
					$value = $('<select/>').addClass($el.get(0).className);
					$value.append('<option value="none">none</option>');
					$value.append('<option value="hover">hover</option>');
					$value.append('<option value="focus">focus</option>');
					$value.append('<option value="click">click</option>');
					$value.append('<option value="dblclick">dblclick</option>');
					
					$el.append($value);
					$value.unwrap();
					$value.on('change', onValueInput);
					
					function onValueInput(e) {
						var value = $value.val();
						
						if(value == 'none') {
							value = null;
						}
						
						env.setValue(expression, value);
						env.scan();
					}
					
					env.watch(expression, function(value) {
						if(value == null) {
							$value.val('none');
						} else {
							$value.val(value);
						}
					}, {readOnly: true});
				}
			}
			//=========================================================
			// Filters
			//=========================================================
			
			//=========================================================
			// Event Modifiers
			//=========================================================
			//alight.hooks.eventModifier['enter'] = 'keydown keyup';
			
			//=========================================================
			// Initialization
			//=========================================================
			appData.config = $.extend(true, {}, appData.defaultConfig);
			appData.alight = alight;
			appData.rootScope = appData.alight(document.querySelectorAll('#vision-app-item')[0], {appData: appData});
			
			appData.fn.init(appData);
		};
		window.alightInitCallback = alightInitCallback;
	}
	
	function page_settings() {
		//=========================================================
		// Application Model Data
		//=========================================================
		var appData = {
			alight: null,
			rootScope: null,
			
			wp_ajax_url: null,
			wp_ajax_nonce: null,
			wp_ajax_action_update: null, // update settings
			wp_ajax_action_get: null, // get themes
			wp_ajax_action_delete_data: null, // delete all data
			wp_ajax_action_modal: null,
			wp_ajax_msg_error: null,
			
			themes: null,
			roles: null,
			
			// used for save/restore config data (user interface + plugin config)
			config: null,
			
			defaultConfig: {
				themeJavaScript: null,
				themeCSS: null,
				roles: null
			},
			
			fn: {
				init: function(appData) {
					$('#vision-app-settings').removeAttr('style');
					
					// init ajax
					appData.plan = vision_globals.plan;
					appData.wp_ajax_url = vision_globals.ajax_url;
					appData.wp_ajax_nonce = vision_globals.ajax_nonce;
					appData.wp_ajax_action_update = vision_globals.ajax_action_update;
					appData.wp_ajax_action_get = vision_globals.ajax_action_get;
					appData.wp_ajax_action_delete_data = vision_globals.ajax_action_delete_data;
					appData.wp_ajax_action_modal = vision_globals.ajax_action_modal;
					appData.wp_ajax_msg_error = vision_globals.ajax_msg_error;
					
					appData.fn.initConfig(appData);
				},
				
				enableLoading: function(appData) {
					$('#vision-app-settings').removeClass('vision-active');
				},
				
				disableLoading: function(appData) {
					setTimeout(function() {
						$('#vision-app-settings').addClass('vision-active');
					}, 1000);
				},
				
				loadData: function(appData, dataName) {
					var def = $.Deferred();
					
					$.ajax({
						url: appData.wp_ajax_url,
						type: 'POST',
						dataType: 'json',
						data: {
							nonce: appData.wp_ajax_nonce,
							action: appData.wp_ajax_action_get,
							type: dataName
						},
						success: function(json){
							if(json && json.success) {
								def.resolve(json.data);
								return;
							}
							this.error();
						},
						error: function (xhr, ajaxOptions, thrownError) {
							appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
							def.reject();
						}
					});
					
					return def.promise();
				},
				
				initConfig: function(appData) {
					appData.fn.enableLoading(appData);
					
					var cfg = $.extend(true, {}, appData.defaultConfig, (vision_globals.config ? JSON.parse(vision_globals.config) : null));
					appData.config = cfg;
					
					if(appData.config) { // leave only default properties
						for(var key in appData.config) {
							if(!appData.defaultConfig.hasOwnProperty(key)) {
								delete appData.config[key];
							}
						}
					}
					
					appData.fn.loadData(appData, 'editor-themes').done(function(data) {
						appData.themes = data.list;
					}).always(function(){
						appData.rootScope.scan();
						appData.fn.disableLoading(appData);
					});
					
					appData.fn.loadData(appData, 'roles').done(function(data) {
						appData.roles = data.list;
					}).always(function(){
						appData.rootScope.scan();
						appData.fn.disableLoading(appData);
					});
				},
				
				saveConfig: function(appData) {
					appData.fn.enableLoading(appData);
					
					var cfg = $.extend(true, {}, appData.config);
					cfg = JSON.stringify(cfg);
					
					$.ajax({
						url: appData.wp_ajax_url,
						type: 'POST',
						dataType: 'json',
						data: {
							nonce: appData.wp_ajax_nonce,
							action: appData.wp_ajax_action_update,
							config: cfg
						}
					}).done(function(json) {
						if(json) {
							appData.fn.showNotice(appData, json.data.msg, (json.success ? 'notice-success' : 'notice-error'));
							return;
						}
						appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
					}).fail(function() {
						appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
					}).always(function() {
						appData.fn.disableLoading(appData);
					});
				},
				
				deleteAllData: function(appData, text) {
					var modalData = {
						text: text
					};
					
					appData.modal.fn.show(appData, 'confirm', modalData).then(function(result) {
						appData.modal.fn.close(appData, modalData.id);
						
						if(result == 'close') {
							return;
						}
						
						if(result) {
							appData.fn.enableLoading(appData);
							
							$.ajax({
								url: appData.wp_ajax_url,
								type: 'POST',
								dataType: 'json',
								data: {
									nonce: appData.wp_ajax_nonce,
									action: appData.wp_ajax_action_delete_data
								}
							}).done(function(json) {
								if(json) {
									appData.fn.showNotice(appData, json.data.msg, (json.success ? 'notice-success' : 'notice-error'));
									return;
								}
								appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
							}).fail(function() {
								appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
							}).always(function() {
								appData.fn.disableLoading(appData);
							});
							
							appData.rootScope.scan();
						}
					});
				},
				
				showNotice: function(appData, data, type) { // type: notice-success, notice-error, notice-warning, notice-info
					var $messages = $('#vision-messages'),
					$msg = $('<div></div>').addClass('notice is-dismissible').addClass(type),
					$data = $('<p></p>').html(data),
					$close = $('<button></button>').attr('type', 'button').addClass('notice-dismiss').html('<span class="screen-reader-text">Dismiss this notice.</span>');
					
					function close() {
						clearTimeout($msg.data('timer'));
						
						$msg.fadeTo(100, 0, function() {
							$msg.slideUp(100, function() {
								$msg.remove();
							});
						});
					}
					
					$msg.data('timer', setTimeout(close, 5000));
					
					$close.click(function(e) {
						e.preventDefault();
						close();
					});
					
					$msg.append($data, $close);
					$messages.append($msg);
				},
			},
			
			modal: {
				count: 0,
				items: [],
				
				fn: {
					resize: function(modalData) {
						var $modal = $('#vision-modal-' + modalData.id),
						$dialog = $modal.find('.vision-modal-dialog'),
						$header = $modal.find('.vision-modal-header'),
						$data = $modal.find('.vision-modal-data'),
						$footer = $modal.find('.vision-modal-footer');
						
						var h = $header.outerHeight() + $footer.outerHeight() + 50,
						wh = $(window).height(),
						dh = $data.height();
						
						if(dh > wh - h) {
							$data.outerHeight(wh - h);
						}
					},
					show: function(appData, modalName, modalData, callback) {
						var id = ++appData.modal.count,
						deferred = $.Deferred();
						
						appData.modal.items.push(id);
						appData.inprocess++;
						
						$.ajax({
							url: appData.wp_ajax_url,
							type: 'GET',
							dataType: 'html',
							data: {
								nonce: appData.wp_ajax_nonce,
								action: appData.wp_ajax_action_modal,
								name: modalName
							}
						}).done(function(html) {
							$('body').addClass('vision-modal-open');
							
							var $modal = $(html),
							scope = {};
							scope.modalData = modalData;
							scope.modalData.id = id;
							scope.modalData.deferred = deferred;
							scope.modalData.appData = appData;
							
							if(modalData.easyClose == undefined || modalData.easyClose) {
								$modal.on('click', function(e) {
									scope.modalData.deferred.resolve('close');
								});
							}
							
							$('#vision-modals').append($modal);
							
							var $dialog = $modal.find('.vision-modal-dialog');
							$dialog.on('click', function(e) {
								return false;
							});
							
							modalData.rootScope = appData.alight($modal.get(0), scope);
							
							appData.modal.fn.resize(modalData);
						}).fail(function(xhr, textStatus, thrownError) {
							appData.fn.showNotice(appData, appData.wp_ajax_msg_error, 'notice-error');
						}).always(function() {
							if (callback && typeof callback == 'function') { // make sure the callback is a function
								callback.call(this, modalData); // brings the scope to the callback
							}
							appData.inprocess--;
						});
						
						return deferred.promise();
					},
					close: function(appData, id) {
						$('#vision-modal-' + id).remove();
						
						var index = appData.modal.items.indexOf(id);
						appData.modal.items.splice(index, 1);
						if(appData.modal.items.length == 0) {
							jQuery('body').removeClass('vision-modal-open');
						}
					}
				}
			}
		}
		
		//=========================================================
		// Angular Light Isolate Initialization
		//=========================================================
		var alightInitCallback = function(alight) {
			delete window.alightInitCallback;
			
			//=========================================================
			// Directives
			//=========================================================
			alight.directives.al.toggle = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					var $el = $(element);
					$el.addClass('vision-toggle').html('&nbsp;');
					$el.on('mousedown touchstart', onItemClick);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function onItemClick(e) {
						env.setValue(expression, !env.getValue(expression));
						env.scan();
						callback();
					}
					
					env.watch(expression, function(value) {
						if(value) {
							$el.addClass('vision-checked').removeClass('vision-unchecked');
						} else {
							$el.removeClass('vision-checked').addClass('vision-unchecked');
						}
					}, {readOnly: true});
				}
			};
			
			alight.directives.al.checkboxlist = {
				restrict: 'EA',
				link: function(scope, element, expression, env) {
					// template
					//.<ul>
					//   <li><div class="vision-checkbox"></div><div class="vision-name"></div></li>
					var $el = $(element),
					$ul = $('<ul>'),
					predefined = $el.data('predefined'),
					source = $el.data('src');
					
					$el.addClass('vision-checkboxlist').append($ul);
					$el.on('click', '.vision-checkbox', onItemClick);
					
					function callback() {
						var callback = $el.data('callback');
						if(callback) {
							var fn = env.changeDetector.compile(callback);
							fn(scope);
						}
					}
					
					function onItemClick(e) {
						var $checkbox = $(this),
						$li = $checkbox.parent(),
						id = $li.data('id'),
						dataSrc = env.getValue(source);
						
						for(var i=0;i<dataSrc.length;i++) {
							if(dataSrc[i].id == id) {
								var dataDst = env.getValue(expression);
								if(dataDst) {
									var flag = true;
									for(var j=0;j<dataDst.length;j++) {
										if(dataDst[j] == id) {
											flag = false;
											dataDst.splice(j, 1);
											$checkbox.removeClass('vision-checked');
											
											if(dataDst.length == 0) {
												dataDst = null;
											}
											
											break;
										}
									}
									if(flag) {
										dataDst.push(id);
										$checkbox.addClass('vision-checked');
									}
								} else {
									dataDst = [];
									dataDst.push(id);
									$checkbox.addClass('vision-checked');
								}
								
								env.setValue(expression, dataDst);
								env.scan();
								
								callback();
								
								break;
							}
						}
					}
					
					if(source) {
						env.watch(source, function(data) {
							var dataSrc = env.getValue(source),
							dataDst = env.getValue(expression);
							
							$ul.empty();
							if(dataSrc instanceof Array) {
								for(var i=0;i<dataSrc.length;i++) {
									var $li = $('<li>').attr({'data-id':dataSrc[i].id}),
									$checkbox = $('<div>').addClass('vision-checkbox'),
									$name = $('<div>').addClass('vision-name').text(dataSrc[i].name);
									
									if(predefined == dataSrc[i].id) {
										$checkbox.addClass('vision-checked vision-readonly');
									}
									
									if(dataDst instanceof Array) {
										for(var j=0;j<dataDst.length;j++) {
											if(dataDst[j] == dataSrc[i].id) {
												$checkbox.addClass('vision-checked');
												break;
											}
										}
									}
									
									$li.append($checkbox, $name);
									$ul.append($li);
								}
							}
						}, {readOnly: true});
					}
				}
			};
			//=========================================================
			// Initialization
			//=========================================================
			appData.config = $.extend(true, {}, appData.defaultConfig);
			appData.alight = alight;
			appData.rootScope = appData.alight(document.querySelectorAll('#vision-app-settings')[0], {appData: appData});
			
			appData.fn.init(appData);
		};
		window.alightInitCallback = alightInitCallback;
	}

	
	//=========================================================
	// Entry point
	//=========================================================
	if($('#vision-app-items').length) { page_items(); } 
	else if($('#vision-app-item').length) { page_item(); }
	else if($('#vision-app-settings').length) { page_settings(); }

	/**
	 * Angular Light 0.14.0
	 * (c) 2016 Oleg Nechaev
	 * Released under the MIT License.
	 */
	(function() {
		"use strict";
		function buildAlight() {
			var alight = function(element, data) {
				return alight.bootstrap(element, data);
			}
			alight.version = '0.14.0';
			alight.filters = {};
			alight.text = {};
			alight.core = {};
			alight.utils = {};
			alight.option = {
				globalController: false,
				removeAttribute: true,
				domOptimization: true,
				domOptimizationRemoveEmpty: true,
				fastBinding: true
			};
			alight.debug = {
				scan: 0,
				directive: false,
				watch: false,
				watchText: false,
				parser: false
			};
			alight.ctrl = alight.controllers = {};
			alight.d = alight.directives = {
				al: {},
				bo: {},
				$global: {}
			};
			alight.hooks = {
				directive: [],
				binding: []
			};
			alight.priority = {
				al: {
					app: 2000,
					checked: 20,
					'class': 30,
					css: 30,
					focused: 20,
					'if': 700,
					'ifnot': 700,
					model: 25,
					radio: 25,
					repeat: 1000,
					select: 20,
					stop: -10,
					value: 20,
					on: 10
				},
				$component: 5,
				$attribute: -5
			};
			var f$ = alight.f$ = {};

			var removeItem = function(list, item) {
				var i = list.indexOf(item);
				if(i >= 0) list.splice(i, 1)
				else console.warn('trying to remove not exist item')
			};
			/* next postfix.js */

	/* library to work with DOM */
	(function(){
		f$.before = function(base, elm) {
			var parent = base.parentNode;
			parent.insertBefore(elm, base)
		};

		f$.after = function(base, elm) {
			var parent = base.parentNode;
			var n = base.nextSibling;
			if(n) parent.insertBefore(elm, n)
			else parent.appendChild(elm)
		};

		f$.remove = function(elm) {
			var parent = elm.parentNode;
			if(parent) parent.removeChild(elm)
		};

		// on / off
		f$.on = function(element, event, callback) {
			element.addEventListener(event, callback, false)
		};
		f$.off = function(element, event, callback) {
			element.removeEventListener(event, callback, false)
		};

		f$.isFunction = function(fn) {
			return (fn && Object.prototype.toString.call(fn) === '[object Function]')
		};

		f$.isObject = function(o) {
			return (o && Object.prototype.toString.call(o) === '[object Object]')
		};

		f$.isPromise = function(p) {
			return p && window.Promise && p instanceof window.Promise;
		};

		f$.isElement = function(el) {
			return el instanceof HTMLElement
		};

		f$.addClass = function(element, name) {
			if(element.classList) element.classList.add(name)
			else element.className += ' ' + name
		};

		f$.removeClass = function(element, name) {
			if(element.classList) element.classList.remove(name)
			else element.className = element.className.replace(new RegExp('(^| )' + name.split(' ').join('|') + '( |$)', 'gi'), ' ')
		};

		f$.rawAjax = function(args) {
			var request = new XMLHttpRequest();
			request.open(args.type || 'GET', args.url, true, args.username, args.password);
			for(var i in args.headers) request.setRequestHeader(i, args.headers[i]);

			if(args.success) {
				request.onload = function() {
					if (request.status >= 200 && request.status < 400){
						args.success(request.responseText);
					} else {
						if(args.error) args.error();
					}
				}
			}
			if(args.error) request.onerror = args.error;

			request.send(args.data || null);
		};

		/*
			ajax
				cache
				type
				url
				success
				error
				username
				password
				data
				headers
		*/
		f$.ajaxCache = {};
		f$.ajax = function(args) {
			if(args.username || args.password || args.headers || args.data || !args.cache) return f$.rawAjax(args);

			// cache
			var queryType = args.type || 'GET';
			var cacheKey = queryType + ':' + args.url;
			var d = f$.ajaxCache[cacheKey];
			if(!d) f$.ajaxCache[cacheKey] = d = {callback: []};  // data
			if(d.result) {
				if(args.success) args.success(d.result);
				return
			}
			d.callback.push(args);
			if(d.loading) return;
			d.loading = true;
			f$.rawAjax({
				type: queryType,
				url: args.url,
				success: function(result) {
					d.loading = false
					d.result = result;
					for(var i=0;i<d.callback.length;i++)
						if(d.callback[i].success) d.callback[i].success(result)
					d.callback.length = 0;
				},
				error: function() {
					d.loading = false
					for(var i=0;i<d.callback.length;i++)
						if(d.callback[i].error) d.callback[i].error()
					d.callback.length = 0;
				}
			})
		};

		// append classes
		(function(){
			var css = '@charset "UTF-8";[al-cloak],[hidden],.al-hide{display:none !important;}';
			var head = document.querySelectorAll('head')[0];

			var s = document.createElement('style');
			s.setAttribute('type', 'text/css');
			if (s.styleSheet) {  // IE
				s.styleSheet.cssText = css;
			} else {
				s.appendChild(document.createTextNode(css));
			}
			head.appendChild(s);
		})();

	})();

	f$.ready = (function() {
		var callbacks = [];
		var ready = false;
		function onReady() {
			ready = true;
			f$.off(document, 'DOMContentLoaded', onReady);
			for(var i=0;i<callbacks.length;i++)
				callbacks[i]();
			callbacks.length = 0;
		};
		f$.on(document, 'DOMContentLoaded', onReady);
		return function(callback) {
			if(ready) callback();
			else callbacks.push(callback)
		}
	})();

	if (window.jQuery) {
		window.jQuery.fn.alight = function (data) {
			var elements = [];
			this.each(function (i, el) { return elements.push(el); });
			if (elements.length)
				return alight(elements, data);
		};
	}

	alight.core.getFilter = function (name, cd) {
		var filter = cd.locals[name];
		if (filter && (f$.isFunction(filter) || filter.init || filter.fn))
			return filter;
		filter = alight.filters[name];
		if (filter)
			return filter;
		throw 'Filter not found: ' + name;
	};
	function makeSimpleFilter(filter, option) {
		var onStop;
		var values = [];
		var active = false;
		var cd = option.cd;
		var callback = option.callback;
		if (option.filterConf.args.length) {
			var watchers = [];
			option.filterConf.args.forEach(function (exp, i) {
				var w = cd.watch(exp, function (value) {
					values[i + 1] = value;
					handler();
				});
				if (!w.$.isStatic)
					watchers.push(w);
			});
			var planned = false;
			var handler = function () {
				if (!planned) {
					planned = true;
					cd.watch('$onScanOnce', function () {
						planned = false;
						if (active) {
							var result = filter.apply(null, values);
							if (f$.isPromise(result)) {
								result.then(function (value) {
									callback(value);
									cd.scan();
								});
							}
							else
								callback(result);
						}
					});
				}
			};
			if (watchers.length) {
				onStop = function () {
					watchers.forEach(function (w) { return w.stop(); });
				};
			}
		}
		else {
			var handler = function () {
				var result = filter(values[0]);
				if (f$.isPromise(result)) {
					result.then(function (value) {
						callback(value);
						cd.scan();
					});
				}
				else
					callback(result);
			};
		}
		var node = {
			onChange: function (value) {
				active = true;
				values[0] = value;
				handler();
			},
			onStop: onStop,
			watchMode: option.watchMode
		};
		return node;
	}
	alight.core.buildFilterNode = function (cd, filterConf, filter, callback) {
		if (f$.isFunction(filter)) {
			return makeSimpleFilter(filter, { cd: cd, filterConf: filterConf, callback: callback });
		}
		else if (filter.init) {
			return filter.init.call(cd, cd.scope, filterConf.raw, {
				setValue: callback,
				conf: filterConf,
				changeDetector: cd
			});
		}
		else if (f$.isFunction(filter.fn)) {
			return makeSimpleFilter(filter.fn, { cd: cd, filterConf: filterConf, callback: callback, watchMode: filter.watchMode });
		}
		throw 'Wrong filter: ' + filterConf.name;
	};
	function makeFilterChain(cd, ce, prevCallback, option) {
		var watchMode = null;
		var oneTime = option.oneTime;
		if (option.isArray)
			watchMode = 'array';
		else if (option.deep)
			watchMode = 'deep';
		if (!prevCallback) {
			var watchObject_1 = {
				el: option.element,
				ea: option.elementAttr
			};
			prevCallback = function (value) {
				execWatchObject(cd.scope, watchObject_1, value);
			};
		}
		var chain = alight.utils.parsFilter(ce.filter);
		var onStop = [];
		for (var i = chain.result.length - 1; i >= 0; i--) {
			var filter = alight.core.getFilter(chain.result[i].name, cd);
			var node = alight.core.buildFilterNode(cd, chain.result[i], filter, prevCallback);
			if (node.watchMode)
				watchMode = node.watchMode;
			if (node.onStop)
				onStop.push(node.onStop);
			prevCallback = node.onChange;
		}
		;
		option = {
			oneTime: oneTime
		};
		if (watchMode === 'array')
			option.isArray = true;
		else if (watchMode === 'deep')
			option.deep = true;
		if (onStop.length) {
			option.onStop = function () {
				onStop.forEach(function (fn) { return fn(); });
				onStop.length = 0;
			};
		}
		return cd.watch(ce.expression, prevCallback, option);
	}
	;

	var ChangeDetector, ErrorValue, Root, WA, displayError, execWatchObject, get_time, innerEvents, notEqual, scanCore, watchAny, watchInitValue;

	alight.ChangeDetector = function(scope) {
	  var cd, root;
	  root = new Root();
	  cd = new ChangeDetector(root, scope || {});
	  root.topCD = cd;
	  return cd;
	};

	Root = function() {
	  this.watchers = {
		any: [],
		finishBinding: [],
		finishScan: [],
		finishScanOnce: [],
		onScanOnce: []
	  };
	  this.status = null;
	  this.extraLoop = false;
	  this.finishBinding_lock = false;
	  this.lateScan = false;
	  this.topCD = null;
	  return this;
	};

	Root.prototype.destroy = function() {
	  this.watchers.any.length = 0;
	  this.watchers.finishBinding.length = 0;
	  this.watchers.finishScan.length = 0;
	  this.watchers.finishScanOnce.length = 0;
	  this.watchers.onScanOnce.length = 0;
	  if (this.topCD) {
		return this.topCD.destroy();
	  }
	};

	ChangeDetector = function(root, scope) {
	  this.scope = scope;
	  this.locals = scope;
	  this.root = root;
	  this.watchList = [];
	  this.destroy_callbacks = [];
	  this.parent = null;
	  this.children = [];
	  this.rwatchers = {
		any: [],
		finishScan: [],
		elEvents: []
	  };
	};

	ChangeDetector.prototype["new"] = function(scope, option) {
	  var Locals, cd, parent;
	  option = option || {};
	  parent = this;
	  if (scope == null) {
		scope = parent.scope;
	  }
	  cd = new ChangeDetector(parent.root, scope);
	  cd.parent = parent;
	  if (scope === parent.scope) {
		if (option.locals) {
		  Locals = parent._ChildLocals;
		  if (!Locals) {
			parent._ChildLocals = Locals = function() {
			  this.$$root = scope;
			  return this;
			};
			Locals.prototype = parent.locals;
		  }
		  cd.locals = new Locals();
		} else {
		  cd.locals = parent.locals;
		}
	  }
	  parent.children.push(cd);
	  return cd;
	};

	ChangeDetector.prototype.destroy = function() {
	  var cd, child, d, fn, i, j, k, l, len, len1, len2, len3, len4, len5, m, n, o, ref, ref1, ref2, ref3, ref4, ref5, root, wa;
	  cd = this;
	  root = cd.root;
	  cd.scope = null;
	  if (cd.parent) {
		removeItem(cd.parent.children, cd);
	  }
	  ref = cd.destroy_callbacks;
	  for (j = 0, len = ref.length; j < len; j++) {
		fn = ref[j];
		fn();
	  }
	  ref1 = cd.children.slice();
	  for (k = 0, len1 = ref1.length; k < len1; k++) {
		child = ref1[k];
		child.destroy();
	  }
	  cd.destroy_callbacks.length = 0;
	  ref2 = cd.watchList;
	  for (l = 0, len2 = ref2.length; l < len2; l++) {
		d = ref2[l];
		if (d.onStop) {
		  d.onStop();
		}
	  }
	  cd.watchList.length = 0;
	  ref3 = cd.rwatchers.any;
	  for (m = 0, len3 = ref3.length; m < len3; m++) {
		wa = ref3[m];
		removeItem(root.watchers.any, wa);
	  }
	  cd.rwatchers.any.length = 0;
	  ref4 = cd.rwatchers.finishScan;
	  for (n = 0, len4 = ref4.length; n < len4; n++) {
		wa = ref4[n];
		removeItem(root.watchers.finishScan, wa);
	  }
	  cd.rwatchers.finishScan.length = 0;
	  ref5 = this.rwatchers.elEvents;
	  for (o = 0, len5 = ref5.length; o < len5; o++) {
		i = ref5[o];
		f$.off(i[0], i[1], i[2]);
	  }
	  this.rwatchers.elEvents.length = 0;
	  if (root.topCD === cd) {
		root.topCD = null;
		root.destroy();
	  }
	};

	WA = function(callback) {
	  return this.cb = callback;
	};

	watchAny = function(cd, key, callback) {
	  var root, wa;
	  root = cd.root;
	  wa = new WA(callback);
	  cd.rwatchers[key].push(wa);
	  root.watchers[key].push(wa);
	  return {
		stop: function() {
		  removeItem(cd.rwatchers[key], wa);
		  return removeItem(root.watchers[key], wa);
		}
	  };
	};

	ChangeDetector.prototype.on = function(element, eventName, callback) {
	  f$.on(element, eventName, callback);
	  return this.rwatchers.elEvents.push([element, eventName, callback]);
	};

	innerEvents = {
	  $any: function(cd, callback) {
		return watchAny(cd, 'any', callback);
	  },
	  $finishScan: function(cd, callback) {
		return watchAny(cd, 'finishScan', callback);
	  },
	  $finishScanOnce: function(cd, callback) {
		cd.root.watchers.finishScanOnce.push(callback);
	  },
	  $onScanOnce: function(cd, callback) {
		cd.root.watchers.onScanOnce.push(callback);
	  },
	  $destroy: function(cd, callback) {
		cd.destroy_callbacks.push(callback);
	  },
	  $finishBinding: function(cd, callback) {
		cd.root.watchers.finishBinding.push(callback);
	  }
	};


	/*
		option:
			isArray
			readOnly
			oneTime
			deep
			onStop
			watchText
	 */

	watchInitValue = function() {};

	ChangeDetector.prototype.watch = function(name, callback, option) {
	  var cd, ce, d, exp, ie, isFunction, isStatic, key, r, root, scope;
	  ie = innerEvents[name];
	  if (ie) {
		return ie(this, callback);
	  }
	  option = option || {};
	  if (option === true) {
		option = {
		  isArray: true
		};
	  }
	  if (option.init) {
		console.warn('watch.init is depricated');
	  }
	  cd = this;
	  root = cd.root;
	  scope = cd.scope;
	  if (f$.isFunction(name)) {
		exp = name;
		key = alight.utils.getId();
		isFunction = true;
	  } else {
		isFunction = false;
		exp = null;
		name = name.trim();
		if (name.slice(0, 2) === '::') {
		  name = name.slice(2);
		  option.oneTime = true;
		}
		key = name;
		if (option.deep) {
		  key = 'd#' + key;
		} else if (option.isArray) {
		  key = 'a#' + key;
		} else {
		  key = 'v#' + key;
		}
	  }
	  if (alight.debug.watch) {
		console.log('$watch', name);
	  }
	  isStatic = false;
	  if (!isFunction) {
		if (option.watchText) {
		  exp = option.watchText.fn;
		} else {
		  ce = alight.utils.compile.expression(name);
		  if (ce.filter) {
			return makeFilterChain(cd, ce, callback, option);
		  }
		  isStatic = ce.isSimple && ce.simpleVariables.length === 0;
		  exp = ce.fn;
		}
	  }
	  if (option.deep) {
		option.isArray = false;
	  }
	  d = {
		isStatic: isStatic,
		isArray: Boolean(option.isArray),
		extraLoop: !option.readOnly,
		deep: option.deep === true ? 10 : option.deep,
		value: watchInitValue,
		callback: callback,
		exp: exp,
		src: '' + name,
		onStop: option.onStop || null,
		el: option.element || null,
		ea: option.elementAttr || null
	  };
	  if (isStatic) {
		cd.watch('$onScanOnce', function() {
		  return execWatchObject(scope, d, d.exp(scope));
		});
	  } else {
		cd.watchList.push(d);
	  }
	  r = {
		$: d,
		stop: function() {
		  var e, error;
		  if (option.onStop) {
			try {
			  option.onStop();
			} catch (error) {
			  e = error;
			  alight.exceptionHandler(e, "Error in onStop of watcher: " + name, name);
			}
		  }
		  if (d.isStatic) {
			return;
		  }
		  return removeItem(cd.watchList, d);
		},
		refresh: function() {
		  var value;
		  value = d.exp(cd.locals);
		  if (value && d.deep) {
			return d.value = alight.utils.clone(value, d.deep);
		  } else if (value && d.isArray) {
			return d.value = value.slice();
		  } else {
			return d.value = value;
		  }
		}
	  };
	  if (option.oneTime) {
		d.callback = function(value) {
		  if (value === void 0) {
			return;
		  }
		  r.stop();
		  return callback(value);
		};
	  }
	  return r;
	};

	ChangeDetector.prototype.watchGroup = function(keys, callback) {
	  var cd, group, j, key, len, planned;
	  cd = this;
	  if (!callback && f$.isFunction(keys)) {
		callback = keys;
		keys = null;
	  }
	  planned = false;
	  group = function() {
		if (planned) {
		  return;
		}
		planned = true;
		return cd.watch('$onScanOnce', function() {
		  planned = false;
		  return callback();
		});
	  };
	  if (keys) {
		for (j = 0, len = keys.length; j < len; j++) {
		  key = keys[j];
		  cd.watch(key, group);
		}
	  }
	  return group;
	};

	get_time = (function() {
	  if (window.performance) {
		return function() {
		  return Math.floor(performance.now());
		};
	  }
	  return function() {
		return (new Date()).getTime();
	  };
	})();

	notEqual = function(a, b) {
	  var i, j, len, ta, tb, v;
	  if (a === null || b === null) {
		return true;
	  }
	  ta = typeof a;
	  tb = typeof b;
	  if (ta !== tb) {
		return true;
	  }
	  if (ta === 'object') {
		if (a.length !== b.length) {
		  return true;
		}
		for (i = j = 0, len = a.length; j < len; i = ++j) {
		  v = a[i];
		  if (v !== b[i]) {
			return true;
		  }
		}
	  }
	  return false;
	};

	execWatchObject = function(scope, w, value) {
	  if (w.el) {
		if (w.ea) {
		  w.el.setAttribute(w.ea, value);
		} else {
		  w.el.nodeValue = value;
		}
	  } else {
		w.callback.call(scope, value);
	  }
	};

	displayError = function(e, cd, w, option) {
	  var args, text;
	  args = {
		src: w.src,
		scope: cd.scope,
		locals: cd.locals
	  };
	  if (w.el) {
		args.element = w.el;
	  }
	  if (option === 1) {
		text = '$scan, error in callback: ';
	  } else {
		text = '$scan, error in expression: ';
	  }
	  return alight.exceptionHandler(e, text + w.src, args);
	};

	ErrorValue = function() {};

	scanCore = function(topCD, result) {
	  var a0, a1, cd, changes, e, error, error1, extraLoop, index, j, last, len, locals, mutated, queue, ref, root, total, value, w;
	  root = topCD.root;
	  extraLoop = false;
	  changes = 0;
	  total = 0;
	  if (!topCD) {
		return;
	  }
	  queue = [];
	  index = 0;
	  cd = topCD;
	  while (cd) {
		locals = cd.locals;
		total += cd.watchList.length;
		ref = cd.watchList.slice();
		for (j = 0, len = ref.length; j < len; j++) {
		  w = ref[j];
		  last = w.value;
		  try {
			value = w.exp(locals);
		  } catch (error) {
			e = error;
			value = ErrorValue;
		  }
		  if (last !== value) {
			mutated = false;
			if (w.isArray) {
			  a0 = Array.isArray(last);
			  a1 = Array.isArray(value);
			  if (a0 === a1) {
				if (a0) {
				  if (notEqual(last, value)) {
					mutated = true;
					w.value = value.slice();
				  }
				} else {
				  mutated = true;
				  w.value = value;
				}
			  } else {
				mutated = true;
				if (a1) {
				  w.value = value.slice();
				} else {
				  w.value = value;
				}
			  }
			} else if (w.deep) {
			  if (!alight.utils.equal(last, value, w.deep)) {
				mutated = true;
				w.value = alight.utils.clone(value, w.deep);
			  }
			} else {
			  mutated = true;
			  w.value = value;
			}
			if (mutated) {
			  mutated = false;
			  if (value === ErrorValue) {
				displayError(e, cd, w);
			  } else {
				changes++;
				try {
				  if (w.el) {
					if (w.ea) {
					  if (value != null) {
						w.el.setAttribute(w.ea, value);
					  } else {
						w.el.removeAttribute(w.ea);
					  }
					} else {
					  w.el.nodeValue = value;
					}
				  } else {
					if (last === watchInitValue) {
					  last = void 0;
					}
					if (w.callback.call(cd.scope, value, last) !== '$scanNoChanges') {
					  if (w.extraLoop) {
						extraLoop = true;
					  }
					}
				  }
				} catch (error1) {
				  e = error1;
				  displayError(e, cd, w, 1);
				}
			  }
			}
			if (alight.debug.scan > 1) {
			  console.log('changed:', w.src);
			}
		  }
		}
		queue.push.apply(queue, cd.children);
		cd = queue[index++];
	  }
	  result.total = total;
	  result.changes = changes;
	  result.extraLoop = extraLoop;
	};

	ChangeDetector.prototype.digest = function() {
	  var callback, duration, j, len, mainLoop, onScanOnce, result, root, start, totalChanges;
	  root = this.root;
	  mainLoop = 10;
	  totalChanges = 0;
	  if (alight.debug.scan) {
		start = get_time();
	  }
	  result = {
		total: 0,
		changes: 0,
		extraLoop: false,
		src: '',
		scope: null,
		element: null
	  };
	  while (mainLoop) {
		mainLoop--;
		root.extraLoop = false;
		if (root.watchers.onScanOnce.length) {
		  onScanOnce = root.watchers.onScanOnce.slice();
		  root.watchers.onScanOnce.length = 0;
		  for (j = 0, len = onScanOnce.length; j < len; j++) {
			callback = onScanOnce[j];
			callback.call(root);
		  }
		}
		scanCore(this, result);
		totalChanges += result.changes;
		if (!result.extraLoop && !root.extraLoop && !root.watchers.onScanOnce.length) {
		  break;
		}
	  }
	  if (alight.debug.scan) {
		duration = get_time() - start;
		console.log("$scan: loops: (" + (10 - mainLoop) + "), last-loop changes: " + result.changes + ", watches: " + result.total + " / " + duration + "ms");
	  }
	  result.mainLoop = mainLoop;
	  result.totalChanges = totalChanges;
	  return result;
	};

	ChangeDetector.prototype.scan = function(cfg) {
	  var callback, cb, finishScanOnce, j, k, l, len, len1, len2, ref, ref1, result, root;
	  root = this.root;
	  cfg = cfg || {};
	  if (alight.option.zone && !cfg.zone) {
		return;
	  }
	  if (f$.isFunction(cfg)) {
		cfg = {
		  callback: cfg
		};
	  }
	  if (cfg.callback) {
		root.watchers.finishScanOnce.push(cfg.callback);
	  }
	  if (cfg.late) {
		if (root.lateScan) {
		  return;
		}
		root.lateScan = true;
		alight.nextTick(function() {
		  if (root.lateScan) {
			return root.topCD.scan();
		  }
		});
		return;
	  }
	  if (root.status === 'scaning') {
		root.extraLoop = true;
		return;
	  }
	  root.lateScan = false;
	  root.status = 'scaning';
	  if (root.topCD) {
		result = root.topCD.digest();
	  } else {
		result = {};
	  }
	  if (result.totalChanges) {
		ref = root.watchers.any;
		for (j = 0, len = ref.length; j < len; j++) {
		  cb = ref[j];
		  cb();
		}
	  }
	  root.status = null;
	  ref1 = root.watchers.finishScan;
	  for (k = 0, len1 = ref1.length; k < len1; k++) {
		callback = ref1[k];
		callback();
	  }
	  finishScanOnce = root.watchers.finishScanOnce.slice();
	  root.watchers.finishScanOnce.length = 0;
	  for (l = 0, len2 = finishScanOnce.length; l < len2; l++) {
		callback = finishScanOnce[l];
		callback.call(root);
	  }
	  if (result.mainLoop === 0) {
		throw 'Infinity loop detected';
	  }
	  return result;
	};

	alight.core.ChangeDetector = ChangeDetector;

	ChangeDetector.prototype.compile = function(expression, option) {
	  return alight.utils.compile.expression(expression, option).fn;
	};

	ChangeDetector.prototype.setValue = function(name, value) {
	  var cd, e, error, error1, fn, j, key, len, locals, msg, ref, rx;
	  cd = this;
	  fn = cd.compile(name + ' = $value', {
		input: ['$value'],
		no_return: true
	  });
	  try {
		return fn(cd.locals, value);
	  } catch (error) {
		e = error;
		msg = "can't set variable: " + name;
		if (alight.debug.parser) {
		  console.warn(msg);
		}
		if (('' + e).indexOf('TypeError') >= 0) {
		  rx = name.match(/^([\w\d\.]+)\.[\w\d]+$/);
		  if (rx && rx[1]) {
			locals = cd.locals;
			ref = rx[1].split('.');
			for (j = 0, len = ref.length; j < len; j++) {
			  key = ref[j];
			  if (locals[key] === void 0) {
				locals[key] = {};
			  }
			  locals = locals[key];
			}
			try {
			  fn(cd.locals, value);
			  return;
			} catch (error1) {

			}
		  }
		}
		return alight.exceptionHandler(e, msg, {
		  name: name,
		  value: value
		});
	  }
	};

	ChangeDetector.prototype["eval"] = function(exp) {
	  var fn;
	  fn = this.compile(exp);
	  return fn(this.locals);
	};

	ChangeDetector.prototype.getValue = function(name) {
	  return this["eval"](name);
	};

	(function() {

	  /*
		  Scope.$watchText(name, callback, config)
		  args:
			  config.readOnly
			  config.onStatic
		  result:
			  isStatic: flag
			  $: watch-object
			  value: current value
			  exp: expression
			  stop: function to stop watch
	  
	  
		  kind of expressions
			  simple: {{model}}
			  text-directive: {{#dir model}} {{=staticModel}} {{::oneTimeBinding}}
			  with function: {{fn()}}
			  with filter: {{value | filter}}
	   */
	  var watchText;
	  alight.text.$base = function(option) {
		var cd, dir, env, point, scope;
		point = option.point;
		cd = option.cd;
		scope = cd.scope;
		if (scope.$ns && scope.$ns.text) {
		  dir = scope.$ns.text[option.name];
		} else {
		  dir = alight.text[option.name];
		}
		if (!dir) {
		  throw 'No directive alight.text.' + option.name;
		}
		env = {
		  changeDetector: cd,
		  setter: function(value) {
			if (!option.update) {
			  return;
			}
			if (value === null) {
			  point.value = '';
			} else {
			  point.value = '' + value;
			}
			return option.update();
		  },
		  setterRaw: function(value) {
			if (!option.updateRaw) {
			  return;
			}
			if (value === null) {
			  point.value = '';
			} else {
			  point.value = '' + value;
			}
			return option.updateRaw();
		  },
		  "finally": function(value) {
			if (!option["finally"]) {
			  return;
			}
			if (value === null) {
			  point.value = '';
			} else {
			  point.value = '' + value;
			}
			point.type = 'text';
			option["finally"]();
			option.update = null;
			return option["finally"] = null;
		  }
		};
		return dir.call(cd, env.setter, option.exp, scope, env);
	  };
	  watchText = function(expression, callback, config) {
		var canUseSimpleBuilder, cd, ce, d, data, doFinally, doUpdate, doUpdateRaw, exp, fireCallback, fn, i, j, k, l, len, len1, len2, lname, name, noCache, privateValue, resultValue, st, updatePlanned, value, w, watchCount, watchObject;
		config = config || {};
		cd = this;
		if (alight.debug.watchText) {
		  console.log('$watchText', expression);
		}
		st = alight.utils.compile.buildSimpleText(expression, null);
		if (st) {
		  cd.watch(expression, callback, {
			watchText: st,
			element: config.element,
			elementAttr: config.elementAttr
		  });
		  return;
		}
		data = alight.utils.parsText(expression);
		watchCount = 0;
		canUseSimpleBuilder = true;
		noCache = false;
		doUpdate = doUpdateRaw = doFinally = function() {};
		for (j = 0, len = data.length; j < len; j++) {
		  d = data[j];
		  if (d.type === 'expression') {
			exp = d.list.join('|');
			lname = exp.match(/^([^\w\d\s\$"'\(\u0410-\u044F\u0401\u0451]+)/);
			if (lname) {
			  d.isDir = true;
			  name = lname[1];
			  if (name === '#') {
				i = exp.indexOf(' ');
				if (i < 0) {
				  name = exp.substring(1);
				  exp = '';
				} else {
				  name = exp.slice(1, i);
				  exp = exp.slice(i);
				}
			  } else {
				exp = exp.substring(name.length);
			  }
			  alight.text.$base({
				name: name,
				exp: exp,
				cd: cd,
				point: d,
				update: function() {
				  return doUpdate();
				},
				updateRaw: function() {
				  return doUpdateRaw();
				},
				"finally": function() {
				  doUpdate();
				  return doFinally();
				}
			  });
			  noCache = true;
			  if (d.type !== 'text') {
				canUseSimpleBuilder = false;
			  }
			} else {
			  ce = alight.utils.compile.expression(exp, {
				string: true
			  });
			  if (!ce.filter) {
				d.fn = ce.fn;
				if (!ce.rawExpression) {
				  throw 'Error';
				}
				if (ce.isSimple && ce.simpleVariables.length === 0) {
				  d.type = 'text';
				  d.value = d.fn();
				} else {
				  d.re = ce.rawExpression;
				  watchCount++;
				}
			  } else {
				watchCount++;
				canUseSimpleBuilder = false;
				d.watched = true;
				(function(d) {
				  return cd.watch(exp, function(value) {
					if (value == null) {
					  value = '';
					}
					d.value = value;
					return doUpdate();
				  });
				})(d);
			  }
			}
		  }
		}
		if (canUseSimpleBuilder) {
		  if (!watchCount) {
			value = '';
			for (k = 0, len1 = data.length; k < len1; k++) {
			  d = data[k];
			  value += d.value;
			}
			cd.watch('$onScanOnce', function() {
			  return execWatchObject(cd.scope, {
				callback: callback,
				el: config.element,
				ea: config.elementAttr
			  }, value);
			});
			return;
		  }
		  if (noCache) {
			st = alight.utils.compile.buildSimpleText(null, data);
		  } else {
			st = alight.utils.compile.buildSimpleText(expression, data);
		  }
		  cd.watch(expression, callback, {
			watchText: {
			  fn: st.fn
			},
			element: config.element,
			elementAttr: config.elementAttr
		  });
		  return;
		}
		watchObject = {
		  callback: callback,
		  el: config.element,
		  ea: config.elementAttr
		};
		data.scope = cd.scope;
		fn = alight.utils.compile.buildText(expression, data);
		doUpdateRaw = function() {
		  return execWatchObject(cd.scope, watchObject, fn());
		};
		if (watchCount) {
		  w = null;
		  resultValue = '';
		  doUpdate = function() {
			resultValue = fn();
		  };
		  doFinally = function() {
			var l, len2;
			i = true;
			for (l = 0, len2 = data.length; l < len2; l++) {
			  d = data[l];
			  if (d.type === 'expression') {
				i = false;
				break;
			  }
			}
			if (!i) {
			  return;
			}
			cd.watch('$finishScanOnce', function() {
			  return w.stop();
			});
			if (config.onStatic) {
			  config.onStatic();
			}
		  };
		  privateValue = function() {
			return resultValue;
		  };
		  for (l = 0, len2 = data.length; l < len2; l++) {
			d = data[l];
			if (d.type === 'expression') {
			  if (d.isDir || d.watched) {
				continue;
			  }
			  d.watched = true;
			  (function(d, exp) {
				return cd.watch(exp, function(value) {
				  if (value == null) {
					value = '';
				  }
				  d.value = value;
				  return doUpdate();
				});
			  })(d, d.list.join(' | '));
			}
		  }
		  doUpdate();
		  w = cd.watch(privateValue, callback, {
			element: config.element,
			elementAttr: config.elementAttr
		  });
		} else {
		  updatePlanned = false;
		  fireCallback = function() {
			updatePlanned = false;
			return doUpdateRaw();
		  };
		  doUpdate = function() {
			if (updatePlanned) {
			  return;
			}
			updatePlanned = true;
			return cd.watch('$onScanOnce', fireCallback);
		  };
		  doUpdate();
		}
	  };
	  return ChangeDetector.prototype.watchText = watchText;
	})();

	var _optimizeLineElements;

	_optimizeLineElements = {
	  TR: 1,
	  TD: 1,
	  LI: 1
	};

	alight.utils.optmizeElement = function(element, noRemove) {
	  var current, d, data, e, exp, i, j, k, len, len1, lname, mark, n, next, prev, prevLineElement, ref, result, text, wrapped;
	  if (element.nodeType === 1) {
		noRemove = noRemove || !alight.option.domOptimizationRemoveEmpty;
		if (element.nodeName === 'PRE') {
		  noRemove = true;
		}
		e = element.firstChild;
		if (e && e.nodeType === 3 && !e.nodeValue.trim() && !noRemove) {
		  f$.remove(e);
		  e = element.firstChild;
		}
		prevLineElement = false;
		while (e) {
		  next = e.nextSibling;
		  if (prevLineElement && e.nodeType === 3 && !e.nodeValue.trim() && !noRemove) {
			f$.remove(e);
		  } else {
			prevLineElement = e.nodeType === 1 && _optimizeLineElements[e.nodeName];
			alight.utils.optmizeElement(e, noRemove);
		  }
		  e = next;
		}
		e = element.lastChild;
		if (e && e.nodeType === 3 && !e.nodeValue.trim() && !noRemove) {
		  f$.remove(e);
		}
	  } else if (element.nodeType === 3) {
		text = element.data;
		mark = alight.utils.pars_start_tag;
		i = text.indexOf(mark);
		if (i < 0) {
		  return;
		}
		if (text.slice(i + mark.length).indexOf(mark) < 0) {
		  return;
		}
		prev = 't';
		current = {
		  value: ''
		};
		result = [current];
		data = alight.utils.parsText(text);
		for (j = 0, len = data.length; j < len; j++) {
		  d = data[j];
		  if (d.type === 'text') {
			current.value += d.value;
		  } else {
			exp = d.list.join('|');
			wrapped = alight.utils.pars_start_tag + exp + alight.utils.pars_finish_tag;
			lname = exp.match(/^([^\w\d\s\$"'\(\u0410-\u044F\u0401\u0451]+)/);
			if (lname) {
			  if (prev === 't' || prev === 'd') {
				current.value += wrapped;
			  } else {
				current = {
				  value: wrapped
				};
				result.push(current);
			  }
			  prev = 'd';
			} else if (d.list.length === 1) {
			  if (prev === 't' || prev === 'v') {
				current.value += wrapped;
			  } else {
				current = {
				  value: wrapped
				};
				result.push(current);
			  }
			  prev = 'v';
			} else {
			  if (prev === 't') {
				current.value += wrapped;
			  } else {
				current = {
				  value: wrapped
				};
				result.push(current);
			  }
			}
		  }
		}
		if (result.length < 2) {
		  return;
		}
		e = element;
		e.data = result[0].value;
		ref = result.slice(1);
		for (k = 0, len1 = ref.length; k < len1; k++) {
		  d = ref[k];
		  n = document.createTextNode(d.value);
		  f$.after(e, n);
		  e = n;
		}
	  }
	};

	var Env, attrBinding, bindComment, bindElement, bindNode, bindText, sortByPriority, testDirective;

	(function() {
	  var ext;
	  alight.hooks.attribute = ext = [];
	  ext.push({
		code: 'dataPrefix',
		fn: function() {
		  if (this.attrName.slice(0, 5) === 'data-') {
			this.attrName = this.attrName.slice(5);
		  }
		}
	  });
	  ext.push({
		code: 'colonNameSpace',
		fn: function() {
		  var name, parts;
		  if (this.directive || this.name) {
			return;
		  }
		  parts = this.attrName.match(/^(\w+)[\-\:](.+)$/);
		  if (parts) {
			this.ns = parts[1];
			name = parts[2];
		  } else {
			this.ns = '$global';
			name = this.attrName;
		  }
		  parts = name.match(/^([^\.]+)\.(.*)$/);
		  if (parts) {
			name = parts[1];
			this.attrArgument = parts[2];
		  }
		  this.name = name.replace(/(-\w)/g, function(m) {
			return m.substring(1).toUpperCase();
		  });
		}
	  });
	  ext.push({
		code: 'getGlobalDirective',
		fn: function() {
		  var path;
		  if (this.directive) {
			return;
		  }
		  path = alight.d[this.ns];
		  if (!path) {
			this.result = 'noNS';
			this.stop = true;
			return;
		  }
		  this.directive = path[this.name];
		  if (!this.directive) {
			if (this.ns === '$global') {
			  this.result = 'noNS';
			} else {
			  this.result = 'noDirective';
			}
			this.stop = true;
		  }
		}
	  });
	  ext.push({
		code: 'cloneDirective',
		fn: function() {
		  var dir, k, name, ns, r, v;
		  r = this.directive;
		  ns = this.ns;
		  name = this.name;
		  dir = {};
		  if (f$.isFunction(r)) {
			dir.init = r;
		  } else if (f$.isObject(r)) {
			for (k in r) {
			  v = r[k];
			  dir[k] = v;
			}
		  } else {
			throw 'Wrong directive: ' + ns + '.' + name;
		  }
		  dir.priority = r.priority || (alight.priority[ns] && alight.priority[ns][name]) || 0;
		  dir.restrict = r.restrict || 'A';
		  if (dir.restrict.indexOf(this.attrType) < 0) {
			throw 'Directive has wrong binding (attribute/element): ' + name;
		  }
		  this.directive = dir;
		}
	  });
	  return ext.push({
		code: 'preprocessor',
		fn: function() {
		  var directive, name, ns;
		  ns = this.ns;
		  name = this.name;
		  directive = this.directive;
		  directive.$init = function(cd, element, value, env) {
			var doProcess, dscope;
			doProcess = function() {
			  var dp, i, j, l, len;
			  l = dscope.procLine;
			  for (i = j = 0, len = l.length; j < len; i = ++j) {
				dp = l[i];
				dp.fn.call(dscope);
				if (dscope.isDeferred) {
				  dscope.procLine = l.slice(i + 1);
				  break;
				}
			  }
			  dscope.async = true;
			  return null;
			};
			dscope = {
			  element: element,
			  value: value,
			  cd: cd,
			  env: env,
			  ns: ns,
			  name: name,
			  doBinding: false,
			  directive: directive,
			  isDeferred: false,
			  procLine: alight.hooks.directive,
			  makeDeferred: function() {
				dscope.isDeferred = true;
				dscope.doBinding = true;
				dscope.retStopBinding = true;
				dscope.async = false;
				return function() {
				  dscope.isDeferred = false;
				  if (dscope.async) {
					return doProcess();
				  }
				};
			  }
			};
			if (directive.stopBinding) {
			  env.stopBinding = true;
			}
			doProcess();
			if (dscope.retStopBinding) {
			  return 'stopBinding';
			}
		  };
		}
	  });
	})();

	(function() {
	  var ext;
	  ext = alight.hooks.directive;
	  ext.push({
		code: 'init',
		fn: function() {
		  var result;
		  if (this.directive.init) {
			if (alight.debug.directive) {
			  if (this.directive.scope) {
				console.warn(this.ns + "-" + this.name + " uses scope and init together, probably you need use link instead of init");
			  }
			}
			this.env.changeDetector = this.cd;
			result = this.directive.init.call(this.env, this.cd.scope, this.element, this.value, this.env);
			if (result && result.start) {
			  result.start();
			}
		  }
		}
	  });
	  ext.push({
		code: 'templateUrl',
		fn: function() {
		  var callback, ds;
		  ds = this;
		  if (this.directive.templateUrl) {
			callback = this.makeDeferred();
			f$.ajax({
			  cache: true,
			  url: this.directive.templateUrl,
			  success: function(html) {
				ds.directive.template = html;
				return callback();
			  },
			  error: callback
			});
		  }
		}
	  });
	  ext.push({
		code: 'template',
		fn: function() {
		  var el;
		  if (this.directive.template) {
			if (this.element.nodeType === 1) {
			  this.element.innerHTML = this.directive.template;
			} else if (this.element.nodeType === 8) {
			  el = document.createElement('p');
			  el.innerHTML = this.directive.template.trim();
			  el = el.firstChild;
			  f$.after(this.element, el);
			  this.element = el;
			  this.doBinding = true;
			}
		  }
		}
	  });
	  ext.push({
		code: 'scope',
		fn: function() {
		  var childCD, parentCD;
		  if (!this.directive.scope) {
			return;
		  }
		  parentCD = this.cd;
		  switch (this.directive.scope) {
			case true:
			  childCD = parentCD["new"]({
				$parent: parentCD.scope
			  });
			  break;
			case 'root':
			  childCD = alight.ChangeDetector({
				$parent: parentCD.scope
			  });
			  parentCD.watch('$destroy', function() {
				return childCD.destroy();
			  });
			  break;
			default:
			  throw 'Wrong scope value: ' + this.directive.scope;
		  }
		  this.env.parentChangeDetector = parentCD;
		  this.cd = childCD;
		  this.doBinding = true;
		  this.retStopBinding = true;
		}
	  });
	  ext.push({
		code: 'link',
		fn: function() {
		  var result;
		  if (this.directive.link) {
			this.env.changeDetector = this.cd;
			result = this.directive.link.call(this.env, this.cd.scope, this.element, this.value, this.env);
			if (result && result.start) {
			  result.start();
			}
		  }
		}
	  });
	  return ext.push({
		code: 'scopeBinding',
		fn: function() {
		  if (this.doBinding && !this.env.stopBinding) {
			alight.bind(this.cd, this.element, {
			  skip_attr: this.env.skippedAttr()
			});
		  }
		}
	  });
	})();

	testDirective = (function() {
	  var addAttr;
	  addAttr = function(attrName, args, base) {
		var attr;
		if (args.attr_type === 'A') {
		  attr = base || {};
		  attr.priority = alight.priority.$attribute;
		  attr.is_attr = true;
		  attr.name = attrName;
		  attr.attrName = attrName;
		  attr.element = args.element;
		  args.list.push(attr);
		} else if (args.attr_type === 'M') {
		  args.list.push(base);
		}
	  };
	  return function(attrName, args) {
		var attrHook, attrSelf, j, len, ref;
		if (args.skip_attr.indexOf(attrName) >= 0) {
		  return addAttr(attrName, args, {
			skip: true
		  });
		}
		attrSelf = {
		  attrName: attrName,
		  attrType: args.attr_type,
		  element: args.element,
		  cd: args.cd,
		  result: null
		};
		ref = alight.hooks.attribute;
		for (j = 0, len = ref.length; j < len; j++) {
		  attrHook = ref[j];
		  attrHook.fn.call(attrSelf);
		  if (attrSelf.stop) {
			break;
		  }
		}
		if (attrSelf.result === 'noNS') {
		  addAttr(attrName, args);
		  return;
		}
		if (attrSelf.result === 'noDirective') {
		  if (args.attr_type === 'E') {
			args.list.push({
			  name: attrName,
			  priority: -10,
			  attrName: attrName,
			  noDirective: true
			});
			return;
		  }
		  addAttr(attrName, args, {
			noDirective: true
		  });
		  return;
		}
		args.list.push({
		  name: attrName,
		  directive: attrSelf.directive,
		  priority: attrSelf.directive.priority,
		  attrName: attrName,
		  attrArgument: attrSelf.attrArgument
		});
	  };
	})();

	sortByPriority = function(a, b) {
	  if (a.priority === b.priority) {
		return 0;
	  }
	  if (a.priority > b.priority) {
		return -1;
	  } else {
		return 1;
	  }
	};

	attrBinding = function(cd, element, value, attrName) {
	  var text;
	  text = value;
	  if (text.indexOf(alight.utils.pars_start_tag) < 0) {
		return;
	  }
	  cd.watchText(text, null, {
		element: element,
		elementAttr: attrName
	  });
	  return true;
	};

	bindText = function(cd, element, option) {
	  var text;
	  text = element.data;
	  if (text.indexOf(alight.utils.pars_start_tag) < 0) {
		return;
	  }
	  cd.watchText(text, null, {
		element: element
	  });
	  return text;
	};

	bindComment = function(cd, element, option) {
	  var args, d, dirName, directive, e, env, error, i, list, text, value;
	  text = element.nodeValue.trim();
	  if (text.slice(0, 10) !== 'directive:') {
		return;
	  }
	  text = text.slice(10).trim();
	  i = text.indexOf(' ');
	  if (i >= 0) {
		dirName = text.slice(0, +(i - 1) + 1 || 9e9);
		value = text.slice(i + 1);
	  } else {
		dirName = text;
		value = '';
	  }
	  args = {
		list: list = [],
		element: element,
		attr_type: 'M',
		cd: cd,
		skip_attr: []
	  };
	  testDirective(dirName, args);
	  d = list[0];
	  if (d.noDirective) {
		throw "Comment directive not found: " + dirName;
	  }
	  directive = d.directive;
	  env = new Env({
		element: element,
		attrName: d.attrName,
		attributes: list
	  });
	  if (alight.debug.directive) {
		console.log('bind', d.attrName, value, d);
	  }
	  try {
		directive.$init(cd, element, value, env);
	  } catch (error) {
		e = error;
		alight.exceptionHandler(e, 'Error in directive: ' + d.name, {
		  value: value,
		  env: env,
		  cd: cd,
		  scope: cd.scope,
		  element: element
		});
	  }
	  if (env.skipToElement) {
		return {
		  directive: 1,
		  skipToElement: env.skipToElement
		};
	  }
	  return {
		directive: 1,
		skipToElement: null
	  };
	};

	Env = function(option) {
	  var k, v;
	  for (k in option) {
		v = option[k];
		this[k] = v;
	  }
	  return this;
	};

	Env.prototype.takeAttr = function(name, skip) {
	  var attr, j, len, ref, value;
	  if (arguments.length === 1) {
		skip = true;
	  }
	  ref = this.attributes;
	  for (j = 0, len = ref.length; j < len; j++) {
		attr = ref[j];
		if (attr.attrName !== name) {
		  continue;
		}
		if (skip) {
		  attr.skip = true;
		}
		value = this.element.getAttribute(name);
		return value || true;
	  }
	};

	Env.prototype.skippedAttr = function() {
	  var attr, j, len, ref, results;
	  ref = this.attributes;
	  results = [];
	  for (j = 0, len = ref.length; j < len; j++) {
		attr = ref[j];
		if (!attr.skip) {
		  continue;
		}
		results.push(attr.attrName);
	  }
	  return results;
	};

	Env.prototype.scan = function(option) {
	  return this.changeDetector.scan(option);
	};

	Env.prototype.on = function(element, eventname, callback) {
	  return this.changeDetector.on(element, eventname, callback);
	};

	Env.prototype.watch = function(name, callback, option) {
	  return this.changeDetector.watch(name, callback, option);
	};

	Env.prototype.watchGroup = function(keys, callback) {
	  return this.changeDetector.watchGroup(keys, callback);
	};

	Env.prototype.watchText = function(expression, callback, option) {
	  return this.changeDetector.watchText(expression, callback, option);
	};

	Env.prototype.getValue = function(name) {
	  return this.changeDetector.getValue(name);
	};

	Env.prototype.setValue = function(name, value) {
	  return this.changeDetector.setValue(name, value);
	};

	Env.prototype["eval"] = function(exp) {
	  return this.changeDetector["eval"](exp);
	};


	/*
		env.new(scope, option)
		env.new(scope, true)  - makes locals
		env.new(true)  - makes locals
	 */

	Env.prototype["new"] = function(scope, option) {
	  if (option === true) {
		option = {
		  locals: true
		};
	  } else if (scope === true && (option == null)) {
		scope = null;
		option = {
		  locals: true
		};
	  }
	  return this.changeDetector["new"](scope, option);
	};


	/*
		env.bind(cd, element, option)
		env.bind(cd)
		env.bind(element)
		env.bind(element, cd)
		env.bind(option)
		env.bind(env.new(), option)
	 */

	Env.prototype.bind = function(_cd, _element, _option) {
	  var a, cd, count, element, j, len, option;
	  this.stopBinding = true;
	  count = 0;
	  for (j = 0, len = arguments.length; j < len; j++) {
		a = arguments[j];
		if (a instanceof ChangeDetector) {
		  cd = a;
		  count += 1;
		}
		if (f$.isElement(a)) {
		  element = a;
		  count += 1;
		}
	  }
	  option = arguments[count];
	  if (!option) {
		option = {
		  skip: this.skippedAttr()
		};
	  }
	  if (!element) {
		element = this.element;
	  }
	  if (!cd) {
		cd = this.changeDetector;
	  }
	  return alight.bind(cd, element, option);
	};

	bindElement = (function() {
	  return function(cd, element, config) {
		var args, attr, attrName, attrValue, bindResult, childElement, childNodes, childOption, d, directive, e, env, error, fastBinding, fb, index, j, len, len1, len2, list, n, o, r, ref, ref1, skipChildren, skipToElement, skip_attr, value;
		fb = {
		  attr: [],
		  dir: [],
		  children: []
		};
		bindResult = {
		  directive: 0,
		  hook: 0,
		  skipToElement: null,
		  fb: fb
		};
		config = config || {};
		skipChildren = false;
		skip_attr = config.skip_attr;
		if (config.skip === true) {
		  config.skip_top = true;
		} else if (!skip_attr) {
		  skip_attr = config.skip || [];
		}
		if (!(skip_attr instanceof Array)) {
		  skip_attr = [skip_attr];
		}
		if (!config.skip_top) {
		  args = {
			list: list = [],
			element: element,
			skip_attr: skip_attr,
			attr_type: 'E',
			cd: cd
		  };
		  attrName = element.nodeName.toLowerCase();
		  testDirective(attrName, args);
		  if (attrName === 'script' || attrName === 'style') {
			skipChildren = true;
		  }
		  args.attr_type = 'A';
		  ref = element.attributes;
		  for (j = 0, len = ref.length; j < len; j++) {
			attr = ref[j];
			testDirective(attr.name, args);
		  }
		  if (config.attachDirective) {
			ref1 = config.attachDirective;
			for (attrName in ref1) {
			  attrValue = ref1[attrName];
			  testDirective(attrName, args);
			}
		  }
		  list = list.sort(sortByPriority);
		  for (n = 0, len1 = list.length; n < len1; n++) {
			d = list[n];
			if (d.skip) {
			  continue;
			}
			if (d.noDirective) {
			  throw "Directive not found: " + d.name;
			}
			d.skip = true;
			if (config.attachDirective && config.attachDirective[d.attrName]) {
			  value = config.attachDirective[d.attrName];
			} else {
			  value = element.getAttribute(d.attrName);
			}
			if (d.is_attr) {
			  if (attrBinding(cd, element, value, d.attrName)) {
				fb.attr.push({
				  attrName: d.attrName,
				  value: value
				});
			  }
			} else {
			  directive = d.directive;
			  env = new Env({
				element: element,
				attrName: d.attrName,
				attrArgument: d.attrArgument || null,
				attributes: list,
				stopBinding: false,
				elementCanBeRemoved: config.elementCanBeRemoved,
				fbElement: config.fbElement
			  });
			  if (alight.debug.directive) {
				console.log('bind', d.attrName, value, d);
			  }
			  try {
				if (directive.$init(cd, element, value, env) === 'stopBinding') {
				  skipChildren = true;
				}
			  } catch (error) {
				e = error;
				alight.exceptionHandler(e, 'Error in directive: ' + d.attrName, {
				  value: value,
				  env: env,
				  cd: cd,
				  scope: cd.scope,
				  element: element
				});
			  }
			  if (env.fastBinding) {
				if (f$.isFunction(env.fastBinding)) {
				  fastBinding = env.fastBinding;
				} else {
				  fastBinding = directive.init;
				}
				fb.dir.push({
				  fb: fastBinding,
				  attrName: d.attrName,
				  value: value,
				  attrArgument: env.attrArgument,
				  fbData: env.fbData
				});
			  } else {
				bindResult.directive++;
			  }
			  if (env.stopBinding) {
				skipChildren = true;
				break;
			  }
			  if (env.skipToElement) {
				bindResult.skipToElement = env.skipToElement;
			  }
			}
		  }
		}
		if (!skipChildren) {
		  skipToElement = null;
		  childNodes = (function() {
			var len2, o, ref2, results;
			ref2 = element.childNodes;
			results = [];
			for (o = 0, len2 = ref2.length; o < len2; o++) {
			  childElement = ref2[o];
			  results.push(childElement);
			}
			return results;
		  })();
		  for (index = o = 0, len2 = childNodes.length; o < len2; index = ++o) {
			childElement = childNodes[index];
			if (!childElement) {
			  continue;
			}
			if (skipToElement) {
			  if (skipToElement === childElement) {
				skipToElement = null;
			  }
			  continue;
			}
			if (config.fbElement) {
			  childOption = {
				fbElement: config.fbElement.childNodes[index]
			  };
			}
			r = bindNode(cd, childElement, childOption);
			bindResult.directive += r.directive;
			bindResult.hook += r.hook;
			skipToElement = r.skipToElement;
			if (r.fb) {
			  if (r.fb.text || (r.fb.attr && r.fb.attr.length) || (r.fb.dir && r.fb.dir.length) || (r.fb.children && r.fb.children.length)) {
				fb.children.push({
				  index: index,
				  fb: r.fb
				});
			  }
			}
		  }
		}
		return bindResult;
	  };
	})();

	bindNode = function(cd, element, option) {
	  var h, j, len, r, ref, result, text;
	  result = {
		directive: 0,
		hook: 0,
		skipToElement: null,
		fb: null
	  };
	  if (alight.hooks.binding.length) {
		ref = alight.hooks.binding;
		for (j = 0, len = ref.length; j < len; j++) {
		  h = ref[j];
		  result.hook += 1;
		  r = h.fn(cd, element, option);
		  if (r && r.owner) {
			return result;
		  }
		}
	  }
	  if (element.nodeType === 1) {
		r = bindElement(cd, element, option);
		result.directive += r.directive;
		result.hook += r.hook;
		result.skipToElement = r.skipToElement;
		result.fb = r.fb;
	  } else if (element.nodeType === 3) {
		text = bindText(cd, element, option);
		if (text) {
		  result.fb = {
			text: text
		  };
		}
	  } else if (element.nodeType === 8) {
		r = bindComment(cd, element, option);
		if (r) {
		  result.directive += r.directive;
		  result.skipToElement = r.skipToElement;
		}
	  }
	  return result;
	};

	alight.nextTick = (function() {
	  var exec, list, timer;
	  timer = null;
	  list = [];
	  exec = function() {
		var callback, dlist, e, error, it, j, len, self;
		timer = null;
		dlist = list.slice();
		list.length = 0;
		for (j = 0, len = dlist.length; j < len; j++) {
		  it = dlist[j];
		  callback = it[0];
		  self = it[1];
		  try {
			callback.call(self);
		  } catch (error) {
			e = error;
			alight.exceptionHandler(e, '$nextTick, error in function', {
			  fn: callback,
			  self: self
			});
		  }
		}
		return null;
	  };
	  return function(callback) {
		list.push([callback, this]);
		if (timer) {
		  return;
		}
		return timer = setTimeout(exec, 0);
	  };
	})();

	alight.bind = function(changeDetector, element, option) {
	  var cb, finishBinding, j, len, lst, result, root;
	  if (!changeDetector) {
		throw 'No changeDetector';
	  }
	  if (!element) {
		throw 'No element';
	  }
	  option = option || {};
	  if (alight.option.domOptimization && !option.noDomOptimization) {
		alight.utils.optmizeElement(element);
	  }
	  root = changeDetector.root;
	  finishBinding = !root.finishBinding_lock;
	  if (finishBinding) {
		root.finishBinding_lock = true;
		root.bindingResult = {
		  directive: 0,
		  hook: 0
		};
	  }
	  result = bindNode(changeDetector, element, option);
	  root.bindingResult.directive += result.directive;
	  root.bindingResult.hook += result.hook;
	  changeDetector.digest();
	  if (finishBinding) {
		root.finishBinding_lock = false;
		lst = root.watchers.finishBinding.slice();
		root.watchers.finishBinding.length = 0;
		for (j = 0, len = lst.length; j < len; j++) {
		  cb = lst[j];
		  cb();
		}
		result.total = root.bindingResult;
		
		
	  }
	  return result;
	};

	!function () {
		function zoneJSInvoker(_0, zone, _2, task, _4, args) {
			task.callback.apply(null, args);
			var root = zone._properties.root;
			if (root && root.topCD)
				root.topCD.scan({ zone: true });
		}
		var bind = alight.bind;
		alight.bind = function (cd, el, option) {
			var root = cd.root;
			var oz = alight.option.zone;
			if (oz) {
				var Z = oz === true ? Zone : oz;
				var zone = root.zone;
				if (!zone) {
					root.zone = zone = Z.current.fork({
						name: Z.current.name + '.x',
						properties: { root: root },
						onInvokeTask: zoneJSInvoker
					});
				}
				if (Z.current !== zone)
					return root.zone.run(bind, null, [cd, el, option]);
			}
			return bind(cd, el, option);
		};
	}();

	alight.bootstrap = function (input, data) {
		if (!input) {
			alight.bootstrap('[al-app]');
			alight.bootstrap('[al\\:app]');
			alight.bootstrap('[data-al-app]');
			return;
		}
		var changeDetector;
		if (input instanceof alight.core.ChangeDetector) {
			changeDetector = input;
			input = data;
		}
		else if (data instanceof alight.core.ChangeDetector) {
			changeDetector = data;
		}
		else if (f$.isFunction(data)) {
			var scope = {};
			changeDetector = alight.ChangeDetector(scope);
			data.call(changeDetector, scope);
		}
		else if (data) {
			changeDetector = alight.ChangeDetector(data);
		}
		if (Array.isArray(input)) {
			var result = void 0;
			for (var _i = 0, input_1 = input; _i < input_1.length; _i++) {
				var item = input_1[_i];
				result = alight.bootstrap(item, changeDetector);
			}
			return result;
		}
		if (typeof (input) === 'string') {
			var result = void 0;
			var elements = document.querySelectorAll(input);
			for (var _a = 0, elements_1 = elements; _a < elements_1.length; _a++) {
				var element = elements_1[_a];
				result = alight.bootstrap(element, changeDetector);
			}
			return result;
		}
		if (!changeDetector)
			changeDetector = alight.ChangeDetector();
		if (f$.isElement(input)) {
			var ctrlKey, ctrlName;
			for (var _b = 0, _c = ['al-app', 'al:app', 'data-al-app']; _b < _c.length; _b++) {
				ctrlKey = _c[_b];
				ctrlName = input.getAttribute(ctrlKey);
				input.removeAttribute(ctrlKey);
				if (ctrlName)
					break;
			}
			var option;
			if (ctrlName) {
				option = {
					skip_attr: [ctrlKey],
					attachDirective: {}
				};
				if (alight.d.al.ctrl)
					option.attachDirective['al-ctrl'] = ctrlName;
				else
					option.attachDirective[ctrlName + '!'] = '';
			}
			alight.bind(changeDetector, input, option);
			return changeDetector;
		}
		;
		alight.exceptionHandler('Error in bootstrap', 'Error input arguments', {
			input: input
		});
	};

	var clone, equal;

	alight.utils.getId = (function() {
	  var index, prefix;
	  prefix = (function() {
		var d, k, n, p, r, symbols;
		symbols = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		n = Math.floor((new Date()).valueOf() / 1000) - 1388512800;
		r = '';
		while (n > 0) {
		  d = Math.floor(n / 62);
		  p = d * 62;
		  k = n - p;
		  n = d;
		  r = symbols[k] + r;
		}
		return r;
	  })();
	  index = 1;
	  return function() {
		return prefix + '#' + index++;
	  };
	})();

	alight.utils.clone = clone = function(d, lvl) {
	  var i, k, r, v;
	  if (lvl == null) {
		lvl = 128;
	  }
	  if (lvl < 1) {
		return null;
	  }
	  if (!d) {
		return d;
	  }
	  if (typeof d === 'object') {
		if (d instanceof Array) {
		  r = (function() {
			var j, len, results;
			results = [];
			for (j = 0, len = d.length; j < len; j++) {
			  i = d[j];
			  results.push(clone(i, lvl - 1));
			}
			return results;
		  })();
		  return r;
		}
		if (d instanceof Date) {
		  return new Date(d.valueOf());
		}
		if (d.nodeType && typeof d.cloneNode === "function") {
		  return d;
		}
		r = {};
		for (k in d) {
		  v = d[k];
		  if (k[0] === '$') {
			continue;
		  }
		  r[k] = clone(v, lvl - 1);
		}
		return r;
	  }
	  return d;
	};

	alight.utils.equal = equal = function(a, b, lvl) {
	  var i, j, k, len, set, ta, tb, v;
	  if (lvl == null) {
		lvl = 128;
	  }
	  if (lvl < 1) {
		return true;
	  }
	  if (!a || !b) {
		return a === b;
	  }
	  ta = typeof a;
	  tb = typeof b;
	  if (ta !== tb) {
		return false;
	  }
	  if (ta === 'object') {
		if (a instanceof Array) {
		  if (a.length !== b.length) {
			return false;
		  }
		  for (i = j = 0, len = a.length; j < len; i = ++j) {
			v = a[i];
			if (!equal(v, b[i], lvl - 1)) {
			  return false;
			}
		  }
		  return true;
		}
		if (a instanceof Date) {
		  return a.valueOf() === b.valueOf();
		}
		if (a.nodeType && typeof a.cloneNode === "function") {
		  return a === b;
		}
		set = {};
		for (k in a) {
		  v = a[k];
		  if (k[0] === '$') {
			continue;
		  }
		  set[k] = true;
		  if (!equal(v, b[k], lvl - 1)) {
			return false;
		  }
		}
		for (k in b) {
		  v = b[k];
		  if (k[0] === '$') {
			continue;
		  }
		  if (set[k]) {
			continue;
		  }
		  if (!equal(v, a[k], lvl - 1)) {
			return false;
		  }
		}
		return true;
	  }
	  return a === b;
	};

	alight.exceptionHandler = function(e, title, locals) {
	  var output;
	  output = [];
	  if (title) {
		output.push(title);
	  }
	  if (e && e.message) {
		output.push(e.message);
	  }
	  if (locals) {
		output.push(locals);
	  }
	  if (e) {
		output.push(e.stack ? e.stack : e);
	  }
	  return console.error.apply(console, output);
	};

	(function() {
	  var assignmentOperator, isChar, isDigit, isSign, reserved, toDict;
	  toDict = function() {
		var i, k, len, result;
		result = {};
		for (i = 0, len = arguments.length; i < len; i++) {
		  k = arguments[i];
		  result[k] = true;
		}
		return result;
	  };
	  reserved = toDict('instanceof', 'typeof', 'in', 'null', 'true', 'false', 'undefined', 'return');
	  isChar = (function() {
		var rx;
		rx = /[a-zA-Z\u0410-\u044F\u0401\u0451_\.\$]/;
		return function(x) {
		  return x.match(rx);
		};
	  })();
	  isDigit = function(x) {
		return x.charCodeAt() >= 48 && x.charCodeAt() <= 57;
	  };
	  isSign = (function() {
		var chars;
		chars = toDict('+', '-', '>', '<', '=', '&', '|', '^', '!', '~');
		return function(x) {
		  return chars[x] || false;
		};
	  })();
	  assignmentOperator = toDict('=', '+=', '-=', '++', '--', '|=', '^=', '&=', '!=', '<<=', '>>=');
	  alight.utils.parsExpression = function(expression, option) {
		var build, convert, data, getFirstPart, inputKeywords, pars, ret, splitVariable, toElvis, uniq;
		option = option || {};
		inputKeywords = toDict.apply(null, option.input || []);
		uniq = 1;
		pars = function(option) {
		  var a, an, ap, bracket, child, commitText, digit, filter, freeText, index, leftVariable, level, line, original, result, sign, status, stopKey, stringKey, stringValue, variable, variableChildren;
		  line = option.line;
		  result = option.result || [];
		  index = option.index || 0;
		  level = option.level || 0;
		  stopKey = option.stopKey || null;
		  variable = '';
		  leftVariable = null;
		  variableChildren = [];
		  sign = '';
		  digit = '';
		  status = false;
		  original = '';
		  stringKey = '';
		  stringValue = '';
		  freeText = '';
		  bracket = 0;
		  filter = null;
		  commitText = function() {
			if (freeText) {
			  result.push({
				type: 'free',
				value: freeText
			  });
			}
			return freeText = '';
		  };
		  while (index <= line.length) {
			ap = line[index - 1];
			a = line[index++] || '';
			an = line[index];
			if ((status && freeText) || (!a)) {
			  commitText();
			}
			if (status === 'string') {
			  if (a === stringKey && ap !== '\\') {
				stringValue += a;
				result.push({
				  type: 'string',
				  value: stringValue
				});
				stringValue = '';
				stringKey = '';
				status = '';
				continue;
			  }
			  stringValue += a;
			  continue;
			} else if (status === 'key') {
			  if (isChar(a) || isDigit(a)) {
				variable += a;
				continue;
			  }
			  if (a === '[') {
				variable += a;
				child = pars({
				  line: line,
				  index: index,
				  level: level + 1,
				  stopKey: ']'
				});
				if (!child.stopKeyOk) {
				  throw 'Error expression';
				}
				index = child.index;
				variable += '###' + child.uniq + '###]';
				variableChildren.push(child);
				continue;
			  } else if (a === '?' && (an === '.' || an === '(' || an === '[')) {
				variable += a;
				continue;
			  } else if (a === '(') {
				variable += a;
				child = pars({
				  line: line,
				  index: index,
				  level: level + 1,
				  stopKey: ')'
				});
				if (!child.stopKeyOk) {
				  throw 'Error expression';
				}
				index = child.index;
				variable += '###' + child.uniq + '###)';
				variableChildren.push(child);
				continue;
			  }
			  leftVariable = {
				type: 'key',
				value: variable,
				start: index - variable.length - 1,
				finish: index - 1,
				children: variableChildren
			  };
			  result.push(leftVariable);
			  status = '';
			  variable = '';
			  variableChildren = [];
			} else if (status === 'sign') {
			  if (isSign(a)) {
				sign += a;
				continue;
			  }
			  if (sign === '|' && level === 0 && bracket === 0) {
				filter = line.substring(index - 1);
				index = line.length + 1;
				continue;
			  }
			  if (assignmentOperator[sign] || (sign[0] === '=' && sign[1] !== '=')) {
				leftVariable.assignment = true;
			  }
			  result.push({
				type: 'sign',
				value: sign
			  });
			  status = '';
			  sign = '';
			} else if (status === 'digit') {
			  if (isDigit(a) || a === '.') {
				digit += a;
				continue;
			  }
			  result.push({
				type: 'digit',
				value: digit
			  });
			  digit = '';
			}
			if (isChar(a)) {
			  status = 'key';
			  variable += a;
			  continue;
			}
			if (isSign(a)) {
			  status = 'sign';
			  sign += a;
			  continue;
			}
			if (isDigit(a)) {
			  status = 'digit';
			  digit += a;
			  continue;
			}
			if (a === '"' || a === "'") {
			  stringKey = a;
			  status = 'string';
			  stringValue += a;
			  continue;
			}
			if (a === stopKey) {
			  commitText();
			  return {
				result: result,
				index: index,
				stopKeyOk: true,
				uniq: uniq++
			  };
			}
			if (a === '(') {
			  bracket++;
			}
			if (a === ')') {
			  bracket--;
			}
			if (a === '{') {
			  commitText();
			  child = pars({
				line: line,
				index: index,
				level: level + 1,
				stopKey: '}'
			  });
			  result.push({
				type: '{}',
				child: child
			  });
			  index = child.index;
			  continue;
			}
			if (a === ':' && stopKey === '}') {
			  leftVariable.type = 'free';
			}
			freeText += a;
		  }
		  commitText();
		  return {
			result: result,
			index: index,
			filter: filter
		  };
		};
		data = pars({
		  line: expression
		});
		ret = {
		  isSimple: !data.filter,
		  simpleVariables: []
		};
		if (data.filter) {
		  ret.expression = expression.substring(0, expression.length - data.filter.length - 1);
		  ret.filter = data.filter;
		} else {
		  ret.expression = expression;
		}
		splitVariable = function(variable) {
		  var parts;
		  parts = variable.split(/[\.\[\(\?]/);
		  return {
			count: parts.length,
			firstPart: parts[0]
		  };
		};
		toElvis = function(name, isReserved) {
		  if (isReserved) {
			return '($$=' + name + ',$$==null)?undefined:';
		  } else {
			return '($$=$$' + name + ',$$==null)?undefined:';
		  }
		};
		getFirstPart = function(name) {
		  return name.split(/[\.\[\(\?]/)[0];
		};
		convert = function(variable) {
		  var firstPart, full, i, isReserved, last, len, p, parts, ref, result;
		  if (variable === 'this') {
			return '$$scope';
		  }
		  firstPart = getFirstPart(variable);
		  isReserved = reserved[firstPart] || inputKeywords[firstPart];
		  if (firstPart === 'this') {
			variable = '$$scope' + variable.slice(4);
			isReserved = true;
		  }
		  parts = variable.split('?');
		  if (parts.length === 1) {
			if (isReserved) {
			  return variable;
			}
			return '$$scope.' + variable;
		  }
		  if (isReserved) {
			result = toElvis(parts[0], true);
			full = parts[0];
		  } else {
			result = toElvis('scope.' + parts[0]);
			full = 'scope.' + parts[0];
		  }
		  ref = parts.slice(1, parts.length - 1);
		  for (i = 0, len = ref.length; i < len; i++) {
			p = ref[i];
			if (p[0] === '(') {
			  result += toElvis(full + p, isReserved);
			} else {
			  result += toElvis(p);
			  full += p;
			}
		  }
		  last = parts[parts.length - 1];
		  if (last[0] === '(') {
			if (!isReserved) {
			  result += '$$';
			}
			result += full + last;
		  } else {
			result += '$$' + last;
		  }
		  return '(' + result + ')';
		};
		build = function(part) {
		  var c, childName, d, i, j, key, len, len1, name, ref, ref1, result, sv;
		  result = '';
		  ref = part.result;
		  for (i = 0, len = ref.length; i < len; i++) {
			d = ref[i];
			if (d.type === 'key') {
			  if (d.assignment) {
				sv = splitVariable(d.value);
				if (sv.firstPart === 'this') {
				  name = '$$scope' + d.value.substring(4);
				} else if (inputKeywords[sv.firstPart]) {
				  name = d.value;
				} else if (sv.count < 2) {
				  name = '($$scope.$$root || $$scope).' + d.value;
				} else {
				  name = '$$scope.' + d.value;
				}
				ret.isSimple = false;
			  } else {
				if (reserved[d.value]) {
				  name = d.value;
				} else {
				  name = convert(d.value);
				  ret.simpleVariables.push(name);
				}
			  }
			  if (d.children.length) {
				ref1 = d.children;
				for (j = 0, len1 = ref1.length; j < len1; j++) {
				  c = ref1[j];
				  key = "###" + c.uniq + "###";
				  childName = build(c);
				  name = name.split(key).join(childName);
				}
			  }
			  result += name;
			  continue;
			}
			if (d.type === '{}') {
			  result += '{' + build(d.child) + '}';
			  continue;
			}
			result += d.value;
		  }
		  return result;
		};
		ret.result = build(data);
		if (alight.debug.parser) {
		  console.log(expression, ret);
		}
		return ret;
	  };
	  alight.utils.parsFilter = function(text) {
		var d, r, result;
		result = [];
		text = text.trim();
		while (text) {
		  d = text.match(/^(\w+)([^\w])(.*)$/);
		  if (d) {
			if (d[2] === '|') {
			  result.push({
				name: d[1],
				args: [],
				raw: ''
			  });
			  text = d[3];
			} else {
			  r = alight.utils.parsArguments(d[3], {
				stop: '|'
			  });
			  result.push({
				name: d[1],
				args: r.result,
				raw: d[3].slice(0, r.length)
			  });
			  text = d[3].slice(r.length + 1).trim();
			}
		  } else {
			d = text.match(/^(\w+)$/);
			if (!d) {
			  return null;
			}
			result.push({
			  name: d[1],
			  args: [],
			  raw: ''
			});
			break;
		  }
		}
		return {
		  result: result
		};
	  };
	  return alight.utils.parsArguments = function(text, option) {
		var a, arg, args, bracket, index, push, string0, string1;
		option = option || {};
		index = 0;
		args = [];
		arg = '';
		bracket = 0;
		string0 = false;
		string1 = false;
		push = function() {
		  if (arg) {
			args.push(arg);
			arg = '';
		  }
		};
		while (index <= text.length) {
		  a = text[index] || '';
		  index++;
		  if (string0) {
			arg += a;
			if (a === '"') {
			  string0 = false;
			}
			continue;
		  }
		  if (string1) {
			arg += a;
			if (a === "'") {
			  string1 = false;
			}
			continue;
		  }
		  if (a === '"') {
			arg += a;
			string0 = true;
			continue;
		  }
		  if (a === "'") {
			arg += a;
			string1 = true;
			continue;
		  }
		  if (bracket) {
			arg += a;
			if (a === '(') {
			  bracket++;
			}
			if (a === ')') {
			  bracket--;
			}
			continue;
		  }
		  if (a === ' ' || a === ',') {
			push();
			continue;
		  }
		  if (option.stop && option.stop === a) {
			push();
			break;
		  }
		  if (a === '(') {
			bracket = 1;
		  }
		  arg += a;
		}
		push();
		return {
		  result: args,
		  length: index - 1
		};
	  };
	})();

	(function() {
	  var cache, clone, rawParsText;
	  alight.utils.pars_start_tag = '{{';
	  alight.utils.pars_finish_tag = '}}';
	  rawParsText = function(line) {
		var find_exp, finish_tag, get_part, index, pars, prev_index, result, rexp, start_tag;
		start_tag = alight.utils.pars_start_tag;
		finish_tag = alight.utils.pars_finish_tag;
		result = [];
		index = 0;
		prev_index = 0;
		get_part = function(count) {
		  var r;
		  count = count || 1;
		  r = line.substring(prev_index, index - count);
		  prev_index = index;
		  return r;
		};
		rexp = null;
		pars = function(lvl, stop, force) {
		  var a, a2, an, prev;
		  if (!lvl) {
			rexp = {
			  type: 'expression',
			  list: []
			};
			result.push(rexp);
		  }
		  prev = null;
		  a = null;
		  while (index < line.length) {
			prev = a;
			a = line[index];
			index += 1;
			a2 = prev + a;
			an = line[index];
			if (a === stop) {
			  return;
			}
			if (force) {
			  continue;
			}
			if (a2 === finish_tag && lvl === 0) {
			  rexp.list.push(get_part(2));
			  return true;
			}
			if (a === '(') {
			  pars(lvl + 1, ')');
			} else if (a === '{') {
			  pars(lvl + 1, '}');
			} else if (a === '"') {
			  pars(lvl + 1, '"', true);
			} else if (a === "'") {
			  pars(lvl + 1, "'", true);
			} else if (a === '|') {
			  if (lvl === 0) {
				if (an === '|') {
				  index += 1;
				} else {
				  rexp.list.push(get_part());
				}
			  }
			}
		  }
		};
		find_exp = function() {
		  var a, a2, prev, r, text;
		  prev = null;
		  a = null;
		  while (index < line.length) {
			prev = a;
			a = line[index];
			index += 1;
			a2 = prev + a;
			if (a2 === start_tag) {
			  text = get_part(2);
			  if (text) {
				result.push({
				  type: 'text',
				  value: text
				});
			  }
			  if (!pars(0)) {
				throw 'Wrong expression' + line;
			  }
			  a = null;
			}
		  }
		  r = get_part(-1);
		  if (r) {
			return result.push({
			  type: 'text',
			  value: r
			});
		  }
		};
		find_exp();
		if (alight.debug.parser) {
		  console.log('parsText', result);
		}
		return result;
	  };
	  cache = {};
	  clone = function(result) {
		var i, k, resp;
		resp = (function() {
		  var j, len, results;
		  results = [];
		  for (j = 0, len = result.length; j < len; j++) {
			i = result[j];
			k = {
			  type: i.type,
			  value: i.value
			};
			if (i.list) {
			  k.list = i.list.slice();
			}
			results.push(k);
		  }
		  return results;
		})();
		return resp;
	  };
	  return alight.utils.parsText = function(line) {
		var result;
		result = cache[line];
		if (!result) {
		  cache[line] = result = rawParsText(line);
		}
		return clone(result);
	  };
	})();


	/*
		src - expression
		cfg:
			scope
			hash		
			no_return   - method without return (exec)
			string	  - method will return result as string
			input	   - list of input arguments
			rawExpression

		return {
			fn
			rawExpression
			filters
			isSimple
			simpleVariables
		}
	 */
	(function() {
	  var self;
	  alight.utils.compile = self = {};
	  self.cache = {};
	  self.Function = Function;

	  /*
	  compile expression
		  no_return
		  input
		  string
	  
	  return
		  fn
		  rawExpression
	  
		  result
		  filters
		  isSimple
		  simpleVariables
		  expression
	   */
	  self.expression = function(src, cfg) {
		var args, e, error, exp, fn, funcCache, hash, no_return, result;
		cfg = cfg || {};
		src = src.trim();
		hash = src + '#';
		hash += cfg.no_return ? '+' : '-';
		hash += cfg.string ? 's' : 'v';
		if (cfg.input) {
		  hash += cfg.input.join(',');
		}
		funcCache = self.cache[hash];
		if (funcCache) {
		  return funcCache;
		}
		funcCache = alight.utils.parsExpression(src, {
		  input: cfg.input
		});
		exp = funcCache.result;
		no_return = cfg.no_return || false;
		if (no_return) {
		  result = "var $$;" + exp;
		} else {
		  if (cfg.string && !funcCache.filter) {
			result = "var $$, __ = (" + exp + "); return '' + (__ || (__ == null?'':__))";
			funcCache.rawExpression = "(__=" + exp + ") || (__ == null?'':__)";
		  } else {
			result = "var $$;return (" + exp + ")";
		  }
		}
		try {
		  if (cfg.input) {
			args = cfg.input.slice();
			args.unshift('$$scope');
			args.push(result);
			fn = self.Function.apply(null, args);
		  } else {
			fn = self.Function('$$scope', result);
		  }
		} catch (error) {
		  e = error;
		  alight.exceptionHandler(e, 'Wrong expression: ' + src, {
			src: src,
			cfg: cfg
		  });
		  throw 'Wrong expression: ' + exp;
		}
		funcCache.fn = fn;
		return self.cache[hash] = funcCache;
	  };
	  self.cacheText = {};
	  self.buildText = function(text, data) {
		var d, escapedValue, fn, i, index, len, result;
		fn = self.cacheText[text];
		if (fn) {
		  return function() {
			return fn.call(data);
		  };
		}
		result = [];
		for (index = i = 0, len = data.length; i < len; index = ++i) {
		  d = data[index];
		  if (d.type === 'expression') {
			if (d.fn) {
			  result.push("this[" + index + "].fn(this.scope)");
			} else {
			  result.push("((x=this[" + index + "].value) || (x == null?'':x))");
			}
		  } else if (d.value) {
			escapedValue = d.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
			result.push('"' + escapedValue + '"');
		  }
		}
		result = result.join(' + ');
		fn = self.Function("var x; return (" + result + ")");
		self.cacheText[text] = fn;
		return function() {
		  return fn.call(data);
		};
	  };
	  self.cacheSimpleText = {};
	  return self.buildSimpleText = function(text, data) {
		var d, escapedValue, fn, i, index, item, len, result, simpleVariables;
		item = text ? self.cacheSimpleText[text] : null;
		if (item || !data) {
		  return item || null;
		}
		result = [];
		simpleVariables = [];
		for (index = i = 0, len = data.length; i < len; index = ++i) {
		  d = data[index];
		  if (d.type === 'expression') {
			result.push("(" + d.re + ")");
			if (d.simpleVariables) {
			  simpleVariables.push.apply(simpleVariables, d.simpleVariables);
			}
		  } else if (d.value) {
			escapedValue = d.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
			result.push('"' + escapedValue + '"');
		  }
		}
		result = result.join(' + ');
		fn = self.Function('$$scope', "var $$, __; return (" + result + ")");
		item = {
		  fn: fn,
		  simpleVariables: simpleVariables
		};
		if (text) {
		  self.cacheSimpleText[text] = item;
		}
		return item;
	  };
	})();

	var FastBinding, compileText, pathToEl;

	pathToEl = function(path) {
	  var i, j, len, result;
	  if (!path.length) {
		return 'el';
	  }
	  result = 'el';
	  for (j = 0, len = path.length; j < len; j++) {
		i = path[j];
		result += ".childNodes[" + i + "]";
	  }
	  return result;
	};

	compileText = function(text) {
	  var ce, d, data, j, key, len, st;
	  data = alight.utils.parsText(text);
	  for (j = 0, len = data.length; j < len; j++) {
		d = data[j];
		if (d.type !== 'expression') {
		  continue;
		}
		if (d.list.length > 1) {
		  return null;
		}
		key = d.list[0];
		if (key[0] === '#') {
		  return null;
		}
		if (key[0] === '=') {
		  return null;
		}
		if (key.slice(0, 2) === '::') {
		  return null;
		}
		ce = alight.utils.compile.expression(key, {
		  string: true
		});
		if (!ce.rawExpression) {
		  throw 'Error';
		}
		d.re = ce.rawExpression;
	  }
	  st = alight.utils.compile.buildSimpleText(text, data);
	  return st.fn;
	};

	alight.core.fastBinding = function(bindResult) {
	  if (!alight.option.fastBinding) {
		return;
	  }
	  if (bindResult.directive || bindResult.hook || !bindResult.fb) {
		return;
	  }
	  return new FastBinding(bindResult);
	};

	FastBinding = function(bindResult) {
	  var path, self, source, walk;
	  self = this;
	  source = [];
	  self.fastWatchFn = [];
	  path = [];
	  walk = function(fb, deep) {
		var d, fn, it, j, k, key, l, len, len1, len2, ref, ref1, ref2, rel, rtext, text;
		if (fb.dir) {
		  rel = pathToEl(path);
		  ref = fb.dir;
		  for (j = 0, len = ref.length; j < len; j++) {
			d = ref[j];
			source.push('s.dir(' + self.fastWatchFn.length + ', ' + rel + ');');
			self.fastWatchFn.push(d);
		  }
		}
		if (fb.attr) {
		  ref1 = fb.attr;
		  for (k = 0, len1 = ref1.length; k < len1; k++) {
			it = ref1[k];
			text = it.value;
			key = it.attrName;
			rel = pathToEl(path);
			fn = compileText(text);
			rtext = text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
			if (fn) {
			  source.push('s.fw("' + rtext + '", ' + self.fastWatchFn.length + ', ' + rel + ', "' + key + '");');
			  self.fastWatchFn.push(fn);
			} else {
			  source.push("s.wt('" + rtext + "', " + rel + ", '" + key + "');");
			}
		  }
		}
		if (fb.text) {
		  rel = pathToEl(path);
		  fn = compileText(fb.text);
		  rtext = fb.text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
		  if (fn) {
			source.push('s.fw("' + rtext + '", ' + self.fastWatchFn.length + ', ' + rel + ');');
			self.fastWatchFn.push(fn);
		  } else {
			source.push('s.wt("' + rtext + '", ' + rel + ');');
		  }
		}
		if (fb.children) {
		  ref2 = fb.children;
		  for (l = 0, len2 = ref2.length; l < len2; l++) {
			it = ref2[l];
			path.length = deep + 1;
			path[deep] = it.index;
			walk(it.fb, deep + 1);
		  }
		}
	  };
	  walk(bindResult.fb, 0);
	  source = source.join('\n');
	  self.resultFn = alight.utils.compile.Function('s', 'el', 'f$', source);
	  return this;
	};

	FastBinding.prototype.bind = function(cd, element) {
	  this.currentCD = cd;
	  this.resultFn(this, element, f$);
	};

	FastBinding.prototype.dir = function(fnIndex, el) {
	  var cd, d, env, r;
	  d = this.fastWatchFn[fnIndex];
	  cd = this.currentCD;
	  env = new Env({
		attrName: d.attrName,
		attrArgument: d.attrArgument,
		changeDetector: cd,
		fbData: d.fbData
	  });
	  r = d.fb.call(env, cd.scope, el, d.value, env);
	  if (r && r.start) {
		r.start();
	  }
	};

	FastBinding.prototype.fw = function(text, fnIndex, element, attr) {
	  var cd, fn, value, w;
	  cd = this.currentCD;
	  fn = this.fastWatchFn[fnIndex];
	  value = fn(cd.locals);
	  w = {
		isStatic: false,
		isArray: false,
		extraLoop: false,
		deep: false,
		value: value,
		callback: null,
		exp: fn,
		src: text,
		onStop: null,
		el: element,
		ea: attr || null
	  };
	  cd.watchList.push(w);
	  execWatchObject(cd.scope, w, value);
	};

	FastBinding.prototype.wt = function(expression, element, attr) {
	  this.currentCD.watchText(expression, null, {
		element: element,
		elementAttr: attr
	  });
	};

	(function() {
	  var eventOption, execute, formatModifier, getValue, handler, keyCodes, makeEvent, setKeyModifier;
	  alight.hooks.attribute.unshift({
		code: 'events',
		fn: function() {
		  var d;
		  d = this.attrName.match(/^\@([\w\.\-]+)$/);
		  if (!d) {
			return;
		  }
		  this.ns = 'al';
		  this.name = 'on';
		  this.attrArgument = d[1];
		}
	  });

	  /*
	  eventModifier
		  = 'keydown blur'
		  = ['keydown', 'blur']
		  =
			  event: string or list
			  fn: (event, env) ->
	   */
	  alight.hooks.eventModifier = {};
	  setKeyModifier = function(name, key) {
		return alight.hooks.eventModifier[name] = {
		  event: ['keydown', 'keypress', 'keyup'],
		  fn: function(event, env) {
			if (!event[key]) {
			  env.stop = true;
			}
		  }
		};
	  };
	  setKeyModifier('alt', 'altKey');
	  setKeyModifier('control', 'ctrlKey');
	  setKeyModifier('ctrl', 'ctrlKey');
	  setKeyModifier('meta', 'metaKey');
	  setKeyModifier('shift', 'shiftKey');
	  alight.hooks.eventModifier.self = function(event, env) {
		if (event.target !== env.element) {
		  return env.stop = true;
		}
	  };
	  alight.hooks.eventModifier.once = {
		beforeExec: function(event, env) {
		  return env.unbind();
		}
	  };
	  formatModifier = function(modifier, filterByEvents) {
		var e, i, inuse, len, ref, result;
		result = {};
		if (typeof modifier === 'string') {
		  result.event = modifier;
		} else if (typeof modifier === 'object' && modifier.event) {
		  result.event = modifier.event;
		}
		if (typeof result.event === 'string') {
		  result.event = result.event.split(/\s+/);
		}
		if (filterByEvents) {
		  if (result.event) {
			inuse = false;
			ref = result.event;
			for (i = 0, len = ref.length; i < len; i++) {
			  e = ref[i];
			  if (filterByEvents.indexOf(e) >= 0) {
				inuse = true;
				break;
			  }
			}
			if (!inuse) {
			  return null;
			}
		  }
		}
		if (f$.isFunction(modifier)) {
		  result.fn = modifier;
		} else if (modifier.fn) {
		  result.fn = modifier.fn;
		}
		if (modifier.beforeExec) {
		  result.beforeExec = modifier.beforeExec;
		}
		if (modifier.init) {
		  result.init = modifier.init;
		}
		return result;
	  };
	  alight.d.al.on = function(scope, element, expression, env) {
		var evConstructor, eventName;
		if (!env.attrArgument) {
		  return;
		}
		if (alight.option.removeAttribute) {
		  element.removeAttribute(env.attrName);
		  if (env.fbElement) {
			env.fbElement.removeAttribute(env.attrName);
		  }
		}
		eventName = env.attrArgument.split('.')[0];
		evConstructor = function() {};
		evConstructor.prototype = makeEvent(env.attrArgument, eventOption[eventName]);
		if (expression) {
		  evConstructor.prototype.fn = env.changeDetector.compile(expression, {
			no_return: true,
			input: ['$event', '$element', '$value']
		  });
		}
		evConstructor.prototype.expression = expression;
		env.fastBinding = function(scope, element, expression, env) {
		  var callback, cd, e, ev, i, len, ref;
		  ev = new evConstructor;
		  ev.scope = scope;
		  ev.element = element;
		  ev.cd = cd = env.changeDetector;
		  callback = function(e) {
			return handler(ev, e);
		  };
		  ref = ev.eventList;
		  for (i = 0, len = ref.length; i < len; i++) {
			e = ref[i];
			f$.on(element, e, callback);
		  }
		  if (ev.initFn) {
			ev.initFn(scope, element, expression, env);
		  }
		  ev.unbind = function() {
			var j, len1, ref1;
			ref1 = ev.eventList;
			for (j = 0, len1 = ref1.length; j < len1; j++) {
			  e = ref1[j];
			  f$.off(element, e, callback);
			}
		  };
		  env.changeDetector.watch('$destroy', ev.unbind);
		};
		env.fastBinding(scope, element, expression, env);
	  };
	  keyCodes = {
		enter: 13,
		tab: 9,
		"delete": 46,
		backspace: 8,
		esc: 27,
		space: 32,
		up: 38,
		down: 40,
		left: 37,
		right: 39
	  };
	  eventOption = {
		click: {
		  stop: true,
		  prevent: true
		},
		dblclick: {
		  stop: true,
		  prevent: true
		},
		submit: {
		  stop: true,
		  prevent: true
		},
		keyup: {
		  filterByKey: true
		},
		keypress: {
		  filterByKey: true
		},
		keydown: {
		  filterByKey: true
		}
	  };
	  makeEvent = function(attrArgument, option) {
		var args, ev, eventName, filterByKey, i, k, len, modifier, ref;
		option = option || {};
		ev = {
		  attrArgument: attrArgument,
		  throttle: null,
		  throttleTime: 0,
		  debounce: null,
		  debounceId: null,
		  initFn: null,
		  eventList: null,
		  stop: option.stop || false,
		  prevent: option.prevent || false,
		  scan: true,
		  modifiers: []
		};
		args = attrArgument.split('.');
		eventName = args[0];
		filterByKey = null;
		modifier = alight.hooks.eventModifier[eventName];
		if (modifier) {
		  modifier = formatModifier(modifier);
		  if (modifier.event) {
			ev.eventList = modifier.event;
			if (modifier.fn) {
			  ev.modifiers.push(modifier);
			}
			if (modifier.init) {
			  ev.initFn = modifier.init;
			}
		  }
		}
		if (!ev.eventList) {
		  ev.eventList = [eventName];
		}
		ref = args.slice(1);
		for (i = 0, len = ref.length; i < len; i++) {
		  k = ref[i];
		  if (k === 'stop') {
			ev.stop = true;
			continue;
		  }
		  if (k === 'prevent') {
			ev.prevent = true;
			continue;
		  }
		  if (k === 'nostop') {
			ev.stop = false;
			continue;
		  }
		  if (k === 'noprevent') {
			ev.prevent = false;
			continue;
		  }
		  if (k === 'noscan') {
			ev.scan = false;
			continue;
		  }
		  if (k.substring(0, 9) === 'throttle-') {
			ev.throttle = Number(k.substring(9));
			continue;
		  }
		  if (k.substring(0, 9) === 'debounce-') {
			ev.debounce = Number(k.substring(9));
			continue;
		  }
		  modifier = alight.hooks.eventModifier[k];
		  if (modifier) {
			modifier = formatModifier(modifier, ev.eventList);
			if (modifier) {
			  ev.modifiers.push(modifier);
			}
			continue;
		  }
		  if (!option.filterByKey) {
			continue;
		  }
		  if (filterByKey === null) {
			filterByKey = {};
		  }
		  if (keyCodes[k]) {
			k = keyCodes[k];
		  }
		  filterByKey[k] = true;
		}
		ev.filterByKey = filterByKey;
		return ev;
	  };
	  getValue = function(ev, event) {
		var element;
		element = ev.element;
		if (element.type === 'checkbox') {
		  return element.checked;
		} else if (element.type === 'radio') {
		  return element.value || element.checked;
		} else if (event.component) {
		  return event.value;
		} else {
		  return element.value;
		}
	  };
	  execute = function(ev, event) {
		var error, error1, i, len, modifier, ref;
		ref = ev.modifiers;
		for (i = 0, len = ref.length; i < len; i++) {
		  modifier = ref[i];
		  if (modifier.beforeExec) {
			modifier.beforeExec(event, ev);
		  }
		}
		if (ev.fn) {
		  try {
			ev.fn(ev.cd.locals, event, ev.element, getValue(ev, event));
		  } catch (error1) {
			error = error1;
			alight.exceptionHandler(error, "Error in event: " + ev.attrArgument + " = " + ev.expression, {
			  attr: ev.attrArgument,
			  exp: ev.expression,
			  scope: ev.scope,
			  cd: ev.cd,
			  element: ev.element,
			  event: event
			});
		  }
		}
		if (ev.scan) {
		  ev.cd.scan();
		}
	  };
	  return handler = function(ev, event) {
		var EV, env, i, len, modifier, ref;
		if (ev.filterByKey) {
		  if (!ev.filterByKey[event.keyCode]) {
			return;
		  }
		}
		if (ev.modifiers.length) {
		  EV = function() {};
		  EV.prototype = ev;
		  env = new EV;
		  env.stop = false;
		  ref = ev.modifiers;
		  for (i = 0, len = ref.length; i < len; i++) {
			modifier = ref[i];
			if (modifier.fn) {
			  modifier.fn(event, env);
			  if (env.stop) {
				return;
			  }
			}
		  }
		}
		if (ev.prevent) {
		  event.preventDefault();
		}
		if (ev.stop) {
		  event.stopPropagation();
		}
		if (ev.debounce) {
		  if (ev.debounceId) {
			clearTimeout(ev.debounceId);
		  }
		  ev.debounceId = setTimeout(function() {
			ev.debounceId = null;
			return execute(ev, event);
		  }, ev.debounce);
		} else if (ev.throttle) {
		  if (ev.throttleTime < Date.now()) {
			ev.throttleTime = Date.now() + ev.throttle;
			execute(ev, event);
		  }
		} else {
		  execute(ev, event);
		}
	  };
	})();

	alight.hooks.attribute.unshift({
		code: 'directDirective',
		fn: function () {
			var d = this.attrName.match(/^(.*)\!$/);
			if (!d)
				return;
			var name = d[1].replace(/(-\w)/g, function (m) {
				return m.substring(1).toUpperCase();
			});
			var fn = this.cd.locals[name] || alight.ctrl[name] || alight.option.globalController && window[name];
			if (f$.isFunction(fn)) {
				this.directive = function (scope, element, value, env) {
					var cd = env.changeDetector;
					if (value) {
						var args = alight.utils.parsArguments(value);
						var values = Array(args.result.length);
						for (var i = 0; i < args.result.length; i++) {
							values[i] = alight.utils.compile.expression(args.result[i], {
								input: ['$element', '$env']
							}).fn(cd.locals, element, env);
						}
						fn.apply(cd, values);
					}
					else {
						fn.call(cd, scope, element, value, env);
					}
				};
			}
			else {
				this.result = 'noDirective';
				this.stop = true;
			}
		}
	});

	function setElementToName(scope, element, value, env) {
		env.setValue(env.attrArgument, element);
	}
	;
	alight.hooks.attribute.unshift({
		code: 'elementVariable',
		fn: function () {
			var d = this.attrName.match(/^#([\w\.]*)$/);
			if (!d)
				return;
			this.directive = setElementToName;
			this.attrArgument = d[1];
		}
	});

	alight.d.al.value = function(scope, element, variable, env) {
	  var updateModel, watch;
	  env.fastBinding = true;
	  updateModel = function() {
		env.setValue(variable, element.value);
		watch.refresh();
		env.scan();
	  };
	  env.on(element, 'input', updateModel);
	  env.on(element, 'change', updateModel);
	  return watch = env.watch(variable, function(value) {
		if (value == null) {
		  value = '';
		}
		element.value = value;
		return '$scanNoChanges';
	  });
	};

	alight.d.al.checked = function (scope, element, name, env) {
		var fbData = env.fbData = {
			opt: {},
			watch: []
		};
		function eattr(attrName) {
			var result = env.takeAttr(attrName);
			if (alight.option.removeAttribute) {
				element.removeAttribute(attrName);
				if (env.fbElement)
					env.fbElement.removeAttribute(attrName);
			}
			return result;
		}
		function takeAttr(name, attrName) {
			var text = eattr(attrName);
			if (text) {
				fbData.opt[name] = text;
				return true;
			}
			else {
				var exp = eattr(':' + attrName) || eattr('al-attr.' + attrName);
				if (exp) {
					fbData.watch.push([exp, name]);
					return true;
				}
			}
		}
		function applyOpt(opt, env, updateDOM) {
			for (var k in env.fbData.opt) {
				opt[k] = env.fbData.opt[k];
			}
			var _loop_1 = function(w) {
				var name_1 = w[1];
				env.watch(w[0], function (value) {
					opt[name_1] = value;
					updateDOM();
				});
			};
			for (var _i = 0, _a = env.fbData.watch; _i < _a.length; _i++) {
				var w = _a[_i];
				_loop_1(w);
			}
		}
		if (takeAttr('value', 'value')) {
			env.fastBinding = function (scope, element, name, env) {
				var watch, array = null;
				function updateDOM() {
					element.checked = array && array.indexOf(opt.value) >= 0;
					return '$scanNoChanges';
				}
				;
				var opt = {};
				applyOpt(opt, env, updateDOM);
				watch = env.watch(name, function (input) {
					array = input;
					if (!Array.isArray(array))
						array = null;
					updateDOM();
				}, { isArray: true });
				env.on(element, 'change', function () {
					if (!array) {
						array = [];
						env.setValue(name, array);
					}
					if (element.checked) {
						if (array.indexOf(opt.value) < 0)
							array.push(opt.value);
					}
					else {
						var i = array.indexOf(opt.value);
						if (i >= 0)
							array.splice(i, 1);
					}
					watch.refresh();
					env.scan();
					return;
				});
			};
		}
		else {
			takeAttr('true', 'true-value');
			takeAttr('false', 'false-value');
			env.fastBinding = function (scope, element, name, env) {
				var value, watch;
				var opt = {
					true: true,
					false: false
				};
				function updateDOM() {
					element.checked = value === opt.true;
					return '$scanNoChanges';
				}
				;
				applyOpt(opt, env, updateDOM);
				watch = env.watch(name, function (input) {
					value = input;
					updateDOM();
				});
				env.on(element, 'change', function () {
					value = element.checked ? opt.true : opt.false;
					env.setValue(name, value);
					watch.refresh();
					env.scan();
					return;
				});
			};
		}
		env.fastBinding(scope, element, name, env);
	};

	alight.d.al["if"] = function(scope, element, name, env) {
	  var self;
	  if (env.elementCanBeRemoved) {
		alight.exceptionHandler(null, env.attrName + " can't control element because of " + env.elementCanBeRemoved, {
		  scope: scope,
		  element: element,
		  value: name,
		  env: env
		});
		return {};
	  }
	  env.stopBinding = true;
	  return self = {
		item: null,
		childCD: null,
		base_element: null,
		top_element: null,
		start: function() {
		  self.prepare();
		  self.watchModel();
		},
		prepare: function() {
		  self.base_element = element;
		  self.top_element = document.createComment(" " + env.attrName + ": " + name + " ");
		  f$.before(element, self.top_element);
		  f$.remove(element);
		},
		updateDom: function(value) {
		  if (value) {
			self.insertBlock(value);
		  } else {
			self.removeBlock();
		  }
		},
		removeBlock: function() {
		  if (!self.childCD) {
			return;
		  }
		  self.childCD.destroy();
		  self.childCD = null;
		  self.removeDom(self.item);
		  self.item = null;
		},
		insertBlock: function() {
		  if (self.childCD) {
			return;
		  }
		  self.item = self.base_element.cloneNode(true);
		  self.insertDom(self.top_element, self.item);
		  self.childCD = env.changeDetector["new"]();
		  alight.bind(self.childCD, self.item, {
			skip_attr: env.skippedAttr(),
			elementCanBeRemoved: env.attrName
		  });
		},
		watchModel: function() {
		  env.watch(name, self.updateDom);
		},
		removeDom: function(element) {
		  f$.remove(element);
		},
		insertDom: function(base, element) {
		  f$.after(base, element);
		}
	  };
	};

	alight.d.al.ifnot = function(scope, element, name, env) {
	  var self;
	  self = alight.d.al["if"](scope, element, name, env);
	  self.updateDom = function(value) {
		if (value) {
		  self.removeBlock();
		} else {
		  self.insertBlock();
		}
	  };
	  return self;
	};


	/*
		al-repeat="item in list"
		"item in list"
		"item in list | filter"
		"item in list | filter track by trackExpression"
		"item in list track by $index"
		"item in list track by $id(item)"
		"item in list track by item.id"

		"(key, value) in object"
		"(key, value) in object orderBy:key:reverse"
		"(key, value) in object | filter orderBy:key,reverse"
	 */
	alight.directives.al.repeat = {
		restrict: 'AM',
		init: function(parentScope, element, exp, env) {
			var CD, self;
			if (env.elementCanBeRemoved) {
				alight.exceptionHandler(null, env.attrName + " can't control element because of " + env.elementCanBeRemoved, {
					scope: parentScope,
					element: element,
					value: exp,
					env: env
				});
				return {};
			}
			env.stopBinding = true;
			CD = env.changeDetector;
			
			return self = {
				start: function() {
					self.parsExpression();
					self.prepareDom();
					self.buildUpdateDom();
					self.watchModel();
				},
				parsExpression: function() {
					var r, s;
					s = exp.trim();
					if (s[0] === '(') {
						self.objectMode = true;
						r = s.match(/\((\w+),\s*(\w+)\)\s+in\s+(.+)\s+orderBy:(.+)\s*$/);
						if (r) {
							self.objectKey = r[1];
							self.objectValue = r[2];
							self.expression = r[3] + (" | toArray:" + self.objectKey + "," + self.objectValue + " | orderBy:" + r[4]);
							self.nameOfKey = '$item';
							self.trackExpression = '$item.' + self.objectKey;
						} else {
							r = s.match(/\((\w+),\s*(\w+)\)\s+in\s+(.+)\s*$/);
							if (!r) {
								throw 'Wrong repeat: ' + exp;
							}
							self.objectKey = r[1];
							self.objectValue = r[2];
							self.expression = r[3] + (" | toArray:" + self.objectKey + "," + self.objectValue);
							self.nameOfKey = '$item';
							self.trackExpression = '$item.' + self.objectKey;
						}
					} else {
						//==============================
						// simple array with structures
						// item in appData.config.list
						//==============================
						r = s.match(/(.*) track by ([\w\.\$\(\)]+)/);
						if (r) {
							self.trackExpression = r[2];
							s = r[1];
						}
						r = s.match(/\s*(\w+)\s+in\s+(.+)/);
						if (!r) {
							throw 'Wrong repeat: ' + exp;
						}
						self.nameOfKey = r[1];
						self.expression = r[2];
					}
				},
				watchModel: function() {
					var flags;
					if (self.objectMode) {
						flags = { deep: true };
					} else {
						flags = { isArray: true };
					}
					self.watch = CD.watch(self.expression, self.updateDom, flags);
				},
				prepareDom: function() {
					var el, element_list, i, len, t, t2;
					if (element.nodeType === 8) {
						self.top_element = element;
						self.element_list = element_list = [];
						el = element.nextSibling;
						while (el) {
							if (el.nodeType === 8) {
								t = el.nodeValue;
								t2 = t.trim().split(/\s+/);
								if (t2[0] === '/directive:' && t2[1] === 'al-repeat') {
									env.skipToElement = el;
									break;
								}
							}
							element_list.push(el);
							el = el.nextSibling;
						}
						for (i = 0, len = element_list.length; i < len; i++) {
							el = element_list[i];
							f$.remove(el);
						}
						null;
					} else {
						//==============================
						// simple array with structures
						// item in appData.config.list
						//==============================
						self.base_element = element;
						self.top_element = document.createComment(" " + exp + " ");
						f$.before(element, self.top_element);
						f$.remove(element);
						if (alight.option.removeAttribute) {
							element.removeAttribute(env.attrName);
						}
					}
				},
				makeChild: function(item, index, list) {
					var childCD;
					childCD = CD["new"](null, {
						locals: true
					});
					self.updateLocals(childCD, item, index, list);
					return childCD;
				},
				updateLocals: function(childCD, item, index, list) {
					var locals;
					locals = childCD.locals;
					if (self.objectMode) {
						locals[self.objectKey] = item[self.objectKey];
						locals[self.objectValue] = item[self.objectValue];
					} else {
						locals[self.nameOfKey] = item;
					}
					locals.$index = index;
					locals.$first = index === 0;
					locals.$last = index === list.length - 1;
				},
				rawUpdateDom: function(removes, inserts) {
					var e, i, it, j, len, len1;
					for (i = 0, len = removes.length; i < len; i++) {
						e = removes[i];
						f$.remove(e);
					}
					for (j = 0, len1 = inserts.length; j < len1; j++) {
						it = inserts[j];
						f$.after(it.after, it.element);
					}
				},
				buildUpdateDom: function() {
					return self.updateDom = (function() {
						var _getId, _id, fastBinding, generator, getResultList, index, node_by_id, node_del, node_get, node_set, nodes, skippedAttrs, version;
						nodes = [];
						index = 0;
						fastBinding = null;
						version = 0;
						skippedAttrs = env.skippedAttr();
						if (self.trackExpression === '$index') {
							node_by_id = {};
							node_get = function(item) {
								return node_by_id[index] || null;
							};
							node_del = function(node) {
								if(node.$id != null) delete node_by_id[node.$id];
							};
							node_set = function(item, node) {
								node.$id = index;
								node_by_id[index] = node;
							};
						} else {
							if (self.trackExpression) {
								node_by_id = {};
								_getId = (function() {
									var fn;
									fn = CD.compile(self.trackExpression, {
										input: ['$id', self.nameOfKey]
									});
									return function(a, b) {
										return fn(CD.scope, a, b);
									};
								})();
								_id = function(item) {
									var id;
									id = item.$alite_id;
									if (id) {
										return id;
									}
									id = item.$alite_id = alight.utils.getId();
									return id;
								};
								node_get = function(item) {
									var $id;
									$id = _getId(_id, item);
									if($id != null) return node_by_id[$id];
									return null;
								};
								node_del = function(node) {
									var $id;
									$id = node.$id;
									if($id != null) delete node_by_id[$id];
								};
								node_set = function(item, node) {
									var $id;
									$id = _getId(_id, item);
									node.$id = $id;
									node_by_id[$id] = node;
								};
							} else {
								//==============================
								// simple array with structures
								// item in appData.config.list
								//==============================
								if (window.Map) {
									node_by_id = new Map();
									node_get = function(item) {
										return node_by_id.get(item);
									};
									node_del = function(node) {
										node_by_id["delete"](node.item);
									};
									node_set = function(item, node) {
										node_by_id.set(item, node);
									};
								} else {
									node_by_id = {};
									node_get = function(item) {
										var $id;
										if (typeof item === 'object') {
											$id = item.$alite_id;
											if ($id) {
												return node_by_id[$id];
											}
										} else {
											return node_by_id[item] || null;
										}
										return null;
									};
									node_del = function(node) {
										var $id;
										$id = node.$id;
										if (node_by_id[$id]) {
											node.$id = null;
											delete node_by_id[$id];
										}
									};
									node_set = function(item, node) {
										var $id;
										if (typeof item === 'object') {
											$id = alight.utils.getId();
											item.$alite_id = $id;
											node.$id = $id;
											node_by_id[$id] = node;
										} else {
											node.$id = item;
											node_by_id[item] = node;
										}
									};
								}
							}
						}
						generator = [];
						getResultList = function(input) {
							var size, t;
							t = typeof input;
							if (t === 'object') {
								//==============================
								// simple array with structures
								// item in appData.config.list
								//==============================
								if (input && input.length) {
									return input;
								}
							} else {
								if (t === 'number') {
									size = Math.floor(input);
								} else if (t === 'string') {
									size = Math.floor(input);
									if (isNaN(size)) {
										return [];
									}
								}
								if (size < generator.length) {
									generator.length = size;
								} else {
									while (generator.length < size) {
										generator.push(generator.length);
									}
								}
								return generator;
							}
							return [];
						};
						if (self.element_list) {
							return function(input) {
								var applyList, bel, childCD, dom_inserts, dom_removes, el, elLast, element_list, i, it, item, item_value, j, k, l, last_element, len, len1, len2, len3, len4, len5, len6, len7, list, m, n, next2, node, nodes2, o, p, pid, prev_moved, prev_node, ref, ref1, ref2;
								list = getResultList(input);
								last_element = self.top_element;
								dom_inserts = [];
								nodes2 = [];
								for (i = 0, len = nodes.length; i < len; i++) {
									node = nodes[i];
									node.active = false;
								}
								for (index = j = 0, len1 = list.length; j < len1; index = ++j) {
									item = list[index];
									node = node_get(item);
									if (node) {
										node.active = true;
									}
								}
								dom_removes = [];
								for (k = 0, len2 = nodes.length; k < len2; k++) {
									node = nodes[k];
									if (node.active) {
										continue;
									}
									if (node.prev) {
										node.prev.next = node.next;
									}
									if (node.next) {
										node.next.prev = node.prev;
									}
									node_del(node);
									node.CD.destroy();
									ref = node.element_list;
									for (l = 0, len3 = ref.length; l < len3; l++) {
										el = ref[l];
										dom_removes.push(el);
									}
									node.next = null;
									node.prev = null;
									node.element_list = null;
								}
								applyList = [];
								pid = null;
								prev_node = null;
								prev_moved = false;
								elLast = self.element_list.length - 1;
								for (index = m = 0, len4 = list.length; m < len4; index = ++m) {
									item = list[index];
									item_value = item;
									node = node_get(item);
									if (node) {
										self.updateLocals(node.CD, item, index, list);
										if (node.prev === prev_node) {
											if (prev_moved) {
												ref1 = node.element_list;
												for (n = 0, len5 = ref1.length; n < len5; n++) {
													el = ref1[n];
													dom_inserts.push({
														element: el,
														after: last_element
													});
													last_element = el;
												}
											}
											prev_node = node;
											last_element = node.element_list[elLast];
											node.active = true;
											nodes2.push(node);
											continue;
										}
										node.prev = prev_node;
										if (prev_node) {
											prev_node.next = node;
										}
										ref2 = node.element_list;
										for (o = 0, len6 = ref2.length; o < len6; o++) {
											el = ref2[o];
											dom_inserts.push({
												element: el,
												after: last_element
											});
											last_element = el;
										}
										prev_moved = true;
										prev_node = node;
										node.active = true;
										nodes2.push(node);
										continue;
									}
									childCD = self.makeChild(item_value, index, list);
									element_list = (function() {
										var len7, p, ref3, results;
										ref3 = self.element_list;
										results = [];
										for (p = 0, len7 = ref3.length; p < len7; p++) {
											bel = ref3[p];
											el = bel.cloneNode(true);
											applyList.push({
												cd: childCD,
												el: el
											});
											dom_inserts.push({
												element: el,
												after: last_element
											});
											results.push(last_element = el);
										}
										return results;
									})();
									node = {
										CD: childCD,
										element_list: element_list,
										prev: prev_node,
										next: null,
										active: true,
										item: item
									};
									node_set(item, node);
									if (prev_node) {
										next2 = prev_node.next;
										prev_node.next = node;
										node.next = next2;
										if (next2) {
											next2.prev = node;
									}
									} else if (index === 0 && nodes[0]) {
										next2 = nodes[0];
										node.next = next2;
										next2.prev = node;
									}
									prev_node = node;
									nodes2.push(node);
								}
								nodes = nodes2;
								self.rawUpdateDom(dom_removes, dom_inserts);
								dom_removes.length = 0;
								dom_inserts.length = 0;
								for (p = 0, len7 = applyList.length; p < len7; p++) {
									it = applyList[p];
									alight.bind(it.cd, it.el, {
										skip_attr: skippedAttrs,
										elementCanBeRemoved: env.attrName,
										noDomOptimization: true
									});
								}
							};
						} else {
							return function(input) {
								//console.log(input);
								var applyList, childCD, dom_inserts, dom_removes, fbElement, i, it, item, item_value, j, k, last_element, len, len1, len2, list, next2, node, nodes2, pid, prev_moved, prev_node, r;
								list = getResultList(input);
								last_element = self.top_element;
								version++;
								dom_inserts = [];
								nodes2 = [];
								applyList = [];
								pid = null;
								prev_node = null;
								prev_moved = false;
								for (index = i = 0, len = list.length; i < len; index = ++i) {
									item = list[index];
									item_value = item;
									node = node_get(item);
									if (node) {
										self.updateLocals(node.CD, item, index, list);
										if (node.prev === prev_node) {
											if (prev_moved) {
												dom_inserts.push({
													element: node.element,
													after: prev_node.element
												});
											}
											prev_node = node;
											last_element = node.element;
											node.version = version;
											nodes2.push(node);
											continue;
										}
										node.prev = prev_node;
										if (prev_node) {
											prev_node.next = node;
										}
										dom_inserts.push({
											element: node.element,
											after: last_element
										});
										prev_moved = true;
										last_element = node.element;
										prev_node = node;
										node.version = version;
										nodes2.push(node);
										continue;
									}
									childCD = self.makeChild(item_value, index, list);
									element = self.base_element.cloneNode(true);
									if(fastBinding === null) {
										//==============================
										// simple array with structures
										// item in appData.config.list
										//==============================
										fbElement = self.base_element.cloneNode(true);
										r = alight.bind(childCD, element, {
											skip_attr: skippedAttrs,
											elementCanBeRemoved: env.attrName,
											noDomOptimization: true,
											fbElement: fbElement
										});
										fastBinding = alight.core.fastBinding(r) || false;
										if (fastBinding) {
											self.base_element = fbElement;
										}
									} else {
										applyList.push({
											cd: childCD,
											el: element
										});
									}
									dom_inserts.push({
										element: element,
										after: last_element
									});
									node = {
										CD: childCD,
										element: element,
										prev: prev_node,
										next: null,
										version: version,
										item: item
									};
									last_element = element;
									
									//console.log(item);
									//console.log(node);
									
									node_set(item, node);
									if (prev_node) {
										next2 = prev_node.next;
										prev_node.next = node;
										node.next = next2;
										if (next2) {
											next2.prev = node;
										}
									} else if (index === 0 && nodes[0]) {
										next2 = nodes[0];
										node.next = next2;
										next2.prev = node;
									}
									prev_node = node;
									nodes2.push(node);
								}
								dom_removes = [];
								for (j = 0, len1 = nodes.length; j < len1; j++) {
									node = nodes[j];
									if (node.version === version) {
										continue;
									}
									if (node.prev) {
										node.prev.next = node.next;
									}
									if (node.next) {
										node.next.prev = node.prev;
									}
									node_del(node);
									node.CD.destroy();
									dom_removes.push(node.element);
									node.next = null;
									node.prev = null;
									node.element = null;
								}
								nodes = nodes2;
								self.rawUpdateDom(dom_removes, dom_inserts);
								dom_removes.length = 0;
								dom_inserts.length = 0;
								for (k = 0, len2 = applyList.length; k < len2; k++) {
									it = applyList[k];
									if (fastBinding) {
										fastBinding.bind(it.cd, it.el);
									} else {
										alight.bind(it.cd, it.el, {
											skip_attr: skippedAttrs,
											elementCanBeRemoved: env.attrName,
											noDomOptimization: true
										});
									}
								}
							};
						}
					})(); // updateDom
				}
			};
		}
	};

	alight.d.al.init = function(scope, element, exp, env) {
	  var cd, e, error, fb, fn, input;
	  if (alight.option.removeAttribute) {
		element.removeAttribute(env.attrName);
		if (env.fbElement) {
		  env.fbElement.removeAttribute(env.attrName);
		}
	  }
	  cd = env.changeDetector;
	  input = ['$element'];
	  if (env.attrArgument === 'window') {
		input.push('window');
	  }
	  try {
		fn = cd.compile(exp, {
		  no_return: true,
		  input: input
		});
		env.fastBinding = fb = function(scope, element, exp, env) {
		  return fn(env.changeDetector.locals, element, window);
		};
		fb(scope, element, exp, env);
	  } catch (error) {
		e = error;
		alight.exceptionHandler(e, 'al-init, error in expression: ' + exp, {
		  exp: exp,
		  scope: scope,
		  cd: cd,
		  element: element
		});
		env.fastBinding = function() {};
	  }
	};

	alight.d.al.app = {
	  stopBinding: true
	};

	alight.d.al.stop = {
	  restrict: 'AE',
	  stopBinding: true
	};

	alight.d.al.cloak = function(scope, element, name, env) {
	  element.removeAttribute(env.attrName);
	  if (name) {
		f$.removeClass(element, name);
	  }
	};


	/*
		al-html="model"
		al-html:id=" 'templateId' "
		al-html:id.literal="templateId" // template id without 'quotes'
		al-html:url="model"
		al-html:url.tpl="/templates/{{templateId}}"
	 */
	alight.d.al.html = {
	  restrict: 'AM',
	  priority: 100,
	  modifier: {},
	  link: function(scope, element, inputName, env) {
		var self;
		if (env.elementCanBeRemoved && element.nodeType !== 8) {
		  alight.exceptionHandler(null, env.attrName + " can't control element because of " + env.elementCanBeRemoved, {
			scope: scope,
			element: element,
			value: inputName,
			env: env
		  });
		  return {};
		}
		env.stopBinding = true;
		return self = {
		  baseElement: null,
		  topElement: null,
		  activeElement: null,
		  childCD: null,
		  name: inputName,
		  watchMode: null,
		  start: function() {
			self.parsing();
			self.prepare();
			self.watchModel();
		  },
		  parsing: function() {
			var i, len, modifierName, ref;
			if (env.attrArgument) {
			  ref = env.attrArgument.split('.');
			  for (i = 0, len = ref.length; i < len; i++) {
				modifierName = ref[i];
				if (modifierName === 'literal') {
				  self.watchMode = 'literal';
				  continue;
				}
				if (modifierName === 'tpl') {
				  self.watchMode = 'tpl';
				  continue;
				}
				if (!alight.d.al.html.modifier[modifierName]) {
				  continue;
				}
				alight.d.al.html.modifier[modifierName](self, {
				  scope: scope,
				  element: element,
				  inputName: inputName,
				  env: env
				});
			  }
			}
		  },
		  prepare: function() {
			if (element.nodeType === 8) {
			  self.baseElement = null;
			  self.topElement = element;
			} else {
			  self.baseElement = element;
			  self.topElement = document.createComment(" " + env.attrName + ": " + inputName + " ");
			  f$.before(element, self.topElement);
			  f$.remove(element);
			}
		  },
		  removeBlock: function() {
			var el, i, len, ref;
			if (self.childCD) {
			  self.childCD.destroy();
			  self.childCD = null;
			}
			if (self.activeElement) {
			  if (Array.isArray(self.activeElement)) {
				ref = self.activeElement;
				for (i = 0, len = ref.length; i < len; i++) {
				  el = ref[i];
				  self.removeDom(el);
				}
			  } else {
				self.removeDom(self.activeElement);
			  }
			  self.activeElement = null;
			}
		  },
		  insertBlock: function(html) {
			var current, el, t;
			if (self.baseElement) {
			  self.activeElement = self.baseElement.cloneNode(false);
			  self.activeElement.innerHTML = html;
			  self.insertDom(self.topElement, self.activeElement);
			  self.childCD = env.changeDetector["new"]();
			  alight.bind(self.childCD, self.activeElement, {
				skip_attr: env.skippedAttr(),
				elementCanBeRemoved: env.attrName
			  });
			} else {
			  t = document.createElement('body');
			  t.innerHTML = html;
			  current = self.topElement;
			  self.activeElement = [];
			  self.childCD = env.changeDetector["new"]();
			  while (el = t.firstChild) {
				self.insertDom(current, el);
				current = el;
				self.activeElement.push(el);
				alight.bind(self.childCD, current, {
				  skip_attr: env.skippedAttr(),
				  elementCanBeRemoved: env.attrName
				});
			  }
			}
		  },
		  updateDom: function(html) {
			self.removeBlock();
			if (html) {
			  self.insertBlock(html);
			}
		  },
		  removeDom: function(element) {
			f$.remove(element);
		  },
		  insertDom: function(base, element) {
			f$.after(base, element);
		  },
		  watchModel: function() {
			if (self.watchMode === 'literal') {
			  self.updateDom(self.name);
			} else if (self.watchMode === 'tpl') {
			  env.watchText(self.name, self.updateDom);
			} else {
			  env.watch(self.name, self.updateDom);
			}
		  }
		};
	  }
	};

	alight.d.al.html.modifier.id = function(self) {
	  return self.updateDom = function(id) {
		var html, tpl;
		self.removeBlock();
		tpl = document.getElementById(id);
		if (tpl) {
		  html = tpl.innerHTML;
		  if (html) {
			self.insertBlock(html);
		  }
		}
	  };
	};

	alight.d.al.html.modifier.url = function(self) {
	  self.loadHtml = function(cfg) {
		f$.ajax(cfg);
	  };
	  return self.updateDom = function(url) {
		if (!url) {
		  self.removeBlock();
		  return;
		}
		self.loadHtml({
		  cache: true,
		  url: url,
		  success: function(html) {
			self.removeBlock();
			self.insertBlock(html);
		  },
		  error: self.removeBlock
		});
	  };
	};

	alight.d.al.html.modifier.scope = function(self, option) {
	  var d, innerName, oneTime, outerName;
	  d = self.name.split(':');
	  if (d.length === 2) {
		self.name = d[0];
		outerName = d[1];
	  } else {
		d = self.name.match(/(.+)\:\s*\:\:([\d\w]+)$/);
		if (d) {
		  oneTime = true;
		} else {
		  oneTime = false;
		  d = self.name.match(/(.+)\:\s*([\.\w]+)$/);
		  if (!d) {
			throw 'Wrong expression ' + self.name;
		  }
		}
		self.name = d[1];
		outerName = d[2];
	  }
	  innerName = 'outer';
	  return self.insertBlock = function(html) {
		var childCD, parentCD, w;
		self.activeElement = self.baseElement.cloneNode(false);
		self.activeElement.innerHTML = html;
		self.insertDom(self.topElement, self.activeElement);
		parentCD = option.env.changeDetector;
		childCD = self.childCD = parentCD["new"](null, {
		  locals: true
		});
		childCD.locals[innerName] = null;
		w = parentCD.watch(outerName, function(outerValue) {
		  return childCD.locals[innerName] = outerValue;
		}, {
		  oneTime: oneTime
		});
		self.childCD.watch('$destroy', function() {
		  return w.stop();
		});
		alight.bind(self.childCD, self.activeElement, {
		  skip_attr: option.env.skippedAttr()
		});
	  };
	};

	alight.d.al.html.modifier.inline = function(self, option) {
	  var originalPrepare;
	  originalPrepare = self.prepare;
	  return self.prepare = function() {
		originalPrepare();
		return option.env.setValue(self.name, self.baseElement.innerHTML);
	  };
	};

	alight.d.al.radio = function(scope, element, name, env) {
	  var key, value, watch;
	  key = env.takeAttr('al-value');
	  if (key) {
		value = env["eval"](key);
	  } else {
		value = env.takeAttr('value');
	  }
	  env.on(element, 'change', function() {
		env.setValue(name, value);
		watch.refresh();
		env.scan();
	  });
	  return watch = env.watch(name, function(newValue) {
		element.checked = value === newValue;
		return '$scanNoChanges';
	  });
	};


	/*
		<select al-select="selected">
		  <option al-repeat="item in list" al-option="item">{{item.name}}</option>
		  <optgroup label="Linux">
			  <option al-repeat="linux in list2" al-option="linux">Linux {{linux.codeName}}</option>
		  </optgroup>
		</select>
	 */
	(function() {
	  var Mapper;
	  if (window.Map) {
		Mapper = function() {
		  this.idByItem = new Map;
		  this.itemById = {};
		  this.index = 1;
		  return this;
		};
		Mapper.prototype.acquire = function(item) {
		  var id;
		  id = "i" + (this.index++);
		  this.idByItem.set(item, id);
		  this.itemById[id] = item;
		  return id;
		};
		Mapper.prototype.release = function(id) {
		  var item;
		  item = this.itemById[id];
		  delete this.itemById[id];
		  this.idByItem["delete"](item);
		};
		Mapper.prototype.replace = function(id, item) {
		  var old;
		  old = this.itemById[id];
		  this.idByItem["delete"](old);
		  this.idByItem.set(item, id);
		  this.itemById[id] = item;
		};
		Mapper.prototype.getId = function(item) {
		  return this.idByItem.get(item);
		};
		Mapper.prototype.getItem = function(id) {
		  return this.itemById[id] || null;
		};
	  } else {
		Mapper = function() {
		  this.itemById = {
			'i#null': null
		  };
		  return this;
		};
		Mapper.prototype.acquire = function(item) {
		  var id;
		  if (item === null) {
			return 'i#null';
		  }
		  if (typeof item === 'object') {
			id = item.$alite_id;
			if (!id) {
			  item.$alite_id = id = alight.utils.getId();
			}
		  } else {
			id = '' + item;
		  }
		  this.itemById[id] = item;
		  return id;
		};
		Mapper.prototype.release = function(id) {
		  delete this.itemById[id];
		};
		Mapper.prototype.replace = function(id, item) {
		  this.itemById[id] = item;
		};
		Mapper.prototype.getId = function(item) {
		  if (item === null) {
			return 'i#null';
		  }
		  if (typeof item === 'object') {
			return item.$alite_id;
		  } else {
			return '' + item;
		  }
		};
		Mapper.prototype.getItem = function(id) {
		  return this.itemById[id] || null;
		};
	  }
	  alight.d.al.select = function(scope, element, key, env) {
		var cd, lastValue, mapper, onChangeDOM, setValueOfElement, watch;
		cd = env.changeDetector["new"]();
		env.stopBinding = true;
		cd.$select = {
		  mapper: mapper = new Mapper
		};
		lastValue = null;
		cd.$select.change = function() {
		  return alight.nextTick(function() {
			return setValueOfElement(lastValue);
		  });
		};
		setValueOfElement = function(value) {
		  var id;
		  id = mapper.getId(value);
		  if (id) {
			return element.value = id;
		  } else {
			return element.selectedIndex = -1;
		  }
		};
		watch = cd.watch(key, function(value) {
		  lastValue = value;
		  return setValueOfElement(value);
		});
		onChangeDOM = function(event) {
		  lastValue = mapper.getItem(event.target.value);
		  cd.setValue(key, lastValue);
		  watch.refresh();
		  return cd.scan();
		};
		env.on(element, 'input', onChangeDOM);
		env.on(element, 'change', onChangeDOM);
		return alight.bind(cd, element, {
		  skip_attr: env.skippedAttr()
		});
	  };
	  return alight.d.al.option = function(scope, element, key, env) {
		var cd, i, id, j, mapper, select, step;
		cd = step = env.changeDetector;
		for (i = j = 0; j <= 4; i = ++j) {
		  select = step.$select;
		  if (select) {
			break;
		  }
		  step = step.parent || {};
		}
		if (!select) {
		  alight.exceptionHandler('', 'Error in al-option - al-select is not found', {
			cd: cd,
			scope: cd.scope,
			element: element,
			value: key
		  });
		  return;
		}
		mapper = select.mapper;
		id = null;
		cd.watch(key, function(item) {
		  if (id) {
			if (mapper.getId(item) !== id) {
			  mapper.release(id);
			  id = mapper.acquire(item);
			  element.value = id;
			  select.change();
			} else {
			  mapper.replace(id, item);
			}
		  } else {
			id = mapper.acquire(item);
			element.value = id;
			select.change();
		  }
		});
		cd.watch('$destroy', function() {
		  mapper.release(id);
		  return select.change();
		});
	  };
	})();

	(function() {
	  var props;
	  alight.hooks.attribute.unshift({
		code: 'attribute',
		fn: function() {
		  var d, value;
		  d = this.attrName.match(/^\:([\w\.\-]+)$/);
		  if (!d) {
			return;
		  }
		  value = d[1];
		  if (value.split('.')[0] === 'html') {
			this.name = 'html';
			value = value.substring(5);
		  } else {
			this.name = 'attr';
		  }
		  this.ns = 'al';
		  this.attrArgument = value;
		}
	  });
	  props = {
		checked: 'checked',
		readonly: 'readOnly',
		value: 'value',
		selected: 'selected',
		muted: 'muted',
		disabled: 'disabled',
		hidden: 'hidden'
	  };
	  return alight.d.al.attr = function(scope, element, key, env) {
		var args, attrName, d, fn, isTemplate, list, prop, setter, styleName, watch;
		if (!env.attrArgument) {
		  return;
		}
		d = env.attrArgument.split('.');
		attrName = d[0];
		prop = props[attrName];
		isTemplate = d.indexOf('tpl') > 0;
		if (alight.option.removeAttribute) {
		  element.removeAttribute(env.attrName);
		  if (env.fbElement) {
			env.fbElement.removeAttribute(env.attrName);
		  }
		}
		args = {
		  readOnly: true
		};
		setter = null;
		if (attrName === 'style') {
		  if (!d[1]) {
			throw 'Style is not declared';
		  }
		  styleName = d[1].replace(/(-\w)/g, function(m) {
			return m.substring(1).toUpperCase();
		  });
		  setter = function(element, value) {
			if (value == null) {
			  value = '';
			}
			return element.style[styleName] = value;
		  };
		} else if (attrName === 'class' && d.length > 1) {
		  isTemplate = false;
		  list = d.slice(1);
		  setter = function(element, value) {
			var c, i, j, len, len1;
			if (value) {
			  for (i = 0, len = list.length; i < len; i++) {
				c = list[i];
				f$.addClass(element, c);
			  }
			} else {
			  for (j = 0, len1 = list.length; j < len1; j++) {
				c = list[j];
				f$.removeClass(element, c);
			  }
			}
		  };
		} else if (attrName === 'focus') {
		  setter = function(element, value) {
			if (value) {
			  return element.focus();
			} else {
			  return element.blur();
			}
		  };
		} else {
		  if (prop) {
			setter = function(element, value) {
			  if (value === void 0) {
				value = null;
			  }
			  if (element[prop] !== value) {
				return element[prop] = value;
			  }
			};
		  } else {
			args.element = element;
			args.elementAttr = attrName;
		  }
		}
		watch = isTemplate ? 'watchText' : 'watch';
		if (setter) {
		  fn = function(scope, element, _, env) {
			return env.changeDetector[watch](key, function(value) {
			  return setter(element, value);
			}, args);
		  };
		} else {
		  fn = function(scope, element, _, env) {
			return env.changeDetector[watch](key, null, {
			  readOnly: true,
			  element: element,
			  elementAttr: attrName
			});
		  };
		}
		fn(scope, element, key, env);
		env.fastBinding = fn;
	  };
	})();

	alight.d.al.model = function(scope, element, value, env) {
	  var name;
	  name = element.nodeName.toLowerCase();
	  if (name === 'select') {
		return alight.d.al.select.call(this, scope, element, value, env);
	  }
	  if (name === 'input') {
		if (element.type === 'checkbox') {
		  return alight.d.al.checked.call(this, scope, element, value, env);
		}
		if (element.type === 'radio') {
		  return alight.d.al.radio.call(this, scope, element, value, env);
		}
	  }
	  return alight.d.al.value.call(this, scope, element, value, env);
	};

	alight.filters.slice = function(value, a, b) {
	  if (!value) {
		return null;
	  }
	  if (b) {
		return value.slice(a, b);
	  } else {
		return value.slice(a);
	  }
	};

	(function() {
	  var d2;
	  d2 = function(x) {
		if (x < 10) {
		  return '0' + x;
		}
		return '' + x;
	  };
	  return alight.filters.date = function(value, format) {
		var d, i, len, r, x;
		if (!value) {
		  return '';
		}
		value = new Date(value);
		x = [[/yyyy/g, value.getFullYear()], [/mm/g, d2(value.getMonth() + 1)], [/dd/g, d2(value.getDate())], [/HH/g, d2(value.getHours())], [/MM/g, d2(value.getMinutes())], [/SS/g, d2(value.getSeconds())]];
		r = format;
		for (i = 0, len = x.length; i < len; i++) {
		  d = x[i];
		  r = r.replace(d[0], d[1]);
		}
		return r;
	  };
	})();

	alight.filters.json = {
	  watchMode: 'deep',
	  fn: function(value) {
		return JSON.stringify(alight.utils.clone(value), null, 4);
	  }
	};

	alight.filters.filter = function(input, _a, _b) {
	  var d, i, j, k, key, len, len1, result, s, svalue, v, value;
	  if (arguments.length === 2) {
		key = null;
		value = _a;
	  } else if (arguments.length === 3) {
		key = _a;
		value = _b;
	  } else {
		return input;
	  }
	  if (!input || (value == null) || value === '') {
		return input;
	  }
	  result = [];
	  svalue = ('' + value).toLowerCase();
	  if (key) {
		for (i = 0, len = input.length; i < len; i++) {
		  d = input[i];
		  if (d[key] === value) {
			result.push(d);
		  } else {
			s = ('' + d[key]).toLowerCase();
			if (s.indexOf(svalue) >= 0) {
			  result.push(d);
			}
		  }
		}
	  } else {
		for (j = 0, len1 = input.length; j < len1; j++) {
		  d = input[j];
		  for (k in d) {
			v = d[k];
			if (v === value) {
			  result.push(d);
			} else {
			  s = ('' + v).toLowerCase();
			  if (s.indexOf(svalue) >= 0) {
				result.push(d);
			  }
			}
		  }
		}
	  }
	  return result;
	};

	alight.filters.orderBy = function(value, key, reverse) {
	  if (!value instanceof Array) {
		return null;
	  }
	  if (reverse) {
		reverse = 1;
	  } else {
		reverse = -1;
	  }
	  return value.sort(function(a, b) {
		if (a[key] < b[key]) {
		  return -reverse;
		}
		if (a[key] > b[key]) {
		  return reverse;
		}
		return 0;
	  });
	};

	alight.filters.throttle = {
	  init: function(scope, delay, env) {
		var to;
		delay = Number(delay);
		to = null;
		return {
		  onChange: function(value) {
			if (to) {
			  clearTimeout(to);
			}
			return to = setTimeout(function() {
			  to = null;
			  env.setValue(value);
			  return env.changeDetector.scan();
			}, delay);
		  }
		};
	  }
	};

	alight.filters.toArray = {
	  init: function(scope, exp, env) {
		var keyName, result, valueName;
		if (env.conf.args.length === 2) {
		  keyName = env.conf.args[0];
		  valueName = env.conf.args[1];
		} else {
		  keyName = 'key';
		  valueName = 'value';
		}
		result = [];
		return {
		  watchMode: 'deep',
		  onChange: function(obj) {
			var d, key, value;
			result.length = 0;
			for (key in obj) {
			  value = obj[key];
			  d = {};
			  d[keyName] = key;
			  d[valueName] = value;
			  result.push(d);
			}
			return env.setValue(result);
		  }
		};
	  }
	};

	alight.filters.storeTo = {
	  init: function(scope, key, env) {
		return {
		  onChange: function(value) {
			env.changeDetector.setValue(key, value);
			return env.setValue(value);
		  }
		};
	  }
	};

	alight.text['='] = function(callback, expression, scope, env) {
	  var ce;
	  ce = alight.utils.compile.expression(expression);
	  if (ce.filters) {
		throw 'Conflict: bindonce and filters, use one-time binding';
	  }
	  env["finally"](ce.fn(env.changeDetector.locals));
	};

	alight.text['::'] = function(callback, expression, scope, env) {
	  env.changeDetector.watch(expression, function(value) {
		return env["finally"](value);
	  }, {
		oneTime: true
	  });
	};

	(function () {
		/*
		
		alight.component('rating', (scope, element, env) => {
		  return {
			template,
			templateId,
			templateUrl,
			props,
			onStart,
			onDestroy,
			api
		  };
		})
		
		<rating :rating="rating" :max="max" @change="rating=$event.value"></rating>
		
		*/
		var f$ = alight.f$;
		function toCamelCase(name) {
			return name.replace(/(-\w)/g, function (m) {
				return m.substring(1).toUpperCase();
			});
		}
		;
		function makeWatch(_a) {
			var listener = _a.listener, childCD = _a.childCD, name = _a.name, parentName = _a.parentName, parentCD = _a.parentCD;
			var fn;
			var watchOption = {};
			name = toCamelCase(name);
			if (listener && listener !== true) {
				if (f$.isFunction(listener)) {
					fn = listener;
				}
				else {
					fn = listener.onChange;
					if (listener === 'copy' || listener.watchMode === 'copy') {
						if (fn)
							fn(parentName);
						else
							childCD.scope[name] = parentName;
						return;
					}
					if (listener === 'array' || listener.watchMode === 'array')
						watchOption.isArray = true;
					if (listener === 'deep' || listener.watchMode === 'deep')
						watchOption.deep = true;
				}
			}
			if (!fn) {
				fn = function (value) {
					childCD.scope[name] = value;
					childCD.scan();
				};
			}
			parentCD.watch(parentName, fn, watchOption);
		}
		;
		alight.component = function (attrName, constructor) {
			var parts = attrName.match(/^(\w+)[\-](.+)$/);
			var ns, name;
			if (parts) {
				ns = parts[1];
				name = parts[2];
			}
			else {
				ns = '$global';
				name = attrName;
			}
			name = toCamelCase(name);
			if (!alight.d[ns])
				alight.d[ns] = {};
			alight.d[ns][name] = {
				restrict: 'E',
				stopBinding: true,
				priority: alight.priority.$component,
				init: function (_parentScope, element, _value, parentEnv) {
					var scope = {
						$sendEvent: function (eventName, value) {
							var event = new CustomEvent(eventName);
							event.value = value;
							event.component = true;
							element.dispatchEvent(event);
						}
					};
					var parentCD = parentEnv.changeDetector.new();
					var childCD = alight.ChangeDetector(scope);
					var env = new Env({
						element: element,
						attributes: parentEnv.attributes,
						changeDetector: childCD,
						parentChangeDetector: parentCD
					});
					try {
						var option = constructor.call(childCD, scope, element, env) || {};
					}
					catch (e) {
						alight.exceptionHandler(e, 'Error in component <' + attrName + '>: ', {
							element: element,
							scope: scope,
							cd: childCD
						});
						return;
					}
					if (option.onStart) {
						childCD.watch('$finishBinding', function () {
							option.onStart();
							childCD.scan();
						});
					}
					// bind props
					var parentDestroyed = false;
					parentCD.watch('$destroy', function () {
						parentDestroyed = true;
						childCD.destroy();
					});
					childCD.watch('$destroy', function () {
						if (option.onDestroy)
							option.onDestroy();
						if (!parentDestroyed)
							parentCD.destroy(); // child of parentCD
					});
					// api
					for (var _i = 0, _a = element.attributes; _i < _a.length; _i++) {
						var attr = _a[_i];
						if (attr.name[0] !== '#')
							continue;
						var name_1 = attr.name.slice(1);
						if (!name_1)
							continue;
						if (option.api)
							parentCD.setValue(name_1, option.api);
						else
							parentCD.setValue(name_1, scope);
						break;
					}
					function watchProp(key, listener) {
						var name = ':' + key;
						var value = env.takeAttr(name);
						if (!value) {
							value = env.takeAttr(key);
							if (!value)
								return;
							listener = 'copy';
						}
						makeWatch({ childCD: childCD, listener: listener, name: key, parentName: value, parentCD: parentCD });
					}
					// option props
					if (option.props) {
						if (Array.isArray(option.props))
							for (var _b = 0, _c = option.props; _b < _c.length; _b++) {
								var key = _c[_b];
								watchProp(key, true);
							}
						else
							for (var key in option.props)
								watchProp(key, option.props[key]);
					}
					else {
						// auto props
						for (var _d = 0, _e = element.attributes; _d < _e.length; _d++) {
							var attr = _e[_d];
							var propName = attr.name;
							var propValue = attr.value;
							if (!propValue)
								continue;
							var parts_1 = propName.match(/^\:(.*)$/);
							if (!parts_1)
								continue;
							makeWatch({ childCD: childCD, name: parts_1[1], parentName: propValue, parentCD: parentCD });
						}
					}
					var scanned = false;
					parentCD.watch('$onScanOnce', function () { return scanned = true; });
					// template
					if (option.template)
						element.innerHTML = option.template;
					if (option.templateId) {
						var templateElement = document.getElementById(option.templateId);
						if (!templateElement)
							throw 'No template ' + option.templateId;
						element.innerHTML = templateElement.innerHTML;
					}
					if (option.templateUrl) {
						f$.ajax({
							url: option.templateUrl,
							cache: true,
							success: function (template) {
								element.innerHTML = template;
								binding(true);
							},
							error: function () {
								console.error('Template is not loaded', option.templateUrl);
							}
						});
					}
					else {
						binding();
					}
					function binding(async) {
						if (!scanned)
							parentCD.digest();
						alight.bind(childCD, element, { skip: true });
					}
				}
			};
		};
	})();
	
			/* prev prefix.js */
			return alight;
		}; // finish of buildAlight
		
		var alight = buildAlight();
		alight.makeInstance = buildAlight;
		
		if(typeof(alightInitCallback) === 'function') {
			alightInitCallback(alight)
		} else if(typeof(define) === 'function') {  // requrejs/commonjs
			define(function() {
				return alight;
			});
		} else if(typeof(module) === 'object' && typeof(module.exports) === 'object') {
			module.exports = alight
		} else {
			alight.option.globalController = true;  // global controllers
			window.alight = alight;
			alight.f$.ready(alight.bootstrap);
		};
	})();
})(jQuery);