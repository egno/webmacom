// Наименование приложения			
var appCaption = "Учёт ГСМ";
// Главное меню
var appNav = 
				[
					['На главную', '.'],
					['Путевые листы', '?t=w_waybills_month'],
					['Справочники',
						[
							['Сезоны', '?t=w_season_dates'],
							['Автомобили', '?t=w_cars'],
							['Водители', '?t=drivers']
						]
					],
					['Контроль', '?t=alerts', 'nav_check_alarm'],
					['Отчёты',
						[
							['Карточка первичных документов', '?t=w_waybill_card_month'],
							['Учёт рабочего времени', '?t=w_driver_worktime_month'],
							['Справка о затратах', '?t=w_costs_month'],
							['Справка о тоннокилометрах',
								[
									['Собственные нужды', '?t=w_tnkm_month'],
									['Сторонние', '?t=w_tnkm_month_enemy']
								]
							],
							['Справка об использовании транспорта', '?t=w_car_use_month']
						]
					]
				];

var flViewOnly = false;

// Главная функция				
function refresh() {
	if (kind !== "") {
		switch (kind) {
			case 'alerts':
				{
					order = "table_disp, o";
					break;
				}
			case 'q_car_norms':
				{
					order = "car_disp, kind_disp";
					break;
				}
			case 'w_car_use_month':
				{
					order = "car_disp";
					break;
				}
			case 'w_costs_month':
				{
					order = "workplace_disp, service_disp, car_disp";
					break;
				}
			case 'w_driver_worktime_month':
				{
					order = "driver_disp, car_disp";
					break;
				}
			case 'w_tnkm_month':
			case 'w_tnkm_month_enemy':
				{
					order = "service_disp, service, car_disp, car";
					break;
				}
			case 'w_waybill_card_month':
				{
					order = "driver_disp, driver, car_disp, car, dt, num, odo_b, odo_e, workplace_disp";
					break;
				}
			case 'w_waybills_month':
				{
					order = "dt, num, odo_b";
					if (mode==='new' || mode==='edit') {
						kind = "w_waybills";
					};
					break;
				}
		}
		;
		checkAttentions();
//		document.getElementById('param').innerHTML="<input id='work_date' type='date' value='"+dt.toDbFormat('-')+"' onchange='setDt(this.value); refresh();' />";
		tryGetData(kind, id, rel);
	}
}

// Проверка, есть ли ошибки в первичных документах				
function checkAttentions() {
	function updateAttention(o) {
		if (o[0].cnt > 0) {
			addClass(getObj('nav_check_alarm'), 'strong');
			getObj('attention').innerHTML = 'Внимание! Исходные данные содержат <a href="?t=alerts&o=table_disp,disp" title="Просмотреть результаты контроля">ошибки</a>. Отчёты могут содержать некорректную информацию.';
		}
		;
	}
	;
	makeRequest(purl + "alerts_count", updateAttention);
}
;

// Получить данные от сервера
function tryGetData(url, id, rel) {
	var lurl;
	var o = new Object();
	var cont = document.getElementById('contentBody');
	var param = "";

	kind = url;
	cont.innerHTML = "";
	if (id) {
		id = "/" + id;
	}
	;
	if ((order !== undefined) && (order !== "")) {
		param += "?o=" + order;
	}
	;
	if ((where !== undefined) && (where !== "")) {
		if (param !== "") {
			param += "&w=" + where;
		} else {
			param += "?w=" + where;
		}
		;
	} else {
		where = "";
	}
	;
	if (rel === "") {
		lurl = purl + url + id + param;
	} else {
		lurl = purl + url + "/" + rel + id + param;
	}
	;
	if ((mode === "new") && (!id)) {
		cont.innerHTML = formatTable(o);
	}
	else {
		showStatus("Данные загружаются");
		makeRequest(lurl, getData);
	}
}

// Вывести ячейку таблицы с информацией о водителе
function tdDriver(id, disp, href, title) {
	var res = "";
	if (id === null) {
		return '<td>-</td>';
	}
	;
	res += "<td class='left printsmall expanded'>";
	if (href) {
		res += hrefnvl(disp, href, undefined, title);
	} else {
		res += disp;
	}
	res += "<div class='full'>";
	res += '<a href="?t=w_waybills_month&r=driver&id=' + id + '" title="Путевые листы водителя: ' + disp + '"><img src="img/tasks.svg" alt="Путевые листы"/></a>';
	res += "</div>";
	res += "</td>";
	return res;
}
;

// Вывести ячейку таблицы с информацией об автомобиле
function tdCar(id, disp, href, title) {
	var res = "";
	if (id === null) {
		return '<td>-</td>';
	}
	;
	res += "<td class='left printsmall expanded'>";
	if (href) {
		res += hrefnvl(disp, href, undefined, title);
	} else {
		res += disp;
	}
	res += "<div class='full'>";
	res += '<a href="?t=w_cars&m=edit&id=' + id + '" title="Редактировать т/с: ' + disp + '"><img src="img/edit.svg" alt="Редактировать"/></a>';
	res += '<a href="?t=q_car_norms&m=edit&r=car&id=' + id + '" title="Нормы т/с: ' + disp + '"><img src="img/settings.svg" alt="Нормы"/></a>';
	res += '<a href="?t=w_waybills_month&r=car&id=' + id + '" title="Путевые листы т/с: ' + disp + '"><img src="img/tasks.svg" alt="Путевые листы"/></a>';
	res += "</div>";
	res += "</td>";
	return res;
}
;

