var canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var mouse = { x: 0, y: 0, px: 0, py: 0, influence: 0.09,  down: false };
var unPinned = false;
var pinned = false;
var currentPoint = false;
var gl = undefined;

var accuracy = 25;
var gravity = -0.04;
var damping = 0.99;
var clothX = 15;
var clothY = 15;
var spacing = 0.4 / clothX;
var startY = .95;
var startX = -0.2;
var bounce = .5;