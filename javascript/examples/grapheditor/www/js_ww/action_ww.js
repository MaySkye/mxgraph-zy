const WW = {
    /* 配置项目URL根、动画过渡 */
    config: {
        baseUrl: "http://localhost:8888/telemetry",
        animation: {
            DialogfadeInDuration: 200,
            DialogfadeOutDuration: 200,
            interval: 50 //hideEditDetectedValueDialog-->showMiniDialog动画切换延时
        }
    },
    /* 封装数据 */
    data: {
        units: {
            needRetrive: true,
            unitList: {}   ////键--值
        },
        properties: {
            needRetrive: true,
            propertyList: {}  //键--值
        }
    },
    /* 立即隐藏所有模态框 */
    hideAllDialog: function () {
        WW.hideEditDetectedValueDialog();
        WW.hideMiniDialog();
    },
    /* 显示提示框，参数title、content、delay、mRootCell */
    showMiniDialog: function (params) {
        //防止重叠
        $("#mini-app").remove();
        let doShowMiniDialog = function () {
            $("body").append(
                //王伟的模态框区域
                '<div id="mini-app">' +
                //蒙层
                '    <div class="ww-dialog-mask" id="ww-mini-dialog-mask" onclick="WW.hideMiniDialog();"></div>' +
                //模态框窗体
                '    <div class="ww-mini-dialog" id="ww-mini-dialog">' +
                '        <div class="ww-mini-dialog-title '+ (params.type?'ww-dialog-' + params.type:'--ww-mini-dialog-default') +'">' + params.title + '</div>' +
                '        <div class="ww-dialog-body">' +
                params.content +
                '        </div>' +
                '        <div class="ww-mini-dialog-btnGroup">' +
                '            <button type="button" class="ww-btn ww-btn-gray ww-btn-sm" id="mini-btn-closeDialog" onclick="WW.hideMiniDialog();">关闭</button>' +
                '        </div>' +
                '    </div>' +
                '</div>');
            $("#mini-app").fadeIn(WW.config.animation.DialogfadeInDuration);
        }
        setTimeout(doShowMiniDialog, params == null || params.delay == null ? WW.config.animation.DialogfadeOutDuration + WW.config.animation.interval : params.delay);
    },
    /* 隐藏提示框，可接参数duration */
    hideMiniDialog: function (params) {
        let duration = params == null || params.duration == null ? WW.config.animation.DialogfadeOutDuration : params.duration;
        $("#mini-app").fadeOut(duration);
        setTimeout('$("#mini-app").remove();', duration);
    },
    showEditDetectedValueDialog: function (params) {
        //防止重叠
        $("#app").remove();
        //step1：获取监控字段名（带有设备id）
        /* 解析XML树 */
        this.getAllProperty(params.mRootCell);
        this.data.properties.needRetrive = false;
        let propertiesList = this.data.properties.propertyList[params.deviceId];
        /* 使用hasProperty字段值 */
        // if (params.hasProperty == null)
        //     return;
        // let propertiesList = params.hasProperty.replace(/\s*/g, "").split(";");

        // step2：获取源数据
        var originalDetectedValue = this.getDetectedValueByParameters({
            site_name: params.site_name,
            device_name: params.deviceId
        });
        console.log("originalDetectedValue:"+originalDetectedValue);

        //step3：获取属性单位
        this.getAllPropertyUnits(params.mRootCell);
        this.data.units.needRetrive = false;

        //step4：动态生成的行html
        let columnHtml = "";
        console.log("propertiesList.length:"+propertiesList.length);
        for (let i = 0; i < propertiesList.length; i++) {
            columnHtml +=
                '<tr>' +
                '   <th class="ww-col-7">' + propertiesList[i].substring(0, propertiesList[i].length - 5) + '</th>' +
                '   <td class="ww-col-5">' +
                '       <input type="number" name="' + propertiesList[i] + '" value="' + (originalDetectedValue[propertiesList[i]] == null ? '0' : originalDetectedValue[propertiesList[i]]) + '">' +
                '   </td>' +
                '   <th class="ww-col-2">' + this.data.units.unitList[propertiesList[i]] + '</th>' +
                '</tr>';
        }
        //step5：添加模态框html
        $("body").append(
            //王伟的模态框区域
            '<div id="app">' +
            //蒙层
            '    <div class="ww-dialog-mask" id="ww-dialog-mask" onclick="WW.hideEditDetectedValueDialog();"></div>' +
            //模态框窗体
            '    <div class="ww-dialog" id="ww-dialog">' +
            '        <div class="ww-dialog-title">修改参数</div>' +
            '        <div class="ww-dialog-body">' +
            '            <form id="edit-form">' +
            '                <table class="ww-dialog-table">' +
            '                    <tr>' +
            '                        <th colspan="3">' + params.deviceId.substring(0, params.deviceId.length - 5) + '</th>' +
            '                    </tr>' +
            columnHtml +
            '                </table>' +
            '            </form>' +
            '        </div>' +
            '        <div class="ww-dialog-btnGroup">' +
            '            <button type="button" class="ww-btn ww-btn-gray ww-btn-sm" id="btn-closeDialog" onclick="WW.hideEditDetectedValueDialog();">关闭</button>' +
            '            <button type="button" class="ww-btn ww-btn-gray ww-btn-sm" id="btn-submit">提交</button>' +
            '        </div>' +
            '    </div>' +
            '</div>');
        //step6：模态框提交按钮监听
        $("#btn-submit").click(function () {
            //表单检查
            for (let i = 0; i < propertiesList.length; i++) {
                let value = $('input[name="' + propertiesList[i] + '"]').val();
                if (value == "" || isNaN(value)) {
                    WW.showMiniDialog({
                        title: "提交失败",
                        content: "请检查数据合法性！",
                        type:"warning",
                        delay: 10
                    });
                    return;
                }
            }
            let dataArray = $("#edit-form").serializeArray();
            let siteData = {
                device_name: params.deviceId,
                site_name: params.site_name
            };
            //将deviceid放在首部
            dataArray.splice(0, 0, siteData);
            //提交数据给后端
            $.ajax({
                url: WW.config.baseUrl + "/updateDetectedValue",
                type: 'POST',
                data: JSON.stringify(dataArray),
                dataType: "json",
                contentType: "application/json",
                success: function (res) {
                    if (res.type == "success") {
                        WW.hideEditDetectedValueDialog();
                        WW.showMiniDialog({
                            title: "提交成功",
                            type:"success",
                            content: "修改检测值成功！"
                        });
                    } else {
                        //解析错误报告
                        let obj = JSON.parse(res.msg);
                        let parsedMsg = "";
                        Object.keys(obj).forEach(function (key) {
                            parsedMsg += key.substring(0, key.length - 5) + "： " + obj[key] + "<br/>";
                        })
                        WW.showMiniDialog({
                            title: "提交失败",
                            type:"warning",
                            content: parsedMsg,
                            delay: 0
                        })
                    }
                },
                error: function (data) {
                    WW.showMiniDialog({
                        title: "提交失败",
                        type:"warning",
                        content: "请检查网络状况！",
                        delay: 0
                    });
                }
            });
            WW.refreshCellValues({
                mRootCell: params.mRootCell,
                graph: params.graph,
                dataArray: dataArray
            })
        });
        //模态框淡出动画
        $("#app").fadeIn(WW.config.animation.DialogfadeInDuration);
    },
    /* 参数：delay */
    hideEditDetectedValueDialog: function (params) {
        let duration = params == null || params.duration == null ? WW.config.animation.DialogfadeOutDuration : params.duration;
        $("#app").fadeOut(duration);
        setTimeout('$("#app").remove();', duration);
    },
    getAllPropertyUnits: function (cell) {
        if (!this.data.units.needRetrive)
            return;
        if (cell == null) {
            return;
        }
        if (cell.getattr() == "property_data") {
            this.data.units.unitList[cell.getmonitor_name()] = cell.getmonitor_unit();
        }
        for (let i = 0; i < cell.getChildCount(); i++) {
            let child = cell.getChildAt(i);
            this.getAllPropertyUnits(child);
        }
    },
    getAllProperty: function (cell) {
        if (!this.data.properties.needRetrive)
            return;
        if (cell == null) {
            return;
        }
        if (cell.getattr() == "property_data") {
            if (!this.data.properties.propertyList[cell.getmonitor_device_name()]) {
                this.data.properties.propertyList[cell.getmonitor_device_name()] = [];
            }
            this.data.properties.propertyList[cell.getmonitor_device_name()].push(cell.getmonitor_name());
        }
        for (let i = 0; i < cell.getChildCount(); i++) {
            let child = cell.getChildAt(i);
            this.getAllProperty(child);
        }
    },
    getDetectedValueByParameters: function (params) {
        let resData = null;
        $.ajax({
            url: WW.config.baseUrl + "/getDetectedValueByParameters",
            type: "POST",
            async: false,
            data: JSON.stringify(params),
            dataType: "json",
            contentType: "application/json",
            success: function (res) {
                if (res.type == "success") {
                    resData = JSON.parse(res.data);
                } else {
                    WW.showMiniDialog({
                        title: "查询失败",
                        type:"warning",
                        content: res.msg,
                        delay: 10
                    });
                }

            },
            error: function (res) {
                WW.showMiniDialog({
                    title: "查询失败",
                    type:"warning",
                    content: "请检查网络状况！",
                    delay: 10
                });
                resData = "";
            }
        });
        return resData;
    },
    //接收参数：含mRootCell、graph、dtaArray：含data_names数组、detected_values数组，索引对应
    refreshCellValues: function (params) {
        let data_names = [];     //监控属性数组
        let detected_values = [];        //监控值数组
        for (let i = 0; i < params.dataArray.length; i++) {
            if (!params.dataArray[i].name)
                continue;
            data_names.push(params.dataArray[i].name);
            detected_values.push(params.dataArray[i].value);
        }
        //视图层更新
        let doRefreshCellValue = function (cell) {
            if (cell == null) {
                return;
            }
            if (cell.getattr() == "property_data") {
                let index = data_names.indexOf(cell.getmonitor_name());
                if (index == -1)
                    return;
                else {
                    cell.setValue(detected_values[index]);
                }
            }
            for (let i = 0; i < cell.getChildCount(); i++) {
                let child = cell.getChildAt(i);
                doRefreshCellValue(child);
            }
        };
        doRefreshCellValue(params.mRootCell);
        params.graph.refresh();
    }
}

/* document.ready */
$(function () {

});
