function AttachedObject(id)
{
	if (isPrototype(arguments))
		return this;
	this.id = id;
	this.element = null;
}

AttachedObject.prototype.attach = function attach(doc)
{
	if (!this.element)
	{
		if (!doc)
			doc = document;
		this.element = doc.getElementById(this.id);
		this.element.object = this;
	}
}

AttachedObject.prototype.detach = function detach()
{
	if (this.element)
		this.element.object = null;
	this.element = null;
}