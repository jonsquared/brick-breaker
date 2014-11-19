inherit(Ball,AttachedObject);

function Ball (id, board)
{
	if (isPrototype(arguments))
		return this;
	Ball.base.constructor.call(this,id);
	this.board = board;
	this.x = 0;
	this.y = 0;
	this.vX = 0;
	this.vY = 500;
	
	this.stickyTarget = null;
}

Ball.width = 10;
Ball.height = 10;

Ball.prototype.attach = function attach(doc)
{
	var obj = doc.createElement("DIV");
	obj.id = this.id;
	obj.className = "ball_normal";
	this.board.element.appendChild(obj);
	Ball.base.attach.call(this,doc);
	this.element.style.left = Math.round(this.x)+"px";
	this.element.style.top = Math.round(this.y)+"px";
}

Ball.prototype.detach = function detach()
{
	var element = this.element;
	Ball.base.detach.call(this);
	element.parentNode.removeChild(element);
}

Ball.prototype.faster = function faster()
{
	var len = Math.sqrt(this.vX*this.vX + this.vY*this.vY);
	this.vX += 4 * this.vX / len;
	this.vY += 4 * this.vY / len;
}

Ball.prototype.update = function update()
{
	if (this.stickyTarget)
	{
		this.x = Math.round(this.stickyTarget.x + this.stickyTarget.width/2 - Ball.width/2);
		this.y = this.stickyTarget.y - Ball.height;
	}
	this.element.style.left = Math.round(this.x)+"px";
	this.element.style.top = Math.round(this.y)+"px";
}

Ball.prototype.hit = function hit()
{
}

Ball.prototype.stickTo = function stickTo(object)
{
	this.stickyTarget = object;
	if (this.stickyTarget)
	{
		if (this.stickyTimer)
			TimerManager.remove(this.stickyTimer);
		this.stickyTimer = TimerManager.add(this, "stickTo", 3000, [null], false);
		TimerManager.start(this.stickyTimer);
	}
	else
	{
		if (this.stickyTimer)
			TimerManager.remove(this.stickyTimer);
	}
}