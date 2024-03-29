var appCaption="Обслуживание МКД";
var appNav=[['На главную','.'],
						['РЭУ','?t=reu'],
						['Здания','?t=building_main_companies&o=building_disp'],
						['Персонал','?t=personnel_active']
];

var purl = "j/";
var kind = "";
var mode = "";
var order = "2";
var header_table = "";
var ot="", timer=0, x=-1,y=0;

function refresh(){
	if ( kind != "") {
		if (kind==='work_plan_month' && mode==='edit'){header_table='building_work_person'};

		switch (kind){
 			case "f_work_plan":
 			case "work_plan": {
				where = ((where)? where + ' and ' : '') + "dt between '"+dt.getFirstMonthDay().toDbFormat()+"' and '"+dt.getLastMonthDay().toDbFormat()+"'";	
			}
		};

		getObj('param').innerHTML="<input id='work_date' type='date' value='"+dt.toDbFormat('-')+"' onchange='setDt(this.value, function() {refresh()});' />";
		if (header_table===""){
			tryGetData(kind, id, rel, order, where);
		} else {
			tryGetData(header_table, id, rel, order, where);
		};
	}
}

function tryGetData(url, id, rel, order, where){
  var lurl;
	var param = "";
	var o = new Object();
  var cont = document.getElementById('contentBody');  

// 	kind = url;
	cont.innerHTML = "";
  if( id != "" ) {
		id="/"+id;
  };
  if( (order != undefined) && (order != "") ) {
		param += "?o="+order;
  };
  if( (where != undefined) && (where != "") ) {
		if (param!=""){
			param += "&w="+where;
		} else {
			param += "?w="+where;
		};
  } else {
		where = "";
	};
	if (kind.substring(0,2) == "f_") {
		url += "('"+dt.toDbFormat()+"'::date)"
	};
	lurl = purl + url;
	if (rel == "") {
  	lurl += id+param;
	} else {
  	lurl += "/"+ rel + id+param;
	};
	if (mode == "new") {
		cont.innerHTML = formatTable(o);
	}
	else {
		document.getElementById("status").innerHTML = "Данные загружаются";
		makeRequest(lurl, getData);
	}
}

function tryDelData(id){
  var lurl;
  if( id != "" ) {
		id="/"+id;
		lurl = purl + kind + id;
		var ai = new AJAXInteraction(lurl, refresh);
		ai.doDelete();
  }
}

function saveSingleValue(table, el, func){
	var o = new Object();
	var oel = new Object();
	var div = document.getElementById('contentBody');
	var d;
	var labels = div.getElementsByTagName ('label');
	for (key in labels) {
		if (labels.hasOwnProperty(key)) {
			if (labels[key].htmlFor == el.id){
				var nm=labels[key].attributes['name'].nodeValue;
				var val=labels[key].attributes['value'].nodeValue;
				oel[nm]=val;
			};
		};
	};
	oel[el.name]=el.value;
	o[table]=Array(oel);	
	d=JSON.stringify(o);
	
	var ai = new AJAXInteraction('s/', func);
  ai.doPost(d);
}


function calcObjTotal(re){
	var div = document.getElementById('contentBody');
	var elems = div.getElementsByClassName('jsobj');
	var res = 0;

	for(var i=0; i<elems.length; i++){
		el=document.getElementById(elems[i].id);
		if ((el.id.search(re) != -1) ) {
			res = res + (el.value.replace(',','.') - 0);
		};
	};
	if (isNaN(res)){res='<div title="Невозможно вычислить сумму\nВ строке введены нечисловые значения"><strong>Ошибка!</strong></div>'};
	return res;
};

