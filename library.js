var LCIM = (function () {
	/** 
	 * [-Linear Culling and Interpolation Mapping library-]
	 * 
	 * > Created by Commandrew
	 * > Build: alpha-0.2.9
   *
	**/
	var __object = function () {
		this.configured = false;
		this.config = {};
	};
	__object.prototype = {
		config_check : function () {
			if (!this.configured) {
				throw {
					message : "Please configure COORD with method 'init()'"
				};
			}
		},
		init : function (config) {
			var keys = Object.keys(config),          // Get config keys
			req_keys = ["width", "height", "size"],  // Required keys for config
			fail = false;                            // Fail switching variable
			// Loop over keys
			for (var i = 0; i < req_keys.length; i++) {
				// Includes all keys?
				if (keys.includes(req_keys[i])) {
					// Next key
					continue;
				} else {
					// Fail switch on
					fail = true;
					// Exit loop
					break;
				}
			}
			// Fails?
			if (fail) {
				// Log error
				console.log("Config example:\n\n{\n\twidth : [dimensionsX],\n\theight : [dimensionsY],\n\tsize : [tileSize]\n}");
				// Throw error
				throw {
					message: "Map config object invalid."
				};
			} else {
				// Adopt config
				this.config = config;
				// Is configured
				this.configured = true;
			}
		},
		load : function (startX, startY, endX, endY, iter, ctx) {
			ctx = ctx || {};
			var __width = this.config.width,                           // Cached selection width
			__size = this.config.size,                                 // Cached tile size
			startIndex = this.coordsToIndex(startX, startY),                  // Index of start tile
			endIndex = this.coordsToIndex(endX - 1, endY - 1) + 1,            // Index of end tile
			cutWidth = this.coordsToIndex(endX - 1, startY) - startIndex + 1; // Width in tiles of selection width
			// Loop over indices
			for (var i = startIndex; i < endIndex; i++) {
				// Iteration function (passed in)
				iter(i, this, ctx);
				// Check if the current iteration passes the threshold on the far right of the selection
				if (~~(i % __width) * __size > endX - __size - 1) {
					// Jump the selection down
					i += __width - cutWidth;
				}
			}
		},
		coordsToIndex : function (x, y) {
			var __width = this.config.width, 
			__height = this.config.height, 
			__size = this.config.size, 
			__x = ~~(x / __size), 
			__y = ~~(y / __size), 
			__index = (__x % __width) + (__y * __width);
			return (__index < 0 || __index > (__width * __height)) ? undefined : __index;
		},
		indexToCoords : function (i, checkOverflow) {
			var __width = this.config.width,
			 __height = this.config.height, 
			 __size = this.config.size, 
			 __x = ~~(i % __width) * __size, 
			 __y = ~~(i / __width) * __size;
			if (checkOverflow) {
				return (Math.abs(__x) === __x && __x < (__width * __height) * __size & Math.abs(__y) === __y && __y < (__width * __height) * __size) ? {
					x : __x, 
					y : __y
				} : {
					x : -Infinity, 
					y : -Infinity
				};
			} else {
				return {
					x : __x, 
					y : __y
				};
			}
		},
		findIndex : function (i, direction) {
			switch (direction) {
				case "LEFT":
					// Index of tile to LEFT
					return (i % this.config.width > 0 ? i - 1 : undefined);
				case "RIGHT":
					// Index of tile to RIGHT
					return (i % this.config.width < this.config.width - 1 ? i + 1 : undefined);
				case "UP":
					// Index of tile above
					return (i - this.config.width >= 0 ? i - this.config.width : undefined);
				case "DOWN":
					// Index of tile below
					return (i + this.config.width < this.config.width * this.config.height ? i + this.config.width : undefined);
			}
		},
		radialIndices : function (r, i) {
			var __width = this.config.width,
			__size = this.config.size,
			__indices = [], 
			indexRadius = ~~(r / __size), 
			pys = i - (indexRadius * __width), pye = i + (indexRadius * __width), n = this.indexToCoords(i);
			for (var py = pys; py <= pye; py += __width) {
				for (var px = -indexRadius; px <= indexRadius; px++) {
					var q = this.indexToCoords(px + py), 
					d = this.__dist(q.x + (__size / 2), q.y + (__size / 2), n.x + (__size / 2), n.y + (__size / 2));
					if (d <= r) {
						__indices.push({
							index : (px + py), 
							dist : d
						});
					}
				}
			}
			return __indices;
		},
		__dist : function (x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		}
	}
	return __object;
})();
