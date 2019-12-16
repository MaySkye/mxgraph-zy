let hashmap=new Map();
let sta=1; //主要用来控制点击事件，1表示查看，2表示添加新的站点，3表示添加新的链路
//以下4个变量，sta=3时使用
let startPoint; //起点
let endPoint; //终点
let flag=0; //0表示未选，1表示起点，2表示终点
let temp_polyline; //存储新链路的对象
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
function requestPaintInfo(map)
{
    //请求数据服务  Access-Control-Allow-Origin:
    let paint_url =  "http://localhost:8888/siteline/findPaintInfo";
    console.log("paint_url:  " + paint_url);
    let paint_xmlHttp = createXMLHttpRequest();
    if (paint_xmlHttp == null) {
        alert('not allow ajax');
        return;
    }
    paint_xmlHttp.open("GET", paint_url, true);
    paint_xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    paint_xmlHttp.setRequestHeader('Content-type', 'application/json');
    paint_xmlHttp.onreadystatechange = function () {
        PaintInfoCallBack(map,paint_xmlHttp);
    }; //call back when ready
    paint_xmlHttp.send();
}
function PaintInfoCallBack(map,xmlHttp) {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) { // finish
        console.log("[" + getTime() + "]" + xmlHttp.responseText);
        let paintInfo = JSON.parse(xmlHttp.responseText);
        let siteData=paintInfo[0]["siteInfo"];
        let siteLineData=paintInfo[0]["siteLinkInfo"];
        console.log("siteInfo:"+siteData);
        console.log("siteLinkInfo:"+siteLineData);
        //可以改变一下标志
        createLevel(siteData,map, 1, 'red');
        createLevel(siteData,map, 2, 'blue');
        createLevel(siteData,map, 3, 'green');
        createLine(siteData,siteLineData,map);

        return true;
    }else{
        return false;
    }
}

