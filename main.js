function init() {
   
    document.onmousemove = e => {
        let rect = canvas.getBoundingClientRect();  
        mouse.px = mouse.x;
        mouse.py = mouse.y;   
        mouse.x = (e.x - rect.left);
        mouse.y = (e.y - rect.top) ;
        mouse.x = -1. + 2. * mouse.x / canvas.width;
        mouse.y =  1. - 2. * mouse.y / canvas.height;
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

    animate();
}

cloth = new Cloth();

try {
    gl = canvas.getContext('webgl');
    let EXT = gl.getExtension("OES_element_index_uint") ||
        gl.getExtension("MOZ_OES_element_index_uint") ||
        gl.getExtension("WEBKIT_OES_element_index_uint") ||
        //gl.getExtension('WEBGL_multi_draw');

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
} catch (e) {
    console.error("It does not appear your computer can support WebGL.");
}

let vertexShader = getShader(gl.VERTEX_SHADER, "vertex")
let fragmentShader = getShader(gl.FRAGMENT_SHADER, "fragment");

let program = initShaderProgram(vertexShader, fragmentShader);

gl.useProgram(program);

let indicesbuffer = gl.createBuffer();
let vertexbuffer = gl.createBuffer();
let colorBuffer = gl.createBuffer();

let a_PostionID = gl.getAttribLocation(program, "a_position");
let colorID = gl.getAttribLocation(program, "a_color");
let timeID = gl.getUniformLocation(program, "u_time");

initUniformParams();

let loadTime = Date.now();
let lastTime = loadTime;
let nbFrames = 0;

let render_mode = gl.LINES;

document.addEventListener("keypress", function (key) {
    if (key.key == 'w') {
        render_mode = render_mode == gl.LINES ? gl.POINT : gl.LINES;
    } else if (key.key == 'g') {
        gravity = gravity ? 0 : -0.04;
    } else if (key.key == 'r') {
        cloth = new Cloth();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesbuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cloth.indices, gl.STATIC_DRAW);
    }
});

function render() {
    let currentTime = Date.now();
    nbFrames++;
    if (currentTime - lastTime >= 1000.0) {
        console.log(1000.0 / nbFrames + " ms/frame");
        nbFrames = 0;
        lastTime += 1000.0;
    }


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    initVertexBuffer(a_PostionID, vertexbuffer, cloth.vertices);
    
    initIndicesBuffer(render_mode, indicesbuffer, cloth.indices);

    gl.uniform1f(timeID, (currentTime - loadTime) / 1000.0);
    
    gl.flush();
}

function animate() {

    cloth.update(0.055);
    cloth.mousePressed();
    cloth.getColor();
    cloth.draggedPoint();

    render();

    requestAnimFrame(animate);
}

window.onload = function() {

    init();
}