function requestSiteInfo(map)
{
    //请求数据服务  Access-Control-Allow-Origin:
    let ip = "http://localhost";
    let url = ip + ":8888/site/findall";
    console.log("url:  " + url);
    let xmlHttp = createXMLHttpRequest();
    //xmlHttp.crossDomain="Access-Control-Allow-Origin";
    if (xmlHttp == null) {
        alert('not allow ajax');
        return;
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.onreadystatechange = function () {
        siteCallBack(map,xmlHttp)
    }; //call back when ready
    xmlHttp.send();
}

function createXMLHttpRequest() {
    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlhttp;
}
function getTime() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function siteCallBack(map,xmlHttp) {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) { // finish
        console.log("[" + getTime() + "]" + xmlHttp.responseText);
        let jsonData = JSON.parse(xmlHttp.responseText);
        createLevel(JSON.stringify(jsonData),map, 1, 'red');
        createLevel(JSON.stringify(jsonData),map, 2, 'blue');
        createLevel(JSON.stringify(jsonData),map, 3, 'green');

        // 绘制线路
        //this.createLine(JSON.stringify(jsonData),map);

    }
}

/** 创建坐标 */
function createLevel(siteData,map, level, color) {
    //处理siteData
    let jsonArray = JSON.parse(siteData);
    for (let i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i]["site_level"] == level) {
            let x = jsonArray[i]["site_localx"];
            let y = jsonArray[i]["site_localy"];
            let point = new BMap.Point(x,y);
            addMarker(map, point, color, jsonArray[i]);
        }
    }
}
/** 创建标注 */
function addMarker(map, point, color, locationInfo) {
    // 设置marker图标为水滴
    const marker = new BMap.Marker(point,
        {
            // 指定Marker的icon属性为Symbol
            // @ts-ignore
            icon: new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
                scale: 1, // 图标缩放大小
                fillColor: color, // 填充颜色
                fillOpacity: 0.8, // 填充透明度
            }),
        });
    map.addOverlay(marker);
    // 构建label 样式 添加文字标签
    const content =
        '<div>' +
        '<div style="transform: translateX(-50%);' +
        'position: absolute;' +
        'left: 50%;">' + locationInfo["site_name"] + '</div>' +
        '</div>';
    const label = new BMap.Label(content, { offset: new BMap.Size(10, 25) });
    label.setStyle({ border: 'none', padding: 0, fontWeight: 'bold', fontSize: '16px' }); // 去边框
    marker.setLabel(label);
    // 构建信息窗口
    const opw = this.openInfo(locationInfo, point, map);
    // 注册点击事件,弹出信息窗口
    marker.addEventListener('click', (e) => {
            //this.router.navigate(['/mapdisplay/StructureDiagram', locationInfo]);
            // 打开模态框
            // this.showOpenInfo(locationInfo);
        },
    );
    // 鼠标移入时触发
    marker.addEventListener('mouseover', (e) => {
            map.openInfoWindow(opw, point); // 开启信息窗口
        },
    );
    // 鼠标移出时触发
    marker.addEventListener('mouseout', e => {
            // map.closeInfoWindow();
        },
    );
}
/** 注册内容框的弹出事件 */
function openInfo(content, point, map) {
    const opts = {
        // width: 250,     // 信息窗口宽度
        // height: 80,     // 信息窗口高度
        title: '基本信息', // 信息窗口标题
        enableMessage: true, // 设置允许信息窗发送短息
        offset: new BMap.Size(0, -23),
    };
    const sContent = '<table align="center">' +
        '<tbody>' +
        '  <tr>' +
        '    <td>名称：</td>' +
        '    <td> ' + content["site_name"]+ '</td>' +
        '  </tr>' +
        '  <tr>' +
        '    <td>站点级别：</td>' +
        '    <td>' + content["site_name"]+ '级</td>' +
        '  </tr>' +
        '  <tr>' +
        '    <td>编址码：</td>' +
        '    <td>000000000000001</td>' +
        '  </tr>' +
        '  <tr>' +
        '    <td>地址：</td>' +
        '    <td> ' + content["site_name"] + '市xxxx区xxxx路</td>' +
        '  </tr>' +
        // '  <tr>' +
        // '    <td><a>详情</a></td>' +
        // '    <td><a>查看组态图</a></td>' +
        // '  </tr>' +
        '</tbody>' +
        '</table>';
    const infoWindow = new BMap.InfoWindow(sContent, opts);  // 创建信息窗口对象
    return infoWindow;
    // map.openInfoWindow(infoWindow, point); // 开启信息窗口
}
// 创建连线
function createLine(siteData,map) {

        const lineArray = [];
        let j = 0;
        for (const i of data) {
            lineArray[j] = new BMap.Point(i.longitude, i.Latitude);
            j++;
        }
        // 喀什- 西安
        const line1 = [lineArray[7], lineArray[9], lineArray[17], lineArray[10], lineArray[19], lineArray[25], lineArray[0]];
        // 环 西安-郑州
        const line2 = [lineArray[0], lineArray[22], lineArray[20], lineArray[3], lineArray[15], lineArray[0]];
        // 成都-三亚
        const line3 = [lineArray[22], lineArray[11], lineArray[12], lineArray[23], lineArray[6]];
        // 湛江-武汉
        const line4 = [lineArray[23], lineArray[26], lineArray[13], lineArray[14], lineArray[4], lineArray[24], lineArray[2], lineArray[3]];
        // 南京- 西安
        const line5 = [lineArray[24], lineArray[16], lineArray[1], lineArray[21], lineArray[0]];
        // 北京-哈尔滨
        const line6 = [lineArray[1], lineArray[8], lineArray[5], lineArray[18]];
        const line23 = [1, 1, 1, 1];
        this.addLine(this.map1, line1);
        this.addLine(this.map1, line2);
        this.addLine(this.map1, line3);
        this.addLine(this.map1, line4);
        this.addLine(this.map1, line5);
        this.addLine(this.map1, line6);
}


/* document.ready */
/*
$(function () {

});*/
