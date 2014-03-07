// Добавляет класс к элементу
function addClass(o, c) {
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
    if (re.test(o.className))
        return;
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}

// Удаляет класс элемента
function removeClass(o, c) {
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}

// Возвращает параметр из URL
function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results === null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Возвращает элемент по ID
function getObj(objID) {
    var o = new Object;
    if (document.getElementById) {
        o = document.getElementById(objID);
    }
    else if (document.all) {
        o = document.all[objID];
    }
    else if (document.layers) {
        o = document.layers[objID];
    }
    if (!o) {
        alert("Отсутствует объект: " + objID);
    }
    ;
    return o;
}

