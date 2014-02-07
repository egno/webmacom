function dbDate(txt){
	var regex = new RegExp('-', 'gi');
	txt=txt.replace(regex,'');
	var res = new Date(txt.substr(0,4), txt.substr(4,2)-1, txt.substr(6,2));
	return res;
}

Date.prototype.getMonthName =
	function (){
		var MonthArray = new Array(
		"Январь", "Февраль", "Март",
		"Апрель", "Май", "Июнь",
		"Июль", "Август", "Сентябрь",
		"Октябрь", "Ноябрь", "Декабрь") 
		return MonthArray[this.getMonth()] 
	}

Date.prototype.toYMFormat = 
	function () {
     return this.getFullYear().toString() + ("0"+-~(this.getMonth())).substr(-2,2);
  }

Date.prototype.toDbFormat = 
	function (dlm) {
     return this.getFullYear().toString() + nvl(dlm,'') + ("0"+-~(this.getMonth())).substr(-2,2) + nvl(dlm,'') + ("0"+-~(this.getDate()-1)).substr(-2,2);
  }

Date.prototype.toShortFormat = 
	function () {
     return ("0"+-~(this.getDate()-1)).substr(-2,2) + '.'+("0"+-~(this.getMonth())).substr(-2,2)+'.'+ this.getFullYear().toString();
  }

Date.prototype.toFullMonthFormat = 
	function () {
     return this.getMonthName() + ' ' + this.getFullYear().toString();
  }

Date.prototype.getFirstMonthDay = 
	function () {
		var dt = new Date(this.getFullYear(), this.getMonth(), 1);
     return dt;
  }

Date.prototype.addMonth = 
	function (num) {
		var dt = new Date(this.getFullYear(), this.getMonth()+num, 1);
     return dt;
  }


Date.prototype.getLastMonthDay = 
	function () {
		var dt = new Date(this.getFullYear(), this.getMonth()+1, 0);
     return dt;
  }


