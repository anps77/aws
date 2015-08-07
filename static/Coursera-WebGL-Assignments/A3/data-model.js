"use strict";

function DataModel() {
    this.scene = new Scene();
    this.events = new EventEmitter("change");
    this.selected = this.scene.camera;
    this.transformation = {
		translateAmount: 0.25,
		rotateAmount: 5,
		scaleAmount: 1.1
	}
}

DataModel.prototype.setModel = function(model) {
    this.scene.model = model;
    this.events.emit("change");
};

DataModel.prototype.newObjectTransformFromCamera = Transformation.newTranslation(0, 0, -4);

DataModel.prototype.setMeshGenerators = function(generators) {
	var dataModel = this;

    var ulAddObject = $("#ul-structure-add-object");
    var addElement = function(title, generator) {
        var a = $("<a href='#'></a>");
        a.text(title);
        a.on("click", function() {
			var mesh = generator();
			
			mesh.transformation = dataModel.scene.camera.transformation.multiply(dataModel.newObjectTransformFromCamera);
			
			var c = Color.newRandom();
			mesh.material.faceColor = new Color(c.r, c.g, c.b, 1.0);
			mesh.material.edgeColor = new Color(c.r*0.5, c.g*0.5, c.b*0.5, 1.0);
			
			dataModel.scene.model.meshes.push(mesh);
			dataModel.selected = mesh;
			dataModel.events.emit("change");
			dataModel.applyToGui();
		});
        var li = $("<li>");
        li.append(a);
        ulAddObject.append(li);
	};

	for(var title in generators) {
		addElement(title, generators[title]);
	}
}

