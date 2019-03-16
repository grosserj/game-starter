//
// 1. GLOBAL VARIABLES
// -------------------------------------------------------
// These variables are "global" meaning they can be used in all code
// 

// The "canvas" is used to draw basic shapes
let canvas: CanvasRenderingContext2D;

// This contains the dimensions of the canvas. The dimensions are fixed.
let canvasRect: { left: number, top: number, width: number, height: number };

//
// 2. SETUP
// -------------------------------------------------------
// This code initializes the globals and registers the main game functions.
//

// The "main" function that is the first code that runs once the page loads
// This function bootstraps the rest of the program
function main() {
    console.log("Hello, world!")

    // Get a hold of the HTML "canvas" element and save it to the "canvas" global variable
    let canvasEl = document.getElementById("game-canvas") as HTMLCanvasElement;
    canvas = canvasEl.getContext('2d')!;
    canvasRect = canvasEl.getBoundingClientRect()
    console.log(`Canvas rectangle: ${[canvasRect.left, canvasRect.top, canvasRect.width, canvasRect.height]}`)
    
    document.body.style.backgroundColor = "grey"

    // We register a function, "onKeyDown", that will be called any time a key
    // is pressed down
    window.addEventListener('keydown', function (event: KeyboardEvent) {
        onKeyDown(event.keyCode);
    }, false);

    // Likewise we register the "onClick" function to be invoked whenever the left
    // mouse button is pressed on the webpage
    window.addEventListener("dblclick", function (event: MouseEvent) {
        onClick(event.offsetX, event.offsetY);
    });

    // Game loop setup.
    // Description TBD. The important thing is that "gameUpdate" function will be
    // called every 10 milliseconds.
    let gameLoopReg: number = 0;
    let gameLastTick: number = performance.now();
    let gameTickLength: number = 10/*ms*/;
    let gameLoop = function (timeMs: number/*FYI it's a decimal*/) {
        gameLoopReg = window.requestAnimationFrame(gameLoop);
        let nextTick = gameLastTick + gameTickLength;
        let numTicks = 0;

        if (timeMs > nextTick) {
            let timeSinceTick = timeMs - gameLastTick;
            numTicks = Math.floor(timeSinceTick / gameTickLength);
            gameLastTick += numTicks * gameTickLength;
        }

        gameUpdate(numTicks);

    };
    gameLoop(gameLastTick);



}

// This says: once the webpage is fully loaded, run the main() function
document.addEventListener("DOMContentLoaded", () => main(), false);

//
// 3. THE GAME
// -------------------------------------------------------
// The "game" consists of a green box that is the "player"
// and many red boxes that are "foes"
// The player can be moved with the arrow keys
// Foes can be spawned by clicking
// That's it!
//

// an object describing the "player"
// - the player has an x, y position
let player = { x: 13, y: 104, width: 40, height: 40, dx:0, dy:0, yOLD:0, xOLD:0, fuel: 100};

// list of objects that each describe a "foe"
// - each foe has an x, y position
let foes: { x: number, y: number, hitPoints: number}[] = [];

//ticks consistent time step scale thing
function gameUpdate(ticks: number) {
    // Reset the canvas
    canvas.clearRect(0, 0, canvasRect.width, canvasRect.height)

    //draw map border
    canvas.beginPath();
    canvas.lineWidth = 5;
    canvas.strokeStyle = "black";
    canvas.rect(canvasRect.left, canvasRect.top, canvasRect.width, canvasRect.height);
    canvas.stroke();

    // Draw the "player" box
    canvas.fillStyle = "green"
    canvas.fillRect(player.x, player.y, player.width, player.height)
    // Draw a "P" for the player
    canvas.fillStyle = "black"
    canvas.font = "2em Monaco";
    canvas.textBaseline = "middle";
    canvas.fillText("P", player.x + 11, player.y + 20)


    // Draw player's fuel
    canvas.font = ".9em Monaco";
    canvas.textBaseline = "middle";
    canvas.fillStyle = "white";
    canvas.fillText('Fuel: ' + player.fuel.toString(), canvasRect.width - 80, 35);

    // Draw all foes as red boxes
    canvas.fillStyle = "red"
    for (let foe of foes) {
        canvas.fillRect(foe.x, foe.y, 10, 10)
        //canvas.fillRect(foe.x, foe.y, -10, -10) //health bar
    }

    playerMove();
   // console.log(player.dy)
}

function onClick(x: number, y: number) {
    console.log(`Click! (${x}, ${y})`)

    // Create a foe at the location we click
    let newFoe = { x: x, y: y, hitPoints: 5 }
    // Add it to the list of foes
    foes.push(newFoe)
}


function onKeyDown(keycode: number) {
    // see: https://keycode.info/ to understand keycodes
   // console.log(`Press! (${keycode})`)
    console.log(player.fuel)
    if (player.fuel > 0) {
        // Move the player with the arrow keys
        if (keycode == 39 /*right*/) {
            player.dx += 1
            player.fuel -= 1
        } else if (keycode == 37 /*left*/) {
            player.dx -= 1
            player.fuel -= 1
        } else if (keycode == 40 /*down*/) {
            player.dy += 1
            player.fuel -= 1
        } else if (keycode == 38 /*up*/) {
            player.dy -= 1
            player.fuel -= 1
        }
    }

}

function playerMove() {
   
    //Right
    if (player.x + player.width < canvasRect.width - canvas.lineWidth && player.dx > 0) {
    player.x += player.dx;     
    }
    else if (player.x + player.width >= canvasRect.width - canvas.lineWidth){
        player.x = canvasRect.width  - canvas.lineWidth - player.width
    }
    //left
    if (player.x > canvasRect.left + canvas.lineWidth && player.dx < 0) {
        player.x += player.dx;
        }
    else if (player.x <= canvasRect.left + canvas.lineWidth) {
        player.x = canvasRect.left  + canvas.lineWidth
    }
    //down
    if (player.y + player.height < canvasRect.height - canvas.lineWidth && player.dy > 0) {
        player.y += player.dy;     
        }
    else if (player.y + player.height >= canvasRect.height - canvas.lineWidth){
        player.y = canvasRect.height - canvas.lineWidth - player.height -0; //sets position to bottom of canvas
        player.dx = 0; 
    }

    //up
    if (player.y > canvasRect.top + canvas.lineWidth && player.dy < 0) {
        player.y += player.dy;
        }
    else if (player.y <= canvasRect.top + canvas.lineWidth) {
        player.y = canvasRect.top  + canvas.lineWidth;
        player.dy = 0;
    }
    
    //downward force
    if (player.y + player.height < canvasRect.height - canvas.lineWidth && player.dy < 3) {
        
        player.dy += .01;
        player.y += player.dy;
    }

    //check if y position has changed from last frame
    //this section is used to set dx || dy to zero when player is against a wall
    //otherwise player dy can keep growing and needs to have opposite input to get back off of the wall
    if (player.yOLD === player.y) {
        player.dy = 0;
    }
    if (player.xOLD === player.x) {
        player.dx = 0;
    }
    player.yOLD = player.y;
    player.xOLD = player.x;
}














