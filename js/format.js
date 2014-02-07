function nvl(value1,value2,value3) 
{
if ((value3 != undefined) && (value1 == value3)) {value1 = null};
if (value1 == null)
return nvl(value2,'');
return value1;
}

function hrefnvl(value1,href,value3,title) 
{
if ((value3 != undefined) && (value1 == value3)) {value1 = null};
if (value1 == null) return "-";
return "<a href='"+href+"' "+((title)?"title='"+title+"'":"")+">"+value1+"</a>";
}

function formatnull(value1, res1, res2){
	if (value1 == null) {
		return res1;
 	} else {
		return res2;
	};
};

function EOP(){
	return "<div style='page-break-before:always;'>&nbsp;<hr class='noprint pagebreak'></div>"
};
