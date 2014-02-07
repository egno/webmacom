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
				document.getElementById('status').innerHTML='Установлена расчётная дата: '+dt.toDbFormat('-');
			}
		}
}

function showStatus(txt){
	document.getElementById('status').innerHTML=txt;
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
				document.getElementById("status").innerHTML = ""; 
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
//	document.getElementById("buttonSave").value="Ждите. Идёт сохранение данных";

	var surl;
	var o = new Object();
	var div = document.getElementById('contentBody');
	var elems = div.getElementsByClassName('jsobj');
	var labels = div.getElementsByTagName ('label');
	var el;
	var d;
	var nm;
	var ar = new Array;

	if(!(kind.substring(0,2)=="f_")){
		switch (kind.substring(0,2)) {
			case "q_":  
				o[kind]=new Array;
				for(var i=0; i<elems.length; i++){
					el=document.getElementById(elems[i].id);
					var oel = new Object();
					for (key in labels) {
						if (labels.hasOwnProperty(key)) {
							if (labels[key].htmlFor == el.id){
								nm=labels[key].attributes['name'].nodeValue;
								if (!(nm == 'id' && (labels[key].id == 'null'))) {
									oel[nm]=labels[key].id;
								};
							};
						};
					};
					oel[el.name]=el.value
					o[kind].push(oel);
				};
				break;
	/*		case "f_":  
				var table = kind.substring(2,255);
				o[table]=new Array;
				for(var i=0; i<elems.length; i++){
					el=document.getElementById(elems[i].id);
					var oel = new Object();
					for (key in labels) {
						if (labels.hasOwnProperty(key)) {
							if (labels[key].htmlFor == el.id){
								var nm=labels[key].attributes['name'].nodeValue;
								var val=labels[key].attributes['value'].nodeValue;
								if (!(nm == 'id' && val == 'null')) {
									oel[nm]=val;
								};
							};
						};
					};
					oel[el.name]=el.value;
	//				if (!(oel.amount=='')) {
						o[table].push(oel);	
	//				};
				};
				break;
	*/
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
			default:
				var oel = new Object();
				for(var i=0; i<elems.length; i++){
					el=document.getElementById(elems[i].id);
					if (!( (el.id == 'id') && ((mode == 'new') || (el.value == '')) )) {
						oel[elems[i].id]=el.value;
					};
				};
				o[kind]=Array(oel);
		};	
		d=JSON.stringify(o);

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