function tdBuilding(id, disp, href){
	var res = "";		
	res += "<td class='left expanded'>";
	if (href){
		res += hrefnvl(disp,href); 
	} else {
		res += disp;
	}
	res += "<div class='full'>";
	res += '<a href="?t=q_buildings_p&m=edit&r=building&id='+id+'&w=not(code<@\'p113\')&o=code<@\'ds\', code_disp, code" title="Характеристики объекта обслуживания"><img src="img/settings.svg" alt="Характеристики"/></a>';
	res += '<a href="?t=q_buildings_p&m=edit&r=building&id='+id+'&w=code<@\'p113\'&o=code,code_disp" title="Электронный паспорт дома"><img src="img/passport.svg" alt="Электронный паспорт"/></a>';
	res += '<a href="?t=building_work_person&r=building&id='+id+'&o=service_disp,work_full_disp" title="Услуги и работы по договору обслуживания"><img src="img/worker.svg" alt="Работы"/></a>';
	res += '<a href="?t=i_building_staff&r=building&id='+id+'" title="Закреплённый обслуживающий персонал"><img src="img/personnel.svg" alt="Персонал"/></a>';
	res += '<a href="?t=work_plan_month&m=edit&r=building&id='+id+'&o=person_disp,building_disp,work_code" title="Производственные задания персоналу на выполение работ"><img src="img/tasks_edit.svg" alt="Задания" /></a>';
	res += '<a href="?t=work_plan_month&r=building&id='+id+'&o=person_disp,building_disp,dt,work_code" title="Печать производственных заданий"><img src="img/tasks.svg" alt="Задания" /></a>';
	res += "</div>";
	res += "</td>";
	return res;
};

function tdPerson(id, disp, href){
	var res = "";		
	if (id == null) {
		res += "<td title='Сотрудник не указан'>-</td>";
	} else {
		res += "<td class='left expanded'>";
		if (href){
			res += hrefnvl(disp,href); 
		} else {
			res += disp;
		}
		res += "<div class='full'>";
		res += '<a href="?t=i_building_staff&r=person&id='+id+'" title="Закрепление за объектами"><img src="img/personnel.svg" alt="Персонал"/></a>';
		res += '<a href="?t=work_plan_month&m=edit&r=person&id='+id+'&o=person_disp,building_disp,dt,work_code" title="Производственные задания сотруднику"><img src="img/tasks_edit.svg" alt="Задания" /></a>';
	res += '<a href="?t=work_plan_month&r=person&id='+id+'&o=person_disp,building_disp,dt,work_code" title="Печать производственных заданий"><img src="img/tasks.svg" alt="Задания" /></a>';
		res += "</div>";
		res += "</td>";	
	};
	return res;
};

