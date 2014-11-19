inherit(Board,AttachedObject);

function Board (id)
{
	if (isPrototype(arguments))
		return this;
	Board.base.constructor.call(this,id);
	this.shuttle = null;
	this.extraShuttles = [];
	this.bricks = [];
	this.balls = [];
	this.frameDelay = 10;

	this.width = 0;
	this.height = 0;
	this.gridTop = Brick.height*2;
	this.gridBottom = this.gridTop + Brick.height*20;
	
	this.timer = TimerManager.add(this,"update",this.frameDelay,[],true);
	
	this.backgroundClassName = "";
	this.brickCount = 0;
	this.levels = [];
	this.currentLevel = -1;
}

Board.prototype.attach = function attach(doc)
{
	Board.base.attach.call(this,doc);
	this.element.className = this.backgroundClassName;

	if (this.element.currentStyle)
	{
		this.width = parseInt(this.element.currentStyle.width);
		this.height = parseInt(this.element.currentStyle.height);
	}
	else if (window.getComputedStyle)
	{
		this.width = parseInt(window.getComputedStyle(this.element,null).width);
		this.height = parseInt(window.getComputedStyle(this.element,null).height);
	}
	for (var i=0; i<this.bricks.length; i++)
		for (var j=0; j<this.bricks[i].length; j++)
			if (this.bricks[i][j])
				this.bricks[i][j].attach(doc);

	if (this.shuttle)
	{
		this.shuttle.attach(doc);
		var ball = this.spawnBall();
		ball.stickTo(this.shuttle);
	}
	for(var i=0; i<this.extraShuttles.length; i++)
		this.extraShuttles[i].attach(doc);

	doc.onmousemove = function(e) { if (top.game.board.shuttle) top.game.board.shuttle.onMouseMove(e); }
	
	doc.onclick = function(e) {
		for (var i=0; i<top.game.board.balls.length; i++)
			if (top.game.board.balls[i].stickyTarget === top.game.board.shuttle)
				top.game.board.balls[i].stickTo(null);
		top.game.board.spawnBall();
	}
	
	TimerManager.start(this.timer);
}

Board.prototype.detach = function detach()
{
	if (this.shuttle)
		this.shuttle.detach();
	for(var i=0; i<this.extraShuttles.length; i++)
		this.extraShuttles[i].detach();

	for (var i=0; i<this.bricks.length; i++)
		for (var j=0; j<this.bricks[i].length; j++)
			if (this.bricks[i][j])
				this.bricks[i][j].detach();
	this.bricks = [];
	for (var i=0; i<this.balls.length; i++)
		this.balls[i].detach();
	this.balls = [];
	if (this.element)
		this.element.innerHTML = "";
	Board.base.detach.call(this);
}

Board.prototype.loadLevel = function loadLevel(doc)
{
	if (this.currentLevel < this.levels.length-1)
	{
		this.currentLevel++;

		this.detach();
		if (this.currentLevel < this.levels.length)
		{
			var level = this.levels[this.currentLevel];
			
			//level is the name of an xml file
			//for now just create some random bricks
			this.brickCount = 0;
			this.bricks = new Array(5);
			for (var i=0; i<this.bricks.length; i++)
			{
				this.bricks[i] = new Array(20);
				for (var j=0; j<this.bricks[i].length; j++)
				{
					var type = randBetween(0,4);
					if (type == 0)
						this.bricks[i][j] = null;
					else
					{
						this.bricks[i][j] = new Brick("Brick_"+i+"_"+j, this, type, (type == 4 ? 2 : 1));
						this.bricks[i][j].top = this.gridTop + i*Brick.height;
						this.bricks[i][j].left = j*Brick.width;
						
						this.brickCount++;
					}
				}
			}
			this.backgroundClassName = "background_01";
			this.attach(doc);
		}
	}
}

Board.prototype.spawnShuttle = function spawnShuttle()
{
	var doc = this.element.document;
	if (!doc)
		doc = this.element.ownerDocument;
	if (typeof(Shuttle.count) == "undefined")
		Shuttle.count = 0;
	var shuttle = new Shuttle('Shuttle_'+(Shuttle.count++),this);
	if (!this.shuttle)
	{
		this.shuttle = shuttle;
		this.shuttle.active = true;
	}
	else
		this.extraShuttles.push(shuttle);
	shuttle.attach(doc);
	return shuttle;
}

Board.prototype.destroyShuttle = function destroyShuttle()
{
	var doc = this.element.document;
	if (!doc)
		doc = this.element.ownerDocument;
	var x = this.shuttle.x;
	var y = this.shuttle.y;
	this.shuttle.detach();
	this.shuttle = this.extraShuttles.pop();
	if (this.shuttle)
	{
		this.shuttle.detach();
		this.shuttle.x = x;
		this.shuttle.y = y;
		this.shuttle.active = true;
		this.shuttle.attach(doc);
		var ball = this.spawnBall();
		ball.stickTo(this.shuttle);
	}
}

Board.prototype.spawnBall = function spawnBall()
{
	var doc = this.element.document;
	if (!doc)
		doc = this.element.ownerDocument;
	if (typeof(Ball.count) == "undefined")
		Ball.count = 0;
	var ball = new Ball("Ball_"+(Ball.count++),this);
	this.balls.push(ball);
	ball.x = Math.round(this.shuttle.x + this.shuttle.width/2 - Ball.width/2);
	ball.y = this.shuttle.y - Ball.height;
	ball.attach(doc);
	return ball;
}

