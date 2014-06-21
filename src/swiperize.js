(function($){

    /**
     * Detect supports
     */
    $.extend($.support, {
        touchEvents: "ontouchstart" in document,
        msPointerEvents: window.navigator.msPointerEnabled
    });

    /**
     * Swiperizer
     * -----------------------------
     * @class Swiperize an element
     * @param {HTML*Element} el
     * @param {Object} options
     */
    var Swiperizer = function(el, options){
        this._construct.apply(this, arguments);
    };

    (function(){
        var api = Swiperizer.prototype, u;

        /**
         * Defaults for options:
         * - {String} event* ... Event name
         * - {Number} threshold ... Threshold to be judged as swiping
         * - {Boolean} preventDefault ... Call e.preventDefault or not
         */
        api.defaults = {
            eventRight: "swiperight",
            eventLeft: "swipeleft",
            eventUp: "swipeup",
            eventDown: "swipedown",

            eventMoveRight: "swipemoveright",
            eventMoveLeft: "swipemoveleft",
            eventMoveUp: "swipemoveup",
            eventMoveDown: "swipemovedown",

            threshold: 50,
            mouse: false,
            preventDefault: true
        };

        api.eventDefaults = {
            touch: {
                start: "touchstart",
                end: "touchend",
                move: "touchmove"
            },
            mspointer: {
                start: "MSPointerDown",
                end: "MSPointerUp",
                move: "MSPointerMove"
            },
            mouse: {
                start: "mousedown",
                end: "mouseup",
            move: "mousemove"
            }
        };

        api.el = null;
        api.$el = null;
        api.options = null;
        api.events = null;
        api.position = null;
        api.swiping = false;

        /**
         * Constructor
         * @constructor
         * @param {HTML*Element} el
         * @param {Object} options
         */
        api._construct = function(el, options){
            var my = this;

            // Set elements
            this.el = el;
            this.$el = $(el);

            // Configure
            this.config(this.defaults).config(options);

            // Bind handlers to the instance
            $.each(["onStart", "onEnd", "onMove"], function(i, name){
                my[name] = $.proxy(my[name], my);
            });

            this.initEvents();
        };

        /**
         * Configure options
         * @param {Object} options
         */
        api.config = function(options){
            this.options = $.extend(true, {}, this.options, options);
            return this;
        };

        /**
         * Get event names by the environment
         * @returns {Object}
         */
        api.getEventNames = function(){
            var name = $.support.touchEvents ? "touch"
            : $.support.msPointerEvents ? "mspointer"
            : this.options.mouse ? "mouse"
            : null;
            if(name){
                return this.eventDefaults[name];
            }
            return null;
        };

        /**
         * Initialize events
         * @param {Boolean} set ... Initialize or destroy
         */
        api.initEvents = function(set){
            var my, events;

            set = (set === void 0) ? true : false;
            my = this;
            if(! (events = this.getEventNames())){ return; }
            $.each(events, function(key, value){
                my.$el[set ? "on" : "off"](value, my["on" + u.capitalize(key)]);
            });
        };

        /**
         * Set or get position at start
         * @param {Number} x
         * @param {Number} y
         */
        api.pos = function(x, y){
            if(! arguments.length){
                return this.position ? this.position : null;
            }
            this.position = {x: x, y:y};
        };

        /**
         * Get diffs from the point started
         * @param {Number} x
         * @param {Number} y
         * @param {Boolean} force ... Ignore threshold or not
         */
        api.diff = function(x, y, force){
            var pos, o;

            pos = this.pos() || {x: 0, y:0};
            o = {
                x: x - pos.x,
                y: y - pos.y,
                ax: Math.abs(x - pos.x),
                ay: Math.abs(y - pos.y)
            };
            // Compare to threshold
            if(Math.max(o.ax, o.ay) < this.options.threshold && ! force){
                return null;
            }
            // Get direction
            if(o.ax > o.ay){
                o.dir = o.x > 0 ? "right" : "left";
            } else {
                o.dir = o.y > 0 ? "down" : "up";
            }
            return o;
        };

        /**
         * Handler for starting
         * @param {Event} e
         */
        api.onStart = function(e){
            var pos = this.getPosition(e);
            this.pos(pos.x, pos.y);
            this.options.preventDefault && e.preventDefault();
            this.swiping = true;
        };

        /**
         * Handler for ending
         * @param {Event} e
         */
        api.onEnd = function(e){
            var pos, diff;

            pos = this.getPosition(e);
            diff = this.diff(pos.x, pos.y);
            if(diff){
                this.$el.trigger(this.options["event" + u.capitalize(diff.dir)]);
            }
            this.swiping = false;
        };

        /**
         * Handler for moving
         * @param {Event} e
         */
        api.onMove = function(e){
            var pos, diff;

            if(! this.swiping){ return; }
            pos = this.getPosition(e);
            diff = this.diff(pos.x, pos.y, true);
            this.$el.trigger(this.options["eventMove" + u.capitalize(diff.dir)], diff);
        };

        /**
         * Get touched position by event object
         * @param {Event} e
         * @returns {Object}
         */
        api.getPosition = function(e){
            var o;

            switch(true){
                case /^mouse/.test(e.type):
                case /^ms/.test(e.type):
                    o = e.originalEvent;
                    return {x: o.pageX, y: o.pageY};
                case /^touch/.test(e.type):
                    o = e.originalEvent.changedTouches[0];
                    return {x: o.pageX, y: o.pageY};
                default: break;
            }
        };

        /**
         * Destructor
         */
        api.destroy = function(){
            this.initEvents(false);
        };

        /**
         * Utilities
         */
        u = {

            /**
             * Capitalize string
             * @param {String} str
             */
            capitalize: function(str){
                return str.replace(/^[a-z]/, function(s){
                    return s.toUpperCase();
                });
            }
        };

    }());

    /**
     * Exports
     */
    $.extend($, {

        // Class
        Swiperizer: Swiperizer,

        // Key for data
        swiperizerDataKey: "swiperizerInstance",

        /**
         * Get swipe event names as array
         * @returns {Array}
         */
        getSwipeEvents: function(){
            var events = [];
            $.each(this.Swiperizer.prototype.defaults, function(key, value){
                if(/^event/.test(key)){
                    events.push(value);
                }
            });
            return events;
        }
        
    });

    $.fn.extend({

        /**
         * Initialize swipe events
         * @param {Object} options
         */
        swiperize: function(options){
            var key = $.swiperizerDataKey;
            this.each(function(){
                var node = $(this);
                if(node.data(key)){
                    return;
                }
                node.data(key, new $.Swiperizer(this, options));
            });
            return this;
        },

        /**
         * Destruct swipe events
         */
        unswiperize: function(){
            var key = $.swiperizerDataKey;
            this.each(function(){
                var node, ist;
                node = $(this);
                ist = node.data(key);
                if(ist instanceof $.Swiperizer){
                    ist.destroy();
                    node.data(key, void 0);
                }
            });
            return this;
        }

    });

}(jQuery));