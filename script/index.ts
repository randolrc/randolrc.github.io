let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let grid = [];
let gridSize = 100;
let widthHeight = 5;

let blockTimer = 100;
let newWaterTimer = 10;

let valley = 0;
let valleyMoveRate = 1;
let valleyTimer = 100;

window.onload = init;

function init(){
    canvas = document.getElementById("foo") as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.canvas.width  = gridSize * widthHeight; // window.innerWidth;
    ctx.canvas.height = gridSize * widthHeight; //window.innerHeight;

    let rR:number;
    let rB:number;
    let rG:number;

    let index = 0;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            
            rR = 0;
            rB = 0;
            rG = getRandomInt(150, 100);

            grid[index] = new Rect(index, x * widthHeight, y * widthHeight, rR, rG, rB);
            //grid[index] = new Rectangle(x * widthHeight, y * widthHeight, new Color(rR, rG, rB));
            index++;
        }  
    }

    index = 0;
    grid.forEach((rectangle) => {   

        let nCount = 0;
        for (let i = 0; i < grid.length; i++) {
            if (i != index) {
                if (grid[i].x === rectangle.x + widthHeight && grid[i].y === rectangle.y) { //east
                    rectangle.e = i;
                    nCount++;  
                } else  if (grid[i].y === rectangle.y && grid[i].x === rectangle.x - widthHeight) { //west
                    rectangle.w = i;
                    nCount++;
                } else  if (grid[i].x === rectangle.x && grid[i].y === rectangle.y - widthHeight) { //north
                    rectangle.n = i;
                    nCount++;
                } else  if (grid[i].x === rectangle.x && grid[i].y === rectangle.y + widthHeight) { //south
                    rectangle.s = i;
                    nCount++;
                } else if (grid[i].x === rectangle.x + widthHeight && grid[i].y === rectangle.y - widthHeight) { //NE
                    rectangle.ne = i;
                    nCount++;  
                } else if (grid[i].x === rectangle.x - widthHeight && grid[i].y === rectangle.y - widthHeight) { //NW
                    rectangle.nw = i;
                    nCount++;  
                } else if (grid[i].x === rectangle.x - widthHeight && grid[i].y === rectangle.y + widthHeight) { //SW
                    rectangle.sw = i;
                    nCount++;  
                } else if (grid[i].x === rectangle.x + widthHeight && grid[i].y === rectangle.y + widthHeight) { //SE
                    rectangle.se = i;
                    nCount++;  
                }

                if (nCount >= 8) {
                    break;
                }
            }
            
        }

        index++;
    });


    for (let i=0; i < 1; i++) {
        newRandomWaterFill();
    }  

    
    for (let i=0; i < 10; i++) {
        let rand = getRandomInt(grid.length- 1);
        grid[rand].whatAmI = "flower";
        grid[rand].fadeIn = true;
        let rect = grid[rand];

        if (rect.ne != -1 && grid[rect.ne].whatAmI === 'grass') {
            grid[rect.ne].whatAmI = 'flower';
            grid[rect.ne].red = 50;
        }

        if (rect.se != -1 && grid[rect.se].whatAmI === 'grass') {
            grid[rect.se].whatAmI = 'flower';
            grid[rect.se].red = 50;
        }

        if (rect.sw != -1 && grid[rect.sw].whatAmI === 'grass') {
            grid[rect.sw].whatAmI = 'flower';
            grid[rect.sw].red = 50;
        }

        if (rect.nw != -1 && grid[rect.nw].whatAmI === 'grass') {
            grid[rect.nw].whatAmI = 'flower';
            grid[rect.nw].red = 50;
        }
    } 
    

    // Start the first frame request
    //window.requestAnimationFrame(gameLoop);
    setInterval(gameLoop, 1 * 100);
}

class Rect {
    index: number;

    red: number;
    green: number;
    blue: number;

    x: number;
    y: number;

    n: number;
    s: number;
    e: number;
    w: number;

    ne: number;
    se: number;
    sw: number;
    nw: number;

    fadeInOut: boolean;
    fadeOut: boolean;
    fadeIn: boolean;

    whatAmI: string;

    move: boolean;
    direction: string;

    waitTimer: number;

    constructor(index: number, x: number, y:number, r: number, g: number, b: number) {
        this.index = index;
        
        this.x = x;
        this.y = y;
        this.red = r;
        this.green = g;
        this.blue = b;

        this.n = -1;
        this.s = -1;
        this.e = -1;
        this.w = -1;
        this.ne = -1;
        this.nw -1;
        this.se = -1;
        this.sw = -1;

        this.fadeInOut = true;
        this.fadeOut = false;
        this.fadeIn = false;

        this.whatAmI = "grass";

        //bug
        this.move = false;
        this.direction = "se";
        this.waitTimer = 0;
    }

    directionFromString(dir: string) {
        switch (dir) {
            case 'n':
                return this.n;
            case 'ne':
                return this.ne;
            case 'e':
                return this.e;
            case 'se':
                return this.se;
            case 's':
                return this.s;
            case 'sw':
                return this.sw; 
            case 'w':
                return this.w; 
            case 'nw':
                return this.nw; 
        }
    }
}

