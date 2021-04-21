var canvas = document.getElementById('c');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


var mouse = { x: 0, y: 0, down: false };
var unPinned = false;
var pinned = false;
var currentPoint = false;
let gl = undefined;

var accuracy = 5;
var gravity = -0.02;
var damping = 0.99;
let clothX = 20;
let clothY = 15;
let spacing = 0.4 / clothX;
let startY = .95;
let startX = -0.2;
let bounce = .5;

function init() {

    document.onmousemove = e => {
        var rect = canvas.getBoundingClientRect();
        mouse.x = (e.x - rect.left) / canvas.width;
        mouse.y = (canvas.height - (e.y - rect.top)) / canvas.height;
        mouse.x = (mouse.x * 2.0) - 1.0;
        mouse.y = (mouse.y * 2.0) - 1.0;
    }

    document.onmousedown = e => {
        if (e.button == 1) {
            pinned = true;
        }
        if (e.button == 0) {
            mouse.down = true;
        }
        if (e.shiftKey) {
            unPinned = true;
        }
    }

    document.onmouseup = e => {
        currentPoint = false;
        pinned = false;
        unPinned = false;
        mouse.down = false;
    }

    render();
}

window.onload = function() {
    init();
}

function render() {

    cloth.update(0.026);
    cloth.draggedPoints();
    cloth.getColor();

    animate();

    requestAnimFrame(render);
}

cloth = new Cloth();

try {
    gl = canvas.getContext('webgl');

    let EXT = gl.getExtension("OES_element_index_uint") ||
        gl.getExtension("MOZ_OES_element_index_uint") ||
        gl.getExtension("WEBKIT_OES_element_index_uint");

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
} catch (e) {
    console.error("It does not appear your computer can support WebGL.");
}

function CreateViewMatrix(position, direction, up) {
    let f = direction;
    let len = Math.sqrt(f[0] * f[0] + f[1] * f[1] + f[2] * f[2]);
    f = [f[0] / len, f[1] / len, f[2] / len];

    let s = [
        up[1] * f[2] - up[2] * f[1],
        up[2] * f[0] - up[0] * f[2],
        up[0] * f[1] - up[1] * f[0]
    ];

    len = Math.sqrt(s[0] * s[0] + s[1] * s[1] + s[2] * s[2]);

    let s_norm = [
        s[0] / len,
        s[1] / len,
        s[2] / len
    ];

    let u = [
        f[1] * s_norm[2] - f[2] * s_norm[1],
        f[2] * s_norm[0] - f[0] * s_norm[2],
        f[0] * s_norm[1] - f[1] * s_norm[0]
    ];

    let p = [-position[0] * s_norm[0] - position[1] * s_norm[1] - position[2] * s_norm[2], -position[0] * u[0] - position[1] * u[1] - position[2] * u[2], -position[0] * f[0] - position[1] * f[1] - position[2] * f[2]];

    return [
        s_norm[0], u[0], f[0], 0.0,
        s_norm[1], u[1], f[1], 0.0,
        s_norm[2], u[2], f[2], 0.0,
        p[0], p[1], p[2], 1.0
    ];
}

function CreateOrthoMatrix(l, r, b, t, n, f) {
    let result = [];

    result[0] = 2 / (r - l);
    result[1] = 0;
    result[2] = 0;
    result[3] = -(r + l) / (r - l);

    result[4] = 0;
    result[5] = 2 / (t - b);
    result[6] = 0;
    result[7] = -(t + b) / (t - b);

    result[8] = 0;
    result[9] = 0;
    result[10] = -2 / (f - n);
    result[11] = -(f + n) / (f - n);

    result[12] = 0;
    result[13] = 0;
    result[14] = 0;
    result[15] = 1;

    return result;
}

let orthoMatrix = CreateOrthoMatrix(-1.0, 1.0, -1.0, 1.0, 0.1, 1024.0);
var viewMatrix = CreateViewMatrix([0.0, 0.0, 0.0], [0.0, 0.0, 1.0], [0.0, 1.0, 0.0]);
var modelViewMatrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0,
]);

let vertexShader = getShader(gl.VERTEX_SHADER, "vertex")
let fragmentShader = getShader(gl.FRAGMENT_SHADER, "fragment");

let program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
}

gl.useProgram(program);

let orthoMatrixID = gl.getUniformLocation(program, "u_ortho");
let modelMatrixID = gl.getUniformLocation(program, "u_model");
let viewMatrixID = gl.getUniformLocation(program, "u_view");
let timeID = gl.getUniformLocation(program, "u_time");
let resolutionID = gl.getUniformLocation(program, "u_resolution");
let a_PostionID = gl.getAttribLocation(program, "a_position");

let indicesbuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesbuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cloth.indices, gl.STATIC_DRAW);

gl.uniform2f(resolutionID, canvas.width, canvas.height);
gl.uniformMatrix4fv(orthoMatrixID, false, orthoMatrix);
gl.uniformMatrix4fv(viewMatrixID, false, viewMatrix);
gl.uniformMatrix4fv(modelMatrixID, false, modelViewMatrix);


let loadTime = Date.now();
let lastTime = loadTime;
let nbFrames = 0;
let vertexbuffer = gl.createBuffer();

let render_mode = gl.TRIANGLES;

function animate() {
    let currentTime = Date.now();
    nbFrames++;
    if (currentTime - lastTime >= 1000.0) {
        console.log(1000.0 / nbFrames + " ms/frame");
        nbFrames = 0;
        lastTime += 1000.0;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1st attribute buffer : vertices
    gl.enableVertexAttribArray(a_PostionID);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cloth.vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_PostionID, 3, gl.FLOAT, false, 0, 0);

    gl.uniform1f(timeID, (currentTime - loadTime) / 1000.0);
    gl.drawElements(render_mode, cloth.indices.length, gl.UNSIGNED_INT, 0);

    gl.flush();
}

function getShader(type, id) {
    var source = document.getElementById(id);
    var shaderText = source.textContent || source.innerText;

    let shader = gl.createShader(type);
    gl.shaderSource(shader, shaderText);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Error compile shader programm " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}