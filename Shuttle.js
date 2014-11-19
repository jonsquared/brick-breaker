inherit(Shuttle,AttachedObject);

function Shuttle (id, board)
{
	if (isPrototype(arguments))
		return this;
	Shuttle.base.constructor.call(this,id);
	
	this.board = board;
	this.x = -1;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	
	this.active = false;
}

Shuttle.prototype.attach = function attach(doc)
{
	var obj = doc.createElement("DIV");
	obj.id = this.id;
	if (this.active)
		obj.className = "shuttle_normal";
	else
		obj.className = "shuttle_extra";
	if (this.x >= 0)
		obj.style.left = this.x+"px";
	this.board.element.appendChild(obj);

	Shuttle.base.attach.call(this,doc);
	if (window.getComputedStyle)
	{
		var style = window.getComputedStyle(this.element,null);
		if (this.x < 0)
			this.x = parseInt(style.left);
		this.y = parseInt(style.top);
		this.width = parseInt(style.width);
		this.height = parseInt(style.height);	
	}
	else
	{
		if (this.x < 0)
			this.x = parseInt(this.element.currentStyle.left);
		this.y = parseInt(this.element.currentStyle.top);
		this.width = parseInt(this.element.currentStyle.width);
		this.height = parseInt(this.element.currentStyle.height);	
	}
}

Shuttle.prototype.detach = function detach()
{
	var element = this.element;
	Shuttle.base.detach.call(this);
	element.parentNode.removeChild(element);
}

Shuttle.prototype.onMouseMove = function onMouseMove(e)
{
	if (this.element)
	{
		var doc = this.element.document;
		if (!doc)
			doc = this.element.ownerDocument;
		if (!e)
			e = doc.parentWindow.event;
		this.x = e.clientX - Math.round(this.width/2);
		if (this.x < 0)
			this.x = 0;
		else if (this.x > this.board.width-this.width)
			this.x = this.board.width-this.width;
		this.element.style.left = this.x+"px";
	}
}