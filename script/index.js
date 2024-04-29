var canvas;
var ctx;
var grid = [];
var gridSize = 160;
var widthHeight = 3;
var blockTimer = 100;
var newWaterTimer = 1000;
var waterDieTime = 1000;
var valley = 0;
var valleyMoveRate = 1;
var valleyTimer = 100;
var valleyBias = 0.5;
var valleyBiasTimer = 250;
var valleyOn = true;
var valleyOnTimer = 100;
var flowerTimer = 100;
var dirBias = 'none';
var biasTimer = 100;
var bugCount = 0;
window.onload = init;
function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    ctx.canvas.width = gridSize * widthHeight; // window.innerWidth;
    ctx.canvas.height = gridSize * widthHeight; //window.innerHeight;
    var rR;
    var rB;
    var rG;
    var index = 0;
    for (var y = 0; y < gridSize; y++) {
        for (var x = 0; x < gridSize; x++) {
            rR = 0;
            rB = 0;
            rG = getRandomInt(150, 100);
            grid[index] = new Rect(index, x * widthHeight, y * widthHeight, rR, rG, rB);
            index++;
        }
    }
    index = 0;
    grid.forEach(function (rectangle) {
        var nCount = 0;
        for (var i = 0; i < grid.length; i++) {
            if (i != index) {
                if (grid[i].x === rectangle.x + widthHeight && grid[i].y === rectangle.y) { //east
                    rectangle.e = i;
                    nCount++;
                }
                else if (grid[i].y === rectangle.y && grid[i].x === rectangle.x - widthHeight) { //west
                    rectangle.w = i;
                    nCount++;
                }
                else if (grid[i].x === rectangle.x && grid[i].y === rectangle.y - widthHeight) { //north
                    rectangle.n = i;
                    nCount++;
                }
                else if (grid[i].x === rectangle.x && grid[i].y === rectangle.y + widthHeight) { //south
                    rectangle.s = i;
                    nCount++;
                }
                else if (grid[i].x === rectangle.x + widthHeight && grid[i].y === rectangle.y - widthHeight) { //NE
                    rectangle.ne = i;
                    nCount++;
                }
                else if (grid[i].x === rectangle.x - widthHeight && grid[i].y === rectangle.y - widthHeight) { //NW
                    rectangle.nw = i;
                    nCount++;
                }
                else if (grid[i].x === rectangle.x - widthHeight && grid[i].y === rectangle.y + widthHeight) { //SW
                    rectangle.sw = i;
                    nCount++;
                }
                else if (grid[i].x === rectangle.x + widthHeight && grid[i].y === rectangle.y + widthHeight) { //SE
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
    /*
    let r = newRandomWaterFill();

    for (let i=0; i < 10; i++) {
        let index = getRandomNeighborRect(r);

        grid[index].whatAmI = "waterFill";
        grid[index].fadeIn = true;
    }
    */
    for (var i = 0; i < 5; i++) {
        newRandomFlower();
    }
    /*
        for (let i=0; i < 10; i++) {
            newRandomBug();
        }
    */
    // Start the first frame request
    //window.requestAnimationFrame(gameLoop);
    setInterval(gameLoop, 1 * 100);
}
var Rect = /** @class */ (function () {
    function Rect(index, x, y, r, g, b) {
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
        this.nw = -1;
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
        this.fadeRate = 1;
    }
    Rect.prototype.directionFromString = function (dir) {
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
    };
    return Rect;
}());
function newRandomBug() {
    var ranIndex = getRandomInt(grid.length - 1);
    grid[ranIndex].whatAmI = 'bug';
    grid[ranIndex].fadeIn = true;
    grid[ranIndex].waitTimer = 100;
    bugCount++;
}
function newRandomFlower() {
    var rand = getRandomInt(grid.length - 1);
    grid[rand].whatAmI = "flower";
    grid[rand].fadeIn = true;
    var rect = grid[rand];
    rect.waitTimer = getRandomInt(50, 25);
    rect.fadeRate = getRandomInt(15, 5);
    switch (getRandomInt(2, 0)) {
        case 0:
            if (rect.ne != -1 && grid[rect.ne].whatAmI === 'grass' && grid[rect.ne].red === 0 && grid[rect.ne].blue === 0) {
                grid[rect.ne].whatAmI = 'flower';
                grid[rect.ne].red = 50;
                grid[rect.ne].waitTimer = getRandomInt(50, 25);
                grid[rect.ne].fadeRate = getRandomInt(15, 5);
            }
            if (rect.se != -1 && grid[rect.se].whatAmI === 'grass' && grid[rect.se].red === 0 && grid[rect.se].blue === 0) {
                grid[rect.se].whatAmI = 'flower';
                grid[rect.se].red = 50;
                grid[rect.se].waitTimer = getRandomInt(50, 25);
                grid[rect.se].fadeRate = getRandomInt(15, 5);
            }
            if (rect.sw != -1 && grid[rect.sw].whatAmI === 'grass' && grid[rect.sw].red === 0 && grid[rect.sw].blue === 0) {
                grid[rect.sw].whatAmI = 'flower';
                grid[rect.sw].red = 50;
                grid[rect.sw].waitTimer = getRandomInt(50, 25);
                grid[rect.sw].fadeRate = getRandomInt(15, 5);
            }
            if (rect.nw != -1 && grid[rect.nw].whatAmI === 'grass' && grid[rect.nw].red === 0 && grid[rect.nw].blue === 0) {
                grid[rect.nw].whatAmI = 'flower';
                grid[rect.nw].red = 50;
                grid[rect.nw].waitTimer = getRandomInt(50, 25);
                grid[rect.nw].fadeRate = getRandomInt(15, 5);
            }
            break;
        case 1:
            if (rect.ne != -1 && grid[rect.ne].whatAmI === 'grass' && grid[rect.ne].red === 0 && grid[rect.ne].blue === 0) {
                grid[rect.ne].whatAmI = 'flower';
                grid[rect.ne].red = 50;
                grid[rect.ne].waitTimer = getRandomInt(50, 25);
                grid[rect.ne].fadeRate = getRandomInt(15, 5);
            }
            if (rect.sw != -1 && grid[rect.sw].whatAmI === 'grass' && grid[rect.sw].red === 0 && grid[rect.sw].blue === 0) {
                grid[rect.sw].whatAmI = 'flower';
                grid[rect.sw].red = 50;
                grid[rect.sw].waitTimer = getRandomInt(50, 25);
                grid[rect.sw].fadeRate = getRandomInt(15, 5);
            }
            break;
        case 2:
            if (rect.nw != -1 && grid[rect.nw].whatAmI === 'grass' && grid[rect.nw].red === 0 && grid[rect.nw].blue === 0) {
                grid[rect.nw].whatAmI = 'flower';
                grid[rect.nw].red = 50;
                grid[rect.nw].waitTimer = getRandomInt(50, 25);
                grid[rect.nw].fadeRate = getRandomInt(15, 5);
            }
            if (rect.se != -1 && grid[rect.se].whatAmI === 'grass' && grid[rect.se].red === 0 && grid[rect.se].blue === 0) {
                grid[rect.se].whatAmI = 'flower';
                grid[rect.se].red = 50;
                grid[rect.se].waitTimer = getRandomInt(50, 25);
                grid[rect.se].fadeRate = getRandomInt(15, 5);
            }
            break;
    }
}
function newRandomWaterFill() {
    var rand = getRandomInt(grid.length - 1);
    grid[rand].whatAmI = "waterFill";
    grid[rand].fadeIn = true;
    return grid[rand];
}
function getRandomNeighborRect(r, whatAmI) {
    if (whatAmI === void 0) { whatAmI = ['any']; }
    var n = 0;
    var ne = 1;
    var e = 2;
    var se = 3;
    var s = 4;
    var sw = 5;
    var w = 6;
    var nw = 7;
    var northern = [n, ne, nw];
    var western = [nw, w, sw];
    var southern = [se, s, sw];
    var eastern = [se, e, ne];
    var num = getRandomInt(7);
    switch (dirBias) {
        case ('s'):
            num = getRandomInt(5, 3);
            break;
        case ('e'):
            num = getRandomInt(5, 1);
            break;
        case ('n'):
            num = getRandomInt(1);
            break;
        case ('w'):
            num = getRandomInt(7, 5);
            break;
    }
    if (r.y === 0 && northern.includes(num)) {
        num = s;
    }
    if (r.x === 0 && western.includes(num)) {
        num = e;
    }
    if (r.x === (widthHeight * gridSize) - widthHeight && eastern.includes(num)) {
        num = w;
    }
    if (r.y === (widthHeight * gridSize) - widthHeight && southern.includes(num)) {
        num = n;
    }
    var neighborIndex = -1;
    switch (num) {
        case n:
            neighborIndex = r.n;
            break;
        case ne:
            neighborIndex = r.ne;
            break;
        case e:
            neighborIndex = r.e;
            break;
        case se:
            neighborIndex = r.se;
            break;
        case s:
            neighborIndex = r.s;
            break;
        case sw:
            neighborIndex = r.sw;
            break;
        case w:
            neighborIndex = r.w;
            break;
        case nw:
            neighborIndex = r.nw;
            break;
    }
    if (whatAmI.includes('any') || whatAmI.includes(grid[neighborIndex].whatAmI)) {
        return neighborIndex;
    }
    else {
        return r.index;
    }
}
function randomChooser(array) {
    return array[getRandomInt(array.length - 1)];
}
function getRandomInt(max, min) {
    if (min === void 0) { min = 0; }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getClampedXValue(r, clamp, original, xMult) {
    var x = r.x + (r.y * valleyBias);
    var width = gridSize * widthHeight;
    if (x >= width) {
        x -= width;
    }
    if (valleyOn && x >= valley - (widthHeight * xMult) && x <= valley + (widthHeight * xMult)) {
        return clamp;
    }
    else {
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
    var bCount = 0;
    grid.forEach(function (r) {
        if (r.whatAmI === "grass") {
            var minGreen = 125;
            var maxGreen = 150;
            minGreen = getClampedXValue(r, 120, minGreen, 4);
            maxGreen = getClampedXValue(r, 145, maxGreen, 4);
            minGreen = getClampedXValue(r, 115, minGreen, 2);
            maxGreen = getClampedXValue(r, 140, maxGreen, 2);
            var n = getRandomNeighborRect(r, ['water']);
            if (n !== r.index) {
                //r.red = 50;
            }
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
                }
                else {
                    r.fadeInOut = false;
                }
            }
            else {
                if (r.green - 1 > minGreen) {
                    r.green--;
                }
                else {
                    r.fadeInOut = true;
                }
            }
            if (r.blue > 0) {
                var rate = getClampedXValue(r, 5, 1, 1);
                r.blue -= rate;
            }
            if (r.red > 0) {
                var rate = getClampedXValue(r, 5, 1, 1);
                r.red -= rate;
            }
        }
        else if (r.whatAmI === "waterFill") {
            if (r.move) {
                var next = grid[getRandomNeighborRect(r)];
                if (next.whatAmI === "grass") {
                    next.whatAmI = "waterFill";
                    next.fadeIn = true;
                    next.move = true;
                }
                else if (next.whatAmI === "water") {
                    next.whatAmI = "waterFill";
                    next.move = true;
                }
                for (var i = 0; i < 3; i++) {
                    next = grid[getRandomNeighborRect(r)];
                    if (next.whatAmI === "grass") {
                        next.whatAmI = "water";
                        next.fadeInOut = true;
                        next.waitTimer = waterDieTime;
                    }
                }
                r.whatAmI = "water";
                r.fadeInOut = true;
                r.move = false;
                r.waitTimer = waterDieTime;
            }
            else if (r.fadeIn) {
                if (r.blue + 25 < 250) {
                    r.blue += 25;
                    if (r.blue >= 25) {
                        r.move = true;
                    }
                }
                else {
                    //r.fadeIn = false;
                    //r.move = true;
                }
            }
        }
        else if (r.whatAmI === "water") {
            var min = 150;
            var max = 250;
            min = getClampedXValue(r, 100, min, 2);
            max = getClampedXValue(r, 200, max, 2);
            if (r.fadeInOut) {
                if (r.blue + 25 < max) {
                    r.blue += 25;
                }
                else {
                    r.fadeInOut = false;
                }
            }
            else {
                if (r.blue - 25 > min) {
                    r.blue -= 25;
                }
                else {
                    r.fadeInOut = true;
                }
            }
            if (r.waitTimer > 0) {
                r.waitTimer--;
            }
            else {
                r.fadeInOut = false;
                r.whatAmI = "grass";
                //r.waitTimer = 50;
            }
        }
        else if (r.whatAmI === "block") {
            if (r.blue > 0) {
                r.blue--;
            }
            if (r.green > 0) {
                r.green--;
            }
            if (r.waitTimer > 0) {
                r.waitTimer--;
            }
            else {
                r.whatAmI = 'dirt';
                r.fadeInOut = false;
                r.waitTimer = 100;
            }
            var min = 100;
            var max = 250;
            var fadeRate = 5;
            min = getClampedXValue(r, 50, min, 2);
            max = getClampedXValue(r, 200, max, 2);
            if (r.fadeIn) {
                if (r.red + fadeRate < max) {
                    r.red += fadeRate;
                }
                else {
                    //r.red = max;
                    r.fadeIn = false;
                }
            }
            else {
                if (r.red - fadeRate > min) {
                    r.red -= fadeRate;
                }
                else {
                    //r.red = min;
                    r.fadeIn = true;
                    //r.whatAmI = 'grass';
                }
            }
        }
        else if (r.whatAmI === 'dirt') {
            if (!r.fadeInOut) {
                if (r.red > 200) {
                    r.red--;
                }
                else if (r.red < 200) {
                    r.red += 5;
                }
                else if (r.green > 77) {
                    r.green -= 5;
                }
                else if (r.green < 77) {
                    r.green++;
                }
                else if (r.blue > 1) {
                    r.blue -= 5;
                    if (r.blue < 1) {
                        r.blue = 1;
                    }
                }
                else {
                    r.fadeInOut = true;
                    r.fadeIn = true;
                    r.fadeOut = false;
                }
            }
            if (r.fadeInOut) {
                var min = 77;
                var max = 100;
                var fadeRate = 1;
                //if (getRandomInt(4) === 4) {
                fadeRate = getClampedXValue(r, getRandomInt(10, 2), fadeRate, 1);
                //}
                min = getClampedXValue(r, 100, min, 2);
                max = getClampedXValue(r, 255, max, 2);
                fadeRate = getClampedXValue(r, 10, fadeRate, 2);
                if (r.fadeIn) {
                    if (r.green < max) {
                        r.red += fadeRate;
                        r.green += fadeRate;
                        r.blue += fadeRate;
                    }
                    else {
                        r.fadeIn = false;
                    }
                }
                else {
                    if (r.green > min) {
                        r.red -= fadeRate;
                        r.green -= fadeRate;
                        r.blue -= fadeRate;
                    }
                    else {
                        r.fadeIn = true;
                    }
                }
            }
            r.waitTimer--;
            if (r.waitTimer <= 0) {
                r.whatAmI = 'grass';
            }
        }
        else if (r.whatAmI === 'flower') {
            if (r.green < 155) {
                r.green++;
            }
            var max = 100;
            var min = 50;
            var fadeRate = r.fadeRate;
            min = getClampedXValue(r, 100, min, 4);
            max = getClampedXValue(r, 150, max, 4);
            fadeRate = getClampedXValue(r, 15, fadeRate, 4);
            if (r.fadeIn) {
                if (r.red + fadeRate < max) {
                    r.red += fadeRate;
                }
                else {
                    r.fadeIn = false;
                }
            }
            else {
                if (r.red - fadeRate > min) {
                    r.red -= fadeRate;
                }
                else {
                    //r.red = 0;
                    r.fadeIn = true;
                    //r.whatAmI = 'grass';
                }
            }
            r.waitTimer--;
            if (r.waitTimer <= 0) {
                r.whatAmI = 'grass';
            }
        }
        else if (r.whatAmI === 'bug') {
            bCount++;
            if (r.green > 10) {
                r.green -= 10;
            }
            if (r.fadeIn) {
                if (r.red + 25 < 255) {
                    r.red += 25;
                }
                else {
                    r.fadeIn = false;
                }
            }
            else {
                if (r.red - 5 > 100) {
                    r.red -= 5;
                }
                else {
                    r.fadeIn = true;
                }
            }
            r.waitTimer--;
            if (r.waitTimer <= 0) {
                var nextBug = grid[getRandomNeighborRect(r)];
                nextBug.whatAmI = 'bug';
                nextBug.waitTimer = getRandomInt(10, 1);
                r.whatAmI = 'grass';
            }
        }
    });
    /*
        if (bCount < 5) {
            for (let i=0; i < 5; i++) {
                newRandomBug();
            }
        }
    */
    //blockTimer--;
    if (blockTimer <= 0) {
        var rand = getRandomInt(grid.length - 1);
        var blockRect = grid[rand];
        if (blockRect.whatAmI === 'grass') {
            blockRect.whatAmI = 'block';
            blockRect.fadeIn = true;
            blockRect.waitTimer = getRandomInt(25, 1);
            var next = void 0;
            for (var i = 0; i < 4; i++) {
                next = grid[getRandomNeighborRect(blockRect)];
                next.whatAmI = 'block';
                next.fadeIn = true;
                next.waitTimer = getRandomInt(25, 1);
            }
            for (var i = 0; i < 4; i++) {
                next = grid[getRandomNeighborRect(next)];
                next.whatAmI = 'block';
                next.fadeIn = true;
                next.waitTimer = getRandomInt(25, 1);
            }
            for (var i = 0; i < 8; i++) {
                next = grid[getRandomNeighborRect(next)];
                next.whatAmI = 'block';
                next.fadeIn = true;
                next.waitTimer = getRandomInt(25, 1);
            }
        }
        blockTimer = getRandomInt(100, 1);
    }
    //newWaterTimer--;
    if (newWaterTimer <= 0) {
        newRandomWaterFill();
        newWaterTimer = getRandomInt(2000, 1000);
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
    flowerTimer--;
    if (flowerTimer <= 0) {
        for (var i = 0; i < 20; i++) {
            newRandomFlower();
        }
        flowerTimer = getRandomInt(60, 30);
    }
    valleyBiasTimer--;
    if (valleyBiasTimer <= 0) {
        valleyBias = Math.random();
        valleyBiasTimer = getRandomInt(500, 250);
    }
    valleyOnTimer--;
    if (valleyOnTimer <= 0) {
        valleyOn = valleyOn ? false : true;
        valleyOnTimer = getRandomInt(100, 50);
    }
    /*
        biasTimer--
    
        if (biasTimer <= 0) {
    
            switch(getRandomInt(10)) {
                case (0):
                    dirBias = 'n';
                    break;
                case (1):
                    dirBias = 'e';
                    break;
                case (2):
                    dirBias = 's';
                    break;
                case (3):
                    dirBias = 'w';
                    break;
                default:
                    dirBias = 'none';
                    break;
            }
    
            biasTimer = getRandomInt(300, 100);
            
            console.log(dirBias);
        }
        */
}
function draw() {
    grid.forEach(function (rectangle) {
        //if (rectangle.index % 1 === 0) {
        var r = getRandomNeighborRect(rectangle, ['block']);
        ctx.fillStyle = "rgb(".concat(grid[r].red, " ").concat(grid[r].green, " ").concat(grid[r].blue, ")");
        //} else {
        //ctx.fillStyle = `rgb(${rectangle.red} ${rectangle.green} ${rectangle.blue})`;
        //}
        ctx.fillRect(rectangle.x, rectangle.y, widthHeight, widthHeight);
    });
}