DataModel.prototype.bindToGui = function() {
	var dataModel = this;
	
	var reloadData = function(e) { dataModel.loadFromGui(e.target); }
    $(".data-model-container input").on("change", reloadData);
    $(".colorpicker-component").on("changeColor.colorpicker", reloadData);
    $(".data-model-container select").on("change", reloadData);
    
    $("#button-structure-remove-object").on("click", function() {
		var meshes = dataModel.scene.model.meshes;
		var index = meshes.indexOf(dataModel.selected);
		meshes.splice(index, 1);
		if(index < meshes.length) {
			dataModel.selected = meshes[index];
		} else if(meshes.length > 0) {
			dataModel.selected = meshes[meshes.length - 1]
		} else {
			dataModel.selected = dataModel.scene.camera;
		}
		dataModel.applyToGui();
		dataModel.events.emit("change");
	});

    $("#button-structure-remove-all-objects").on("click", function() {
		var meshes = dataModel.scene.model.meshes;
		meshes.length = 0;
		dataModel.selected = dataModel.scene.camera;
		dataModel.applyToGui();
		dataModel.events.emit("change");
	});
	
	$('#button-structure-boolean-union-all').on("click", function() {
		dataModel.scene.model.meshes = [ Mesh.newUnion(dataModel.scene.model.meshes) ];
		dataModel.selected = dataModel.scene.model.meshes[0];
		dataModel.applyToGui();
		dataModel.events.emit("change");
	});
	
	var bindTransformationButton = function(suffix, generator) {
		$("#button-transformation-" + suffix).on("click", function() {
			dataModel.selected.transformation.multiplyAssign(generator());
			dataModel.events.emit("change");
			return;
		});
	};
	bindTransformationButton("translate-xp", function() { return Transformation.newTranslation(+dataModel.transformation.translateAmount, 0.0, 0.0); });
	bindTransformationButton("translate-xn", function() { return Transformation.newTranslation(-dataModel.transformation.translateAmount, 0.0, 0.0); });
	bindTransformationButton("translate-yp", function() { return Transformation.newTranslation(0.0, +dataModel.transformation.translateAmount, 0.0); });
	bindTransformationButton("translate-yn", function() { return Transformation.newTranslation(0.0, -dataModel.transformation.translateAmount, 0.0); });
	bindTransformationButton("translate-zp", function() { return Transformation.newTranslation(0.0, 0.0, +dataModel.transformation.translateAmount); });
	bindTransformationButton("translate-zn", function() { return Transformation.newTranslation(0.0, 0.0, -dataModel.transformation.translateAmount); });
	bindTransformationButton("rotate-xp", function() { return Transformation.newRotationX(+dataModel.transformation.rotateAmount * Math.PI / 180); });
	bindTransformationButton("rotate-xn", function() { return Transformation.newRotationX(-dataModel.transformation.rotateAmount * Math.PI / 180); });
	bindTransformationButton("rotate-yp", function() { return Transformation.newRotationY(+dataModel.transformation.rotateAmount * Math.PI / 180); });
	bindTransformationButton("rotate-yn", function() { return Transformation.newRotationY(-dataModel.transformation.rotateAmount * Math.PI / 180); });
	bindTransformationButton("rotate-zp", function() { return Transformation.newRotationZ(+dataModel.transformation.rotateAmount * Math.PI / 180); });
	bindTransformationButton("rotate-zn", function() { return Transformation.newRotationZ(-dataModel.transformation.rotateAmount * Math.PI / 180); });
	bindTransformationButton("scale-xp", function() { return Transformation.newScale(1*dataModel.transformation.scaleAmount, 1.0, 1.0); });
	bindTransformationButton("scale-xn", function() { return Transformation.newScale(1/dataModel.transformation.scaleAmount, 1.0, 1.0); });
	bindTransformationButton("scale-yp", function() { return Transformation.newScale(1.0, 1*dataModel.transformation.scaleAmount, 1.0); });
	bindTransformationButton("scale-yn", function() { return Transformation.newScale(1.0, 1/dataModel.transformation.scaleAmount, 1.0); });
	bindTransformationButton("scale-zp", function() { return Transformation.newScale(1.0, 1.0, 1*dataModel.transformation.scaleAmount); });
	bindTransformationButton("scale-zn", function() { return Transformation.newScale(1.0, 1.0, 1/dataModel.transformation.scaleAmount); });

	$('#button-transformation-to-origin').on("click", function() {
		dataModel.selected.transformation = new Transformation();
		dataModel.events.emit("change");
		return;
	});
	
	$('#button-transformation-to-camera').on("click", function() {
		dataModel.selected.transformation = dataModel.scene.camera.transformation.multiply(dataModel.newObjectTransformFromCamera);
		dataModel.events.emit("change");
		return;
	});
	
    dataModel.applyToGui();
};

DataModel.prototype.loadFromGui = function(src) {
	// TODO: this looks like a design flaw
	if(src == $('#select-structure-active-object')[0]) {
		if($("#option-structure-active-object-camera").prop('selected')) {
			this.selected = this.scene.camera;
		} else {
			this.selected = this.scene.model.meshes[$('#select-structure-active-object').val()];
		}
		this.events.emit("change");
		this.applyToGui();
		return;
	}
	
    if(this.selected instanceof Camera) {
		// nothing
	} else {
		this.selected.name = $('#input-structure-active-object-name').val();
		this.selected.material.faceColor = this._loadFromGuiColor("input-material-face-color");
		this.selected.material.edgeColor = this._loadFromGuiColor("input-material-edge-color");
	}
	
    this.transformation.translateAmount = +$("#input-transformation-translate-amount").val();
    this.transformation.rotateAmount = +$("#input-transformation-rotate-amount").val();
    this.transformation.scaleAmount = +$("#input-transformation-scale-amount").val();

    this.events.emit("change");
};