function newRandomWaterFill() {
    let rand = getRandomInt(grid.length- 1);
    grid[rand].whatAmI = "waterFill";
    grid[rand].fadeIn = true;
}

function getRandomNeighborRect(r: Rect) {
    const n = 0;
    const ne = 1;
    const e = 2;
    const se = 3;
    const s = 4;
    const sw = 5;
    const w = 6;
    const nw = 7; 

    let num = getRandomInt(7);
    const northern = [n, ne, nw];
    const western = [nw, w, sw];
    const southern = [se, s, sw];
    const eastern = [se, e, ne];

    if (r.y === 0 && northern.includes(num)) {
        num = s;
    }

    if (r.x === 0 && western.includes(num)) {
        num = e;
    }

    if (r.x === (widthHeight * gridSize) - widthHeight  && eastern.includes(num)) {
        num = w;
    }

    if (r.y === (widthHeight * gridSize) - widthHeight && southern.includes(num)) {
        num = n;
    }

    switch (num) {
        case n:
            return r.n;
        case ne:
            return r.ne;
        case e:
            return r.e;
        case se:
            return r.se;
        case s:
            return r.s;
        case sw:
            return r.sw; 
        case w:
            return r.w; 
        case nw:
            return r.nw; 
    }
}

function randomChooser(array: []) {
    return array[getRandomInt(array.length - 1)];
}

function getRandomInt(max: number, min = 0) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getClampedXValue(r: Rect, clamp: number, original: number, xMult: number) {
    if (r.x >= valley - (widthHeight * xMult) && r.x <= valley + (widthHeight * xMult) ) {
        return clamp;
    } else {
        return original;
    }
}

function gameLoop(timeStamp) {
    update();
    draw();

    //console.log(grid[0]);

    // Keep requesting new frames
    //window.requestAnimationFrame(gameLoop);
}

