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

	// TODO: it is a monster
	$("#button-structure-load").on("click", function(e) {
		$('#modal-load tbody').children().not('.tr-modal-load-table-first-row').empty();
		$('#modal-load').modal();

		$.get(
			"library/"
		).done(function(data, textStatus, jqXHR) {
			if(jqXHR.status == 200) {
				for(var name in data) {
					var tr = $('<tr></tr>');
					var aName = $('<a href="#"></a>').text(name);
					aName.on("click", function(e) {
						$('#modal-load tbody').children().not('.tr-modal-load-table-first-row').empty();
						$.get(
							"library/" + encodeURIComponent(e.target.textContent)
						).done(function(data, textStatus, jqXHR) {
							var mesh = Mesh.attach(data);
							// TODO: code dup
							dataModel.scene.model.meshes.push(mesh);
							dataModel.selected = mesh;
							dataModel.events.emit("change");
							dataModel.applyToGui();

							$('#modal-load').modal('hide')
						}).fail(function(jqXHR, textStatus, errorThrown) {
							$('#modal-load .alert-danger').text("Error getting library entry: " + textStatus + " (" + errorThrown + ")");
							$('#modal-load .alert-danger').collapse('show');
						});
					});
					var tdName = $('<td></td>').append(aName);
					var tdDate = $('<td></td>').text(data[name].date.toString());
					$('#modal-load tbody').append(tr.append(tdName).append(tdDate));
				}
				$('#modal-load .alert-danger').collapse('hide');
			} else {
				$('#modal-load .alert-danger').text("Error getting library listing: " + textStatus);
				$('#modal-load .alert-danger').collapse('show');
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$('#modal-load .alert-danger').text("Error getting library listing: " + textStatus + " (" + errorThrown + ")");
			$('#modal-load .alert-danger').collapse('show');
		});
	});

	// TODO: basic alert & prompt look unnatural here
	$("#button-structure-save").on("click", function(e) {
		var body = JSON.stringify(dataModel.selected);
		var name = prompt("Enter library entry name", "");
		$.ajax({
			url: "library/" + encodeURIComponent(name),
			method: "put",
			contentType: "application/json",
			data: body
		}).done(function(data, textStatus, jqXHR) {
			alert("done: " + textStatus);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			alert("fail: " + textStatus + " (" + errorThrown + ")");
		});
	});

    $("#button-information").on("click", function(e) {
		$('#modal-intro').modal();
	});

    $("#gl-canvas").on("keydown", function(e) {
		if(112 /* F1 */ == e.keyCode) {
			$("#button-information").click();
			e.preventDefault();
		}
	});

    $('#modal-intro').modal();
};
