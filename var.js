var canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse = { 
    x: 0, 
    y: 0, 
    px: 0, 
    py: 0, 
    influence: 0.06,  
    down: false 
};

var pinned = false;
var currentPoint = false;
var gl = undefined;
var accuracy = 45;
var gravity = -9.81;
var damping = 0.01;
var clothWidth = 15;
var clothHeight = 15;
var spacing = .4 / clothWidth;
var startY = .95;
var startX = -0.2;
var bounce = .2;
var k = 1.;
var mass = 0.001;

function calculateDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}