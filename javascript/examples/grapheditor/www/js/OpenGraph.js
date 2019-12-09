function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){
            return unescape(decodeURI(pair[1]));
            //return pair[1];
        }
    }
    return(false);
}

function requestGraphXml(sitename,sitelevel){

    //请求数据服务  Access-Control-Allow-Origin:
    var ip = "http://localhost";
    var url = ip + ":8888/telemetry/getLastestServiceFile?site_name=" + sitename + "&site_level=" + sitelevel;
    console.log("url:  " + url);
    var xmlHttp = createXMLHttpRequest();
    //xmlHttp.crossDomain="Access-Control-Allow-Origin";
    if (xmlHttp == null) {
        alert('not allow ajax');
        return;
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlHttp.setRequestHeader('Content-type', 'application/xml');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) { // finish
            console.log("[" + getTime() + "]" + xmlHttp.responseText);
            //alert(xmlHttp.responseText);
            //打开组态图文件
            openGraph(xmlHttp.responseText,sitename);
        }
    }; //call back when ready
    xmlHttp.send();
}

/* document.ready */
$(function () {

});

