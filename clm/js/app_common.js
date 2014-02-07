var purl = "j/";
var kind = "";
var mode = "";
var where;
var dt = new Date();
var ym;
var id;
var rel;

function init(){
	var saved_dt=get_cookie("workdate");
  if (saved_dt!=undefined) {
		setDt(dbDate(saved_dt));
	} else {
		setDt(dt);
	};
	
	window.document.title=appCaption;	
	getObj('header').innerHTML='<h1><a href=".">'+appCaption+'</a> <span id="mode">&nbsp;</span></h1>';
	getObj('app_name').innerHTML=appCaption;
	showMenu();	
	refresh();
}

function showMenu() {

	function calcArray(arr){
		var res='';
		for(var i=0; i<arr.length; i++){
			if (Array.isArray(arr[i][1])) {
				res += '<li><a href="#">'+arr[i][0]+'</a>'+calcArray(arr[i][1])+'</li>';
			} else {
				res += '<li><a href="'+arr[i][1]+'">'+arr[i][0]+'</a></li>';
			}
		};
		return '<ul class="nav">'+ res+ '</ul>';
	};
	
	getObj('nav').innerHTML=calcArray(appNav);
}

function setDt(date){
		if (date) {
			var temp_dt=new Date(date);
			if ( isFinite(temp_dt.getYear()) && isFinite(temp_dt.getMonth()) && isFinite(temp_dt.getDate()) ) {
				dt=temp_dt;
				set_cookie("workdate", dt.toDbFormat());
				showStatus('Установлена расчётная дата: '+dt.toDbFormat('-'));
			}
		}
}

function showStatus(txt){
	document.getElementById('status').innerHTML=nvl(txt,'&nbsp;','');
}

function showStatusAndRefresh(txt){
	showStatus(txt);
};

function showList(m){
	var res = '';
	for(var i=0; i<m.length; i++){
		res += '<li><a href="'+m[i][1]+'">'+m[i][0]+'</a>';
	};
	getObj('contentBody').innerHTML='<ul>' + res + '</ul>';
};

function getData(o) {
  var cont = document.getElementById('contentBody');  
	try { 
				showStatus(); 
				cont.innerHTML = formatTable(o);  
	} catch(e4){alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);}
}

function checkSave(o){
	if (o) {
		showStatus('Сохранено успешно');
		setTimeout(function() { refresh() }, 1000);
	} else {
		showStatus('<strong>Ошибка сохранения</strong>');
	};
}

function saveData(fnew){
	var surl;
	var o = new Object();
	var div = document.getElementById('contentBody');
	var elems = div.getElementsByClassName('jsobj');
	var labels = div.getElementsByTagName ('label');
	var inputs = div.getElementsByTagName ('input');
	var selects = div.getElementsByTagName ('select');
	var el;
	var d;
	var nm;
	var val;
	var ar = new Array;

	if(!(kind.substring(0,2)=="f_")){
		switch (kind.substring(0,2)) {
			case "i_":  
				var oel = new Object();
				for(var i=0; i<elems.length; i++){
					el=document.getElementById(elems[i].id);
					if (!( (el.id == 'id') && ((fnew == 'new') || (el.value == '')) )) {
						oel[elems[i].id]=el.name;
					};
				};
				o[kind]=Array(oel);
				break;
			default: {
				o[kind]=new Array;
				for(var i=0; i<elems.length; i++){
					if (elems[i].attributes['name']) {
						var oel = new Object();
						for (key in labels) {
							if (labels.hasOwnProperty(key)) {
								if (labels[key].htmlFor == elems[i].id && (labels[key].attributes['name']) && (labels[key].attributes['value'])){
									nm=labels[key].attributes['name'].nodeValue;
									val=labels[key].attributes['value'].nodeValue;
									if (!(nm == 'id' && (!(val) || val == 'null' || val==''))) {
										oel[nm]=val;
									};
								};
							};
						};
						for (key in inputs) {
							if (inputs.hasOwnProperty(key)) {
								if ((inputs[key].attributes['for']) && (inputs[key].attributes['for'].nodeValue == elems[i].id) && (inputs[key].attributes['name']) && (inputs[key].attributes['value'])){
									nm=inputs[key].attributes['name'].nodeValue;
									val=inputs[key].value;
									if (!(nm == 'id' && (!(val) || val == 'null' || val==''))) {
										oel[nm]=val;
									};
								};
							};
						};
						for (key in selects) {
							if (selects.hasOwnProperty(key)) {
								if ((selects[key].attributes['for']) && (selects[key].attributes['for'].nodeValue == elems[i].id) && (selects[key].attributes['name'])){
									nm=selects[key].attributes['name'].nodeValue;
									val=selects[key].value;
									if (!(nm == 'id' && (!(val) || val == 'null' || val==''))) {
										oel[nm]=val;
									};
								};
							};
						};
						nm=elems[i].attributes['name'].nodeValue;
						val=elems[i].value;
						if (!(nm == 'id' && (!(val) || val == 'null' || val==''))) {
							oel[elems[i].attributes['name'].nodeValue]=elems[i].value
						};
						o[kind].push(oel);
					};
				};
			};
		};	
		d=JSON.stringify(o);
	
//		alert(d);
		var ai = new AJAXInteraction('s', checkSave);
		ai.doPost(d);
	}
}

	function showMonthHeader(){
		if ( (!rel) && (id) ){
			return '';
		} else {
			return "<div class='noprint'><h1><a href='#' onclick='setDt(dt.addMonth(-1)); refresh();' title='"+dt.addMonth(-1).toFullMonthFormat()+"'><img src='img/arrowleft.svg' alt='&larr;' /></a> &emsp;"+dt.toFullMonthFormat()+"&emsp; <a href='#' onclick='setDt(dt.addMonth(1)); refresh();' title='"+dt.addMonth(1).toFullMonthFormat()+"'><img src='img/arrowright.svg' alt='&rarr;' /></a></h1></div>";
		};
	};

