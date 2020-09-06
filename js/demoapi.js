var bitrade_url = "http://localhost/bitrade-server/";
function sendApiRequest(method, endpointUri, requestBody, successCallback, errorCallback) {
    var api_key = { "X-API-KEY": "8937363jhdd77867370912" };
    window.jQuery.ajax({
        url: endpointUri,
        headers: api_key,
        method: method,
        data: requestBody,
        dataType: "json",
        success: successCallback,
        error: errorCallback
    });
}
function IDGenerator() {
    var uniqueId = "BIT" + Math.floor(Date.now() / 1000) + Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
    return uniqueId;
}
function FindNumberInString(str){
    var num = str.replace( /[^\d\.]*/g, '');
    return parseFloat(num,10);
}
function get(name) {
    if (typeof (Storage) !== "undefined") {
        return localStorage.getItem(name);
    } else {
        alert('Please use a modern browser as this site needs localstroage!');
    }
}

function store(name, val) {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem(name, val);
    } else {
        alert('Please use a modern browser as this site needs localstroage!');
    }
}

function remove(name) {
    if (typeof (Storage) !== "undefined") {
        localStorage.removeItem(name);
    } else {
        alert('Please use a modern browser as this site needs localstroage!');
    }
}
function getQuerystringParamValue(param) {
    var url = window.location.search.slice(window.location.search.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0] === param) {
            return urlparam[1];
        }
    }
}