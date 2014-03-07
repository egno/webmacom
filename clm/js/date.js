// Преобразует текст в формате БД в дату
function dbDate(txt) {
	var regex = new RegExp('-', 'gi');
	txt = txt.replace(regex, '');
	var res = new Date(txt.substr(0, 4), txt.substr(4, 2) - 1, txt.substr(6, 2));
	return res;
}

// Проверяет корректность даты
Date.prototype.Check =
				function() {
					return (isFinite(this.getYear()) && isFinite(this.getMonth()) && isFinite(this.getDate()));
				};

// Возвращает наименование месяца
Date.prototype.getMonthName =
				function() {
					var MonthArray = new Array(
									"Январь", "Февраль", "Март",
									"Апрель", "Май", "Июнь",
									"Июль", "Август", "Сентябрь",
									"Октябрь", "Ноябрь", "Декабрь");
					return MonthArray[this.getMonth()];
				};

// Форматирует дату YYYYMM
Date.prototype.toYMFormat =
				function() {
					return this.getFullYear().toString() + ("0" + -~(this.getMonth())).substr(-2, 2);
				};

// Форматирует дату в формат, понимаемый БД
Date.prototype.toDbFormat =
				function(dlm) {
					return this.getFullYear().toString() + nvl(dlm, '') + ("0" + -~(this.getMonth())).substr(-2, 2) + nvl(dlm, '') + ("0" + -~(this.getDate() - 1)).substr(-2, 2);
				};

// Краткий формат даты
Date.prototype.toShortFormat =
				function() {
					return ("0" + -~(this.getDate() - 1)).substr(-2, 2) + '.' + ("0" + -~(this.getMonth())).substr(-2, 2) + '.' + this.getFullYear().toString();
				};

// Полный формат даты
Date.prototype.toFullMonthFormat =
				function() {
					return this.getMonthName() + ' ' + this.getFullYear().toString();
				};

// Первый день месяца
Date.prototype.getFirstMonthDay =
				function() {
					var dt = new Date(this.getFullYear(), this.getMonth(), 1);
					return dt;
				};

// Добавляет месяц
Date.prototype.addMonth =
				function(num) {
					var dt = new Date(this.getFullYear(), this.getMonth() + num, 1);
					return dt;
				};

// Последний день месяца
Date.prototype.getLastMonthDay =
				function() {
					var dt = new Date(this.getFullYear(), this.getMonth() + 1, 0);
					return dt;
				};


