window.onload = function(){
    var canvas = document.getElementById('stage');
    var c = canvas.getContext('2d');

    var pops = [
        new Audio('/sounds/pop1.wav'),
        new Audio('/sounds/pop2.wav'),
        new Audio('/sounds/pop3.wav')
    ];

    var colors = {
        bg: 'rgba(13, 13, 13, 1)',
        coin: 'rgba(242, 183, 5, 1)', 
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
    world.cellWidth = canvas.width / world.width;
    world.cellHeight = canvas.height / world.height;

    world.scene = [
        "           ",
        "  CCC CCC  ",
        "  CCC CCC  ",
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

        coin.collide = function(ball){

            if (this.hasCollided(ball)){
                this.visible = false;    
                world.score++;
                var p = Math.floor(Math.random() * pops.length);
                pops[p].play();
            }
                
        };

        return coin;
    };

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
                    cell = newCoin(x, y);
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
    ball.x = canvas.width / 2;
    ball.radius = 10;
    ball.dy = 0;
    ball.dx = 0;
    ball.bounciness = 0.8;
    ball.resistance = 0.01;


    var drawFrame = function(timestamp){

        world.t = timestamp - world.lastT;
        world.lastT = timestamp;

        // Time in seconds
        var t = world.t / 1000;
        
        // Hit the bottom?
        if ((ball.y + ball.radius) >= canvas.height){
            ball.dy = -ball.dy * ball.bounciness;
            ball.y = canvas.height - ball.radius;
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
        if ((ball.x + ball.radius) >= canvas.width){
            ball.dx = -ball.dx * ball.bounciness;
            ball.x = canvas.width - ball.radius;
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
        c.fillRect(0, 0, canvas.width, canvas.height);

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

        window.requestAnimationFrame(drawFrame);
    };

    window.requestAnimationFrame(drawFrame);

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

    canvas.addEventListener('touchstart', function(e){
        touch.startX = e.changedTouches[0].pageX
        touch.startY = e.changedTouches[0].pageY
    });

    canvas.addEventListener('touchmove', function(e){
        e.preventDefault();
    });

    canvas.addEventListener('touchend', function(e){
        var dx = touch.startX - e.changedTouches[0].pageX;
        var dy = touch.startY - e.changedTouches[0].pageY;

        ball.dy = -(dy/canvas.height) * 20;
        ball.dx = -(dx/canvas.width) * 20;

        // Fix for Android etc not playing sounds without a user action
        if (world.soundEnabled) return;
        for (var i = 0; i < pops.length; i++){
            pops[i].play();
        }
        world.soundEnabled = true;
    });

};
