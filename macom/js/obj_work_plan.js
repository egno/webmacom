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
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='dt' value='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+"'></label>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='service' value='"+o[key].service+"'></label>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='work' value='"+o[key].work+"'></label>";
					result += "<label for='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='building_staff' value='"+o[key].building_staff+"'></label>";
								result += "<input class='jsobj' id='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='amount' autocomplete='OFF' value='' onchange='saveSingleValue(\"work_plan\", this); getObj(\"total"+dt.toYMFormat()+o[key].service+o[key].work+o[key].building_staff+"\").innerHTML=calcObjTotal(\""+o[key].service+o[key].work+o[key].building_staff+"\");' value=''></td>";
//					result += "<input class='jsobj' id='"+dt.toYMFormat()+("0"+-~(i)).substr(-2,2)+o[key].service+o[key].work+o[key].building_staff+"' name='amount' autocomplete='OFF' value='' onchange='saveSingleValue(\"work_plan\", this );' name='dt' value=''></td>";
				} else {
					result += "<td title='Сотрудник не указан'>-</td>";
				};
			};
			result = result + "</tr>";
			if (!(o[key].building_staff==null)) {
				makeRequest(purl+"macom.building_work_month_plan('"+dt.toDbFormat()+"'::date,'"+o[key].service+"','"+o[key].work+"','"+o[key].building_staff+"')", function(txt){updateInputValues(txt);})
			};
		}
	}
	result = result + "</tbody></table></form>";
	return result;
}