DataModel.prototype._applyToGuiModelObjects = function() {
    var ogModelObjects = $("#optgroup-structure-active-object-model-objects")
    ogModelObjects.empty();
    for(var i = 0; i < this.scene.model.meshes.length; ++i) {
		var newOption = $("<option value='" + i + "'></option>");
		newOption.text(this.scene.model.meshes[i].name);
		if(this.selected == this.scene.model.meshes[i]) {
			newOption.prop('selected', true); // prop or attr?
		}
		ogModelObjects.append(newOption);
	}
	if(this.selected == this.scene.camera) {
		$("#option-structure-active-object-camera").prop('selected', true);
	}
    $('#select-structure-active-object').selectpicker('refresh');
}

DataModel.prototype._loadFromGuiColor = function(id) {
    var rgba = $("#" + id).data('colorpicker').color.toRGB();
    return new Color(rgba.r / 255, rgba.g / 255, rgba.b / 255, rgba.a);
}

DataModel.prototype._applyToGuiColor = function(id, c) {
    // workaround for erroneous colorpicker component
    var stringColor = "rgba(" + Math.floor(c.r * 255) + "," + Math.floor(c.g * 255) + "," + Math.floor(c.b * 255) + "," + c.a + ")";
    $("#" + id).data('colorpicker').color.setColor(stringColor);
    $("#" + id).data('colorpicker').format = "rgba";
    $("#" + id + " input").val(stringColor);
    $("#" + id).data('colorpicker').update(true);
}

DataModel.prototype.applyToGui = function() {
    this._applyToGuiModelObjects();
   
    if(this.selected instanceof Camera) {
		$('#input-structure-active-object-name').val("(Camera)");
		$('#input-structure-active-object-name').prop('disabled', true);
		
		$('#button-structure-remove-object').prop('disabled', true);

		$('#button-structure-save').prop('disabled', true);
		
		$('#button-transformation-scale-xp').prop('disabled', true);
		$('#button-transformation-scale-xn').prop('disabled', true);
		$('#button-transformation-scale-yp').prop('disabled', true);
		$('#button-transformation-scale-yn').prop('disabled', true);
		$('#button-transformation-scale-zp').prop('disabled', true);
		$('#button-transformation-scale-zn').prop('disabled', true);

		$('#button-transformation-to-origin').prop('disabled', true);
		$('#button-transformation-to-camera').prop('disabled', true);

		this._applyToGuiColor("input-material-face-color", new Color());
		$('#input-material-face-color').colorpicker('disable');
		this._applyToGuiColor("input-material-edge-color", new Color());
		$('#input-material-edge-color').colorpicker('disable');
	} else {
		$('#input-structure-active-object-name').val(this.selected.name);
		$('#input-structure-active-object-name').prop('disabled', false);
		
		$('#button-structure-remove-object').prop('disabled', false);

		$('#button-structure-save').prop('disabled', false);
		
		$('#button-transformation-scale-xp').prop('disabled', false);
		$('#button-transformation-scale-xn').prop('disabled', false);
		$('#button-transformation-scale-yp').prop('disabled', false);
		$('#button-transformation-scale-yn').prop('disabled', false);
		$('#button-transformation-scale-zp').prop('disabled', false);
		$('#button-transformation-scale-zn').prop('disabled', false);

		$('#button-transformation-to-origin').prop('disabled', false);
		$('#button-transformation-to-camera').prop('disabled', false);

		this._applyToGuiColor("input-material-face-color", this.selected.material.faceColor);
		$('#input-material-face-color').colorpicker('enable');
		this._applyToGuiColor("input-material-edge-color", this.selected.material.edgeColor);
		$('#input-material-edge-color').colorpicker('enable');
	}
    
	$('#button-structure-remove-all-objects').prop('disabled', this.scene.model.meshes.length > 0 ? false : true);
	$('#button-structure-boolean-union-all').prop('disabled', this.scene.model.meshes.length > 0 ? false : true);
	
    $("#input-transformation-translate-amount").val(this.transformation.translateAmount);
    $("#input-transformation-rotate-amount").val(this.transformation.rotateAmount);
    $("#input-transformation-scale-amount").val(this.transformation.scaleAmount);
};