function formatTable(o) {
	var result = "";
	var key;
	var otmp = new Object();

	if( (mode == "edit") || (mode == "new") ) {
		if (!(o.hasOwnProperty(0))) {
			otmp.id="";
			o[0]=otmp;
		};
		switch (kind) {
			case "work_plan_month": {
			  document.getElementById("mode").innerHTML = "План работ"; 
				result = showMonthHeader();
				result += obj_work_plan_TableEdit(o);
				break;
			}
			case "q_buildings_p": {
				document.getElementById("mode").innerHTML = "<img src='img/settings.svg' alt='Характеристики' title='Характеристики'/> Характеристики зданий"; 
				result += "<div class='input'>";
/*				result += '<input onclick="saveData()" type="button" value="Сохранить" />'; */
				result += "<table><tbody>";
				result = result + "<tr>";
				result = result + "<th>Здание</th>";
				result = result + "<th>Характеристика</th>";
				result = result + "<th>Ед.изм.</th>";
				result = result + "<th>Значение</th>";
				result = result + "</tr>";
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						if (o[key].val == null){o[key].val=''};
						result+= "<tr>";
						result += tdBuilding(o[key].building,o[key].building_disp);
						result+= "<td class='left expanded'><label for='"+o[key].building+o[key].code+"'>"+nvl(o[key].code_disp,o[key].code)+"<br><span class='note full'>"+o[key].code+"</span></label></td>";
						result+= "<td>"+ nvl(o[key].measure,'&nbsp;') +"</td>";				
						if(o[key].code.substring(0,3) == 'ds.'){
							result+= "<td>"+ o[key].val +"</td></tr>";				
						} else {
							result+= "<td><label name='building' value='"+o[key].building+"' for='"+o[key].building+o[key].code+"'></label><label name='id' type='hidden' value='"+ o[key].id +"' for='"+o[key].building+o[key].code+"'></label><label name='code' type='hidden' value='"+ o[key].code +"' for='"+o[key].building+o[key].code+"'></label><input class='jsobj' name='val' id='"+o[key].building+o[key].code+"' type='number' value='"+ o[key].val +"'/></td></tr>";
						};

					};
				};
				result = result + "</tbody></table>";
				break;
			}
		}
		if(!(kind.substring(0,2)=="f_")) {
			result += '<input id="buttonSave" onclick="saveData()" type="button" value="Сохранить" /> ';
		};
		result = result + '</div>';

	} else {
		switch (kind) {
			case "work_plan_month":{
			  document.getElementById("mode").innerHTML = "Производственное задание"; 
				var dayCount = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
				result = showMonthHeader();
				var old = new Object();
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						if ((old.building != o[key].building) || (old.person != o[key].person)){
							if (old.id != undefined) {
								result += "</table><span style='page-break-before:always;'></span>";
							};
							old = o[key];
							result += "<h2><a href='?t=work_plan_month&m=edit&r=building_staff&id="+o[key].building_staff+"&o=service_disp,work_code' title='Изменить задание'>Производственное задание</a></h2><h3><a href='?t=work_plan_month&m=edit&r=building_staff&id="+o[key].building_staff+"&o=service_disp,work_code' title='Изменить задание'>"+o[key].person_disp+"<br>"+o[key].building_disp+"</a></h3>";
							result += "<table>";
							result = result + "<tr>";
							result = result + "<th>Дата</th>";
							result = result + "<th>Работа</th>";
							result = result + "<th>План</th>";
							result = result + "<th>Факт</th>";
							result = result + "<th>Замечания</th>";
							result = result + "<th>Уполномоченный по дому</th>";
							result = result + "<th>Исполнитель</th>";
							result = result + "</tr>";
						};
						result += "<tr>";
						result += "<td>"+dbDate(o[key].dt).toShortFormat()+"</td>"; 
						result += "<td class='left printsmall'>"+o[key].work_disp + "</td>";
						result = result + "<td><b>"+nvl(o[key].work_amount,'-')+"</b> (из "+nvl(o[key].base,'-')+")&nbsp;"+nvl(o[key].measure,'')+"</td>";
						result = result + "<td>&nbsp;</td>";
						result = result + "<td>&nbsp;</td>";
						result = result + "<td>&nbsp;</td>";
						result = result + "<td>&nbsp;</td>";
						result = result + "</tr>";
					}
				}
				result = result + "</table>";
				break;
			}
			case "building_work_person": {
			  document.getElementById("mode").innerHTML = "Договор: услуги и работы"; 
				result = "<table>";
				result = result + "<tr>";
				result = result + "<th>Адрес</th>";
				result = result + "<th>Услуга</th>";
				result = result + "<th>Работа</th>";
				result = result + "<th>Кол-во</th>";
				result = result + "<th>Сотрудник</th>";
				result = result + "</tr>";
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						result = result + "<tr>";
						result += tdBuilding(o[key].building,o[key].building_disp);
						result = result + "<td class='left'>" + o[key].service_disp + "</td>";
						result = result + "<td class='left'><span class='note'>" + o[key].work_code + "</span><br>" + o[key].work_disp + "<br><span class='note'>" + o[key].base_disp + ": <a href='?t=q_buildings_p&m=edit&id="+o[key].prop+"'>" + o[key].base_val + "</a></span></td>";
						result = result + "<td class='left'>" + nvl(o[key].amount,'-') + "<br><span class='note'>" + o[key].amount_interval + "</span></td>";
						result = result + "<td class='left'>" + hrefnvl(o[key].person_disp,'?t=i_building_staff&r=person&id='+o[key].person) + "<br><span class='note'>"+nvl(o[key].position_disp,'')+"</span></td>";
						
						result = result + "</tr>";
					}
				}
				result = result + "</table>";
				break;
			}
			case "i_building_staff": {
			  document.getElementById("mode").innerHTML = "<img src='img/personnel.svg' alt='Персонал' title='Персонал'/> Обслуживающий персонал"; 
				result = "<table>";
				result = result + "<tr>";
				result = result + "<th>&nbsp;</th>";
				result = result + "<th>Здание</th>";
				result = result + "<th>Сотрудник</th>";
				result = result + "<th>Должность</th>";
				result = result + "<th>Ставка</th>";
				result = result + "</tr>";
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						result = result + "<tr>";
						result = result + "<td><a href='#' onclick='tryDelData(\""+o[key].id+"\")'><img src='img/delete.svg' alt='Удалить' title='Удалить' /></a></td>";
						result += tdBuilding(o[key].building,o[key].building_disp);
						result += tdPerson(o[key].person, o[key].person_disp); 
						result = result + "<td class='left'>"+o[key].staff_disp+"</td>";
						result = result + "<td>" + o[key].part + "</td>";
						result = result + "</tr>";
					}
				}
				result = result + "<tr id='new_row' style='display:none'>";
				result = result + "<td><input class='jsobj' id='new_id' name='id' value='' type='hidden'/><a href='#'><a href='#'><a href='#' onclick='saveData(\"new\")' id='new_accepted'><img src='img/accepted.svg'  alt='Сохранить' title='Сохранить' /></a><a href='#'><img src='img/delete.svg' alt='Удалить' title='Удалить' onclick='getObj(\"show_add\").style.display=\"block\"; getObj(\"new_row\").style.display=\"none\"' /></a></td>";		
				if(getParameterByName("r") == "building"){
					result += "<td><label id='building_id' for='new_id' name='building' value='"+getParameterByName("id")+"' ></label></td>";
				} else {
					result = result + "<td class='left'><input id='building_id' for='new_id' name='building' type='hidden'/><input id='building' name='building' type='text' autocomplete='OFF' onkeyup='PressKey(event)' value=''/> <select class='dropdown' name='buildings' id='building_select' size=5 style='visibility:hidden;position:absolute;z-index:999;' onchange=\"getObj('building').value=ot=this.options[this.selectedIndex].text; getObj('building_id').value=ot=this.options[this.selectedIndex].value;\" onkeyup='PressKey2(event)' ondblclick='getObj(\"building_select\").style.visibility = \"hidden\"'> </select> </td>";
				};
				result = result + "<td class='left'><input id='contract_id' for='new_id' name='contract'  type='hidden'/><input name='contract' id='contract' type='text' autocomplete='OFF' onkeyup='PressKey(event)' value=''/> <select class='dropdown' name='pers_contracts' id='contract_select' size=5 style='visibility:hidden;position:absolute;z-index:999;' onchange=\"getObj('contract').value=ot=this.options[this.selectedIndex].text; getObj('contract_id').value=ot=this.options[this.selectedIndex].value;\" onkeyup='PressKey2(event)' ondblclick='getObj(\"contract_select\").style.visibility = \"hidden\"'> </select> </td>";
				result = result + "<td class='left'>&nbsp;</td>";
				result = result + "<td class='left'>&nbsp;</td>";
				result = result + "</tr>";
				result = result + "</table>";
				result = result + "<div class='nav action' id='show_add'><a href='#' onclick='getObj(\"new_row\").style.display=\"table-row\"; getObj(\"show_add\").style.display=\"none\"' ><img src='img/add.svg' /> Добавить</a></div>"
				break;
			}
			case "building_main_companies": {
			  document.getElementById("mode").innerHTML = "<img src='img/buildings.svg' alt='Здания' title='Здания'/> Здания"; 
				result = "<table>";
				result = result + "<tr>";
				result = result + "<th>РЭУ</th>";
				result = result + "<th>Адрес</th>";
				result = result + "<th>Персонал</th>";
				result = result + "</tr>";
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						result = result + "<tr>";
						result = result + "<td class='left'><a href='?t=building_main_companies&r=company&id="+o[key].company+"'>" + o[key].company_disp + "</a></td>";
						result += tdBuilding(o[key].id, o[key].building_disp);
						result = result + '<td><a href="?t=i_building_staff&r=building&id='+o[key].id+'" title="Персонал: '+o[key].pers_cnt+'">'+o[key].pers_cnt+'</a> </td>';
						result = result + "</tr>";
					}
				}
				result = result + "</table>";
				break;
			}
			case "reu": {
			  document.getElementById("mode").innerHTML = "РЭУ"; 
				result = "<table>";
				result = result + "<tr>";
				result = result + "<th>Наименование</th>";
				result = result + "<th>&nbsp;</th>";
				result = result + "</tr>";
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						result = result + "<tr>";
						result = result + "<td class='left'>"+ o[key].disp +"</td>";
						result = result + "<td class='left'><a href='?t=building_main_companies&r=company&id="+o[key].id+"&o=building_disp'><img src='img/buildings.svg' alt='Здания' title='Здания'/></a></td>";
						result = result + "</tr>";
					}
				}
				result = result + "</table>";
				break;
			}
			case "personnel_active": {
			  document.getElementById("mode").innerHTML = "Сотрудники"; 
				result = "<table>";
				result = result + "<tr>";
				result = result + "<th>Ф.И.О.</th>";
				result = result + "</tr>";
				for (key in o) {
					if (o.hasOwnProperty(key)) {
						result = result + "<tr>";
						result = result + tdPerson(o[key].person, o[key].person_disp);
						result = result + "</tr>";
					}
				}
				result = result + "</table>";
				break;
			}
		}
