

var player = {
    x : 400,
    y : 400,
    speed : 30,
    colliding : false
}

var vector = {
    move : {
        x : 100,
        y : 100,
        mag : 1 //use unit vector here
    }
}

var world = {
    acceleration: 2,
    maxSpeed: 10
}

var ctx, stopGame;

var keys = {};

var dir;

// Making sure the page is set up correctly before the game starts.
window.onload = setup;

/*  Using onkey instead of new event handling to allow
 *  simultaneous movement across 2 dimensions.
 *
 *  Changes keys boolean values to true/false,
 *  the values are then accessed in the update
 *  and player moves accordingly.
 */
window.onkeydown = function(e) {

    var kc = e.keyCode;

    if (kc === 65) {
        keys.left = true;
    }
    if (kc === 68) {
        keys.right = true;
    }

    if (kc === 87) {
        keys.up = true;
    }

    if (kc === 83) {
        keys.down = true;
    }
}
window.onkeyup = function(e) {


    var kc = e.keyCode;

    if(kc === 65) {
        keys.left = false;
    }
    if(kc === 68) {
        keys.right = false;
    }

    if (kc === 87) {
        keys.up = false;
    }

    if (kc === 83) {
        keys.down = false;
    }

}


// couple the game loop to the browser event loop
window.main = function () {
    stopGame = window.requestAnimationFrame(main);


    update();
    render();
}


// setup method to load everything sequentially before the game starts.
function setup() {
    ctx = document.getElementById('canvas').getContext('2d');

    keys = {
        up: false,
        down: false,
        left: false,
        right: false
    }

    player.x = 500;
    player.y = 800;


    acceleration = 1;
    maxSpeed = 12;

    dir = directionVector( player.x, player.y, vector.move.x, vector.move.y);

    // Spacebar closes the program,
    // stops the browser event loop calling main().
    document.addEventListener('keydown', function(event) {

        if (event.keyCode == 32) {
            clCanvas();
            window.cancelAnimationFrame(stopGame);
        }
    });


    // Game loop
    main();

}

function update() {
    //console.log('update');

    /*  See lines 31, 51 for keys.direction use
     *
     *  If player goes out of bounds,
     *  snake style teleportation to the other side of the canvas.
     *  -   Adds an avoidance mechanic as the chaser
     *      is faster than the player.
     *  -   Removed that mechanic - Bigger chaser for level two
     */

    /*
    if (!keys.up
        && !keys.down
        && !keys.right
        && !keys.left) {
        player.speed = 20;
    }
`*/

    if (keys.up) {
        player.y -= player.speed;

        if (player.y < -80) {
            player.y = 5000;
        }
    }

    if (keys.down) {

        player.y += player.speed;

        if (player.y > 5000) {
            player.y = 0;
        }
    }

    if (keys.left) {
        player.x -= player.speed;

        if (player.x < 0) {
            player.x = 5000;
        }
    }

    if (keys.right) {
        player.x += player.speed;

        if (player.x > 5000) {
            player.x = -100;
        }
    }
}

function render () {

    // clear and draw the canvas - coupled to the rate at
    // which the browser can push frames.
    clCanvas();
    draw();
}

function clCanvas() {

    ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0, 0, 6000, 6000);

}

function draw() {

    ctx = document.getElementById('canvas').getContext('2d');
    ctx.save();

    drawPlayer();
    drawVector();

    //myDebug();

}

function drawPlayer() {

    ctx.beginPath();
    ctx.arc(player.x, player.y, 100, 0,2 * Math.PI);
    ctx.fillStyle = '#739cff';
    ctx.fill();

}

function drawVector() {

    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "red";

    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + vector.move.x, player.y + vector.move.y);
    ctx.stroke();

}

function calculateMoveVector() {


}

/*
    Finding the direction vector to give the chaser
    a movement direction, towards the player's
    current location.

 */
function directionVector(x, y, a, b) {

    var Vdx = a - x;
    var Vdy = b - y;

    return [Vdx, Vdy];
}

/* Finding unit vector to scale the direction
 * vector by a given speed. Accepts an array to
 * suit the output of the direction vector method.
 *
 *  The vector is rounded because when travelling
 *  diagonally the unit vector becomes a fraction.
 *
 *  TODO -NOTE-
 *      Remember that the unit vector is rounded,
 *      it may be something that works itself out
 *     when more math is applied.
 */
function unitVector(x) {

    var i = x[0];
    var j = x[1];

    var mag =  Math.sqrt((i*i) + (j*j));

    return [Math.round(i/mag), Math.round(j/mag)];
}

/*
function myDebug() {
    // Draw the normalized direction vector.
    var dirStr = unitVector(directionVector(chX + chW/2, chY + chH/2, plX, player)).toString();
    ctx. fillText(dirStr, 4000, 150);
} */

/*
*   TODO: Get vector to rotate around player based on arrow keys
*   TODO: Get Player to move one vector magnitude per frame in vector direction.
*
*
 */