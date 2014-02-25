function fillSelect(element_id, query_url, selected_id) {

    function formatSelect(o) {
        var res = "";
        res += "<option value='' />--</option>";
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                res += "<option value='" + o[key].id + "'";
                if (o[key].id === selected_id) {
                    res += " selected";
                }
                ;
                res += "/>" + o[key].disp + "</option>";
            }
            ;
        }
        ;
        document.getElementById(element_id).innerHTML = res;
    }
    ;

    makeRequest(purl + query_url, formatSelect);
}

function PressKey(e) {
    e = e || window.event;
    t = (window.event) ? window.event.srcElement : e.currentTarget; // объект для которого вызвано
    g = getObj(t.id + '_select');
    if (g.style.visibility === 'hidden') {
        x = pageX(t);
        y = pageY(t);
        g.style.top = y + t.clientHeight + 1 + "px";
        g.style.left = x + "px";
        g.style.width = t.style.width;
    }
    if (e.keyCode === 40) {
        g.focus();
        g.selectedIndex = 0;
        return;
    }
    if (ot === t.value)
        return; // если ничего не изменилось не "замучить" сервер
    ot = t.value;
    if (timer) {
        clearTimeout(timer);
        timer = 0;
    }
    if (ot.length < 2) {
        getObj(t.id + '_select').style.visibility = 'hidden'; // спрячем select
        return;
    }
    timer = window.setTimeout('Load("' + t.id + '_select", "?w=disp~*$$^' + t.value + '$$")', 1000);  // загружаю через 1 секунду после последнего нажатия клавиши
}

function PressKey2(e) { // вызывается при нажатии клавиши в select
    e = e || window.event;
    t = (window.event) ? window.event.srcElement : e.currentTarget;
    if (e.keyCode === 13) { // Enter
        t = (window.event) ? window.event.srcElement : e.currentTarget;
        t.style.visibility = 'hidden'; // спрячем select
//        t.form.onsubmit();
        return;
    }
    if (e.keyCode === 38 && t.selectedIndex === 0) { // Up
//        getObj('city').focus();
        t.style.visibility = 'hidden'; // спрячем select
    }
}
// Определение координаты элемента
function pageX(elem) {
    return elem.offsetParent ?
            elem.offsetLeft + pageX(elem.offsetParent) :
            elem.offsetLeft;
}
function pageY(elem) {
    return elem.offsetParent ?
            elem.offsetTop + pageY(elem.offsetParent) :
            elem.offsetTop;
}

function Load(objname, url) {
    timer = 0;
    o = getObj(objname);
    o.options.length = 0;
    fillSelect(objname, o.name + url, '');
    o.style.visibility = 'visible';
}