// Основная функция обработки данных, полученных с сервера 
function formatTable(o) {
	var result = "";
	var key;
	var otmp = new Object();

	// Режимы редактирования
	if ((mode === "edit") || (mode === "new")) {
		if (!(o.hasOwnProperty(0))) {
			otmp.id = "";
			o[0] = otmp;
		}
		;
		switch (kind) {
			// Редактирование путевого листа
			case "w_waybills":
				{
					if (mode === 'new') {
						document.getElementById("mode").innerHTML = "<a href=?t=" + kind + ">Новый Путевой лист</a>";
					} else {
						document.getElementById("mode").innerHTML = "<a href=?t=" + kind + ">Путевой лист</a>: #" + o[0].num;
					}
					;
					result += "<input class='jsobj' id='" + o[0].id + "' type='hidden' name='id' value='" + o[0].id + "' />";
					result += "<table><tbody>";
					result = result + "<tr>";
					result = result + "<th>Наименование</th>";
					result = result + "<th>Значение</th>";
					result = result + "</tr>";
					result += genRow(o[0], "Номер", "text", "num");
					result += genRow(o[0], "Дата", "date", "dt");
					result += genRow(o[0], "Водитель", "list", "driver", "drivers");
					result += genRow(o[0], "Автомобиль", "list", "car", "cars");
					result += genRow(o[0], "Место работы", "list", "workplace", "workplaces");
					result += genRow(o[0], "вид работы", "list", "service", "services");
					result += genRow(o[0], "отработано часов на линии", "number", "hours_work");
					result += genRow(o[0], "часов на ремонте", "number", "hours_repair");
					result += genRow(o[0], "показание спидометра на начало", "number", "odo_b");
					result += genRow(o[0], "показание спидометра на конец", "number", "odo_e");
					result += genRow(o[0], "работа установки", "number", "set_work");
					result += genRow(o[0], "марка топлива", "text", "fuel_mark");
					result += genRow(o[0], "примечание по источнику топлива", "text", "fuel_note");
					result += genRow(o[0], "выдано", "number", "fuel_issued");
					result += genRow(o[0], "фактический расход", "number", "fuel_fact");
					result = result + "</tbody></table>";
					break;
				}
			// Редактирование автомобиля
			case "w_cars":
				{
					result += '<a href="?t=q_car_norms&m=edit&r=car&id=' + id + '" title="Нормы"><img src="img/settings.svg" alt="Нормы"/></a>';
					if (!(o[0].hasOwnProperty('disp'))) {
						document.getElementById("mode").innerHTML = "<a href=?t=" + kind + ">Новый Автомобиль</a>";
					} else {
						document.getElementById("mode").innerHTML = "<a href=?t=" + kind + ">Автомобиль</a>: #" + o[0].disp;
					}
					result += "<input class='jsobj' id='" + id + "' type='hidden' name='id' value='" + id + "' />";
					result += "<table><tbody>";
					result = result + "<tr>";
					result = result + "<th>Наименование</th>";
					result = result + "<th>Значение</th>";
					result = result + "</tr>";
					result += genRow(o[0], "марка автомобиля государственный номер", "text", "disp");

					result = result + "</tbody></table>";
					break;
				}
			// Редактирование норм автомобиля
			case "q_car_norms":
				{
					document.getElementById("mode").innerHTML = "Нормы";
					result += "<table><tbody>";
					result = result + "<tr>";
					result = result + "<th>Автомобиль</th>";
					result = result + "<th>Норма</th>";
					result = result + "<th>Значение</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result += "<tr>";
							result += tdCar(o[key].car, o[key].car_disp, "?t=" + kind + "&m=edit&r=car&id=" + o[key].car);
							result += "<td class='left'><a href='?t=" + kind + "&m=edit&r=kind&id=" + o[key].kind + "'  title='"+nvl(o[key].note,"")+"'>" + o[key].kind_disp + "</a></td>";
							result += "<td>";
							result += "<label type='hidden' name='car' value='" + o[key].car + "' for='" + o[key].car + o[key].kind + "'></label>";
							result += "<label type='hidden' name='id' value='" + o[key].id + "' for='" + o[key].car + o[key].kind + "'></label>";
							result += "<label type='hidden' name='kind' value='" + o[key].kind + "' for='" + o[key].car + o[key].kind + "'></label>";
							result += "<input class='jsobj' name='val' id='" + o[key].car + o[key].kind + "' type='number' value='" + o[key].val + "'/></td></tr>";
						}
						;
					}
					;
					result = result + "</tbody></table>";
					break;
				}
			// Редактирование сезонов
			case "w_season_dates":
				{
					if (!(o[0].hasOwnProperty('dt'))) {
						document.getElementById("mode").innerHTML = "<a href=?t=" + kind + ">Новый Приказ о смене сезона</a>";
					} else {
						document.getElementById("mode").innerHTML = "<a href=?t=" + kind + ">Приказ о смене сезона</a>: c " + o[0].dt;
					}
					;
					result += "<input class='jsobj' id='" + id + "' type='hidden' name='id' value='" + id + "' />";
					result += "<table><tbody>";
					result = result + "<tr>";
					result = result + "<th>Наименование</th>";
					result = result + "<th>Значение</th>";
					result = result + "</tr>";
					result += genRow(o[0], "Дата начала сезона", "date", "dt");
					result += genRow(o[0], "Сезон", "list", "season", "seasons");
					result = result + "</tbody></table>";
					break;
				}
		}

		result += '<input class="action" onclick="saveData()" type="button" value="Сохранить" /> ';

	} else {
		// Режим просмотра данных
		switch (kind) {
			// Просмотр отчёта
			case "w_car_use_month":
				{
					var total = new Array(0, 0, 0, 0, 0, 0);
					document.getElementById("mode").innerHTML = "Справка об использовании транспорта";
					result = "";
					result += '<h2>Справка<br>';
					result += 'об использовании транспорта<br>';
					result += '<span class="noscreen">за ' + dt.toFullMonthFormat() + '</span></h2>';
					result += showMonthHeader();
					result += "<table>";
					result = result + "<tr>";
					result = result + "<th rowspan='2'>наименование единицы транспорта</th>";
					result = result + "<th rowspan='2'>стоимость часа транспорта</th>";
					result = result + "<th rowspan='2'>норма времени в месяце</th>";
					result = result + "<th rowspan='2'>всего отработано согласно табеля учета рабочего времени</th>";
					result = result + "<th colspan='3'>фактически отработанное количество часов согласно путевых листов</th>";
					result = result + "<th rowspan='2'>отклонения факта ( &quot;-&quot; автомобиль простаивал                &quot;+&quot; автомобиль переработал)</th>";
					result = result + "<th rowspan='2'>примечание</th>";
					result = result + "<th rowspan='2'>Убытки от простоя</th>";
					result = result + "</tr>";
					result = result + "<tr>";
					result = result + "<th>собственные нужды</th>";
					result = result + "<th>ремонт</th>";
					result = result + "<th>услуги сторонним организациям</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result += tdCar(o[key].car, o[key].car_disp);
							result = result + "<td class='right'>" + hrefnvl(o[key].price,"?t=q_car_norms&m=edit&r=car&id="+o[key].car,0,'Нормы') + "</td>";
							result = result + "<td class='right'>" + hrefnvl(o[key].norm,"?t=q_car_norms&m=edit&r=car&id="+o[key].car,0,'Нормы\nЧасов в месяце:'+o[key].hours+'\nДней в месяце:'+o[key].days+'\nКоэффициент:'+o[key].time_k) + "</td>";
							result = result + "<td class='right'>" + hrefnvl(o[key].total_hours, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and (hours_total > 0) ", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td class='right'>" + hrefnvl(o[key].self_hours, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and (hours_work > 0) and not (workplace_disp =$$Сторонние организации$$) and workplace is not null", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td class='right'>" + hrefnvl(o[key].hours_repair, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and (hours_repair > 0)", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td class='right'>" + hrefnvl(o[key].ext_hours, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and (hours_work > 0) and workplace_disp =$$Сторонние организации$$", 0, 'Открыть путевые листы') + "</td>";
							result += "<td class='right'>" + nvl((o[key].total_hours-o[key].norm), "-") + "</td>";
							result += "<td class='right'><div class='printplain noscreen'></div><textarea class='noprint' rows='1' OnChange='fillPrintTextArea(this);' OnKeyUp='fillPrintTextArea(this);'></textarea></td>";
							result += "<td class='right'>" + nvl(((o[key].total_hours-o[key].norm)*o[key].price).toFixed(2), "-", "0.00") + "</td>";
							total[0] += o[key].total_hours;
							total[1] += o[key].self_hours;
							total[2] += o[key].hours_repair;
							total[3] += o[key].ext_hours;
							total[4] += (o[key].total_hours-o[key].norm);
							total[5] += (o[key].total_hours-o[key].norm)*o[key].price;
						}
					}
					result += "<tr class='total'><td colspan=3>Итого</td>";
					result += '<td class="right">' + nvl(total[0], '-', 0) + '</td>';
					result += '<td class="right">' + nvl(total[1], '-', 0) + '</td>';
					result += '<td class="right">' + nvl(total[2], '-', 0) + '</td>';
					result += '<td class="right">' + nvl(total[3], '-', 0) + '</td>';
					result += '<td class="right">' + nvl(total[4], '-', 0) + '</td>';
					result += '<td>&nbsp;</td>';
					result += '<td class="right">' + nvl(total[5].toFixed(2), '-', 0) + '</td>';
					result += "</tr>";
					result = result + "</table>";
					break;
				}
			// Просмотр путевых листов
			case "w_waybills_month":
				{
					document.getElementById("mode").innerHTML = "Путевые листы";
					result = showMonthHeader();
					result += '';
					result += "<table>";
					result = result + "<tr>";
					result = result + "<th rowspan='3'>№ путевого листа</th>";
					result = result + "<th rowspan='3'>Дата</th>";
					result = result + "<th rowspan='3'>Водитель</th>";
					result = result + "<th rowspan='3'>марка автомобиля государственный номер</th>";
					result = result + "<th rowspan='3' >Место работы</th>";
					result = result + "<th rowspan='3' >вид работы</th>";
					result = result + "<th colspan='3' >отработано часов</th>";
					result = result + "<th colspan='2'>показание спидометра</th>";
					result = result + "<th rowspan='3'>пробег (км)</th>";
					result = result + "<th rowspan='3'>работа установки</th>";
					result = result + "<th rowspan='3'>марка топлива</th>";
					result = result + "<th rowspan='3'>примечание по источнику топлива</th>";
					result = result + "<th colspan='4'>расход горючего</th>";
					result = result + "</tr>";
					result = result + "<tr>";
					result = result + "<th rowspan='2' >Всего</th>";
					result = result + "<th colspan='2' >в том числе</th>";
					result = result + "<th rowspan='2'>на начало</th>";
					result = result + "<th rowspan='2'>на конец</th>";
					result = result + "<th rowspan='2'>по норме</th>";
					result = result + "<th rowspan='2'>выдано</th>";
					result = result + "<th rowspan='2'>фактический расход</th>";
					result = result + "<th rowspan='2'>остаток</th>";
					result = result + "</tr>";
					result = result + "<tr>";
					result = result + "<th >на линии</th>";
					result = result + "<th >на ремонте</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result = result + "<td id='" + o[key].id + "' class='expanded'><a href='?t=w_waybills&m=edit&id=" + o[key].id + "' title='Редактировать ПЛ №" + o[key].num_disp + "'>" + o[key].num_disp + "</a><div class='full'><a href='?t=w_waybills&m=edit&id=" + o[key].id + "'><img src='img/edit.svg' alt='Редактировать' title='Редактировать ПЛ №" + o[key].num_disp + "' /></a> <a href='?t=" + kind + "&m=new&id=" + o[key].id + "'><img src='img/copy.svg' alt='Копировать' title='Копировать ПЛ №" + o[key].num_disp + "' /></a> <a href='/r/" + o[key].printform + "?t=clm." + kind + "&id=" + o[key].id + "'><img src='img/ssheet.svg' alt='Печать' title='Печать ПЛ №" + o[key].num_disp + "' /></a></div></td>";
							result = result + "<td><a href='?t=" + kind + "&r=dt&id=" + o[key].dt + "' title='Смотреть все по дате: " + o[key].dt + "'>" + o[key].dt + "</a></td>";
							result += tdDriver(o[key].driver, o[key].driver_disp, "?t=" + kind + "&r=driver&id=" + o[key].driver + "' title='Смотреть все по водителю: " + o[key].driver_disp);
							result += tdCar(o[key].car, o[key].car_disp, "?t=" + kind + "&r=car&id=" + o[key].car, 'Смотреть все по автомобилю: ' + o[key].car_disp);
							result = result + "<td class='left'></a><a href='?t=" + kind + "&r=workplace&id=" + o[key].workplace + "' title='Смотреть все по месту работы: " + o[key].workplace_disp + "'>" + o[key].workplace_disp + "</td>";
							result = result + "<td class='left'><a href='?t=" + kind + "&r=service&id=" + o[key].service + "' title='Смотреть все по виду работы: " + o[key].service_disp + "'>" + o[key].service_disp + "</td>";
							result = result + "<td >" + o[key].hours_total + "</td>";
							result = result + "<td >" + o[key].hours_work + "</td>";
							result = result + "<td >" + o[key].hours_repair + "</td>";
							result = result + "<td>" + o[key].odo_b_disp + "</td>";
							result = result + "<td>" + o[key].odo_e + "</td>";
							result = result + "<td>" + o[key].odometer + "</td>";
							result = result + "<td>" + o[key].set_work + "</td>";
							result = result + "<td class='left'>" + o[key].fuel_mark + "</td>";
							result = result + "<td class='left'>" + o[key].fuel_note + "</td>";
							result = result + "<td>" + o[key].fuel_norm + "</td>";
							result = result + "<td>" + o[key].fuel_issued + "</td>";
							result = result + "<td>" + ((o[key].fuel_fact) - 0).toFixed(2) + "</td>";
							result = result + "<td>" + ((o[key].fuel_unspent) - 0).toFixed(2) + "</td>";
							result = result + "</tr>";
						}
					}
					result = result + "</table>";
					break;
				}
			// Просмотр отчёта
			case "w_waybill_card_month":
				{
					var total = new Array(0, 0, 0, 0, 0, 0);
					var old = new Object();
					document.getElementById("mode").innerHTML = "Карточка первичных документов";
					result = showMonthHeader();
					result += '';
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							if ((old.driver !== o[key].driver) || (old.car !== o[key].car) || (!o[key])) {
								if (old.id !== undefined) {
									result += "<tr class='total'><td colspan=2>итого</td>";
									result += "<td>&nbsp;</td>";
									result += "<td>&nbsp;</td>";
									result += "<td>" + nvl(total[0].toFixed(0), '-', 0) + "</td>";
									result += "<td>" + nvl(total[1].toFixed(2), '-', 0) + "</td>";
									result += "<td>&nbsp;</td>";
									result += "<td>&nbsp;</td>";
									result += "<td>" + nvl(total[2].toFixed(2), '-', 0) + "</td>";
									result += "<td>" + nvl(total[3].toFixed(0), '-', 0) + "</td>";
									result += "<td title='" + total[4].toFixed(2) + "'>" + nvl(total[4].toFixed(0), '-', 0) + "</td>";
									result += "<td title='" + total[5].toFixed(2) + "'>" + nvl(total[5].toFixed(0), '-', 0) + "</td>";
									result += "</tr></table>";
									result += "<p class='noscreen'>Составил: Главный механик, механик __________________</p>";
									result += "<p class='noscreen'>Принял: ______________ </p>";
									result += "<p class='noscreen'>Проверил: ______________ </p>";
									result += EOP();
									result += "<div class='noscreen attention'>" + document.getElementById('attention').innerHTML + "</div>";
								}
								;
								result += "<div class='noscreen'><h2>Карточка учёта первичных документов по учёту пробега и ГСМ по Службе эксплуатации и ремонту машин и механизмов</h2></div>";
								result += "<p>Водитель: <b>" + nvl(o[key].driver_disp, '<Водитель не указан>', '') + "</b> " + nvl(o[key].position_disp, '') + "</p>";
								result += "<p>Наименование и госномер единицы техники: <b>" + o[key].car_disp + "</b></p>";
								result += "<p>Нормы расхода топлива:<br>" + o[key].norm_fuel_disp + ": <b>" + nvl(o[key].norm_val, '0') + "</b><br>";
								result += "" + nvl(o[key].norm_setwork_disp, '') + ": <b>" + nvl(o[key].norm_setwork_val, '-') + "</b></p>";
								result += "<p>Остаток горючего на начало месяца: <b>" + o[key].fuel_unspent_b + "</b></p>";
								result += "<p>Показание спидометра на начало месяца: <b>" + nvl(o[key].odo_last, '<нет данных>') + "</b></p>";
								result = result + "<table><tr>";
								result = result + "<th rowspan='2'>Дата</th>";
								result = result + "<th rowspan='2'>№ путевого листа</th>";
								result = result + "<th colspan='2'>показание спидометра</th>";
								result = result + "<th rowspan='2'>пробег (км)</th>";
								result = result + "<th rowspan='2'>работа установки</th>";
								result = result + "<th rowspan='2'>марка топлива</th>";
								result = result + "<th rowspan='2'>примечание по источнику топлива</th>";
								result = result + "<th colspan='4'>расход горючего</th>";
								result = result + "</tr>";
								result = result + "<tr>";
								result = result + "<th >на начало</th>";
								result = result + "<th >на конец</th>";
								result = result + "<th >по норме</th>";
								result = result + "<th >выдано</th>";
								result = result + "<th >фактический расход</th>";
								result = result + "<th >остаток</th>";
								result = result + "</tr>";
								old = o[key];
								total = [0, 0, 0, 0, 0];
							}
							;
							result = result + "<tr>";
							result = result + "<td><a href='?t=" + kind + "&r=dt&id=" + o[key].dt + "' title='Смотреть все по дате: " + o[key].dt + "'>" + o[key].dt + "</a></td>";
							result = result + "<td><a href='?t=w_waybills_month&id=" + o[key].id + "'  title='Открыть Путевой лист №" + o[key].num_disp + "'>" + o[key].num_disp + "</a></td>";
							result = result + "<td>" + nvl(o[key].odo_b_disp, '-', '0') + "</td>";
							result = result + "<td>" + nvl(o[key].odo_e, '-', '0') + "</td>";
							result = result + "<td>" + nvl(o[key].odometer, '-', '0') + "</td>";
							result = result + "<td>" + nvl(o[key].set_work, '-', '0') + "</td>";
							result = result + "<td class='left'>" + o[key].fuel_mark + "</td>";
							result = result + "<td class='left'>" + o[key].fuel_note + "</td>";
							result = result + "<td>" + o[key].fuel_norm + "</td>";
							result = result + "<td>" + nvl(o[key].fuel_issued, '-', '0') + "</td>";
							result = result + "<td title='" + ((o[key].fuel_fact) - 0).toFixed(2) + "'>" + ((o[key].fuel_fact) - 0).toFixed(0) + "</td>";
							result = result + "<td title='" + ((o[key].fuel_unspent) - 0).toFixed(2) + "\nост. + выд. - расх.:\n" + ((o[key].fuel_unspent_b) - 0).toFixed(2) + " + " + ((o[key].fuel_issued) - 0).toFixed(2)
											+ " - " + ((o[key].fuel_fact) - 0).toFixed(2)
											+ " = " + (((o[key].fuel_unspent_b) - 0) + ((o[key].fuel_issued) - 0) - ((o[key].fuel_fact) - 0)).toFixed(2)
											+ "'>" + ((o[key].fuel_unspent) - 0).toFixed(0) + "</td>";
							result = result + "</tr>";
							total[0] += nvl(o[key].odometer, '0', '') - 0;
							total[1] += nvl(o[key].set_work, '0', '') - 0;
							total[2] += nvl(o[key].fuel_norm, '0', '') - 0;
							total[3] += nvl(o[key].fuel_issued, '0', '') - 0;
							total[4] += nvl(o[key].fuel_fact, '0', '') - 0;
							total[5] = nvl(((o[key].fuel_unspent) - 0).toFixed(4), '0', '') - 0;
						}
						;
					}
					;
					if (o[key]) {
						result += "<tr class='total'><td colspan=2>итого</td>";
						result += "<td>&nbsp;</td>";
						result += "<td>&nbsp;</td>";
						result += "<td>" + nvl(total[0].toFixed(0), '-', 0) + "</td>";
						result += "<td>" + nvl(total[1].toFixed(2), '-', 0) + "</td>";
						result += "<td>&nbsp;</td>";
						result += "<td>&nbsp;</td>";
						result += "<td>" + nvl(total[2].toFixed(2), '-', 0) + "</td>";
						result += "<td>" + nvl(total[3].toFixed(0), '-', 0) + "</td>";
						result += "<td title='" + total[4].toFixed(2) + "'>" + nvl(total[4].toFixed(0), '-', 0) + "</td>";
						result += "<td title='" + total[5].toFixed(2) + "'>" + nvl(total[5].toFixed(0), '-', 0) + "</td>";
						result += "</tr></table>";
					}
					;
					result += "<p class='noscreen'>Составил: Главный механик, механик __________________</p>";
					result += "<p class='noscreen'>Принял: ______________ </p>";
					result += "<p class='noscreen'>Проверил: ______________ </p>";
					break;
				}
			// Просмотр автомобилей
			case "w_cars":
				{
					document.getElementById("mode").innerHTML = "Автомобили";
					result = "<table>";
					result = result + "<tr>";
					result = result + "<th>марка автомобиля государственный номер</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result += tdCar(o[key].id, o[key].disp);
							result = result + "</tr>";
						}
					}
					result = result + "</table>";
					break;
				}
			// Просмотр сезонов
			case "w_season_dates":
				{
					document.getElementById("mode").innerHTML = "Приказы о смене сезона";
					result = "<table>";
					result = result + "<tr>";
					result = result + "<th>Дата смены сезона</th>";
					result = result + "<th>Сезон</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result = result + "<td class='left'><a href='?t=" + kind + "&m=edit&id=" + o[key].id + "' title='Изменить'>" + o[key].dt + "</a></td>";
							result = result + "<td class='left'>" + o[key].season_disp + "</td>";
							result = result + "</tr>";
						}
					}
					result = result + "</table>";
					break;
				}
			// Просмотр водителей
			case "drivers":
				{
					document.getElementById("mode").innerHTML = "Водители";
					result = "<table>";
					result = result + "<tr>";
					result = result + "<th>Ф.И.О.</th>";
					result = result + "<th>Должность</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result += tdDriver(o[key].id, o[key].disp);
							result = result + "<td class='left'>" + o[key].position_disp + "</td>";
							result = result + "</tr>";
						}
					}
					result = result + "</table>";
					break;
				}
			// Просмотр отчёта
			case "w_driver_worktime_month":
				{
					var total = new Array(0, 0, 0, 0, 0, 0);
					document.getElementById("mode").innerHTML = "Учёт рабочего времени";
					result = "";
					result += '<h2>Сводный реестр<br>';
					result += 'учета первичных документов по учету рабочего времени, пробега и ГСМ<br>по Службе эксплуатации и ремонту машин и механизмов<br>';
					result += '<span class="noscreen">за ' + dt.toFullMonthFormat() + '</span></h2>';
					result += showMonthHeader();
					result += "<table>";
					result = result + "<tr>";
					result = result + "<th rowspan='3'>Ф.И.О.</th>";
					result = result + "<th rowspan='3'>Должность</th>";
					result = result + "<th rowspan='3'>марка автомобиля государственный номер</th>";
					result = result + "<th colspan='3'>отработано дней</th>";
					result = result + "<th colspan='3'>отработано часов</th>";
					result = result + "</tr>";
					result = result + "<tr>";
					result = result + "<th rowspan='2'>Всего</th>";
					result = result + "<th colspan='2'>В том числе</th>";
					result = result + "<th rowspan='2'>Всего</th>";
					result = result + "<th colspan='2'>В том числе</th>";
					result = result + "</tr>";
					result = result + "<tr>";
					result = result + "<th>на линии</th>";
					result = result + "<th>на ремонте</th>";
					result = result + "<th>на линии</th>";
					result = result + "<th>на ремонте</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result += tdDriver(o[key].driver, o[key].driver_disp, "?t=" + kind + "&w=driver=$$" + o[key].driver + "$$", 'Смотреть все по водителю: ' + o[key].driver_disp);
							result = result + "<td class='left printsmall'>" + nvl(o[key].position_disp, '-') + "</td>";
							result += tdCar(o[key].car, o[key].car_disp, "?t=" + kind + "&w=car=$$" + o[key].car + "$$", 'Смотреть все по автомобилю: ' + o[key].car_disp);
							result = result + "<td>" + hrefnvl(o[key].days_total, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and driver=$$" + o[key].driver + "$$", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td>" + hrefnvl(o[key].days_work, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and driver=$$" + o[key].driver + "$$ and hours_work > 0", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td>" + hrefnvl(o[key].days_repair, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and driver=$$" + o[key].driver + "$$ and hours_repair > 0", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td>" + hrefnvl(o[key].hours_total, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and driver=$$" + o[key].driver + "$$", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td>" + hrefnvl(o[key].hours_work, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and driver=$$" + o[key].driver + "$$ and hours_work > 0", 0, 'Открыть путевые листы') + "</td>";
							result = result + "<td>" + hrefnvl(o[key].hours_repair, "?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and driver=$$" + o[key].driver + "$$ and hours_repair > 0", 0, 'Открыть путевые листы') + "</td>";
							result = result + "</tr>";
							total[0] += o[key].days_total;
							total[1] += o[key].days_work;
							total[2] += o[key].days_repair;
							total[3] += o[key].hours_total;
							total[4] += o[key].hours_work;
							total[5] += o[key].hours_repair;
						}
					}
					result += "<tr class='total'><td colspan=3>Итого</td>";
					for (var i = 0; i < total.length; i++) {
						result += '<td>' + nvl(total[i], '-', 0) + '</td>';
					}
					result += "</tr>";
					result = result + "</table>";
					result += "<p class='noscreen noeop'>Составил: Главный механик, механик __________________</p>";
					result += "<p class='noscreen noeop'>Принял: ______________ </p>";
					result += "<p class='noscreen noeop'>Проверил: ______________ </p>";
					break;
				}
			// Просмотр отчёта
			case "w_tnkm_month":
			case "w_tnkm_month_enemy":
				{
					var total = new Array(0, 0,0);
					var subtotal = new Array(0, 0,0);
					var old = new Object();
					document.getElementById("mode").innerHTML = "Грузооборот " + ((kind === 'w_tnkm_month_enemy') ? '(сторонние организации)' : 'собственные нужды');
					result = "";
					result += '<h2>Справка <br>';
					result += 'о тонно-километрах ' + ((kind === 'w_tnkm_month_enemy') ? '(сторонние организации)' : 'собственные нужды') + '<br>';
					result += '<span class="noscreen">за ' + dt.toFullMonthFormat() + '</span></h2>';
					result += showMonthHeader();
					result += "<table>";
					result = result + "<tr>";
					result = result + "<th>вид работ</th>";
					result = result + "<th>транспорт</th>";
					result = result + "<th>грузоподъемность</th>";
					result = result + "<th>пробег, км</th>";
					result = result + "<th>Грузооборот, тн-км</th>";
					result = result + "<th>Перевезено грузов, тн</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							if ((old.service !== o[key].service)) {
								if (old.service !== undefined) {
									result += "<tr class='subtotal'><td colspan=2>итого по " + nvl(old.service_disp, '-') + "</td>";
									result += "<td>&nbsp;</td>";
									result += "<td>" + hrefnvl(subtotal[0], "?t=w_waybills_month&w=service=$$" + o[key].service + "$$ and " + ((kind === 'w_tnkm_month_enemy') ? '' : 'not') + " (workplace_disp=$$Сторонние организации$$)", 0, 'Открыть Путевые листы') + "</td>";
									result += "<td>" + nvl(subtotal[1].toFixed(0), '-', 0) + "</td>";
									result += "<td>" + nvl(subtotal[2].toFixed(0), '-', 0) + "</td>";
									result += "</tr>";
								}
								;
								old = o[key];
								subtotal = [0, 0, 0];
							}
							;
							result = result + "<tr>";
							result = result + "<td class='left printsmall'>" + hrefnvl(o[key].service_disp, "?t=" + kind + "&w=service=$$" + o[key].service + "$$", 0, 'Смотреть все по виду работ: ' + o[key].service_disp) + "</td>";
							result += tdCar(o[key].car, o[key].car_disp, "?t=" + kind + "&w=car" + formatnull(o[key].car, " is null", "=$$" + o[key].car + "$$"), 'Смотреть все по автомобилю: ' + o[key].car_disp);
							result = result + "<td>" + nvl(o[key].car_capacity, '-', 0) + "</td>";
							result += "<td>" + hrefnvl(o[key].odometer, "?t=w_waybills_month&w=car" + formatnull(o[key].car, " is null", "=$$" + o[key].car + "$$") + " and service" + formatnull(o[key].service, " is null", "=$$" + o[key].service + "$$")+" and " + ((kind === 'w_tnkm_month_enemy') ? '' : 'not') + " (workplace_disp=$$Сторонние организации$$)", 0, 'Открыть Путевые листы') + "</td>";
							result = result + "<td title='"+o[key].car_capacity+" * "+o[key].koef+" * "+o[key].odometer+" = "+(o[key].car_capacity * o[key].koef * o[key].odometer).toFixed(3) +"'>" + nvl(nvl(o[key].tnkm, 0).toFixed(0), '-', 0) + "</td>";
							result = result + "<td title='"+o[key].car_capacity+" * "+o[key].koef+" * "+o[key].odometer+" / "+o[key].days+" = "+(o[key].car_capacity * o[key].koef * o[key].odometer / o[key].days).toFixed(3) +"'>" + nvl((nvl(o[key].tnkm, 0) / o[key].days).toFixed(0), '-', 0) + "</td>";
							result = result + "</tr>";
							total[0] += o[key].odometer;
							total[1] += o[key].tnkm;
							total[2] += (o[key].tnkm / o[key].days);
							subtotal[0] += o[key].odometer;
							subtotal[1] += o[key].tnkm;
							subtotal[2] += (o[key].tnkm / o[key].days);
						}
					}
					if ((o) && (o[key]) ) {
						result += "<tr class='subtotal'><td colspan=2>итого по " + nvl(old.service_disp, '-') + "</td>";
						result += "<td>&nbsp;</td>";
						result += "<td>" + hrefnvl(subtotal[0], "?t=w_waybills_month&w=service" + formatnull(o[key].service, " is null", "=$$" + o[key].service + "$$")+" and " + ((kind === 'w_tnkm_month_enemy') ? '' : 'not') + " (workplace_disp=$$Сторонние организации$$)", 0, 'Открыть Путевые листы') + "</td>";
						result += "<td>" + nvl(subtotal[1].toFixed(0), '-', 0) + "</td>";
						result += "<td>" + nvl(subtotal[2].toFixed(0), '-', 0) + "</td>";
						result += "</tr>";
					}
					;
					result += "<tr class='total'><td colspan=2>Итого</td>";
					result += "<td>&nbsp;</td>";
					result += "<td>" + hrefnvl(total[0], "?t=w_waybills_month", 0, 'Открыть Путевые листы') + "</td>";
					result += "<td>" + nvl(total[1].toFixed(0), '-', 0) + "</td>";
					result += "<td>" + nvl(total[2].toFixed(0), '-', 0) + "</td>";
					result += "</tr>";
					result = result + "</table>";
					result += "<p class='noscreen noeop'>Механик __________________</p>";
					break;
				}
			// Просмотр отчёта
			case "w_costs_month":
				{
					var total = new Array(0, 0, 0);
					var subtotal = new Array(0, 0, 0);
					var old = new Object();
					addClass(document.getElementById('attention'), 'noprint');
					document.getElementById("mode").innerHTML = "Затраты на выполнение работ";
					result = "";
					result += "<p class='noprint'><a href='/r/clm.waybills.third.fods?t=clm.ym&id=" + dt.toDbFormat().substr(0, 6) + "'>Скачать Справку о затратах ООО УК &quot;Жилищник&quot; на выполнение работ по сторонним организациям</a></p>";
					result += '<h2>Справка <br>';
					result += 'о затратах СЭРМиМ ООО УК &quot;Жилищник&quot; на выполнение работ по подразделениям<br>';
					result += '<span class="noscreen">за ' + dt.toFullMonthFormat() + '</span></h2>';
					result += showMonthHeader();
					result += "<table>";
					result = result + "<tr>";
					result = result + "<th>Подразделение</th>";
					result = result + "<th>вид работ</th>";
					result = result + "<th>транспорт</th>";
					result = result + "<th>количество часов</th>";
					result = result + "<th>стоимость 1 часа</th>";
					result = result + "<th>стоимость работ</th>";
					result = result + "<th>пробег, км</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							if ((old.workplace !== o[key].workplace)) {
								if (old.workplace !== undefined) {
									result += "<tr class='subtotal'><td colspan=3>итого по " + old.workplace_disp + "</td>";
									result += "<td>" + hrefnvl(subtotal[0], "?t=w_waybills_month&w=workplace=$$" + old.workplace + "$$", 0, 'Открыть Путевые листы') + "</td>";
									result += "<td>&nbsp;</td>";
									result += "<td>" + nvl(subtotal[1], '-', 0) + "</td>";
									result += "<td>" + nvl(subtotal[2], '-', 0) + "</td>";
									result += "</tr>";
								}
								;
								old = o[key];
								subtotal = [0, 0, 0];
							}
							;
							result = result + "<tr>";
							result = result + "<td class='left printsmall'>" + hrefnvl(o[key].workplace_disp, "?t=" + kind + "&w=workplace=$$" + o[key].workplace + "$$", 0, 'Смотреть все по месту работ: ' + o[key].workplace_disp) + "</td>";
							result = result + "<td class='left printsmall'>" + hrefnvl(o[key].service_disp, "?t=" + kind + "&w=service=$$" + o[key].service + "$$", 0, 'Смотреть все по виду работ: ' + o[key].service_disp) + "</td>";
							result += tdCar(o[key].car, o[key].car_disp, "?t=" + kind + "&w=car=$$" + o[key].car + "$$", 'Смотреть все по автомобилю: ' + o[key].car_disp);
							result = result + "<td><a href='?t=w_waybills_month&w=car=$$" + o[key].car + "$$ and service" + formatnull(o[key].service, " is null", "=$$" + o[key].service + "$$") + " and workplace" + formatnull(o[key].workplace, " is null", "=$$" + o[key].workplace + "$$") + "' title='Открыть Путевые листы'>" + nvl(o[key].hours_work, '-', 0) + "</a></td>";
