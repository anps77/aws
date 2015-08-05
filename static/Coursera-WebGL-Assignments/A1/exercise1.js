"use strict";

window.onload = function() {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    var canvas = $("#gl-canvas");
    var canvasDOM = canvas[0];
    var dataModel = new DataModel(new Mesh(Mesh.predefined.Triangle));
    var dataStatistics = new DataStatistics();
    var renderer = new Renderer(canvasDOM);
    var mouseCoordinates = [0, 0];
    var partialTriangle = [];
    var render = function() { renderer.render(dataModel, dataStatistics, mouseCoordinates, twistThetaAnimator, partialTriangle); };
    var createPredefinedMeshSetter = function(p) {
        return function() {
            dataModel.setMesh(new Mesh(Mesh.predefined[p]));
        }
    };
    var getMouseCoordinatesFromEvent = function(e) {
        var b = canvasDOM.getBoundingClientRect();
        var x = e.clientX - b.left;
        var y = e.clientY - b.top;
        return [2 * x / canvasDOM.width - 1, 1 - 2 * y / canvasDOM.height];
    };
    var twistThetaAnimator = {
        enabled: dataModel.twist.animation,
        frequency: 1,
        tick: 0,
        previousTick: 0,
        animate: function() {
            if(this.enabled) {
                window.requestAnimFrame(this.animate.bind(this));
                var now = new Date();
                if(this.previousTick == 0) {
                    this.previousTick = now;
                } else {
                    this.tick += now - this.previousTick;
                    this.previousTick = now;
                }
            } else {
                this.tick = 0;
                this.previousTick = 0;
            }
            render();
        }
    };

    $(".data-model-container input").on("change", function() {
        dataModel.loadFromGui();
    });
    var pp = $("#ul-mesh-predefined-mesh");
    for(var p in Mesh.predefined) {
        var a = document.createElement("a");
        a.setAttribute("href", "#");
        a.onclick = createPredefinedMeshSetter(p);
        var li = document.createElement("li");
        li.appendChild(a);
        var txt = document.createTextNode(p);
        a.appendChild(txt);
        pp.append(li)
    }
    $("#button-mesh-clear-mesh").on("click", function() {
        dataModel.setMesh(new Mesh([]))
    });
    canvas.on("mousemove", function(e) {
        if(dataModel.twist.centerFollowsMouse) {
            mouseCoordinates = getMouseCoordinatesFromEvent(e);
            render();
        }
    });
    dataModel.events.on("change", function() {
        if(dataModel.twist.animation != twistThetaAnimator.enabled) {
            twistThetaAnimator.enabled = dataModel.twist.animation;
            if(dataModel.twist.animation) {
                twistThetaAnimator.animate();
            }
        }
    });
    canvas.on("click", function(e) {
        if(dataModel.mesh.editMode) {
            var clickCoordinates = getMouseCoordinatesFromEvent(e);
            partialTriangle.push(clickCoordinates[0], clickCoordinates[1]);
            if(partialTriangle.length == 6) {
                dataModel.setMesh(new Mesh(dataModel.mesh.theMesh.vertices.concat(partialTriangle)));
                partialTriangle = [];
            }
            render();
        }
    });
    $("#button-mesh-get-vertices").on("click", function() {
        alert(dataModel.mesh.theMesh.vertices);
    });

    dataModel.applyToGui();
    dataModel.events.on("change", render);

    render();
};
