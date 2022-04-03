"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var colorsArray = [];

var morning = true;

//SEH Coordinates from previous assignment, scaled to fit clipping plane
var vertices = [
    vec4( -0.70 , -0.37,  0.48, 1.0 ),
    vec4( -0.70,  0.37,  0.48,  1.0 ),
    vec4(  0.70 ,  0.37,  0.48, 1.0 ),
    vec4(  0.70 , -0.37,  0.48, 1.0 ),
    vec4( -0.70, -0.37, -0.48, 1.0 ),
    vec4( -0.70,  0.37, -0.48, 1.0 ),
    vec4(  0.70 ,  0.37, -0.48, 1.0 ),
    vec4(  0.70 , -0.37, -0.48, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
];

//essential lighting and viewing variables
var ambientColor, diffuseColor, specularColor;

var near = 0.3;
var far = 3.0;
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var modelView, projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function quad(a, b, c, d) {
    //smooth out the sides to avoid having visable triangles
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

     pointsArray.push(vertices[a]);
     colorsArray.push(normal);
     pointsArray.push(vertices[b]);
     colorsArray.push(normal);
     pointsArray.push(vertices[c]);
     colorsArray.push(normal);
     pointsArray.push(vertices[a]);
     colorsArray.push(normal);
     pointsArray.push(vertices[c]);
     colorsArray.push(normal);
     pointsArray.push(vertices[d]);
     colorsArray.push(normal);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    //lighting assignment
    var lightPosition, lightAmbient, lightDiffuse, lightSpecular
    var materialAmbient, materialDiffuse, materialSpecular, materialShininess

    //lighting for the morning. Sun faces the right face of the building (east)
    //color illuminates with more yellow/brighter 
    if (morning) {
        lightPosition = vec4(1.0, -0.5, 3.0, 0.0 );
        lightAmbient = vec4(0.2, 0.2, 0.4, 1.0 );
        lightDiffuse = vec4( 1.0, 1.4, 1.0, 1.0 );
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 0.8 , 0.0, 1.0);
        materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
        materialShininess = 100.0;
    }
    //lighting for the evening. Sun faces the left face of the building (west)
    //color illuminates with more orange/darker
    else {
        lightPosition = vec4(-1.0, -0.5, 7.0, 0.0 );
        lightAmbient = vec4(0.2, 0.2, 0.3, 1.0 );
        lightDiffuse = vec4( 1.0, 1.1 , 1.0, 1.0 );
        lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
        materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
        materialShininess = 100.0;
    }

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelView = gl.getUniformLocation( program, "modelViewMatrix" );
    projection = gl.getUniformLocation( program, "projectionMatrix" );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);


    //buttons for switching from evening to morning
    document.getElementById("Button0").onclick = function() {
        morning = true;
        init();
    }

    //buttons for switching from morning to evening
    document.getElementById("Button1").onclick = function() {
        morning = false;
        init();
    }

    render();
}


var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //decrease object radius to 2 to fit inside view. Adjust theta to -45 to view at desired angle. Increase phi to 2(dr) to give ground level apperance
    mvMatrix = lookAt(vec3(2*Math.sin(-45)*Math.cos(2*dr), 2*Math.sin(-45)*Math.sin(2*dr), 2*Math.cos(-45)), at, up);
    pMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    requestAnimFrame(render);
}