//		result += "<div class='nav action'><a href='?t="+kind+"&m=new'>Добавить</a></div>";
	}
	return result;
}


function obj_work_plan_TableEdit(o){
	var dayCount = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
	var result="";

	function updateInputValues(o) {
		var dest;
		var regex = new RegExp('-', 'gi');
		try { 
			for (var key in o) {
				if (o.hasOwnProperty(key)) {
					dest=getObj(o[key].dt.replace(regex,'')+o[key].service+o[key].work+o[key].building_staff);
					dest.value = nvl(o[key].plan_amnt,'');
					dest.style.display='run-in';
					dest["maxValue"] = o[key].calend_hours;
					dest["workHours"] = o[key].work_hours==null?0:o[key].work_hours;
					dest.offsetParent.title = "Рабочий день, часов: "+ dest["maxValue"] +"\n"+"Трудозатрат, часов: "+ dest["workHours"] ;
					if (o[key].calend_hours == 0) {
						dest.offsetParent.className = "holyday";
					};
					if (dest["workHours"] > dest["maxValue"]) {
						addClass(dest.offsetParent, "alert");
					};
				};
			};
		}
		catch(e4){alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);};
		getObj("total"+o[key].dt.replace(regex,'').substring(0,6)+o[key].service+o[key].work+o[key].building_staff).innerHTML=calcObjTotal(o[key].service+o[key].work+o[key].building_staff);
	};

	result += "<form><table><thead>";
	result = result + "<tr>";
	result = result + "<th>Сотрудник</th>";
	result = result + "<th>Адрес</th>";
	result = result + "<th>Работа</th>";
	result = result + "<th>Объём работ</th>";
	result = result + "<th>Договор</th>";
	result = result + "<th>План</th>";
	for (var i = 0; i < dayCount; i) {
		result = result + "<th>"+ ++i +"<br><span class='note'></span></th>";
	};
	result = result + "</tr></thead><tbody>";
	var old = new Object();
	for (key in o) {
		if (o.hasOwnProperty(key)) {
			result = result + "<tr>";
			result += tdPerson(o[key].person, o[key].person_disp); 
			result += tdBuilding(o[key].building,o[key].building_disp);
			result = result + "<td class='left expanded'><span class='full'>" + o[key].work_disp + "<br><span class='note'>"+ o[key].work_code +"</span></span><span class='main'>" + o[key].work_disp.substring(0,30) + "...</span></td>";
			result = result + "<td class='left expanded'>"+nvl(o[key].norm_amount,'??')+" чел.-час<br><span class='full'>"+ o[key].base_disp + ': <a href="/?t=q_buildings_p&m=edit&id='+o[key].prop+'">' + o[key].base_val +"</a>&nbsp;"+ o[key].measure +" </span></td>";
			result = result + "<td>" + nvl(o[key].amount,'-') + "<br><span class='note'>" + o[key].amount_interval + "</span></span></td>";
			result = result + "<td><div id='total"+dt.toYMFormat()+o[key].service+o[key].work+o[key].building_staff+"' name='dt' value='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+"'>0</div></td>";
			for (var i = 0; i < dayCount; i++) {
				if (!(o[key].building_staff==null)) {
					result += "<td>";
//					result += "<div class='spinner'></div>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='dt' value='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+"'></label>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='service' value='"+o[key].service+"'></label>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='work' value='"+o[key].work+"'></label>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='building_staff' value='"+o[key].building_staff+"'></label>";
								result += "<input display='none' class='jsobj' id='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='amount' autocomplete='OFF' value='' onchange='saveSingleValue(\"work_plan_month\", this); getObj(\"total"+dt.toYMFormat()+o[key].service+o[key].work+o[key].building_staff+"\").innerHTML=calcObjTotal(\""+o[key].service+o[key].work+o[key].building_staff+"\");' value=''></td>";
//					result += "<input class='jsobj' id='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='amount' autocomplete='OFF' value='' onchange='saveSingleValue(\"work_plan\", this );' name='dt' value=''></td>";
				} else {
					result += "<td title='Сотрудник не указан'>-</td>";
				};
			};
			result = result + "</tr>";
			if (o[key].building_staff!==null) {
				makeRequest(purl+"building_work_month_plan?w=(service='"+o[key].service+"') and (work='"+o[key].work+"') and (building_staff='"+o[key].building_staff+"')", function(txt){
						updateInputValues(txt); 
					})
			};
		}
	}
	result = result + "</tbody></table></form>";
	return result;
}