Board.prototype.destroyBall = function destroyBall(ball)
{
	for (var i=0; i<this.balls.length; i++)
		if (this.balls[i] === ball)
			break;
	this.balls.splice(i,1);
	ball.detach();
	
	if (this.balls.length == 0)
		this.destroyShuttle();
}

Board.prototype.update = function update()
{
	if (paused || this.brickCount == 0)
		return;

	if (!this.initialized)
	{
		this.fraction = this.frameDelay/1000;
		this.initialized = true;
	}
	
	for (var i=0; i<this.balls.length; i++)
	{
		var ball = this.balls[i];
		if (ball.vX || ball.vY)
		{
			if (!ball.initialized)
			{
				if (window.getComputedStyle)
				{
					var style = window.getComputedStyle(this.element,null);
					var ballStyle = window.getComputedStyle(ball.element,null);
					ball.maxX = parseInt(style.width) - parseInt(ballStyle.width);
					ball.maxY = parseInt(style.height) - parseInt(ballStyle.height);
				}
				else
				{
					ball.maxX = parseInt(this.element.currentStyle.width) - parseInt(ball.element.currentStyle.width);
					ball.maxY = parseInt(this.element.currentStyle.height) - parseInt(ball.element.currentStyle.height);
				}
				ball.initialized = true;
			}
			
			ball.oldX = ball.x;
			ball.oldY = ball.y;
			ball.x += this.fraction*ball.vX;
			ball.y += this.fraction*ball.vY;
			if (ball.x < 0)
			{
				ball.x = 0;
				ball.vX = -ball.vX;
				ball.faster();
			}
			else if (ball.x > ball.maxX)
			{
				ball.x = ball.maxX;
				ball.vX = -ball.vX;
				ball.faster();
			}			
			if (ball.y < 0)
			{
				ball.y = 0;
				ball.vY = -ball.vY;
				ball.faster();
			}
			else if (ball.y >= this.shuttle.y-Ball.height && ball.y <= this.shuttle.y + this.shuttle.height &&
					 ball.x+Ball.width >= this.shuttle.x && ball.x <= this.shuttle.x+this.shuttle.width)
			{
				//ball hit shuttle, calculate new velocity
				var shuttleX = this.shuttle.x + this.shuttle.width/2;
				var shuttleY = this.shuttle.y + this.shuttle.height/2;
				var ballX = ball.x + Ball.width/2;
				var ballY = ball.y + Ball.height/2;
				
				var vel = Math.sqrt(ball.vX*ball.vX + ball.vY*ball.vY);
				
				var new_vX = ballX - shuttleX;
				var new_vY = ballY - shuttleY;
				var new_len = Math.sqrt(new_vX*new_vX + new_vY*new_vY);
				
				new_vX *= vel/new_len;
				new_vY *= vel/new_len;
				
				ball.vX = new_vX;
				ball.vY = new_vY;
				
				ball.faster();
			}
			else if (ball.y > ball.maxY)
			{
				this.destroyBall(ball);
				continue;
			}

			//check for brick collision
			var hx = -1;
			var hy = Math.floor((ball.y + Ball.height/2 - this.gridTop)/Brick.height);
			var vx = Math.floor((ball.x + Ball.width/2)/Brick.width);
			var vy = -1;
			if (ball.vX > 0)
				hx = Math.floor((ball.x + Ball.width)/Brick.width);
			else if (ball.vX < 0)
				hx = Math.floor((ball.x-1)/Brick.width);
			if (ball.vY > 0)
				vy = Math.floor((ball.y + Ball.height - this.gridTop)/Brick.height);
			else if (ball.vY < 0)
				vy = Math.floor((ball.y - this.gridTop - 1)/Brick.height);
			if (hx >= 0 && hy >= 0 && hy < this.bricks.length)
			{
				var brick = this.bricks[hy][hx];
				if (brick)
				{
					if (ball.vX > 0)
						ball.x = brick.left - Ball.width;
					else if (ball.vX < 0)
						ball.x = brick.left + Brick.width;
					ball.vX = -ball.vX;
					brick.hit();
					if (brick.hp == 0)
					{
						this.bricks[hy][hx] = null;
						this.brickCount--;
					}
					ball.faster();
				}
			}
			if (vy >= 0 && vy < this.bricks.length)
			{
				var brick = this.bricks[vy][vx];
				if (brick)
				{
					if (ball.vY > 0)
						ball.y = brick.top - Ball.height;
					else if (ball.vY < 0)
						ball.y = brick.top + Brick.height;
					ball.vY = -ball.vY;
					brick.hit();
					if (brick.hp == 0)
					{
						this.bricks[vy][vx] = null;
						this.brickCount--;
					}
					ball.faster();
				}
			}
			ball.update();			
			if (this.brickCount == 0)
			{
				if (this.currentLevel < this.levels.length-1)
					this.loadLevel(this.element.document || this.element.ownerDocument);
				else
					alert("You Win!\nGame Over!");
			}
		}
	}
}
