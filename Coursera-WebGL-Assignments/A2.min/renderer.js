"use strict";

function Renderer(canvas) {
    this.canvas = canvas;
    this.gl = WebGLUtils.setupWebGL( canvas );
    if ( !this.gl ) {
        alert( "WebGL isn't available" );
    }

    this.program = initShaders( this.gl, $("#vertex-shader").text(), $("#fragment-shader").text() );
    this.bufferIdSolid = this.gl.createBuffer();
}

Renderer.prototype.render = function(dataModel, dataStatistics) {
    var FLOAT32_SIZE = 4;
    var FLOATS_PER_VERTEX = 6;
    var MAX_FLOATS_PER_SEGMENT = FLOATS_PER_VERTEX * 12;

    var startDime = new Date();

    function flattenDrawing( d ) {
        function tesselateSegment(begin, end, floatArray, floatArrayIndex, isFirst) {
            var direction = end.position.subtract(begin.position);
            var orthogonal = new Vector(-direction.y, direction.x).getNormalized();
            var p11 = begin.position.subtract(orthogonal.multiply(begin.width));
            var p12 = begin.position.add(orthogonal.multiply(begin.width));
            var p21 = end.position.subtract(orthogonal.multiply(end.width));
            var p22 = end.position.add(orthogonal.multiply(end.width));
            function addVertex(point, color) {
                floatArray[floatArrayIndex++] = point.radiusVector.x;
                floatArray[floatArrayIndex++] = point.radiusVector.y;
                floatArray[floatArrayIndex++] = color[0];
                floatArray[floatArrayIndex++] = color[1];
                floatArray[floatArrayIndex++] = color[2];
                floatArray[floatArrayIndex++] = color[3];
            }
            function repeatPreviousVertex(offset) {
                floatArray[floatArrayIndex++] = floatArray[offset++];
                floatArray[floatArrayIndex++] = floatArray[offset++];
                floatArray[floatArrayIndex++] = floatArray[offset++];
                floatArray[floatArrayIndex++] = floatArray[offset++];
                floatArray[floatArrayIndex++] = floatArray[offset++];
                floatArray[floatArrayIndex++] = floatArray[offset++];
                return floatArrayIndex;
            }
            if(!isFirst) {
                repeatPreviousVertex(floatArrayIndex - (1 + 0) * FLOATS_PER_VERTEX)
                addVertex(begin.position, begin.color);
                addVertex(p11, begin.color);
                addVertex(begin.position, begin.color);
                repeatPreviousVertex(floatArrayIndex - (2 + 4) * FLOATS_PER_VERTEX)
                addVertex(p12, begin.color);
            }
            addVertex(p11, begin.color);
            addVertex(p12, begin.color);
            addVertex(p22, end.color);
            addVertex(p11, begin.color);
            addVertex(p22, end.color);
            addVertex(p21, end.color);
            return floatArrayIndex;
        }
        var resLength = 0;
        for(var i = 0; i < d.linearSplines.length; ++i) {
            if(d.linearSplines[i].vertices.length >= 1) {
                resLength += (d.linearSplines[i].vertices.length - 1) * MAX_FLOATS_PER_SEGMENT;
            }
        }
        var floatArray = new Float32Array( resLength );
        var resIndex = 0;
        for(var i = 0; i < d.linearSplines.length; ++i) {
            for(var j = 1; j < d.linearSplines[i].vertices.length; ++j) {
                resIndex = tesselateSegment(d.linearSplines[i].vertices[j - 1], d.linearSplines[i].vertices[j], floatArray, resIndex, (j == 1));
            }
        }

        return new Float32Array(floatArray.buffer, 0, resIndex);
    }

    this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.frontFace(this.gl.CW);
    this.gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    this.gl.clear( this.gl.COLOR_BUFFER_BIT );

    var floatArray = flattenDrawing(dataModel.drawing.theDrawing);
    if(floatArray.length > 0) {
        this.gl.useProgram( this.program );
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.bufferIdSolid );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, floatArray.length * FLOAT32_SIZE, this.gl.STATIC_DRAW );
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, floatArray);
        this.gl.vertexAttribPointer( this.gl.getAttribLocation( this.program, "vPosition" ), 2, this.gl.FLOAT, false, FLOAT32_SIZE * FLOATS_PER_VERTEX, FLOAT32_SIZE * 0 );
        this.gl.enableVertexAttribArray( this.gl.getAttribLocation( this.program, "vPosition" ) );
        this.gl.vertexAttribPointer( this.gl.getAttribLocation( this.program, "vColor" ), 4, this.gl.FLOAT, false, FLOAT32_SIZE * FLOATS_PER_VERTEX, FLOAT32_SIZE * 2 );
        this.gl.enableVertexAttribArray( this.gl.getAttribLocation( this.program, "vColor" ) );
        this.gl.drawArrays( this.gl.TRIANGLES, 0, floatArray.length / FLOATS_PER_VERTEX );
    }

    var endDime = new Date();
    dataStatistics.renderTime = endDime - startDime;
    dataStatistics.triangleCount = floatArray.length / (FLOATS_PER_VERTEX * 3);
    dataStatistics.applyToGui();
};

function initShaders( gl, vertexShaderText, fragmentShaderText )
{
    var vertShdr = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertShdr, vertexShaderText );
    gl.compileShader( vertShdr );
    if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
        var msg = "Vertex shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
        alert( msg );
        return -1;
    }

    var fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragShdr, fragmentShaderText );
    gl.compileShader( fragShdr );
    if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
        var msg = "Fragment shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
        alert( msg );
        return -1;
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );

    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
}
