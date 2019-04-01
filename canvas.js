

var player = {
    x : 400,
    y : 400,
    speed : 50,
    colliding : false,

    toString : function () {
        return "( " + this.x + ", "  + this.y + " )";
    }
}

/*
    @members:
        - move : player's movement vector
            - x : x component of players movement vector
            - y : y component of player's movement vector

        - mag : magnitude of player's movement vector
        - unit : normalised movement vector

        - rSp : 1/(rate at which player turns)

 */
var vector = {
    move : {
        x : 100,
        y : 100,

        mag : (Math.sqrt(
            (this.x * this.x)
            + (this.y * this.y))),
        unit : unitVector([this.x, this.y]),


        rSpd : 50
    }
}

/*
    projectile object prototype
    has instantiation location, direction & speed

    needs size & shape data for collision detection.

 */
function Projectile(speed, dirX, dirY)  {

    this.x = player.x;
    this.y = player.y;

    this.size = 10;

    this.direction = {
        x : 0,
        y : 0,
        toString : function() {
            return " x: " + this.x + " y: " + this.y;
        }
    };

    this.direction.x = dirX;
    this.direction.y = dirY;

    this.speed = speed;

    this.vector = (dirX, dirY) * this.speed;
    this.lifetime = 3;

    this.toString = function() {
        return "speed: " + this.speed + " Dir: " + this.direction;
    }
}

var projectiles = [];

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


    let kc = e.keyCode;

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

        if (event.keyCode == 66) {
            shoot();
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




    projectileMechanics();

    input();
    boundsCheck();
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



    drawEnemy();

    drawProjectile();

    //myDebug();

}

function drawPlayer() {

    ctx.beginPath();
    ctx.arc(player.x, player.y, 100, 0,2 * Math.PI);
    ctx.fillStyle = '#739cff';
    ctx.fill();
    ctx.closePath();

}
function drawVector() {

    let  uVec = unitVector([vector.move.x, vector.move.y]);

    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "red";

    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + (uVec[0] * 100), player.y + (uVec[1] * 100));
    ctx.stroke();
    ctx.closePath();

}

function drawEnemy() {
    ctx.beginPath();
    ctx.arc(3000, 3000, 200, 0,(2 * Math.PI) - Math.PI/2.2);
    ctx.strokeStyle = 'darkslategrey';
    ctx.lineWidth = 100;
    ctx.stroke();
    ctx.closePath();
}


function drawProjectile () {
    projectiles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y,   p.size * 2, 0, 2 * Math.PI);
        ctx.fillstyle = '#71771d';
        ctx.fill();
        ctx.closePath();
    });
}

function myDebug() {

    // Draw the normalized direction vector.
    let movementVec = unitVector([vector.move.x, vector.move.y]).toString();
    let playerPos = player.toString();


    // drawing code
    ctx.font = "100px monospace";

    ctx.fillText(movementVec, 3000, 150);
    ctx.fillText(playerPos, 3000, 300);

}


function shoot() {

    const bulletDirX = vector.move.x;
    const bulletDirY = vector.move.y;

    let bullet = new Projectile(100, bulletDirX, bulletDirY);



    projectiles[projectiles.length] = bullet;

    //alert ("shooting " + projectiles[projectiles.length-1].toString());

}

/******** REGIONS ********/

/*
*
*   TODO: Figure out why the vector decreases in magnitude as I turn.
*       ie - if it were a clock, the hands would be getting shorter.
*
 */


//region Physics
function boundsCheck() {


    if (player.x > 5000) {
        player.x = 0;
        return;
    }

    if (player.x < 0) {
        player.x = 5000;
        return;
    }

    if (player.y < 0) {
        player.y = 5000;
        return;
    }

    if (player.y  > 5000) {
        player.y = 0;
        return;
    }

}

// Code for reading user input through keydown events
function input() {

    if (keys.up) {

        // unit vector
        let uVec = unitVector([vector.move.x, vector.move.y]);

        // forward
        player.x += Math.round(uVec[0] * player.speed);
        player.y += Math.round(uVec[1] * player.speed);



    }
    if (keys.down) {

        let uVec = unitVector([vector.move.x, vector.move.y]);

        // reverse
        player.x -= Math.round(uVec[0] * player.speed);
        player.y -= Math.round(uVec[1] * player.speed);


    }
    if (keys.left) {
        //rotate counterclockwise
        vector.move.x = (
            vector.move.x * Math.cos(Math.PI/vector.move.rSpd)
            + vector.move.y * Math.sin(Math.PI/vector.move.rSpd)
        );

        vector.move.y = (
            vector.move.y * Math.cos(Math.PI/vector.move.rSpd)
            - vector.move.x * Math.sin(Math.PI/vector.move.rSpd)
        );


    }
    if (keys.right) {
        /* rotate clockwise
         * Somethings changing the length of the vector ?????
         */
        vector.move.x = (
            vector.move.x * Math.cos(3.14/vector.move.rSpd)
            - vector.move.y * Math.sin(3.14/vector.move.rSpd)
        );

        vector.move.y = (
            vector.move.y * Math.cos(Math.PI/vector.move.rSpd)
            + vector.move.x * Math.sin(Math.PI/vector.move.rSpd)
        );
    }
}

//function for layer based collision detection
function collisionCheck() {

}

// Code for propagating all the projectiles
function projectileMechanics() {
    projectiles.forEach(function(p)
    {
        const uVec = unitVector([p.direction.x, p.direction.y]);

        p.x += uVec[0] * (7 * p.speed/8);
        p.y += uVec[1] * (7 * p.speed/8);

        p.size += 2;
    });
}
//endregion

//region vectors
 /*
@returns a 2d point to point vector
Finding the direction vector to give the chaser
a movement direction, towards the player's
current location.
*/
function directionVector(x, y, a, b) {

    var Vdx = a - x;
    var Vdy = b - y;

    return [Vdx, Vdy];
}

/*  @return unit vector from origin to [x,y]
 * Finding unit vector to scale the direction
 * vector by a given speed. Accepts an array to
 * suit the output of the direction vector method.
 *
 */
function unitVector(x) {

    var i = x[0]*10;
    var j = x[1]*10;

    var mag =  Math.sqrt((i*i) + (j*j));

    return [i/mag, j/mag];
}
//endregion