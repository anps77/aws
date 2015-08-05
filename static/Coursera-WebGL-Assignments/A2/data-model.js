"use strict";

function DataModel() {
    this.options = {
        lineWidth: 1.0,
        maxPressureMultiplier: 10,
        color: [0.5, 0, 0.5, 1],
        hueOscillation: false,
        inkHalfLife: 5000
    };
    this.dropOptions = {
        dropCloserThan: 20,
        unlessTimePassed: 100
    };
    this.drawing = {
        theDrawing: new Drawing()
    };
    this.events = new EventEmitter("change");
}

DataModel.prototype.setDrawing = function(theDrawing) {
    this.drawing.theDrawing = theDrawing;

    this.events.emit("change");
};

DataModel.prototype.loadFromGui = function() {
    this.options.lineWidth = +$("#input-options-line-width").val();
    this.options.maxPressureMultiplier = +$("#input-options-max-pressure-multiplier").val();
    var rgba = $("#input-options-color").data('colorpicker').color.toRGB();
    this.options.color = [rgba.r / 255, rgba.g / 255, rgba.b / 255, rgba.a];
    this.options.inkHalfLife = +$("#input-options-ink-half-life").val();
    this.options.hueOscillation = $("#input-options-hue-oscillation").is(':checked');
    this.dropOptions.dropCloserThan = +$("#input-drop-options-less-than").val();
    this.dropOptions.unlessTimePassed = +$("#input-drop-options-unless-time").val();

    this.events.emit("change");
};

DataModel.prototype.applyToGui = function() {
    $("#input-options-line-width").val(this.options.lineWidth);
    $("#input-options-max-pressure-multiplier").val(this.options.maxPressureMultiplier);
    $("#input-options-ink-half-life").val(this.options.inkHalfLife);
    $("#input-options-hue-oscillation").prop('checked', this.options.hueOscillation);
    $("#input-drop-options-less-than").val(this.dropOptions.dropCloserThan);
    $("#input-drop-options-unless-time").val(this.dropOptions.unlessTimePassed);

    // workaround for erroneous colorpicker component
    var c = this.options.color;
    var stringColor = "rgba(" + Math.floor(c[0] * 255) + "," + Math.floor(c[1] * 255) + "," + Math.floor(c[2] * 255) + "," + c[3] + ")";
    $("#input-options-color").data('colorpicker').color.setColor(stringColor);
    $("#input-options-color").data('colorpicker').format = "rgba";
    $("#input-options-color input").val(stringColor);
    $("#input-options-color").data('colorpicker').update(true);
};

