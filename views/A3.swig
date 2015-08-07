<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ title }}</title>

    <link href="ext/bootstrap.min.css" rel="stylesheet">
    <link href="ext/bootstrap-theme.min.css" rel="stylesheet">
    <link href="ext/bootstrap-colorpicker.min.css" rel="stylesheet">
    <link href="ext/bootstrap-select.min.css" rel="stylesheet">
    <link href="exercise.css" rel="stylesheet">
</head>

<body>

<canvas id="gl-canvas" tabindex="0" autofocus>Oops ... your browser doesn't support the HTML5 canvas element</canvas>

<nav class="navbar navbar-default">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">{{ title }}</a>
        </div>
        <div class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <li class="active"><a href="#">Home</a></li>
            </ul>
        </div>
    </div>
</nav>

<div class="container-fluid">
    <div class="col-md-4 col-md-offset-8 col-lg-3 col-lg-offset-9 data-model-container data-statistics-container">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                    <a data-toggle="collapse" href="#panel-structure">
                        Structure
                    </a>
                </h3>
            </div>
            <div id="panel-structure" class="panel-collapse collapse in">
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">Selected:</span>
                            <select id="select-structure-active-object" class="selectpicker form-control">
								<optgroup label="Scene objects">
									<option id="option-structure-active-object-camera">Camera</option>
								</optgroup>
								<optgroup label="Model objects" id="optgroup-structure-active-object-model-objects"></optgroup>
                            </select>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">Name:</span>
                            <input id="input-structure-active-object-name" type="text" class="form-control"/>
                        </div>
                    </li>
                    <li class="list-group-item">
						<div class="btn-group btn-group-justified btn-group-sm">
                            <div class="btn-group btn-group-sm">
								<button class="btn btn-default dropdown-toggle" type="button" id="button-structure-add-object" data-toggle="dropdown">
									Add Object
									<span class="caret"></span>
								</button>
								<ul id="ul-structure-add-object" class="dropdown-menu" aria-labelledby="button-structure-add-object">
								</ul>
                            </div>
                            <div class="btn-group btn-group-sm"><button class="btn btn-default" type="button" id="button-structure-remove-object">Remove</button></div>
							<div class="btn-group btn-group-sm"><button class="btn btn-default" type="button" id="button-structure-remove-all-objects">Remove All</button></div>
						</div>
                    </li>
                    <li class="list-group-item">
						<div class="btn-group btn-group-justified btn-group-sm">
                            <div class="btn-group btn-group-sm"><button class="btn btn-default" type="button" id="button-structure-boolean-union-all">Boolean Union All</button></div>
							<div class="btn-group btn-group-sm"><button class="btn btn-default" type="button" id="button-structure-save">Save To Library</button></div>
						</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                    <a data-toggle="collapse" href="#panel-transformation">
                        Transformation
                    </a>
                </h3>
            </div>
            <div id="panel-transformation" class="panel-collapse collapse in">
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">T</span>
                            <input id="input-transformation-translate-amount" type="number" class="form-control" min="0" max="10" value="0.1" step="0.1" />
							<span class="input-group-btn">
								<button class="btn btn-default" type="button" id="button-transformation-translate-xp">+X</button>
								<button class="btn btn-default" type="button" id="button-transformation-translate-xn">-X</button>
								<button class="btn btn-default" type="button" id="button-transformation-translate-yp">+Y</button>
								<button class="btn btn-default" type="button" id="button-transformation-translate-yn">-Y</button>
								<button class="btn btn-default" type="button" id="button-transformation-translate-zp">+Z</button>
								<button class="btn btn-default" type="button" id="button-transformation-translate-zn">-Z</button>
							</span>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">R</span>
                            <input id="input-transformation-rotate-amount" type="number" class="form-control" min="0" max="180" value="5" step="5" />
							<span class="input-group-btn">
								<button class="btn btn-default" type="button" id="button-transformation-rotate-xp">+X</button>
								<button class="btn btn-default" type="button" id="button-transformation-rotate-xn">-X</button>
								<button class="btn btn-default" type="button" id="button-transformation-rotate-yp">+Y</button>
								<button class="btn btn-default" type="button" id="button-transformation-rotate-yn">-Y</button>
								<button class="btn btn-default" type="button" id="button-transformation-rotate-zp">+Z</button>
								<button class="btn btn-default" type="button" id="button-transformation-rotate-zn">-Z</button>
							</span>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div class="input-group input-group-sm">
                            <span class="input-group-addon">S</span>
                            <input id="input-transformation-scale-amount" type="number" class="form-control" min="1.0" max="1.5" value="1.05" step="0.01" />
							<span class="input-group-btn">
								<button class="btn btn-default" type="button" id="button-transformation-scale-xp">+X</button>
								<button class="btn btn-default" type="button" id="button-transformation-scale-xn">-X</button>
								<button class="btn btn-default" type="button" id="button-transformation-scale-yp">+Y</button>
								<button class="btn btn-default" type="button" id="button-transformation-scale-yn">-Y</button>
								<button class="btn btn-default" type="button" id="button-transformation-scale-zp">+Z</button>
								<button class="btn btn-default" type="button" id="button-transformation-scale-zn">-Z</button>
							</span>
                        </div>
                    </li>
                    <li class="list-group-item">
						<div class="btn-group btn-group-justified btn-group-sm">
                            <div class="btn-group btn-group-sm"><button class="btn btn-default" type="button" id="button-transformation-to-origin">Reset To Origin</button></div>
							<div class="btn-group btn-group-sm"><button class="btn btn-default" type="button" id="button-transformation-to-camera">Reset To Camera</button></div>
						</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                    <a data-toggle="collapse" href="#panel-material">
                        Material
                    </a>
                </h3>
            </div>
            <div id="panel-material" class="panel-collapse collapse in">
                <ul class="list-group">
                    <li class="list-group-item">
                        <div id="input-material-face-color" class="input-group input-group-sm colorpicker-component colorpicker-element">
                            <span class="input-group-addon">Face Color:</span>
                            <input type="text" value="" class="form-control">
                            <span class="input-group-addon"><i></i></span>
                        </div>
                    </li>
                    <li class="list-group-item">
                        <div id="input-material-edge-color" class="input-group input-group-sm colorpicker-component colorpicker-element">
                            <span class="input-group-addon">Edge Color:</span>
                            <input type="text" value="" class="form-control">
                            <span class="input-group-addon"><i></i></span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">
                    <a data-toggle="collapse" href="#panel-statistics">
                        Statistics
                    </a>
                </h3>
            </div>
            <div id="panel-statistics" class="panel-collapse collapse in">
                <ul class="list-group">
                    <li class="list-group-item">Triangle count: <span class="badge" id="text-statistics-triangle-count"></span></li>
                    <li class="list-group-item">Render time: <span class="badge" id="text-statistics-render-time"></span></li>
                </ul>
            </div>
        </div>
    </div>
