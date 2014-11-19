var PROTOTYPE = "PROTOTYPE";
function isPrototype(arguments)
{
	if (arguments.length == 1 && arguments[0] == PROTOTYPE)
		return true;
	return false;
}

function inherit(subclass, baseclass)
{
	subclass.prototype = new baseclass(PROTOTYPE);
	subclass.prototype.constructor = subclass;
	subclass.base = baseclass.prototype;
}