//						result = result + "<td>" + hrefnvl(o[key].hours_work, "?t=w_waybills_month&ym="+ym+"&w=car=$$"+o[key].car+"$$ and service=$$"+o[key].service+"$$ and workplace=$$"+o[key].workplace+"$$",0,'Открыть Путевые листы') + "</td>";
							result = result + "<td>" + nvl(o[key].price, '-', 0) + "</td>";
							result = result + "<td>" + nvl(o[key].cost, '-', 0) + "</td>";
							result = result + "<td>" + nvl(o[key].odometer, '-', 0) + "</td>";
							result = result + "</tr>";
							total[0] += o[key].hours_work;
							total[1] += o[key].cost;
							total[2] += o[key].odometer;
							subtotal[0] += o[key].hours_work;
							subtotal[1] += o[key].cost;
							subtotal[2] += o[key].odometer;
						}
					}
					if ((o) && (o[key]) && (o[key].workplace)) {
						result += "<tr class='subtotal'><td colspan=3>итого по " + old.workplace_disp + "</td>";
						result += "<td>" + hrefnvl(subtotal[0], "?t=w_waybills_month&w=workplace=$$" + old.workplace + "$$", 0, 'Открыть Путевые листы') + "</td>";
						result += "<td>&nbsp;</td>";
						result += "<td>" + nvl(subtotal[1], '-', 0) + "</td>";
						result += "<td>" + nvl(subtotal[2], '-', 0) + "</td>";
						result += "</tr>";
					}
					;
					result += "<tr class='total'><td colspan=3>Итого</td>";
					result += "<td>" + nvl(total[0], '-', 0) + "</td>";
					result += "<td>&nbsp;</td>";
					result += "<td>" + nvl(total[1], '-', 0) + "</td>";
					result += "<td>" + nvl(total[2], '-', 0) + "</td>";
					result += "</tr>";
					result = result + "</table>";
					result += "<p class='noscreen'>Механик __________________</p>";
					result += "<p class='noscreen'>Начальник ПЭО ______________ Дядченко А.В.</p>";
					break;
				}
			// Просмотр сообщений контроля данных
			case "alerts":
				{
					document.getElementById("mode").innerHTML = "Ошибки";
					result = "<table>";
					result = result + "<tr>";
					result = result + "<th>Вид документа</th>";
					result = result + "<th>Документ</th>";
					result = result + "<th>Сообщение</th>";
					result = result + "</tr>";
					for (key in o) {
						if (o.hasOwnProperty(key)) {
							result = result + "<tr>";
							result = result + "<td class='left'><a href='?t=" + kind + "&r=table_name&id=" + o[key].table_name + "' title='Смотреть все по виду документа: " + o[key].table_disp + "'>" + o[key].table_disp + "</a></td>";
							result = result + "<td class='left'><a href='?t=" + o[key].table_name + "&id=" + o[key].id + "' title='Открыть " + o[key].table_disp + " " + o[key].disp + "'>" + o[key].disp + "</a></td>";
							result = result + "<td class='left'>" + ((o[key].alert_level > 0) ? "<strong>Ошибка</strong>" : "Предупреждение") + ": <a href='?t=" + o[key].table_name + "&id=" + o[key].id + "'  title='Открыть " + o[key].table_disp + " " + o[key].disp + "'>" + o[key].note + "</a></td>";
							result = result + "</tr>";
						}
					}
					result = result + "</table>";
					break;
				}
		}
		result += "<div class='action'><a href='?t=" + kind + "&m=new'>Добавить</a></div>";
	}
	return result;
}



