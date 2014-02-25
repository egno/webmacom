function AJAXInteraction(url, callback, flsync) {

    var req = init();
		if (!flsync) {
			req.onreadystatechange = processRequest;
		};

    function init() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    function processRequest() {
        var o = new Object;
        if ((flsync) || req.readyState === 4) {
            if (req.status === 200) {
                try {
                    if (callback)
                        callback(JSON.parse(req.responseText));
                }
                catch (e4) {
                    alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);
                }
                ;
            }
            ;
            if ((req.status === 410) || (req.status === 404)) {
                try {
                    if (callback)
                        callback(o);
                }
                catch (e4) {
                    alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);
                }
                ;
            }
        }
    }

    this.doGet = function() {
        req.open("GET", url, (!flsync));
        req.send(null);
				if (flsync) {processRequest();};
    };

    this.doPost = function(body) {
        req.open("POST", url, (!flsync));
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(body);
				if (flsync) {processRequest();};
    };

    this.doDelete = function() {
        req.open("DELETE", url, (!flsync));
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send();
				if (flsync) {processRequest();};
    };

}

function makeRequest(url, callback, flsync) {
    var ai = new AJAXInteraction(url, callback, flsync);
    ai.doGet();
}

