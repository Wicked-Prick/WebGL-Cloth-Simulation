var canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse = { x: 0, y: 0, px: 0, py: 0, influence: 0.06,  down: false };
var unPinned = false;
var pinned = false;
var currentPoint = false;
var gl = undefined;

var accuracy = 45;
var gravity = -9.81;
var damping = 0.01;
var clothX = 15;
var clothY = 15;
var spacing = .4 / clothX;
var startY = .95;
var startX = -0.2;
var bounce = .2;
var k = 1.;
var mass = 0.001;

