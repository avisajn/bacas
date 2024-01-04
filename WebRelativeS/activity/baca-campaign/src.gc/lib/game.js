const API = require('./common/api');
const canvas = window.__canvas = new fabric.Canvas('game_main_canvas', { selection: false });
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

// const moveColor = 'red';
const moveColor = 'rgba(0,0,0,0.01)';

function makeCircle(left, top ,selectable) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 15,
      radius: selectable ? 20 : 5,
      fill: selectable ? moveColor : '#000' ,
      stroke: moveColor,
      selectable : selectable ? true : false,
    });
    c.hasControls = c.hasBorders = false;

    return c;
}


function makeLine(coords) {
    return new fabric.Line(coords, {
      fill: '#000',
      stroke: '#000',
      strokeWidth: 3,
      selectable: false
    });
};

var movePoint = null;
var moveStart = false;
var currentStartPoint = null;
var currentLine = null;
var firstPoint = null;

var offset_left = 0;
var offset_top = 0;

var pointsMapping = [
	{x:114, y:94 ,obj:null },
	{x:141, y:146 ,obj:null},
	{x:97, y:207 ,obj:null},
	{x:207, y:207 ,obj:null},
	{x:197, y:110 ,obj:null},
];
const distance = 13;
// 判断是否有交叉点，如果有，则返回一个 交叉点的对象，如果没有，则返回null
const esti_point = function(x, y){
	for(var i=0,k;i<5;i++){
		k = pointsMapping[i];
		if(!k.obj.ignore && Math.abs(k.x - x) <= distance && Math.abs(k.y - y) <= distance ){
			return k.obj;
		}
	}
	return null;
}
// 已经连线成功的点数
var successLines = [];
var all_over = false;
var success_callback = function(){};
module.exports =  {
	init : function(callback){
		if(callback){
			success_callback = callback;
		}
	},
	clear : function(){
		setTimeout(function(){
			const canvas_offset = $('#game_main_canvas').offset();
			offset_left = canvas_offset.left;
			offset_top = canvas_offset.top;
		},100);
		successLines = [];
		all_over = false;
		firstPoint = null;
		currentLine = null;
		currentStartPoint = null;
		moveStart = null;
		canvas.clear();
	},
	start: function () {
		this.clear();
		movePoint = makeCircle(10, 10 ,true);
		canvas.add(movePoint);
		for(var i=0,len=pointsMapping.length;i<len;i++){
			const _temp_point = makeCircle(pointsMapping[i].x, pointsMapping[i].y);
			pointsMapping[i].obj = _temp_point;
			_temp_point._idx = i+1;
			canvas.add(_temp_point);
		}
		canvas.on('mouse:down' ,function(e) {
			const $target = e.target;
			if(!$target || all_over) return ;
			if(!moveStart){
				currentStartPoint = $target;
				firstPoint = $target;
				$target.ignore = true;
				successLines.push($target._idx);
				// 添加一条线
				currentLine = makeLine([ currentStartPoint.left, currentStartPoint.top ,currentStartPoint.left+1 ,currentStartPoint.top+1])
				canvas.add(currentLine);
				canvas.renderAll();
			}
			moveStart = true;
		});

		canvas.on('mouse:move', function(e) {
			if(!moveStart || !currentStartPoint || all_over) return;
			e = e.e['touches'][0];
			const x = e.clientX - offset_left + 20;
			const y = e.clientY - offset_top + 20;
			movePoint.set({ 'left': x, 'top': y});
			const second_point = esti_point(x ,y);
			if(second_point){
				// 将线闭合
				currentLine.set({'x2' : second_point.left ,'y2' : second_point.top});
				currentStartPoint = second_point;
				second_point.ignore = true;
				successLines.push(second_point._idx);
				// 创建一条新线
				currentLine = makeLine([ currentStartPoint.left, currentStartPoint.top ,currentStartPoint.left+1 ,currentStartPoint.top+1])
				canvas.add(currentLine);
				if(successLines.length == 5){
					firstPoint.ignore = false;
				}else if(successLines.length == 6){
					all_over = true;
					success_callback(successLines);
					return;
				}else{

				}
			}else{
				currentLine.set({'x2' : x ,'y2' : y});
			}
			canvas.renderAll();
		});
	},

	getTimeLong : function () {
		return time_long;
	},
}