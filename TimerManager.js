function TimerObject (uid, obj, funcName, delay, args, repeat)
{
	this.uid = uid;
	this.obj = obj;
	this.funcName = funcName;
	this.delay = delay;
	this.args = args;
	this.repeat = repeat;
}

TimerManager = new Object();
TimerManager.timers = [];
TimerManager.add = function add(obj, funcName, delay, args, repeat)
{
	for (var i=0; i<this.timers.length; i++)
		if (!this.timers[i])
			break;
	this.timers[i] = new TimerObject(i, obj, funcName, delay, args, repeat);
	return this.timers[i];
}
TimerManager.remove = function remove(timerObject)
{
	this.stop(timerObject);
	for (var i=0; i<this.timers.length; i++)
		if (this.timers[i] == timerObject)
		{
			this.timers[i] = null;
			break;
		}
}
TimerManager.start = function start(timerObject)
{
	if (!timerObject.id)
	{
		if (timerObject.repeat)
			timerObject.id = setInterval("TimerManager.exec("+timerObject.uid+");", timerObject.delay);
		else
			timerObject.id = setTimeout("TimerManager.exec("+timerObject.uid+");", timerObject.delay);
	}
}
TimerManager.stop = function stop(timerObject)
{
	if (timerObject.id)
	{
		if (timerObject.repeat)
			clearInterval(timerObject.id);
		else
			clearTimeout(timerObject.id);
		delete timerObject.id;
	}
}
TimerManager.exec = function exec(uid)
{
	var timer = this.timers[uid];
	if (timer)
	{
		timer.obj[timer.funcName].apply(timer.obj,timer.args);
		if (!timer.repeat)
			this.stop(timer);
	}
}