function update() {
    grid.forEach((r) => { 
        if (r.whatAmI === "grass") {
            let minGreen = 125;
            let maxGreen = 150;

            
            minGreen = getClampedXValue(r, 120, minGreen, 4);
            maxGreen = getClampedXValue(r, 145, maxGreen, 4);

            minGreen = getClampedXValue(r, 115, minGreen, 2);
            maxGreen = getClampedXValue(r, 140, maxGreen, 2);


            /*
            if (r.x >= valley - (widthHeight * 4) && r.x <= valley + (widthHeight * 4) ) {
                minGreen = 120;
                maxGreen = 145;
            }

            if (r.x >= valley - (widthHeight * 2) && r.x <= valley + (widthHeight * 2) ) {
                minGreen = 115;
                maxGreen = 140;
            }
            */

            if (r.fadeInOut) {
                if (r.green + 1 < maxGreen) {
                    r.green++;
                } else {
                    r.fadeInOut = false;
                }
            } else {
                if (r.green - 1 > minGreen) {
                    r.green--;
                } else {
                    r.fadeInOut = true;
                }
            }

            if (r.blue > 0) {

                let rate = getClampedXValue(r, 5, 1, 1);

                r.blue -= rate;
            }
            if (r.red > 0) {

                let rate = getClampedXValue(r, 5, 1, 1);

                r.red -= rate;
            }
        } else if (r.whatAmI === "waterFill") {
            if (r.move) {

                let next = grid[getRandomNeighborRect(r)];

                if (next.whatAmI === "grass") {
                    next.whatAmI = "waterFill";
                    next.fadeIn = true;
                } else if (next.whatAmI === "water") {
                    next.whatAmI = "waterFill";
                    next.move = true;
                }

                next = grid[getRandomNeighborRect(r)];

                if (next.whatAmI === "grass") {
                    next.whatAmI = "water";
                    next.fadeInOut = true;
                    next.waitTimer = 300;
                }

                next = grid[getRandomNeighborRect(r)];

                if (next.whatAmI === "grass") {
                    next.whatAmI = "water";
                    next.fadeInOut = true;
                    next.waitTimer = 300;
                }

                r.whatAmI = "water";
                r.fadeInOut = true;
                r.move = false;
                r.waitTimer = 300;        
                
            } else  if (r.fadeIn) {
                if (r.blue + 25 < 250) {
                    r.blue += 25;

                    if (r.blue >= 25) {
                        r.move = true;
                    }
                } else {
                    //r.fadeIn = false;
                    //r.move = true;
                }  
            }
        } else if (r.whatAmI === "water") {

            let min = 150;
            let max = 250;

            min = getClampedXValue(r, 100, min, 2);
            max = getClampedXValue(r, 200, max, 2);

            if (r.fadeInOut) {
                if (r.blue + 25 < max) {
                    r.blue += 25;
                } else {
                    r.fadeInOut = false;
                }
            } else {
                if (r.blue - 25 > min) {
                    r.blue -= 25;
                } else {
                    r.fadeInOut = true;
                }
            }

            if (r.waitTimer > 0) {
                r.waitTimer--;
            } else {
                r.fadeInOut = false;
                r.whatAmI = "block";
                r.waitTimer = 100;
            }
            
        } else if (r.whatAmI === "block") {

            if (r.blue > 0) {
                r.blue--;
            }

            if (r.green > 0) {
                r.green--;
            }

            if (r.waitTimer > 0) {
                r.waitTimer--;
            } else {
                r.whatAmI = 'dirt';
                r.fadeInOut = false;
                r.waitTimer = 250;
            } 

            let min = 100;
            let max = 250;
            let fadeRate = 5;

            min = getClampedXValue(r, 50, min, 2);
            max = getClampedXValue(r, 200, max, 2);

            if (r.fadeIn) {
                if (r.red + fadeRate < max) {
                    r.red += fadeRate;

                } else {
                    //r.red = max;
                    r.fadeIn = false;
                }
            } else {
                if (r.red - fadeRate > min) {
                    r.red -= fadeRate;
                } else {
                    //r.red = min;
                    r.fadeIn = true;
                    //r.whatAmI = 'grass';
                }
            }
        } else if (r.whatAmI === 'dirt') {

            if (!r.fadeInOut) {
                if (r.red > 200) {
                    r.red--;
                } else if (r.red < 200) {
                    r.red++;
                } else if (r.green > 77) {
                    r.green--;
                } else if (r.green < 77) {
                    r.green++;
                } else if (r.blue > 1) {
                    r.blue--;
                } else if (r.blue < 1) {
                    r.blue++;
                } else {
                    r.fadeInOut = true;
                    r.fadeIn = true;
                    r.fadeOut = false;
                }
            }

            if (r.fadeInOut) {

                let min = 77;
                let max = 100;

                let fadeRate = 1;

                //if (getRandomInt(4) === 4) {
                    fadeRate = getClampedXValue(r, getRandomInt(10, 2), fadeRate, 1);
                //}
    
                min = getClampedXValue(r, 100, min, 1);
                max = getClampedXValue(r, 255, max, 1);

                if (r.fadeIn) {
                    if (r.green < max) {
                        r.red += fadeRate;
                        r.green += fadeRate;
                        r.blue += fadeRate;


                        
                    } else {
                        r.fadeIn = false;
                        
                    }
                } else {
                    if (r.green > min) {
                        r.red -= fadeRate;
                        r.green -= fadeRate;
                        r.blue -= fadeRate;
                    } else {
                        r.fadeIn = true;
                    }
                }

            }

            r.waitTimer--;

            if (r.waitTimer <= 0) {
                r.whatAmI = 'grass';
            }

        } else if (r.whatAmI === 'flower') {

            if (r.green < 155) {
                r.green++;
            }

            let max = 150;
            let min = 100;
            let fadeRate = 5;

            min = getClampedXValue(r, 150, min, 1);
            max = getClampedXValue(r, 200, max, 1);
            fadeRate = getClampedXValue(r, 15, fadeRate, 2);

            if (r.fadeIn) {
                if (r.red + fadeRate < max) {
                    r.red += fadeRate;
                } else {
                    r.fadeIn = false;
                }
            } else {
                if (r.red - fadeRate > min) {
                    r.red -= fadeRate;
                } else {
                    //r.red = 0;
                    r.fadeIn = true;
                    //r.whatAmI = 'grass';
                }
            }
        }
    });

    //blockTimer--;

    if (blockTimer <= 0) {

        let rand = getRandomInt(grid.length- 1);
        let blockRect = grid[rand];

        if (blockRect.whatAmI === 'grass') {
            blockRect.whatAmI = 'block';
            blockRect.fadeIn = true;
            blockRect.waitTimer = getRandomInt(25, 1);

            let next;
    
            for (let i = 0; i < 4; i++) {
                next = grid[getRandomNeighborRect(blockRect)];
                next.whatAmI = 'block';
                next.fadeIn = true;
                next.waitTimer = getRandomInt(25, 1);
            }

            for (let i = 0; i < 4; i++) {
                next = grid[getRandomNeighborRect(next)];
                next.whatAmI = 'block';
                next.fadeIn = true;
                next.waitTimer = getRandomInt(25, 1);
            }

            for (let i = 0; i < 8; i++) {
                next = grid[getRandomNeighborRect(next)];
                next.whatAmI = 'block';
                next.fadeIn = true;
                next.waitTimer = getRandomInt(25, 1);
            }
        }

        blockTimer = getRandomInt(100, 1);
    }

    newWaterTimer--;

    if (newWaterTimer <= 0) {
        newRandomWaterFill();
        newWaterTimer = getRandomInt(100, 50);
    }

    valleyTimer--;

    if (valleyTimer <= 0) {
        valleyTimer = getRandomInt(500, 100);
        valleyMoveRate = getRandomInt(10, 1);
    }

    valley += valleyMoveRate;

    if (valley >= gridSize * widthHeight) {
        valley = 0;
    }
}

function draw(){
    grid.forEach((rectangle) => {       
        ctx.fillStyle = `rgb(${rectangle.red} ${rectangle.green} ${rectangle.blue})`;
        ctx.fillRect(rectangle.x, rectangle.y, widthHeight, widthHeight);
    });
}