</div>

<script src="ext/jquery.min.js"></script>
<script src="ext/bootstrap.min.js"></script>
<script src="ext/transition.js"></script>
<script src="ext/collapse.js"></script>
<script src="ext/tooltip.js"></script>
<script src="ext/bootstrap-colorpicker.min.js"></script>
<script src="ext/bootstrap-select.min.js"></script>

<script src="webgl-utils.js"></script>
<script src="event-emitter.js"></script>
<script src="geometry.js"></script>
<script src="data-model.js"></script>
<script src="data-statistics.js"></script>
<script src="model.js"></script>
<script src="scene.js"></script>
<script src="renderer.js"></script>
<script src="exercise3.js"></script>

<script id="vertex-shader-meshes" type="x-shader/x-vertex">
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
attribute vec4 vPosition;
attribute vec3 vBarycentric;
varying vec4 fColor;
varying vec3 fBarycentric;

void main()
{
    fColor = vec4(1.0, 0.0, 1.0, 1.0);
    fBarycentric = vBarycentric;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vPosition;
}
</script>

<script id="fragment-shader-meshes" type="x-shader/x-fragment">
precision mediump float;

uniform vec4 faceColor;
uniform vec4 edgeColor;

varying vec4 fColor;
varying vec3 fBarycentric;

#extension GL_OES_standard_derivatives : enable
float edgeFactor() {
	vec3 d = fwidth(fBarycentric);
	vec3 a3 = smoothstep(vec3(0.0), d*0.95, fBarycentric);
	return min(min(a3.x, a3.y), a3.z);
}

void main(){
	gl_FragColor = mix(edgeColor, faceColor, edgeFactor());
}

</script>

</body>
</html>
