window.onload = function(){
    var game = document.getElementById('stage');
    var c = game.getContext('2d');

    var pops = [
        new Audio('/sounds/pop1.wav'),
        new Audio('/sounds/pop2.wav'),
        new Audio('/sounds/pop3.wav')
    ];

    var colors = {
        bg: 'rgba(13, 13, 13, 1)',
        coin: 'rgba(242, 183, 5, 1)', 
        slowCoin: 'rgba(0, 165, 22, 1)', 
        ball: 'rgba(242, 39, 93, 1)',
        text: 'rgba(242, 39, 93, 1)',
    };

    var world = {};
    world.gravity = 9.81;
    world.t = 0;
    world.lastT = 0;
    world.score = 0;
    world.soundEnabled = false;
    world.width = 11;
    world.height = 10;
    world.cellWidth = game.width / world.width;
    world.cellHeight = game.height / world.height;
    world.slowTimer = null;
    world.coinCount = 0;

    world.scene = [
        "           ",
        "  CCC CCC  ",
        "  CSC CSC  ",
        "  CCC CCC  ",
        "   CC CC   ",
        "   CC CC   ",
        "   CC CC   ",
        "   CC CC   ",
        "           ",
        "           "
    ];

    var newCell = function(x, y){
        return {
            x: x,
            y: y,
            draw: function(){},
            collide: function(){}
        };
    };
    var newSpace = newCell;

    var newCoin = function(x, y){
        var coin = newCell(x, y);
        coin.visible = true;
        coin.radius = 8;

        coin.draw = function(c){
            if (!this.visible) return;
            c.beginPath();
            c.fillStyle = colors.coin;
            c.arc(this.x+world.cellWidth/2, this.y+world.cellHeight/2, this.radius, 0, Math.PI * 2);
            c.fill();
        };

        coin.hasCollided = function(ball){
            if (!this.visible) return;

            var a = ball.x - (this.x+world.cellWidth/2);
            var b = ball.y - (this.y+world.cellHeight/2);
            var d = Math.sqrt(a*a + b*b);

            return (d < ball.radius + this.radius);
        };

        coin.pop = function(){
            var p = Math.floor(Math.random() * pops.length);
            pops[p].play();
        };

        coin.collide = function(ball){

            if (this.hasCollided(ball)){
                this.visible = false;    
                game.dispatchEvent(new Event('coin'));
                this.pop();
            }
                
        };

        return coin;
    };

    var newSlowCoin = function(x, y){
        var coin = newCoin(x, y);

        coin.draw = function(c){
            if (!this.visible) return;
            c.beginPath();
            c.fillStyle = colors.slowCoin;
            c.arc(this.x+world.cellWidth/2, this.y+world.cellHeight/2, this.radius, 0, Math.PI * 2);
            c.fill();
        };

        coin.collide = function(ball){
            if (this.hasCollided(ball)){
                this.visible = false;    
                this.pop();
                game.dispatchEvent(new Event('slowCoin'));
            }
        };

        return coin;
    };

    game.addEventListener('newCoin', function(){
        world.coinCount++;
    });

    world.cells = [];
    var x = 0;
    var y = 0;
    for (var i = 0; i < world.scene.length; i++){
        var row = world.scene[i].split('');
        world.cells[i] = [];

        for (var j = 0; j < row.length; j++){

            var cell = null;
            switch (row[j]){
                case 'C':
                    game.dispatchEvent(new Event('newCoin'));
                    cell = newCoin(x, y);
                    break;

                case 'S':
                    cell = newSlowCoin(x, y);
                    break;

                case ' ':
                default:
                    cell = newSpace(x, y);
                    break;
                    
            }
            world.cells[i][j] = cell; 
            x += world.cellWidth;
        }
        x = 0;
        y += world.cellHeight;
    }


    var ball = {};
    ball.y = 10;
    ball.x = game.width / 2;
    ball.dy = 0;
    ball.dx = 0;
    ball.bounciness = 0.8;

    ball.setDefaults = function(){
        this.radius = 10;
        this.resistance = 0.01;
    };

    ball.setDefaults();


    var drawFrame = function(timestamp){

        world.t = timestamp - world.lastT;
        world.lastT = timestamp;

        // Time in seconds
        var t = world.t / 1000;
        
        // Hit the bottom?
        if ((ball.y + ball.radius) >= game.height){
            ball.dy = -ball.dy * ball.bounciness;
            ball.y = game.height - ball.radius;
        }

        // Hit the top?
        if ((ball.y - ball.radius) <= 0){
            ball.dy = -ball.dy * ball.bounciness;
            ball.y = ball.radius;
        }

        // Hit the left?
        if ((ball.x - ball.radius) <= 0){
            ball.dx = -ball.dx * ball.bounciness;
            ball.x = ball.radius;
        }

        // Hit the right?
        if ((ball.x + ball.radius) >= game.width){
            ball.dx = -ball.dx * ball.bounciness;
            ball.x = game.width - ball.radius;
        }

        // Gravity
        ball.dy += t * world.gravity;

        // Air resistance
        ball.dy *= 1 - ball.resistance;
        ball.dx *= 1 - ball.resistance;

        // Move the ball
        ball.y += ball.dy;
        ball.x += ball.dx;

        // Clear the screen
        c.fillStyle = colors.bg;
        c.fillRect(0, 0, game.width, game.height);

        // Draw the world
        for (var i = 0; i < world.cells.length; i++){
            var row = world.cells[i];

            for (var j = 0; j < row.length; j++){
                var cell = row[j];
                c.save();
                cell.draw(c);
                cell.collide(ball);
                c.restore();
            }
        }
        
        // Draw the ball
        c.beginPath();
        c.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        c.fillStyle = colors.ball;
        c.fill();


        // Draw the score
        c.font = "16px sans-serif";
        c.textAlign = "left";
        c.fillStyle = colors.text;
        c.fillText(world.score, 5, 20);

        // You win?
        console.log(world.coinCount);
        if (world.coinCount == 0){
            c.textAlign = "center";
            c.fillText("You win. Well done, you.", game.width/2, game.height/2, game.width);
        }

        window.requestAnimationFrame(drawFrame);
    };

    window.requestAnimationFrame(drawFrame);


    game.addEventListener('coin', function(){
        world.score++;
        world.coinCount--;
    });

    game.addEventListener('slowCoin', function(){
        world.score -= 5;
        var origRes = ball.resistance;
        var origRad = ball.radius;
        ball.resistance = 0.2;
        ball.radius = 3;

        clearTimeout(world.slowTimer);
        world.slowTimer = setTimeout(function(){
            ball.setDefaults();
        }, 3000);
    });

    window.addEventListener('keydown', function(e){
        switch (e.keyCode){

            case 37:
                // Left key
                ball.dx = -10;
                break;

            case 38:
                // Up key
                ball.dy = -10;
                break;

            case 39:
                // Right key
                ball.dx = 10;
                break;

            case 40:
                // Down key
                ball.dy = 10;
                break;
        }
    });

    var touch = {
        startX: 0,
        startY: 0,
    };

    game.addEventListener('touchstart', function(e){
        touch.startX = e.changedTouches[0].pageX
        touch.startY = e.changedTouches[0].pageY
    });

    game.addEventListener('touchmove', function(e){
        e.preventDefault();
    });

    game.addEventListener('touchend', function(e){
        var dx = touch.startX - e.changedTouches[0].pageX;
        var dy = touch.startY - e.changedTouches[0].pageY;

        ball.dy = -(dy/game.height) * 20;
        ball.dx = -(dx/game.width) * 20;

        // Fix for Android etc not playing sounds without a user action
        if (world.soundEnabled) return;
        for (var i = 0; i < pops.length; i++){
            pops[i].play();
        }
        world.soundEnabled = true;
    });

};