/** 创建坐标 */
function createLevel(siteData,map, level, color) {
    //处理siteData
    let jsonArray = JSON.parse(siteData);
    console.log("jsonArray.length:"+jsonArray.length);
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
            if(sta==3){
                if(flag==0){
                    flag=1; //确定起点
                    //alert("确定起点成功");
                    startPoint=marker.getPosition();
                }
                else if(flag==1){
                    flag=2;
                    //alert("确定终点成功");
                    endPoint=marker.getPosition();

                    if(flag==2){
                        flag=0;
                        let polyline1 = new BMap.Polyline([startPoint,endPoint], {strokeColor:"red",//设置颜色
                            strokeWeight:3, //宽度
                            strokeOpacity:0.5});//透明度
                        map.addOverlay(polyline1);
                    }
                }

            }
        },
    );
    marker.addEventListener('rightclick', (e) => {
            if(flag==0){
                flag=1;
                alert("右击成功")
            }
        },
    );
    marker.addEventListener('dblclick', (e) => {
            if(flag==0){
                flag=1;
                alert("双击成功")
            }
        },
    );

    // 鼠标移入时触发
    marker.addEventListener('mouseover', (e) => {
            if(sta==3){
                if(flag==1){
                    temp_polyline = new BMap.Polyline([startPoint,marker.getPosition()], {strokeColor:"red",//设置颜色
                        strokeWeight:3, //宽度
                        strokeOpacity:0.5});//透明度
                    map.addOverlay(temp_polyline);
                }
            }else{
                map.openInfoWindow(opw, point); // 开启信息窗口
            }
        },
    );
    // 鼠标移出时触发
    marker.addEventListener('mouseout', e => {

            if(sta==3){
                if(flag==1){
                    map.removeOverlay(temp_polyline);
                }
            }else{
                //map.openInfoWindow(opw, point); // 开启信息窗口
            }
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
function createLine(siteData,siteLineData,map) {
    let siteArray = JSON.parse(siteData);
    let lineArray = JSON.parse(siteLineData);
    console.log("lineArray:"  + lineArray.length);
    for(let a=0;a<siteArray.length;a++){
        let xx = siteArray[a]["site_localx"];
        let yy = siteArray[a]["site_localy"];
        let temp_point=new BMap.Point(xx,yy);
        hashmap.set(siteArray[a]["site_name"],temp_point);
    }
    for(let i=0;i<lineArray.length;i++){
        console.log("point1:"  + lineArray[i]["point1"]);
        console.log("point2:"  + lineArray[i]["point2"]);
        let point1=hashmap.get(lineArray[i]["point1"]);
        let point2=hashmap.get(lineArray[i]["point2"]);
        let line = [point1,point2];
        addLine(map, line);
        console.log("success" );
    }
    /*for (let i = 0; lineArray.length < 13; i++) {
        //var point1;
        //var point2;
        if (lineArray[i]["point1"] != ""&&lineArray[i]["point2"] != "") {
            console.log("point1:"  + lineArray[i]["point1"]);
            console.log("point2:"  + lineArray[i]["point2"]);
            for(let j=0;j<siteArray.length;j++){
                if(siteArray[j]["site_name"]==lineArray[i]["point1"]){
                    let x1 = siteArray[j]["site_localx"];
                    let y1 = siteArray[j]["site_localy"];
                    console.log("x1:"  + x1);
                    console.log("y1:"  + y1);
                    var point1 = new BMap.Point(x1,y1);
                }
                if(siteArray[j]["site_name"]==lineArray[i]["point2"]){
                    let x2 = siteArray[j]["site_localx"];
                    let y2 = siteArray[j]["site_localy"];
                    console.log("x2:"  + x2);
                    console.log("y2:"  + y2);
                    var point2 = new BMap.Point(x2,y2);
                }
               /!* if(point1!=null&&point2!=null){
                    break;
                }*!/
            }
        }
        //每一个画一个短线
        let line = [point1,point2];
        addLine(map, line);
        //point1=null;
        //point2=null;
        //line=null;
    }*/
}
// 创建连线
function addLine(map, line) {
    // 创建弧线对象
    //  const curve = new BMapLib.CurveLine(line, { strokeColor: '#000000', strokeWeight: 3, strokeOpacity: 0.5 });
    // @ts-ignore
    const sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
        scale: 0.6, // 图标缩放大小
        strokeColor: '#fff', // 设置矢量图标的线填充颜色
        strokeWeight: '1', // 设置线宽
    });
    const icons = new BMap.IconSequence(sy, '10', '30');
    // 创建折线
    let polyline = new BMap.Polyline(line, { strokeColor: '#33FF00', strokeWeight: 3, strokeOpacity: 0.5, icons: [icons] });
    map.addOverlay(polyline);
    //polyline=null;
    // setTimeout(polyline.setStrokeColor('red'), 5000);
    /*this.timer = setInterval(() => {
        const color = ['#33FF00', '#F7F709', '#F70909'];
        const a = Math.floor(Math.random() * 3);
        polyline.setStrokeColor(color[a]);
        console.log('变色');
    }, 2000);*/
}

function paint(map) {
    if(siteData!=null&&siteLineData!=null){
        createLevel(JSON.stringify(siteData),map, 1, 'red');
        createLevel(JSON.stringify(siteData),map, 2, 'blue');
        createLevel(JSON.stringify(siteData),map, 3, 'green');
        createLine(JSON.stringify(siteData),JSON.stringify(siteLineData),map);
        return true;
    }else{
        console.log("hhhhh");
        return false;
    }

}

function normal_fun(map,status) {
    sta=status;
}
function add_site(map,status) {
    sta=status;
    map.addEventListener("click",function(e){
        if(sta==2){
            const marker1 = new BMap.Marker(e.point,
                {
                    // 指定Marker的icon属性为Symbol
                    // @ts-ignore
                    icon: new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
                        scale: 1, // 图标缩放大小
                        fillColor: 'red', // 填充颜色
                        fillOpacity: 0.8, // 填充透明度
                    }),
                });
            map.addOverlay(marker1);
        }
    });
    /*  var address=e.point.lng + "," + e.point.lat;
      $("#pointaddress").attr("value",address);
      var pt = e.point;
      geoc.getLocation(pt, function(rs){
          var addComp = rs.addressComponents;
          $("#provinces").attr("value",addComp.province);
          $("#city").attr("value",addComp.city);
          $("#town").attr("value",addComp.district);*/
//省、市、区、街道、街道号
//alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
    // });
}
function draw_line(map,status) {
    sta=status;
}