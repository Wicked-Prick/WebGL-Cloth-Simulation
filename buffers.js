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

    let p = [-position[0] * s_norm[0] - position[1] * s_norm[1] - position[2] * s_norm[2], 
             -position[0] * u[0] - position[1] * u[1] - position[2] * u[2], 
             -position[0] * f[0] - position[1] * f[1] - position[2] * f[2]];

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

function initUniformParams(){
    let orthoMatrixID = gl.getUniformLocation(program, "u_ortho");
    let modelMatrixID = gl.getUniformLocation(program, "u_model");
    let viewMatrixID = gl.getUniformLocation(program, "u_view");
    let resolutionID = gl.getUniformLocation(program, "u_resolution");
    
    gl.uniform2f(resolutionID, canvas.width, canvas.height);
    gl.uniformMatrix4fv(orthoMatrixID, false, orthoMatrix);
    gl.uniformMatrix4fv(viewMatrixID, false, viewMatrix);
    gl.uniformMatrix4fv(modelMatrixID, false, modelViewMatrix);
}

function initShaderProgram(vShader, fShader){
    let prog = gl.createProgram();
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);

    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    return prog;
}

function initIndicesBuffer(mode, buffer, indices){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.drawElements(mode, indices.length, gl.UNSIGNED_INT, 0);
}

function initColorBuffer(attribute, buffer, colors){
    gl.enableVertexAttribArray(attribute);  
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
}

function initVertexBuffer(attribute, buffer, vertices){
    gl.enableVertexAttribArray(attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
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