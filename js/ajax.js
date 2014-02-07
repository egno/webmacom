function AJAXInteraction(url, callback) {

    var req = init();
    req.onreadystatechange = processRequest;
        
    function init() {
      if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
    
    function processRequest() {
			var o = new Object;
      if (req.readyState == 4) {
        if (req.status == 200) {
					try { 
						if (callback) callback(JSON.parse(req.responseText));
					}
					catch(e4){alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);}
          ;
				};
        if (req.status == 410) {
					try { 
						if (callback) callback(o);
					}
					catch(e4){alert("Ошибка доступа к содержимому страницы: \n" + e4.name + ": " + e4.message);}
					;
				}
        if (req.status == 404) {
					alert("Ошибка в данных");
				}
      }
    }

    this.doGet = function() {
      req.open("GET", url, true);
      req.send(null);
    }
    
    this.doPost = function(body) {
      req.open("POST", url, true);
      req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      req.send(body);
    }

    this.doDelete = function() {
      req.open("DELETE", url, true);
      req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      req.send();
    }

}

function makeRequest(url, callback) {
  var ai = new AJAXInteraction(url, callback);
  ai.doGet();
}

