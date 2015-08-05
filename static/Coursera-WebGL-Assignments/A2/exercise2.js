"use strict";

window.onload = function() {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });
    $(function(){
        $('.colorpicker-component').colorpicker();
    });

    var canvas = $("#gl-canvas");
    var canvasDOM = canvas[0];
    var dataModel = new DataModel();
    var dataStatistics = new DataStatistics();
    var renderer = new Renderer(canvasDOM);
    var render = function() { renderer.render(dataModel, dataStatistics); };
    var getMouseCoordinatesFromEvent = function(e) {
        var b = canvasDOM.getBoundingClientRect();
        var x = e.clientX - b.left;
        var y = e.clientY - b.top;
        return new Point(new Vector(2 * x / canvasDOM.width - 1, 1 - 2 * y / canvasDOM.height));
    };

    $(".data-model-container input").on("change", function() {
        dataModel.loadFromGui();
    });
    $(".colorpicker-component").on("changeColor.colorpicker", function() {
        dataModel.loadFromGui();
    });
    $("#button-mesh-clear-drawing").on("click", function() {
        dataModel.setDrawing(new Drawing());
    });
    $("#button-mesh-delete-last-curve").on("click", function() {
        if(dataModel.drawing.theDrawing.linearSplines.length) {
            --dataModel.drawing.theDrawing.linearSplines.length;
            dataModel.events.emit("change");
        }
    });
    //canvas.on("click", function(e) {
    //    dataModel.drawing.theDrawing.linearSplines[0] = dataModel.drawing.theDrawing.linearSplines[0] || new LinearSpline();
    //    dataModel.drawing.theDrawing.linearSplines[0].vertices.push(new CurveVertex(getMouseCoordinatesFromEvent(e), [1, 0, 0, 1], dataModel.options.lineWidth/512));
    //    render();
    //});
    var additionMode = false;
    var timestamps = [];
    canvas.on("mousedown", function() {
        additionMode = true;
        timestamps = [];
        dataModel.drawing.theDrawing.linearSplines.push(new LinearSpline());
    });
    canvas.on("mouseup", function() {
        additionMode = false;
    });
    var previousMouseMoveInfo = {
        time: 0,
        clientX: 0,
        clientY: 0
    };
    function shouldDropMouseMoveEvent(e) {
        var now = new Date();
        var timeDelta = now - previousMouseMoveInfo.time;
        var posDelta = new Vector(e.clientX, e.clientY).subtract(new Vector(previousMouseMoveInfo.clientX, previousMouseMoveInfo.clientY)).getLength();
        if(posDelta <= dataModel.dropOptions.dropCloserThan && timeDelta <= dataModel.dropOptions.unlessTimePassed) {
            return true;
        } else {
            previousMouseMoveInfo.time = now;
            previousMouseMoveInfo.clientX = e.clientX;
            previousMouseMoveInfo.clientY = e.clientY;
            return false;
        }
    }
    function adjustWidth() {
        var MIN_ESTIMATION_PERIOD = 250;
        var MAX_ESTIMATION_PERIOD = 1000;
        if(MAX_ESTIMATION_PERIOD < dataModel.dropOptions.unlessTimePassed) {
            MAX_ESTIMATION_PERIOD = dataModel.dropOptions.unlessTimePassed;
        }
        var vertices = dataModel.drawing.theDrawing.linearSplines[dataModel.drawing.theDrawing.linearSplines.length - 1].vertices;
        var index = vertices.length - 1;
        var distance = 0;
        var time = 0;
        // TODO: try weighted sum for time and distance to increase curve smoothness when drop settings are set to high quality
        while(time < MAX_ESTIMATION_PERIOD && index > 0) {
            distance += vertices[index].position.subtract(vertices[index - 1].position).getLength();
            time += timestamps[index] - timestamps[index - 1];
        }
        if(time < MIN_ESTIMATION_PERIOD) {
            return;
        }
        var speed = distance / time;
        // TODO: give 1000 from formula below a meaningful name and make it adjustable
        vertices[vertices.length - 1].width *= 1 + (dataModel.options.maxPressureMultiplier - 1) * Math.exp(-1000 * speed);
    }
    // Color Convertion functions are adopted from Bootstrap Colorpicker
    function _sanitizeNumber(val) {
        if (typeof val === 'number') {
            return val;
        }
        if (isNaN(val) || (val === null) || (val === '') || (val === undefined)) {
            return 1;
        }
        if (val.toLowerCase !== undefined) {
            return parseFloat(val);
        }
        return 1;
    }
    function RGBtoHSB(r, g, b) {
        var H, S, V, C;
        V = Math.max(r, g, b);
        C = V - Math.min(r, g, b);
        H = (C === 0 ? null :
                V === r ? (g - b) / C :
                    V === g ? (b - r) / C + 2 :
                    (r - g) / C + 4
        );
        H = ((H + 360) % 6) * 60 / 360;
        S = C === 0 ? 0 : C / V;
        return {
            h: _sanitizeNumber(H),
            s: S,
            b: V
        };
    }
    function HSBtoRGB(h, s, b) {
        h *= 360;
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
            r: R,
            g: G,
            b: B
        };
    }
    function adjustColor() {
        var t = timestamps[timestamps.length - 1] - timestamps[0];
        var vertices = dataModel.drawing.theDrawing.linearSplines[dataModel.drawing.theDrawing.linearSplines.length - 1].vertices;
        var vertex = vertices[vertices.length - 1];
        vertex.color[3] *= Math.exp(-0.69314718056 * t / dataModel.options.inkHalfLife);
        if(dataModel.options.hueOscillation) {
            var hsb = RGBtoHSB(vertex.color[0], vertex.color[1], vertex.color[2]);
            hsb.h += Math.sin((1 / 30) * 2 * Math.PI * t / 1000);
            var rgb = HSBtoRGB(hsb.h, hsb.s, hsb.b);
            vertex.color[0] = rgb.r;
            vertex.color[1] = rgb.g;
            vertex.color[2] = rgb.b;
        }
    }
    canvas.on("mousemove", function(e) {
        if(additionMode && !shouldDropMouseMoveEvent(e)) {
            var spline = dataModel.drawing.theDrawing.linearSplines[dataModel.drawing.theDrawing.linearSplines.length - 1];
            timestamps.push(new Date());
            spline.vertices.push(new CurveVertex(getMouseCoordinatesFromEvent(e), dataModel.options.color.slice(), dataModel.options.lineWidth / canvasDOM.width));
            adjustWidth();
            adjustColor();
            dataModel.events.emit("change");
        }
    });
    $("#button-drop-options-quality").on("click", function() {
        dataModel.dropOptions.dropCloserThan = 0;
        dataModel.dropOptions.unlessTimePassed = 0;
        dataModel.events.emit("change");
        dataModel.applyToGui();
    });
    $("#button-drop-options-balance").on("click", function() {
        dataModel.dropOptions.dropCloserThan = 20;
        dataModel.dropOptions.unlessTimePassed = 100;
        dataModel.events.emit("change");
        dataModel.applyToGui();
    });
    $("#button-drop-options-performance").on("click", function() {
        dataModel.dropOptions.dropCloserThan = 50;
        dataModel.dropOptions.unlessTimePassed = 1000;
        dataModel.events.emit("change");
        dataModel.applyToGui();
    });

    dataModel.applyToGui();
    dataModel.events.on("change", render);

    render();
};
