var purl = "j/";
var kind = "";
var mode = "";
var where;
var dt = new Date();
var ym;
var id;
var rel;
var today = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

// Главная функция
function init() {
	kind = getParameterByName("t");
	if (getParameterByName("ym")) {
			setDt(getParameterByName("ym") + '01');
	}
	;
	if (kind !== "") {
		id = getParameterByName("id");
		mode = getParameterByName("m");
		rel = getParameterByName("r");
		order = getParameterByName("o");
		where = getParameterByName("w");
		header_table = getParameterByName("h");
	} else {
		showNotes();
	}
	;
	window.document.title = appCaption;
	getObj('header').innerHTML = '<h1><a href=".">' + appCaption + '</a> <span id="mode">&nbsp;</span></h1>';
	getObj('app_name').innerHTML = appCaption;
	getObj('attention').innerHTML = '';
	showMenu();
	token(function() {
		loadVar("work.date", function() {
			var saved_dt = get_cookie("work.date");
			if ((saved_dt !== undefined) && (saved_dt !== null)) {
				setDt(dbDate(saved_dt));
			} else {
				setDt(today);
			}
			refresh();
		}, function() {
			saved_dt = today;
		});
	});
}

// Отображает главное меню
function showMenu() {

	function calcArray(arr) {
		var res = '';
		for (var i = 0; i < arr.length; i++) {
			if (Array.isArray(arr[i][1])) {
				res += '<li' + ((arr[i][2]) ? ' id="' + arr[i][2] + '"' : '') + '><a href="#">' + arr[i][0] + '</a>' + calcArray(arr[i][1]) + '</li>';
			} else {
				res += '<li' + ((arr[i][2]) ? ' id="' + arr[i][2] + '"' : '') + '><a href="' + arr[i][1] + '">' + arr[i][0] + '</a></li>';
			}
		}
		;
		return '<ul class="nav">' + res + '</ul>';
	}
	;
	getObj('nav').innerHTML = calcArray(appNav);
}

// Отображает список изменений в приложении
function showNotes() {
	makeRequest('notes.json', function(o) {
		var res = '';
		var key, i;
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				res += '<h4>' + o[key].date + '</h4>';
				if (o[key].notes) {
					res += '<ul>';
					for (i in o[key].notes) {
						if (o[key].notes.hasOwnProperty(i)) {
							res += '<li>' + o[key].notes[i];
						}
						;
					}
					;
					res += '</ul>';
				}
				;
			}
			;
		}
		;
		getObj('notes').innerHTML = res;
	});
}

// Устанавливает расчётную дату
function setDt(date, callback) {
	var code = "work.date";
	if (date) {
		var temp_dt = new Date(date);
		if (temp_dt.Check()) {
			dt = temp_dt;
		} else {
			if (!dt.Check()) {
				dt = today;
			}
		}
	}
	saveVar(code, dt.toDbFormat());
	loadVar(code, function() {
			showStatus('Установлена расчётная дата: ' + dbDate(get_cookie(code)).toDbFormat('-'));
			if (callback) {
				callback();
			}
			;
		});
}

// Получает жетон
function token(callback) {
	makeRequest(purl, function(o) {
		if (o[0] && o[0].token) {
			set_cookie('token', o[0].token);
			if (callback)
				callback();
		} else {
			alert("Ошибка приложения. Не получен жетон.");
		}
	}, true);
}

// Показывает сообщение в строке статуса
function showStatus(txt) {
	document.getElementById('status').innerHTML = nvl(txt, '&nbsp;', '');
}

function showStatusAndRefresh(txt) {
	showStatus(txt);
}

// Отображает массив в виде списка
function showList(m) {
	var res = '';
	for (var i = 0; i < m.length; i++) {
		res += '<li><a href="' + m[i][1] + '">' + m[i][0] + '</a>';
	}
	;
	getObj('contentBody').innerHTML = '<ul>' + res + '</ul>';
}
;

// Запрашивает значение переменной от сервера
function loadVar(code, callback, errorfunc) {
	makeRequest(purl + "app.val('" + code + "'::ltree) val", function(o) {
		if (o[0] && o[0].val) {
			set_cookie(code, o[0].val);
			if (callback)
				callback();
		} else {
			if (errorfunc)
				errorfunc();
			if (callback)
				callback();
		}
	}, true);
}

// Сохраняет значение переменной на сервере
function saveVar(code, value, callback) {
	makeRequest(purl + "app.val('" + code + "'::ltree, '" + value + "'::text)", callback, true);
}

// Запрашивает данные с сервера
function getData(o) {
	var cont = getObj('contentBody');
	try {
		showStatus();
		cont.innerHTML = formatTable(o);
	} catch (e4) {
		alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);
	}
}

// Проверяет успешность сохранения данных на сервере
function checkSave(o) {
	if (o) {
		showStatus('Сохранено успешно');
		setTimeout(function() {
			refresh();
		}, 1000);
	} else {
		showStatus('<strong>Ошибка сохранения</strong>');
	}
	;
}

