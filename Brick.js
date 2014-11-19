inherit(Brick,AttachedObject);

Brick.width = 40;
Brick.height = 20;

function Brick (id, board, type, hp)
{
	if (isPrototype(arguments))
		return this;
	Brick.base.constructor.call(this,id);
	this.board = board;
	this.type = type;
	this.top = 0;
	this.left = 0;
	this.hp = hp;
}

Brick.prototype.attach = function attach(doc)
{
	if (!doc)
		doc = document;
	var obj = doc.createElement("DIV");
	obj.id = this.id;
	obj.className = "brick brick_"+this.type+(this.hp > 0 ? "_"+this.hp : "");
	this.board.element.appendChild(obj);
	Brick.base.attach.call(this,doc);
	this.element.style.top = this.top + "px";
	this.element.style.left = this.left + "px";
}

Brick.prototype.detach = function detach()
{
	var element = this.element;
	Brick.base.detach.call(this);
	if (element)
		element.parentNode.removeChild(element);	
}

Brick.prototype.hit = function hit()
{
	this.hp--;
	if (this.hp == 0)
	{
		this.element.style.visibility = "hidden";
		this.detach();		
	}
	else if (this.hp > 0)
		this.element.className = "brick brick_"+this.type+(this.hp > 0 ? "_"+this.hp : "");
}