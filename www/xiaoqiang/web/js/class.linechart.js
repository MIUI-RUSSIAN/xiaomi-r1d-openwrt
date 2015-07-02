(function(){

    function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
        var l1 = (p2x - p1x) / 2,
            l2 = (p3x - p2x) / 2,
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));

        a = p1y < p2y ? Math.PI - a : a;
        b = p3y < p2y ? Math.PI - b : b;

        var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
            dx1 = l1 * Math.sin(alpha + a),
            dy1 = l1 * Math.cos(alpha + a),
            dx2 = l2 * Math.sin(alpha + b),
            dy2 = l2 * Math.cos(alpha + b);

        return {
            x1: p2x - dx1,
            y1: p2y + dy1,
            x2: p2x + dx2,
            y2: p2y + dy2
        };
    };
    function Linechart (options) {
        var options = $.extend({
            container: null,
            width: 500,
            height: 200,
            maxYval: 10,
            maxYnum: 5,
            lineColor: ["#33cc33"],
            dotColor: ["#33cc33"],
            areaColor: ["rgba(53,204,53,0.4)"]
        }, options);
        this.init(options);
    }
    Linechart.prototype = {
        init: function(options){
            this.container = options.container;
            this.$container = $(this.container);
            this.maxYval = options.maxYval;
            this.maxYnum = options.maxYnum;
            this.width = options.width;
            this.height = options.height;
            this.lineColor = options.lineColor;
            this.areaColor = options.areaColor;
            this.dotColor = options.dotColor;
            this.labelUnit = options.labelUnit;
            try {
                this.svgPaper = Raphael(this.container, this.width, this.height);
            } catch(err) {
                console.log(err);
            }
            this.drawLabel();
            this.drawGrid();
        },
        drawGrid: function () {
            var r = this.svgPaper,
                maxYnum = this.maxYnum,
                maxYval = this.maxYval,
                perHeight = this.height / maxYnum,
                width = this.width,
                gridY = r.set();
            for (var i = 0; i < maxYnum; i++) {
                var posMY = perHeight * i,
                    posLY = width;
                gridY.push( r.path('M0 '+ posMY + 'L' + posLY + ' ' + posMY + 'Z' ) );
            }
            gridY.attr({'stroke': '#d9d9d9', 'stroke-dasharray': '. '});
        },
        drawLabel: function(){
            var r = this.svgPaper,
                maxYnum = this.maxYnum,
                maxYval = parseInt( this.maxYval ),
                perYval = parseInt( maxYval / maxYnum ),
                perHeight = this.height / maxYnum,
                labelUnit = this.labelUnit,
                labelY = r.set();
            for (var i = 0; i < maxYnum; i++) {
                var text = (maxYval - perYval * i) + labelUnit;
                labelY.push( r.text(1, i * perHeight + 10 , text) );
            }
            labelY.attr({'font-size': 12, 'fill': '#999999', 'text-anchor': 'start'});
        },
        drawLine: function(data, index){

            var r = this.svgPaper,
                isvml = Raphael.vml,
                index = index || 0,
                line_color = this.lineColor[index],
                dot_color = this.dotColor[index],
                area_color = this.areaColor[index],
                height = this.height,
                width = this.width,
                maxYnum = this.maxYnum,
                X = width / (data.length - 1),
                Y = height / this.maxYval,
                path = r.path().attr({stroke: line_color, "stroke-width": 2, "stroke-linejoin": "round"}),
                bgp = r.path().attr({stroke: "none", opacity: .5, fill: area_color}),
                blanket = r.set(),
                dot = r.set();
            var p, bgpp;
            for (var i = 0, ii = data.length; i < ii; i++) {
                data[i] = data[i] > this.maxYval ? this.maxYval : data[i];
                var y = Math.round(height - Y * data[i]),
                    x = Math.round( X * i );
                if (!i) {
                    p = ["M", x, y, "C", x, y];
                    bgpp = ["M", X * i , height , "L", x, y, "C", x, y];
                }
                if (i && i < ii - 1) {
                    var Y0 = Math.round(height - Y * data[i - 1]),
                        X0 = Math.round( X * (i - 1) ),
                        Y2 = Math.round(height - Y * data[i + 1]),
                        X2 = Math.round( X * (i + 1) );
                    // var a = getAnchors(X0, Y0, x, y, X2, Y2);
                    var a = {x1: X0, y1: Y0, x2: X2, y2: Y2};
                    p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
                    bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
                }
            }
            p = p.concat([x, y, x, y]);
            path.attr({path: p});

            bgpp = bgpp.concat([x, y, x, y, "L", x, height, "z"]);
            bgp.attr({path: bgpp})

            path.toFront();
            bgp.toFront();
        },
        resize: function(){
            this.width = this.container.width();
            this.height = this.container.height();
            this.svg.html('');
            this.svgPaper = Raphael(this.svg[0], this.width, this.height);
            return this;
        },
        update: function(data){
            this.svgPaper.clear();
            this.drawGrid();
            this.drawLabel();
            this.drawLine(data);
        },
        updateMutil: function(){
            this.svgPaper.clear();
            this.drawGrid();
            this.drawLabel();
            for (var i = 0; i < arguments.length; i++) {
                var data = arguments[i];
                this.drawLine(data, i);
            }
        }
    };

    window.Linechart = Linechart;

    // Closure
    (function(){

        /**
         * Decimal adjustment of a number.
         *
         * @param   {String}    type    The type of adjustment.
         * @param   {Number}    value   The number.
         * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number}            The adjusted value.
         */
        function decimalAdjust(type, value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // If the value is not a number or the exp is not an integer...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        // Decimal round
        if (!Math.round10) {
            Math.round10 = function(value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        // Decimal floor
        if (!Math.floor10) {
            Math.floor10 = function(value, exp) {
                return decimalAdjust('floor', value, exp);
            };
        }
        // Decimal ceil
        if (!Math.ceil10) {
            Math.ceil10 = function(value, exp) {
                return decimalAdjust('ceil', value, exp);
            };
        }

    })();
}());