// Сохраняет данные как копию
function saveCopy() {
	saveData('new');
}

// Сохраняет данные на сервер
function saveData(fnew) {
	var surl;
	var o = new Object();
	var div = document.getElementById('contentBody');
	var elems = div.getElementsByClassName('jsobj');
	var labels = div.getElementsByTagName('label');
	var inputs = div.getElementsByTagName('input');
	var selects = div.getElementsByTagName('select');
	var el;
	var d;
	var nm;
	var val;
	var ar = new Array;
	if (!(kind.substring(0, 2) === "f_")) {
		switch (kind.substring(0, 2)) {
			default:
				{
					o[kind] = new Array;
					for (var i = 0; i < elems.length; i++) {
						if (elems[i].attributes['name']) {
							var oel = new Object();
							for (var key in labels) {
								if (labels.hasOwnProperty(key)) {
									if (labels[key].htmlFor === elems[i].id && (labels[key].attributes['name']) && (labels[key].attributes['value'])) {
										nm = labels[key].attributes['name'].nodeValue;
										val = labels[key].attributes['value'].nodeValue;
										if (!(nm === 'id' && (!(val) || val === 'null' || val === '' || mode === 'new'))) {
											oel[nm] = val;
										}
										;
									}
									;
								}
								;
							}
							;
							for (key in inputs) {
								if (inputs.hasOwnProperty(key) && (inputs[key].attributes)) {
									if ((inputs[key].attributes['for']) && (inputs[key].attributes['for'].nodeValue === elems[i].id) && (inputs[key].attributes['name']) && (inputs[key].attributes['value'])) {
										nm = inputs[key].attributes['name'].nodeValue;
										val = inputs[key].value;
										if (!(nm === 'id' && (!(val) || val === 'null' || val === '' || mode === 'new'))) {
											oel[nm] = val;
										}
										;
									}
									;
								}
								;
							}
							;
							for (key in selects) {
								if (selects.hasOwnProperty(key) && (selects[key].attributes)) {
									if ((selects[key].attributes['for']) && (selects[key].attributes['for'].nodeValue === elems[i].id) && (selects[key].attributes['name'])) {
										nm = selects[key].attributes['name'].nodeValue;
										val = selects[key].value;
										if (!(nm === 'id' && (!(val) || val === 'null' || val === '' || mode === 'new'))) {
											oel[nm] = val;
										}
										;
									}
									;
								}
								;
							}
							;
							nm = elems[i].attributes['name'].nodeValue;
							val = elems[i].value;
							if (!(nm === 'id' && (!(val) || val === 'null' || val === '' || mode === 'new'))) {
								oel[elems[i].attributes['name'].nodeValue] = elems[i].value;
							}
							;
							o[kind].push(oel);
						}
						;
					}
					;
				}
				;
		}
		;
		d = JSON.stringify(o);
//		alert(d);
		var ai = new AJAXInteraction('s/', checkSave);
		ai.doPost(d);
	}
}

// Дублирует значение поля ввода в элементе, предназначенном для печати. Нужно для красоты печати полей ввода.
function fillPrintTextArea(o) {
	var elems = o.offsetParent.getElementsByClassName('printplain');
	if (elems[0]) {
		elems[0].innerHTML=o.value;
	};
}

// Отображает заголовок текущего месяца с навигацией по месяцам
function showMonthHeader() {
	if ((!rel) && (id)) {
		return '';
	} else {
		return "<div class='noprint'><h1><a href='#' onclick='setDt(dt.addMonth(-1)); refresh();' title='" + dt.addMonth(-1).toFullMonthFormat() + "'><img src='img/arrowleft.svg' alt='&larr;' /></a> &emsp;" + dt.toFullMonthFormat() + "&emsp; <a href='#' onclick='setDt(dt.addMonth(1)); refresh();' title='" + dt.addMonth(1).toFullMonthFormat() + "'><img src='img/arrowright.svg' alt='&rarr;' /></a></h1></div>";
	}
	;
}
;

// Формирует стандартную строку таблицы
function genRow(r, nm, type, code, list, rid) {
	var res;
	var val;
	rid = (rid) ? rid : id;
	res = "<tr><td class='left'>";
	res += "<label for='" + rid + code + "'>" + nm + "</label>";
	res += "</td><td>";
	val = (r[code] === undefined) ? '' : r[code];
	switch (type) {
		case "text":
		case "date":
		case "number":
			{
				res += "<input for='" + rid + "' id='" + rid + code + "' type='" + type + "' name='" + code + "' value='" + val + "'/>";
				break;
			}
		case "list":
			{
				res += "<select for='" + rid + "' id='" + rid + code + "' name='" + code + "'><option value='" + r[code] + "'/>" + val + "</option></select></td></tr>";
				fillSelect(rid + code, list, r[code]);
				break;
			}
	}
	res += "</td></tr>";
	return res;
}
;
