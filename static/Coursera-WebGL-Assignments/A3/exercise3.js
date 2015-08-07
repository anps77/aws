"use strict";

window.onload = function() {
	$('[data-toggle="tooltip"]').tooltip()
	$('.colorpicker-component').colorpicker();
    $('.selectpicker').selectpicker();

    var dataModel = new DataModel();
    var dataStatistics = new DataStatistics();

    var renderer = new Renderer($("#gl-canvas")[0]);
    var render = function() { renderer.render(dataModel, dataStatistics); };
    
    $(window).on("resize", function() {
		renderer.onresize();
		render();
	});
	
	var hotkeys = {
		W:      "#button-transformation-translate-zn",
		S:      "#button-transformation-translate-zp",
		A:      "#button-transformation-translate-xn",
		D:      "#button-transformation-translate-xp",
		Z:      "#button-transformation-translate-yn",
		X:      "#button-transformation-translate-yp",
		Q:      "#button-transformation-rotate-zp",
		E:      "#button-transformation-rotate-zn",
		"\x25": "#button-transformation-rotate-yp", /* LEFT */
		"\x27": "#button-transformation-rotate-yn", /* RIGHT */
		"\x26": "#button-transformation-rotate-xp", /* UP */
		"\x28": "#button-transformation-rotate-xn", /* DOWN */
		R:      "#button-transformation-scale-xn",
		T:      "#button-transformation-scale-xp",
		F:      "#button-transformation-scale-yn",
		G:      "#button-transformation-scale-yp",
		V:      "#button-transformation-scale-zn",
		B:      "#button-transformation-scale-zp",
		"\x20": "#button-transformation-to-origin" /* SPACE */
	};
    $("#gl-canvas").on("keydown", function(e) {
		for(var key in hotkeys) {
			if(key.charCodeAt(0) == e.keyCode) {
				var button = $(hotkeys[key]);
				if(button.prop('disabled') == false) {
					button.click();
				}
				break;
			}
		}
	});
	// Digits:
	// (without ALT) select active mesh
	// (with ALT) add mesh from list
    $("#gl-canvas").on("keydown", function(e) {
		if(e.altKey) {
			if("1".charCodeAt(0) <= e.keyCode && e.keyCode <= "9".charCodeAt(0)) {
				var index = e.keyCode - "1".charCodeAt(0);
				$("#ul-structure-add-object").children().eq(index).find("a").click();
				e.preventDefault();
			}
		} else {
			if(192 /* tilde */ == e.keyCode || "0".charCodeAt(0) == e.keyCode) {
				$("#option-structure-active-object-camera").prop('selected', true);
				dataModel.loadFromGui($('#select-structure-active-object')[0]); // hack
			}
			if("1".charCodeAt(0) <= e.keyCode && e.keyCode <= "9".charCodeAt(0)) {
				var index = e.keyCode - "1".charCodeAt(0);
				var option = $('#optgroup-structure-active-object-model-objects option').eq(index);
				if(option) {
					option.prop('selected', true);
					dataModel.loadFromGui($('#select-structure-active-object')[0]); // hack
				}
			}
		}
	});
	
	dataModel.setMeshGenerators({
		"Sphere" : function() { return Mesh.newSphere(); },
		"Cylinder" : function() { return Mesh.newCylinder(); },
		"Cone" : function() { return Mesh.newCone(); },
		"Cube" : function() { return Mesh.newCube(); },
		"Plane (Surface)" : function() { return Mesh.newPlane(); }
	});
	
	dataModel.bindToGui();

    dataModel.events.on("change", render);

    render();
};
