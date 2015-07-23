"use strict";

function Renderer(canvas) {
    this.canvas = canvas;
    this.gl = WebGLUtils.setupWebGL( canvas );
    if ( !this.gl ) {
        alert( "WebGL isn't available" );
    }

    var gl = this.gl;

    this.program = initShaders( this.gl, $("#vertex-shader").text(), $("#fragment-shader").text() );
    this.bufferIdSolid = this.gl.createBuffer();
    this.bufferIdWireframe = this.gl.createBuffer();
    this.bufferIdPartialTriangle  = this.gl.createBuffer();
    this.bufferIdBackground = this.gl.createBuffer();

    function handleTextureLoaded(image, texture, index) {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    gl.activeTexture(this.gl.TEXTURE0);
    this.backgroundTexture = gl.createTexture();
    this.backgroundImage = new Image();
    var bt = this.backgroundTexture, bi = this.backgroundImage;
    this.backgroundImage.onload = function() { handleTextureLoaded(bi, bt, 0); }
    this.backgroundImage.src = "sunlight_through_trees_2292_512.jpg";

    gl.activeTexture(this.gl.TEXTURE1);
    this.foregroundTexture = gl.createTexture();
    this.foregroundImage = new Image();
    var ft = this.foregroundTexture, fi = this.foregroundImage;
    this.foregroundImage.onload = function() { handleTextureLoaded(fi, ft, 1); }
    this.foregroundImage.src = "danger_forest_fires_9300348_512.jpg";
}

Renderer.prototype.render = function(dataModel, dataStatistics, mouseCoordinates, twistThetaAnimator, partialTriangle) {
    var startDime = new Date();

    function tesselate() {
        var originalVertices = dataModel.mesh.theMesh.vertices;
        var tesselatedVertices = [];
        var fractal = dataModel.display.fractal;
        function divideTriangle( a, b, c, count ) {
            function mix( u, v, s ) {
                var result = [];
                for ( var i = 0; i < u.length; ++i ) {
                    result.push( s * u[i] + (1.0 - s) * v[i] );
                }

                return result;
            }

            if ( count == 0 ) {
                tesselatedVertices.push( a[0], a[1], b[0], b[1], c[0], c[1] );
            } else {
                var ab = mix( a, b, 0.5 );
                var ac = mix( a, c, 0.5 );
                var bc = mix( b, c, 0.5 );

                --count;

                divideTriangle( a, ab, ac, count );
                divideTriangle( c, ac, bc, count );
                divideTriangle( b, bc, ab, count );
                if(!fractal) {
                    divideTriangle( ab, bc, ac, count );
                }
            }
        }
        for(var i = 0; i < Math.floor(originalVertices.length / 6); ++i) {
            divideTriangle(originalVertices.slice(i * 6, i * 6 + 2), originalVertices.slice(i * 6 + 2, i * 6 + 4), originalVertices.slice(i  * 6 + 4, i * 6 + 6), dataModel.tesselation.recursionCount);
        }
        return tesselatedVertices;
    }

    function jsArrayToFloat32ArraySolid( jsArray ) {
        var floatArray = new Float32Array( jsArray.length );
        for ( var i = 0; i < jsArray.length; ++i ) {
            floatArray[i] = jsArray[i];
        }

        return floatArray;
    }

    function jsArrayToFloat32ArrayWireframe( jsArray ) {
        var floatArray = new Float32Array( jsArray.length * 2 );
        var i = 0, j = 0;
        while( i < jsArray.length ) {
            floatArray[j++] = jsArray[i++];
            floatArray[j++] = jsArray[i++];
            floatArray[j++] = jsArray[i++];
            floatArray[j++] = jsArray[i++];
            floatArray[j++] = jsArray[i-2];
            floatArray[j++] = jsArray[i-1];
            floatArray[j++] = jsArray[i++];
            floatArray[j++] = jsArray[i++];
            floatArray[j++] = jsArray[i-2];
            floatArray[j++] = jsArray[i-1];
            floatArray[j++] = jsArray[i-6];
            floatArray[j++] = jsArray[i-5];
        }

        return floatArray;
    }

    this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    this.gl.clear( this.gl.COLOR_BUFFER_BIT );
    if(dataModel.display.blended) {
        this.gl.useProgram( this.program );
        var floatArray = jsArrayToFloat32ArraySolid([-1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1]);
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.bufferIdBackground );
        this.gl.bufferData( this.gl.ARRAY_BUFFER, floatArray.length * 4, this.gl.STATIC_DRAW );
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, floatArray);
        this.gl.vertexAttribPointer( this.gl.getAttribLocation( this.program, "vPosition" ), 2, this.gl.FLOAT, false, 0, 0 );
        this.gl.enableVertexAttribArray( this.gl.getAttribLocation( this.program, "vPosition" ) );
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "twist"), 0);
        this.gl.uniform2f(this.gl.getUniformLocation(this.program, "twistOrigin"), 0, 0);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, "pointSize"), 0.0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "useTexture"), 1);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.backgroundTexture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "sampler"), 0);
        this.gl.uniform4f(this.gl.getUniformLocation(this.program, "color"), 0.0, 0.0, 0.0, 1.0);
        this.gl.drawArrays( this.gl.TRIANGLES, 0, floatArray.length / 2 );
    }
    var tesselatedVertices = tesselate();
    if(tesselatedVertices.length > 0 || partialTriangle.length > 0) {
        var twistOrigin = dataModel.twist.centerFollowsMouse ? mouseCoordinates : [0, 0];
        this.gl.useProgram( this.program );
        var twistThetaDegrees = dataModel.twist.thetaDegrees;
        if(dataModel.twist.animation) {
            twistThetaDegrees *= Math.cos(twistThetaAnimator.tick * twistThetaAnimator.frequency * 2 * 3.14159265359 / 1000);
        }

        if(dataModel.display.solid) {
            var floatArray = jsArrayToFloat32ArraySolid(tesselatedVertices);
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.bufferIdSolid );
            this.gl.bufferData( this.gl.ARRAY_BUFFER, floatArray.length * 4, this.gl.STATIC_DRAW );
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, floatArray);
            this.gl.vertexAttribPointer( this.gl.getAttribLocation( this.program, "vPosition" ), 2, this.gl.FLOAT, false, 0, 0 );
            this.gl.enableVertexAttribArray( this.gl.getAttribLocation( this.program, "vPosition" ) );
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "twist"), twistThetaDegrees * 3.14159265359 / 180.0);
            this.gl.uniform2f(this.gl.getUniformLocation(this.program, "twistOrigin"), twistOrigin[0], twistOrigin[1]);
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "pointSize"), 0.0);
            this.gl.uniform4f(this.gl.getUniformLocation(this.program, "color"), 1.0, 0.0, 0.0, dataModel.display.blended ? 0.5 : 1.0);
            if(dataModel.display.textured) {
                this.gl.uniform1i(this.gl.getUniformLocation(this.program, "useTexture"), 1);
                this.gl.activeTexture(this.gl.TEXTURE1);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.foregroundTexture);
                this.gl.uniform1i(this.gl.getUniformLocation(this.program, "sampler"), 1);
            } else {
                this.gl.uniform1i(this.gl.getUniformLocation(this.program, "useTexture"), 0);
            }
            this.gl.drawArrays( this.gl.TRIANGLES, 0, floatArray.length / 2 );
        }
        if(dataModel.display.wireframe) {
            var floatArray = jsArrayToFloat32ArrayWireframe(tesselatedVertices);
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.bufferIdWireframe );
            this.gl.bufferData( this.gl.ARRAY_BUFFER, floatArray.length * 4, this.gl.STATIC_DRAW );
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, floatArray);
            this.gl.vertexAttribPointer( this.gl.getAttribLocation( this.program, "vPosition" ), 2, this.gl.FLOAT, false, 0, 0 );
            this.gl.enableVertexAttribArray( this.gl.getAttribLocation( this.program, "vPosition" ) );
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "twist"), twistThetaDegrees * 3.14159265359 / 180.0);
            this.gl.uniform2f(this.gl.getUniformLocation(this.program, "twistOrigin"), twistOrigin[0], twistOrigin[1]);
            this.gl.uniform4f(this.gl.getUniformLocation(this.program, "color"), 0.0, 0.0, 1.0, 1.0);
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "pointSize"), 0.0);
            this.gl.uniform1i(this.gl.getUniformLocation(this.program, "useTexture"), 0);
            this.gl.drawArrays( this.gl.LINES, 0, floatArray.length / 2 );
        }
        if(partialTriangle.length > 0) {
            var floatArray = jsArrayToFloat32ArraySolid(partialTriangle);
            this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.bufferIdPartialTriangle );
            this.gl.bufferData( this.gl.ARRAY_BUFFER, floatArray.length * 4, this.gl.STATIC_DRAW );
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, floatArray);
            this.gl.vertexAttribPointer( this.gl.getAttribLocation( this.program, "vPosition" ), 2, this.gl.FLOAT, false, 0, 0 );
            this.gl.enableVertexAttribArray( this.gl.getAttribLocation( this.program, "vPosition" ) );
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "twist"), 0.0);
            this.gl.uniform2f(this.gl.getUniformLocation(this.program, "twistOrigin"), 0.0, 0.0);
            this.gl.uniform4f(this.gl.getUniformLocation(this.program, "color"), 0.0, 0.0, 1.0, 1.0);
            this.gl.uniform1f(this.gl.getUniformLocation(this.program, "pointSize"), 4.0);
            this.gl.uniform1i(this.gl.getUniformLocation(this.program, "useTexture"), 0);
            this.gl.drawArrays( this.gl.POINTS, 0, floatArray.length / 2 );
        }
    }

    var endDime = new Date();
    dataStatistics.renderTime = endDime - startDime;
    dataStatistics.triangleCount = tesselatedVertices.length / 6;
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
