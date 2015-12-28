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

    var ball = {};
    ball.y = 10;
    ball.x = canvas.width / 2;
    ball.radius = 10;
    ball.dy = 0;
    ball.dx = 0;
    ball.bounciness = 0.8;
    ball.resistance = 0.01;

    var coins = [];
    var rows = 8;
    var cols = 6;
    var xOffset = (canvas.width / (cols + 1));
    var yOffset = (canvas.height / (rows + 1));
    var coinX = xOffset;
    var coinY = yOffset;

    // Coin init
    for (var i = 0; i < rows; i++){

        for (var j = 0; j < cols; j++){
            var coin = {
                x: coinX,
                y: coinY,
                r: 8,
                visible: true
            };
            coins.push(coin);

            coinX += xOffset;
        }
        coinX = xOffset;
        coinY += yOffset;
    }

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

        // Draw the coins and check for collisions
        c.fillStyle = colors.coin;
        for (var i = 0; i < coins.length; i++){
            if (!coins[i].visible) continue;

            // Trig check to ball
            var d2 = Math.pow(ball.y - coins[i].y, 2) + Math.pow(ball.x - coins[i].x, 2);
            if (d2 < Math.pow(ball.radius + coins[i].r, 2)){
                world.score++;
                coins[i].visible = false;

                var p = Math.floor(Math.random()*pops.length);
                pops[p].play();
            }

            c.beginPath();
            c.arc(coins[i].x, coins[i].y, coins[i].r, 0, Math.PI * 2);
            c.fill();
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
        if (world.score == coins.length){
            c.textAlign = "center";
            c.fillText("You win. Well done, you.", canvas.width/2, canvas.height/2, canvas.width);
        }
        
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

    document.getElementById('resetButton').onclick = function(){
        for (var i = 0; i < coins.length; i++){
            coins[i].visible = true;
        }
        world.score = 0;
    };
};
