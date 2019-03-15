/**
 * 变量
 */
//服务器访问
var ACTION_URL = "../";
//本地访问
var JSON_URL = "../local/json/database/";
//页面信息
var PAGE = {};

/**
 * 预加载
 */
$(function () {
    getIformation(getQueryString("infoId"));
});

/**
 * 获取参数
 * @param name
 * @returns {*}
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

/**
 * 加载表单信息
 * @param v
 */
function getIformation(infoId) {

    var obj = {
        url: ACTION_URL + "getInformation",
        param: {
            infoId: infoId,
        }
    };
    var e = common_ajax(obj);
    if (e.code == 300) {
        Message(e.msg);
        return;
    }
    //获取表单信息
    PAGE = {
        html: e.html,//表单信息
        info: e.info,//表单模块信息
    };
    PAGE.data = {
        INDEX: 0//当前第几张表,用于初始化查询条件
    };
    initPage();
}

/**
 * 初始化表单信息
 */
function initPage() {
    console.log(PAGE);
    document.title = PAGE.html.TITLE;
    //清空表单
    $("#datagrid").empty();
    $("#datagrid2").empty();

    var totalHeight = 0;//height总值
    var totalWidth = 0;//width总值
    var bottomHeight = 0;//联动表高度
    var datagrid2 = false;//判断是否加载了联动表

    //判断是是否为多张表
    if (PAGE.info.length > 1) {
        $.each(PAGE.info, function (index, value) {
            PAGE.info[index].table.WIDTH = value.table.WIDTH ? value.table.WIDTH : 1;
            PAGE.info[index].table.HEIGHT = value.table.HEIGHT ? value.table.HEIGHT : 1;
            //判断是否满足联动条件
            if (!$.isEmptyObject(value.table.PID)) {
                bottomHeight = 300;//联动表高度
            } else {
                if (value.table.POSITION == 1) {//横向
                    if (totalWidth == 0) {
                        totalHeight += PAGE.info[index].table.HEIGHT;//添加一个单位的纵向
                    }
                    totalWidth += PAGE.info[index].table.WIDTH;
                } else {//纵向
                    totalHeight += PAGE.info[index].table.HEIGHT;
                }
            }
        });
    } else {//一张表不存在联动关系
        PAGE.info[0].table.PID = [];
        PAGE.info[0].table.SID = [];
    }

    //初始化查询信息
    var index = PAGE.data.INDEX;
    PAGE.info[index].DIALOG = {
        DIV: "div-search",
        FORM: "form-search",
        TABLE: "table-search",
    };
    initForm(PAGE.info[index]);
    PAGE.data = {
        HEIGHT: ($(document).height() - $("#" + PAGE.info[index].DIALOG.DIV).height() - bottomHeight - 25),//剩余高度,
        WIDTH: 100,//剩余宽度
        INDEX: index
    };
    totalHeight = totalHeight ? totalHeight : 1;
    totalWidth = totalWidth ? totalWidth : 1;

    //初始化表单信息
    $.each(PAGE.info, function (index, value) {
        PAGE.info[index].table.INDEX = index;//表单序号
        PAGE.info[index].table.EDITROW = undefined;//编辑行控制
        PAGE.info[index].table.SORTFLAG = false;//合并单元格需要
        //HEIGHT2和WIDTH2用于存放实际宽高
        if (value.table.POSITION == 1) {//横向
            PAGE.info[index].table.HEIGHT2 = value.table.HEIGHT / totalHeight * PAGE.data.HEIGHT - 8;
            PAGE.info[index].table.WIDTH2 = value.table.WIDTH / totalWidth * PAGE.data.WIDTH + "%";
        } else {//纵向
            if (!$.isEmptyObject(value.table.PID)) {//联动表子表
                PAGE.info[index].table.HEIGHT2 = bottomHeight - 25;
            } else {
                PAGE.info[index].table.HEIGHT2 = value.table.HEIGHT / totalHeight * PAGE.data.HEIGHT - 8;
            }
            PAGE.info[index].table.WIDTH2 = "100%";
        }

        //添加表格/图表
        if (value.table.CATEGORY == "chart") {//图形
            $("#datagrid").append("<div id='" + value.table.ID + "'></div>");
            initChart(PAGE.info[index]);
        } else {//表格
            if ($.isEmptyObject(value.table.PID)) {//无联动
                $("#datagrid").append('<table id="' + value.table.ID + '"></table>');
            } else {//联动
                if (!datagrid2) {
                    $("#datagrid2").append('<div id="bottom" class="easyui-tabs" narrow="true" style="width:100%; height: ' + bottomHeight + 'px"></div>');
                    datagrid2 = true;
                }
                $("#bottom").append('<div title="' + value.table.TITLE + '" style="display: none; padding: 2px; overflow: hidden;"><table id="' + value.table.ID + '"></table></div>');
            }
            initDataGrid(PAGE.info[index]);//初始化datagrid
        }
    });
    initTab();//初始化bottom
}

/**
 * 打开对话框
 * @param id
 */
function openDialog(info) {
    if ($("#" + info.DIALOG.TABLE).is(":empty")) {
        return;
    }
    $("#" + info.DIALOG.DIV).dialog("open");
    $("#" + info.DIALOG.DIV).dialog('center');//使Dialog居中显示
}

/**
 * 历史刷新
 * @param id
 * @private
 */
function reload_(id) {
    $("#" + id).datagrid('reload');
}

/**
 * 重新刷新
 * @param id
 * @param val
 * @private
 */
function load_(id, value) {
    console.log(id, value)
    $("#" + id).datagrid('load', value);
}

/**
 * 本地刷新
 * @param id
 * @param val
 * @private
 */
function loadData_(id, value) {
    $("#" + id).datagrid('loadData', value);
}

/**
 * 重置
 * @param id
 * @private
 */
function reset_(id) {
    $("#" + id).find('input[type=text],select,textarea,input[type=hidden],input[type=file]').each(function () {
        $(this).val('');
    });
}

/**
 * 重置
 * reset2_("form-dg", $("#form-dg").getForm());
 * @param id
 * @param value
 * @private
 */
function reset2_(id, value) {
    $.each(value, function (index, val) {
        value[index] = "";
    });
    $("#" + id).setForm(value);
}

/*
*扩展修改datagrid 标题
 */
function initField(info) {
    //查询
    var obj = {
        url: ACTION_URL + info.table.URL,
        param: $("#" + info.DIALOG.FORM).getForm()
    };
    obj.param = $.extend({}, obj.param, {
        input: JSON.stringify(info.condition),
        table: JSON.stringify(new Array(info.table))
    });
    var e = common_ajax(obj);
    var title = false;
    //改变标题
    if (e.columns.title) {
        $.each(e.columns.titles, function (index, value) {
            $.each(info.column, function (i, val) {
                if (val.FILED == value.FILED) {
                    info.column[i].TITLE = value.TITLE;
                    title = true;
                }
            });
        });
    }
    if (title) {
        var initcolumn = initColumn_(info);
        $('#' + info.table.ID).datagrid({
            columns: initcolumn.columns
        });
    }
    //改变数据列
    if (e.columns.field) {
        info.column = e.columns.fields;
        var initcolumn = initColumn_(info);
        $('#' + info.table.ID).datagrid({
            columns: initcolumn.columns
        });
    }
    //刷新数据
    initDataGrid(info);
}


/**
 * 查询
 * @param o
 */
function doSearch(info) {
    if (typeof(info) == 'string') {
        info = JSON.parse(info);
    }
    if (!$('#' + info.DIALOG.FORM).form('validate')) {
        return;
    }
    if (info.DIALOG.DIV == "div-search2") {//子表查询
        $('#' + info.DIALOG.DIV).dialog('close');
    }
    if (info.table.CATEGORY == "chart") {
        var obj = {
            url: ACTION_URL + info.table.URL,
            param: $("#" + info.DIALOG.FORM).getForm()
        };
        obj.param = $.extend({}, obj.param, {
            input: JSON.stringify(info.condition),
            table: JSON.stringify(new Array(info.table))
        });
        var e = common_ajax(obj);
        //数据处理
        if (e.code != 200) {
            Message(e.msg);
        }
        info.legend = e.echart.legend;
        info.xAxis = e.echart.xAxis;
        info.series = e.echart.series;
        initChart(info);
        //是否有联动表
        if (!$.isEmptyObject(info.table.SID)) {
            $.each(info.table.SID, function (index, value) {
                if (value) {
                    var object = {}
                    $.each(PAGE.info, function (i, val) {
                        if (val.table.ID == value) {
                            object = val;
                            object.DIALOG = info.DIALOG;
                        }
                    });
                    initField(object);
                    // load_(value, $("#" + $.extend({}, object.DIALOG.FORM).getForm(), {
                    //     input: JSON.stringify(object.condition),
                    //     table: JSON.stringify(new Array(object.table))
                    // }));
                }
            });
        }
    } else {
        initField(info);
        //刷新数据
        // load_(info.table.ID, $.extend({}, $("#" + info.DIALOG.FORM).getForm(), {
        //     input: JSON.stringify(info.condition),
        //     table: JSON.stringify(new Array(info.table))
        // }));
    }
}

/**
 * 编辑提交
 * @param o
 */
function doEdit(info) {
    if (typeof(info) == 'string') {
        info = JSON.parse(info);
    }
    if (!$('#' + info.DIALOG.FORM).form('validate')) {
        return;
    }
    $('#' + info.DIALOG.DIV).dialog('close');
    var obj = {
        url: ACTION_URL + info.DIALOG.URL,
        param: $("#" + info.DIALOG.FORM).getForm()
    };
    obj.param = $.extend({}, obj.param, {
        input: JSON.stringify(info.formT),
        table: JSON.stringify(new Array(info.table))
    });
    var e = common_ajax(obj);
    Message(e.msg);
    reload_(info.table.ID);//刷新自身
    $.each(info.table.PID, function (index, value) {
        if (value) {
            reload_(value);//刷新父表
        }
    });
    $.each(info.table.SID, function (index, value) {
        if (value) {
            reload_(value);//刷新子表
        }
    });
}

/**
 * 关闭
 * @param o
 */
function doClose(info) {
    if (typeof(info) == 'string') {
        info = JSON.parse(info);
    }
    $('#' + info.DIALOG.DIV).dialog('close');
}

/**
 * 导入
 */
function doImport(info) {
    if (typeof(info) == 'string') {
        info = JSON.parse(info);
    }
    if (!$("#" + info.DIALOG.FORM).form('validate')) {
        return;
    }
    var formData = new FormData(document.getElementById(info.DIALOG.FORM));
    var obj = {
        // url: ACTION_URL + info.DIALOG.URL,
        url: ACTION_URL + "import",
        param: formData,
        type: "formData"
    };
    $("#file").textbox('setText', '');//清空文件框
    $("#" + info.DIALOG.DIV).dialog("close");
    // obj.param = $.extend({}, obj.param, {
    //     input: JSON.stringify(info.table),
    //     table: JSON.stringify(new Array(info.table))
    // });
    var e = common_ajax(obj);
    if (e.code == 200) {
        Message("导入数据:" + e.real + "</br>" + "导入成功:" + e.success + "</br>" + "导入失败:" + (e.real - e.success));
    } else {
        Message(e.msg);
    }
    reload_(info.table.ID);//刷新自身
    $.each(info.table.PID, function (index, value) {
        if (value) {
            reload_(value);//刷新父表
        }
    });
    $.each(info.table.SID, function (index, value) {
        if (value) {
            reload_(value);//刷新子表
        }
    });
}

/**
 * 导出
 */
function doExport(info) {
    if (typeof(info) == 'string') {
        info = JSON.parse(info);
    }
    // $("#" + info.DIALOG.DIV).dialog("close");
    // var obj = {
    //     url: ACTION_URL + info.DIALOG.URL,
    //     param: $.extend({}, info.DIALOG.FORM ? $("#" + info.DIALOG.FORM).getForm() : {}, info.DIALOG.FORM2 ? $("#" + info.DIALOG.FORM2).getForm() : {})
    // };
    var obj = {
        url: ACTION_URL + info.DIALOG.URL,
        param: $.extend({}, info.DIALOG.FORM2 ? $("#" + info.DIALOG.FORM2).getForm() : {}, {tableId: info.table.PKID})
    };
    common_href(obj);
}

/**
 * //禁用/启用设置
 * @param data
 */
function readonlyText(data) {
    var value = [];
    if (data.banName) {
        var name = Property(data.banName);
        $("#" + data.info.DIALOG.FORM).editForm({type: "readonly", name: name, readonly: true});
        value = data.banValue.split("*");
        if (value.length == 1) {//等于
            if (value[0] == data.value) {
                $("#" + data.info.DIALOG.FORM).editForm({type: "readonly", name: name, readonly: false});
            }
        } else if (value.length == 3) {//包含字符串
            if (data.value.indexOf(value[1]) != -1) {
                $("#" + data.info.DIALOG.FORM).editForm({type: "readonly", name: name, readonly: false});
            }
        } else if (value[1] == "" || value[1] == null) {//以字符串开头
            if (data.value.indexOf(value[0]) == 0) {
                $("#" + data.info.DIALOG.FORM).editForm({type: "readonly", name: name, readonly: false});
            }
        } else if (value[0] == "" || value[0] == null) {//以字符串结尾
            if (data.value.substring(data.value.length - value[1].length) == value[1]) {
                $("#" + data.info.DIALOG.FORM).editForm({type: "readonly", name: name, readonly: false});
            }
        }
    }
}

/**
 * //输入框联动
 * @param data
 */
function linkText(data) {
    if (data.linkName) {
        var name = Property(data.linkName);
        var obj = {
            url: data.linkUrl,
            param: {
                sql: data.sql + " AND " + data.linkByName + " = '" + data.value + "'"
            }
        };
        var e = common_ajax(obj);
        $("#" + data.info.DIALOG.FORM).editForm({
            type: "link",
            name: name,
            value: e.code == 200 ? e.rows : []
        });
    }
}

//切换bottomTab
function initTab() {
    $('#bottom').tabs({
        border: true,
        narrow: true,
        onSelect: function (title) {
            $.each(PAGE.info, function (index, value) {
                if (value.table.TITLE == title) {
                    PAGE.data.DATAGRID = value;
                    PAGE.data.INDEX = index;
                    // reload_(value.table.ID);
                }
            });
        }
    });
}

/**
 * 初始化表单
 * @param v
 */
function initForm(info) {
    console.log(info);
    var button = '<a href="javascript:void(0)" class="easyui-linkbutton a_@@class" data-options="plain:true,iconCls:\'icon-@@icon\'">@@title</a>';
    var tr = "tr_";//用于区分主表和子表查询
    var th = "background: #D4D4D4;text-align: right;width:" + $(document).width() / (2 * info.table.QUERYNUM) + "px";
    var td = "border:solid #ccc 1px;background: #fdfdfd;text-align: left;width:" + $(document).width() / (2 * info.table.QUERYNUM) + "px";
    //清空button
    $("." + info.DIALOG.TABLE).empty();

    //生成button
    if (info.DIALOG.TABLE == "table-import") {//导入
        $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, info.DIALOG.TABLE).replace(/@@icon/g, "ok").replace(/@@title/g, "导入"));
        //绑定事件
        $(".a_" + info.DIALOG.TABLE).click(function () {
            doImport(JSON.stringify(info));
        });
    } else if (info.DIALOG.TABLE == "table-export") {//导出
        $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, info.DIALOG.TABLE).replace(/@@icon/g, "ok").replace(/@@title/g, "导出"));
        //绑定事件
        $(".a_" + info.DIALOG.TABLE).click(function () {
            doExport(JSON.stringify(info));
        });
    } else {
        if (info.DIALOG.TABLE == "table-search") {//查询表单
            tr = "tr_search_"
            $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, info.DIALOG.TABLE).replace(/@@icon/g, "search").replace(/@@title/g, "查询"));
            $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, "clear").replace(/@@icon/g, "reload").replace(/@@title/g, "清空"));
            //绑定事件
            $(".a_" + info.DIALOG.TABLE).click(function () {
                doSearch(JSON.stringify(info));
            });
            $(".a_clear").click(function () {
                reset2_(info.DIALOG.FORM, $("#" + info.DIALOG.FORM).getForm());
            });
        } else if (info.DIALOG.TABLE == "table-dg") {//编辑表单
            tr = "tr_dg_"
            $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, "edit").replace(/@@icon/g, "save").replace(/@@title/g, "保存"));
            $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, "close").replace(/@@icon/g, "no").replace(/@@title/g, "关闭"));
            //绑定事件
            $(".a_edit").click(function () {
                doEdit(JSON.stringify(info));
            });
            $(".a_close").click(function () {
                doClose(JSON.stringify(info));
            });
        } else if (info.DIALOG.TABLE == "table-search2") {//子表查询
            tr = "tr_search2_";
            $("." + info.DIALOG.TABLE).append(button.replace(/@@class/g, info.DIALOG.TABLE).replace(/@@icon/g, "search").replace(/@@title/g, "查询"));
            //绑定事件
            $(".a_" + info.DIALOG.TABLE).click(function () {
                doSearch(JSON.stringify(info));
            });
        }

        //清空表单信息
        $("#" + info.DIALOG.TABLE).empty();
        var formI = [];
        var count = 0;//计数器,用于计算生成了几行输入框
        var index2 = -1;//序列号
        if (info.DIALOG.TABLE == "table-dg") {//编辑表单
            formI = info.formT;
        } else if (info.DIALOG.TABLE == "table-search" || info.DIALOG.TABLE == "table-search2") {//查询表单
            formI = info.condition;
        }
        info.table.QUERYNUM = info.table.QUERYNUM ? info.table.QUERYNUM : 1;
        info.table.FORMNUM = info.table.FORMNUM ? info.table.FORMNUM : 1;

        //生成表单信息
        $.each(formI, function (index, value) {
            index2++;
            //定义输入框id
            var inputId = info.DIALOG.TABLE.split("-")[1] + value.NAME;
            //生成输入框
            if (info.DIALOG.TABLE == "table-search") {
                if (index2 == 0 || index2 % info.table.QUERYNUM == 0) {//换行
                    tr += index;
                    count++;
                    $("#" + info.DIALOG.TABLE).append("<tr class='" + tr + "'><th style='" + th + "'>" + value.TITLE + ":</th><td style='" + td + "'>" + value.TYPE.INPUT.replace(/@@NAME/g, value.NAME).replace(/@@ID/g, inputId) + "</td></tr>");
                } else {
                    $("." + tr).append("<th style='" + th + "'>" + value.TITLE + ":</th><td style='" + td + "'>" + value.TYPE.INPUT.replace(/@@NAME/g, value.NAME).replace(/@@ID/g, inputId) + "</td>");
                }
            } else {
                if (value.TYPE.TYPE == "textarea") {//换行
                    if (index2 == 0 || index2 % info.table.FORMNUM == 0) {
                        index2++;
                    }
                    tr += index;
                    count += value.TYPE.ROWS;
                    $("#" + info.DIALOG.TABLE).append("<tr class='" + tr + "'><th style='" + th + "'>" + value.TITLE + ":</th><td style='" + td + "' colspan='" + (info.table.FORMNUM * 2 - 1) + "'>" + value.TYPE.INPUT.replace(/@@NAME/g, value.NAME).replace(/@@ID/g, inputId) + "</td></tr>");
                } else if (index2 == 0 || index2 % info.table.FORMNUM == 0) {//换行
                    tr += index;
                    count++;
                    $("#" + info.DIALOG.TABLE).append("<tr class='" + tr + "'><th class='th'>" + value.TITLE + ":</th><td class='td'>" + value.TYPE.INPUT.replace(/@@NAME/g, value.NAME).replace(/@@ID/g, inputId) + "</td></tr>");
                } else {
                    $("." + tr).append("<th class='th'>" + value.TITLE + ":</th><td class='td'>" + value.TYPE.INPUT.replace(/@@NAME/g, value.NAME).replace(/@@ID/g, inputId) + "</td>");
                }
            }

            //输入框初始化
            if (value.TYPE.TYPE == "combobox") {//下拉框
                $('#' + inputId).combobox({
                    editable: value.TYPE.EDITABLE ? false : true, //是否可编辑
                    panelHeight: value.VALUE.length < 6 ? "auto" : 162,
                    data: value.VALUE,
                    multiple: value.TYPE.MULTIPLE ? true : false,
                    valueField: 'VALUE',
                    textField: 'TITLE',
                    onChange: function (newVal, oldVal) {
                        if (value.FILED == "JX") {
                            if (newVal == "机型") {
                                daybox("searchbegin", "");
                                // $.parser.parse($("#searchcreatdate"));
                            }
                            if (newVal == "机型2") {
                                monthbox("searchbegin", "");
                            }
                        }

                        //禁用/启用设置
                        if (value.BANNAME && value.BANNAME != value.FILED) {
                            readonlyText({
                                banByName: value.FILED,
                                banName: value.BANNAME,
                                banValue: value.BANVALUE,
                                value: newVal,
                                info: info,
                            });
                        }
                        //输入框联动
                        if (value.LINKNAME && value.LINKNAME != value.FILED) {
                            var sql = "";
                            $.each(formI, function (i, val) {
                                if (value.LINKNAME == val.FILED) {
                                    sql = val.SQL
                                }
                            });
                            linkText({
                                linkByName: value.FILED,
                                linkName: value.LINKNAME,
                                linkUrl: ACTION_URL + "commonBySql",
                                sql: sql,
                                value: newVal,
                                info: info,
                            });
                        }
                    }
                });
            }
            if (value.TYPE.TYPE == "combogrid") {//下拉表
                $('#' + inputId).combogrid({
                    onChange: function (newVal, oldVal) {
                        //禁用/启用设置
                        if (value.BANNAME && value.BANNAME != value.FILED) {
                            readonlyText({
                                banByName: value.FILED,
                                banName: value.BANNAME,
                                banValue: value.BANVALUE,
                                value: newVal,
                                info: info,
                            });
                        }

                        //输入框联动
                        if (value.LINKNAME && value.LINKNAME != value.FILED) {
                            var sql = "";
                            $.each(formI, function (i, val) {
                                if (value.LINKNAME == val.FILED) {
                                    sql = val.SQL
                                }
                            });
                            linkText({
                                linkByName: value.FILED,
                                linkName: value.LINKNAME,
                                linkUrl: ACTION_URL + "commonBySql",
                                sql: sql,
                                value: newVal,
                                info: info,
                            });
                        }
                    }
                });
            }
            if (value.TYPE.TYPE == "monthbox") {//日期
                monthbox(inputId, "");
            }

            //回填默认值
            var json = {};
            if (value.DEFAULT == "@@userName") {//当前操作人
                json[value.NAME] = "admin";
            } else if (value.DEFAULT == "@@systemTime") {//当前时间
                json[value.NAME] = formatterDate(new Date());
            } else {
                json[value.NAME] = value.DEFAULT;
            }
            $("#" + info.DIALOG.FORM).setForm(json);

            //禁用/启用设置
            if (value.BANBYNAME && value.BANBYNAME != value.FILED) {
                readonlyText({
                    banByName: value.BANBYNAME,
                    banName: value.FILED,
                    banValue: value.BANVALUE,
                    value: $("#" + info.DIALOG.FORM).getForm()[value.BANBYNAME],
                    info: info,
                });
            }

            //输入框联动
            if (value.LINKBYNAME && value.LINKBYNAME != value.FILED) {
                console.log("输入框联动_初始化");
                linkText({
                    linkByName: value.LINKBYNAME,
                    linkName: value.FILED,
                    linkUrl: ACTION_URL + "commonBySql",
                    sql: value.SQL,
                    value: $("#" + info.DIALOG.FORM).getForm()[value.LINKBYNAME],
                    info: info,
                });
            }

        });

        //定义窗口大小
        if (info.DIALOG.DIV == "div-search") {
            $("#" + info.DIALOG.DIV).height($.isEmptyObject(formI) ? 0 : count * 30 + 35);
        } else {
            $('#' + info.DIALOG.DIV).dialog({
                height: count * 31 + 80,
                width: formI.length == 1 ? info.table.FORMNUM * 175 : info.table.FORMNUM * 2 * 175,//每个单元长度为170
                resizable: true,//改变大小
                title: info.table.TITLE,//名称
            });
        }

    }
    $.parser.parse();//重新渲染
}

/**
 * 初始化菜单
 * @param o
 */
function initMenu(info) {
    $("#menu").empty();//清空菜单
    //添加菜单元素
    $.each(info.menu, function (index, value) {
        $('#menu').menu('appendItem', {
            id: value.ID,
            text: value.TITLE,
            iconCls: value.ICONCLS,
            disabled: value.DISABLED,
            // href: value.HREF ? value.HREF : "#",
            // onclick: j.onclick
        });
        if (!value.DISABLED) {//不禁用时才重定义onclick
            //增加
            if (value.ID == "m-add") {
                $("#m-add").click(function () {
                    info.DIALOG = {
                        DIV: "div-dg",
                        FORM: "form-dg",
                        TABLE: "table-dg",
                        URL: value.URL
                    };
                    initForm(info);
                    openDialog(info);
                });
            }
            //删除
            if (value.ID == "m-remove") {
                $("#m-remove").click(function () {
                    //删除时先获取选择行
                    var rows = [];
                    rows.push(info.row);
                    //选择要删除的行
                    $.messager.confirm("提示", "你确定要删除吗?", function (r) {
                        if (r) {
                            var obj = {
                                url: ACTION_URL + value.URL,
                                param: {
                                    data: JSON.stringify(rows),
                                }
                            };
                            obj.param = $.extend({}, obj.param, {
                                input: JSON.stringify(info.column),
                                table: JSON.stringify(new Array(info.table))
                            });
                            var e = common_ajax(obj);
                            if (e.code == 200) {
                                Message(e.msg);
                                reload_(info.table.ID);
                            } else {
                                Message(e.msg);
                            }
                        }
                    });
                });
            }
            //修改
            if (value.ID == "m-edit") {
                var url = "";
                $.each(info.menu, function (i, val) {
                    if (val.ID == "m-search") {
                        url = val.URL;
                    }
                });
                $("#m-edit").click(function () {
                    var rows = info.row;
                    info.DIALOG = {
                        DIV: "div-dg",
                        FORM: "form-dg",
                        TABLE: "table-dg",
                        URL: value.URL
                    };
                    initForm(info);
                    var obj = {
                        url: ACTION_URL + url,
                        param: rows
                    };
                    //添加钻取
                    obj.param = $.extend({DRILLING: 1}, obj.param, {
                        input: JSON.stringify(info.column),
                        table: JSON.stringify(new Array(info.table))
                    });
                    var e = common_ajax(obj);
                    if (e.code == 200) {
                        $("#" + info.DIALOG.FORM).setForm(e.rows[0]);
                        openDialog(info);
                    } else {
                        Message(e.msg);
                    }
                });
            }
            //查看
            if (value.ID == "m-search") {
                $("#m-search").click(function () {
                    var rows = info.row;
                    info.DIALOG = {
                        DIV: "div-dg",
                        FORM: "form-dg",
                        TABLE: "table-dg",
                        URL: value.URL
                    };
                    initForm(info);
                    $(".a_edit").remove();//移除确定按钮
                    var obj = {
                        url: ACTION_URL + value.URL,
                        param: rows
                    };
                    //添加钻取
                    obj.param = $.extend({DRILLING: 1}, obj.param, {
                        input: JSON.stringify(info.column),
                        table: JSON.stringify(new Array(info.table))
                    });
                    var e = common_ajax(obj);
                    if (e.code == 200) {
                        $("#" + info.DIALOG.FORM).setForm(e.rows[0]);
                        openDialog(info);
                    } else {
                        Message(e.msg);
                    }
                });
            }
            //钻取
            if (value.ID == "m-drillthrough") {
                $("#m-drillthrough").click(function () {
                    drillthrough({row: info.row, href: value.HREF});
                });
            }
        }
    });
}

/**
 * 钻取
 */
function drillthrough(data) {
    if (typeof(data) == 'string') {
        data = JSON.parse(data);
    }
    PAGE.param = data.row;
    var windows = window.open(ACTION_URL + data.href);
}

/**
 * 初始化超链接
 * @param name
 * @param val
 * @param index
 */
function initHref(id, href, index) {
    var row = $("#" + id).datagrid("getRows")[index];
    var obj = {
        row: row,
        href: href
    };
    drillthrough(obj);
}

/**
 * 初始化图表
 * @param info
 */
function initChart(info) {
    //初始化大小
    $("#" + info.table.ID).height(info.table.HEIGHT2);
    $("#" + info.table.ID).width(info.table.WIDTH2);
    //初始化数据
    var char_data = {};
    char_data.type = info.table.TYPE;//type类型（折线图--line；柱形图--bar）
    char_data.flag = info.table.DISABLEVALUE ? true : false;//是否需要显示数值（需要传入判断值）
    char_data.id = info.table.ID;//传入id
    char_data.text = info.table.TITLE;//传入document.title
    char_data.legend = info.legend;//legend数据
    char_data.xAxis = info.xAxis;//xAxis数据
    char_data.series = info.series;//series数据
    if (info.DIALOG) {
        if (info.DIALOG) char_data.subtext = $("#" + info.DIALOG.FORM).getFormString(info);//查询条件{
    }
    chartLineBar(char_data);//图表展示

}

/**
 * 初始化表格
 * @param v
 */
function initDataGrid(info) {
    var initColumn = initColumn_(info);
    var queryParams = queryParams_(info);//有问题
    var toolbar = toolbar_(info);
    //定义datagrid
    console.log(initColumn);
    $("#" + info.table.ID).datagrid({
        title: info.table.TITLE,//表格标题  
        iconCls: 'icon-large-smartart', //图标
        loadMsg: '数据加载中......',
        width: info.table.WIDTH2,
        height: initColumn.height,
        // fitColumns: true, //列自适应宽度
        scrollbarSize: 0,
        striped: true, //行背景交换
        nowap: true, //列内容多时自动折至第二行
        border: false,
        rownumbers: true,//行号
        // idField: 'packetid', //主键
        // sortName : 'packetid',//排序字段
        // sortOrder : 'desc',//排序方式
        remoteSort: false,//关闭服务器排序
        collapsible: true,//可折叠
        pagination: true,//开启分页 
        // singleSelect: true,//每次只能选中1行
        pageSize: initColumn.pageSize,//分页大小  
        showPageList: true,
        // pageNumber: 1,//第几页显示（默认第一页，可以省略）  
        pageList: [10, initColumn.pageSize, 30],//设置每页记录条数的列表   
        url: ACTION_URL + info.table.URL,//获取数据地址  
        firstLoad: false,
        // data: INFORMATION.data,//数据
        frozenColumns: initColumn.frozenColumns,
        columns: initColumn.columns,
        queryParams: queryParams,//查询参数(有问题)
        onSortColumn: function (sort, order) {
            if (!$.isEmptyObject(info.table.ROWSPAN)) {
                info.table.SORTFLAG = true;
                if ("userName" == sort) {
                    $(this).datagrid("autoMergeCells", [sort]);
                } else {
                    $(this).datagrid("autoMergeCells");
                }
            }
        },//  合并函数
        onLoadSuccess: function (data) {
            // ====合并列=====
            if (!$.isEmptyObject(info.table.COLSPAN)) {
                mergeColumn(info.table.ID, data, info.table.COLSPAN);
            }
            //====合并行=====
            if (!$.isEmptyObject(info.table.ROWSPAN)) {
                if (!info.table.SORTFLAG) $(this).datagrid("autoMergeCells", info.table.ROWSPAN);//第一参数为方法名，第二个参数为要合并的列，用数组存储
            }
        },//数据处理
        onClickRow: function (index, row) {
            var sid = info.table.SID;
            console.log(sid);
            if (sid[0]) {//没有子元素,即没有联动关系
                return;
            }
            var datagrid_ = {};
            $.each(PAGE.info, function (key, val) {
                if (val.table.ID == sid[0]) {
                    datagrid_ = PAGE.info[key];
                    PAGE.data.INDEX = key;
                }
            });
            if ($.isEmptyObject(datagrid_)) {
                return;
            }
            //需要钻取
            if (PAGE.data.DATAGRID) {
                if (PAGE.data.DATAGRID.table.ID != info.table.ID) {
                    load_(PAGE.data.DATAGRID.table.ID, $.extend({DRILLING: 1}, row, {
                        input: JSON.stringify(PAGE.data.DATAGRID.condition),
                        table: JSON.stringify(new Array(PAGE.data.DATAGRID.table))
                    }));//刷新联动表单数据
                    // $("#bottom").tabs('select', info.table.TITLE);//选中该表
                } else {
                    load_(datagrid_.table.ID, $.extend({DRILLING: 1}, row, {
                        input: JSON.stringify(datagrid_.condition),
                        table: JSON.stringify(new Array(datagrid_.table))
                    }));//刷新联动表单数据
                    $("#bottom").tabs('select', datagrid_.table.TITLE);//选中该表
                }
            } else {
                PAGE.data.DATAGRID = datagrid_;
                if (datagrid_.table.ID != info.table.ID) {
                    load_(datagrid_.table.ID, $.extend({DRILLING: 1}, row, {
                        input: JSON.stringify(datagrid_.condition),
                        table: JSON.stringify(new Array(datagrid_.table))
                    }));//刷新联动表单数据
                    $("#bottom").tabs('select', datagrid_.table.TITLE);//选中该表
                }
            }
        },//左键
        onRowContextMenu: function (e, rowIndex, rowData) {
            if ($.isEmptyObject(rowData) || $.isEmptyObject(info.menu)) {
                return;
            }
            info.row = rowData;
            initMenu(info);
            $(this).datagrid("clearSelections"); //取消所有选中项
            $(this).datagrid("selectRow", rowIndex); //根据索引选中该行
            e.preventDefault(); //阻止浏览器捕获右键事件
            $('#menu').menu('show', {
                left: e.pageX,
                top: e.pageY
            });//在鼠标点击处显示菜单
        },//右键
        onBeforeLoad: function (param) {
            if (info.table.PID.length == 0 && info.table.FIRSTLOAD) {
                return true;
            }
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
        },//首次不加载数据
        onDblClickRow: function (rowIndex, rowData) {
            if (!info.table.ONDBLCLICKROW) {//没有双击功能
                return;
            }
            info.DIALOG = {
                DIV: "div-dg",
                FORM: "form-dg",
                TABLE: "table-dg",
                URL: ACTION_URL + info.table.ONDBLCLICKROW
            };
            initForm(info);
            var obj = {
                url: ACTION_URL + info.table.URL,
                param: rowData,
            };
            obj.param = $.extend({DRILLING: 1}, obj.param, {//需要钻取
                input: JSON.stringify(info.column),
                table: JSON.stringify(new Array(info.table))
            });
            var e = common_ajax(obj);
            if (e.code == 200) {
                $("#" + info.DIALOG.FORM).setForm(e.rows[0]);
                openDialog(info);
            } else {
                Message(e.msg);
            }
        },//双击
        onAfterEdit: function (rowIndex, rowData, changes) {
            //获取url
            var t_add_url = "";
            var t_edit_url = "";
            $.each(info.toolbar, function (index, value) {
                if (value.ID == "t-add") {
                    t_add_url = value.URL;
                }
                if (value.ID == "t-edit") {
                    t_edit_url = value.URL;
                }
            });
            //endEdit该方法触发此事件
            var row = $("#" + info.table.ID).datagrid("getData").rows[rowIndex];  //获取当前行的值
            var inserted = $("#" + info.table.ID).datagrid('getChanges', 'inserted');
            var updated = $("#" + info.table.ID).datagrid('getChanges', 'updated');
            //没有被操作或没有获取到值
            if (inserted.length < 1 && updated.length < 1) {
                info.table.EDITROW = undefined;
                $("#" + info.table.ID).datagrid('unselectAll');
                return;
            }
            //当前表操作
            var obj = {
                url: ACTION_URL + (inserted.length < 1 ? t_edit_url : t_add_url),
                param: row,
            };
            obj.param = $.extend({}, obj.param, {
                input: JSON.stringify(info.column),
                table: JSON.stringify(new Array(info.table))
            });
            var e = common_ajax(obj);
            if (e.code == 200) {
                $("#" + info.table.ID).datagrid("acceptChanges");
                info.table.EDITROW = undefined;
                Message(e.msg);
                reload_(info.table.ID);
            } else if (e.code == 300) {
                $.messager.alert('添加失败', '抱歉！您没有权限！', 'warning');
            } else {
                $("#" + info.table.ID).datagrid("beginEdit", info.table.EDITROW);
                $.messager.alert('警告操作', '未知错误！请重新刷新后提交！', 'warning');
            }
            $("#" + info.table.ID).datagrid("unselectAll");
            //联动表操作
            $.each(info.table.PID, function (index, value) {
                if (value) {
                    reload_(value);//刷新父表
                }
            });
            $.each(info.table.SID, function (index, value) {
                if (value) {
                    reload_(value);//刷新子表
                }
            });
        },//结束编辑,提交
        toolbar: toolbar,
        rowStyler: function (index, row) {
            if (1 == 2) {
                return 'background-color:pink;color:blue;font-weight:bold;';
            }
        }//样式
    });
}

/**
 * 表单获取/赋值
 */
$.fn.extend({
    getFormString: function (info) {//取值
        var str = "";
        var o = {};
        var a = this.serializeArray();
        console.log(a);
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        var $radio = $('input[type=radio],input[type=checkbox]', this);
        $.each($radio, function () {
            if (!o.hasOwnProperty(this.name)) {
                o[this.name] = '';
            }
        });
        $.each(o, function (index, value) {
            // $.each(info.condition, function (i, val) {
            //     if (val.NAME == index) {
            //         index = val.TITLE;
            //     }
            // });
            if (value != "" && value != null) {
                str += index + " :[" + value + "]  "
            }
        });
        return str;
    },
    getForm: function () {//取值
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        var $radio = $('input[type=radio],input[type=checkbox]', this);
        $.each($radio, function () {
            if (!o.hasOwnProperty(this.name)) {
                o[this.name] = '';
            }
        });
        return o;
    },
    setForm: function (data) {//赋值
        var jQtarget = this;
        var transform = "CamelCase";//change
        if (!data) return;
        console.log(data);
        if (transform && transform == "CamelCase") {
            data = toCamelCase(data);
            //这里增加表单的主键(PKID)
            data.PKID = data.pkid;
        }
        console.log(data);
        var jQtarget_ = jQtarget ? jQtarget : $(document);
        $.each(data, function (k, v) {
            var jQt = jQtarget_.find("*[textboxname='" + k + "']");
            if (jQt.length <= 0) {
                var tar = jQtarget_.find("*[name='" + k + "']");
                if (!(tar.is(":radio") || tar.is(":checkbox"))) {
                    tar.val(v);
                }
            } else {
                if (jQt.hasClass("combobox-f")) {
                    jQt.combobox('setValue', v);
                } else if (jQt.hasClass("combotree-f")) {
                    jQt.combotree('setValue', v);
                } else if (jQt.hasClass("datetimebox-f")) {
                    jQt.datetimebox('setValue', v);
                } else if (jQt.hasClass("datebox-f")) {
                    jQt.datebox('setValue', v);
                } else if (jQt.hasClass("numberbox-f")) {
                    jQt.numberbox('setValue', v);
                } else if (jQt.hasClass("numberspinner-f")) {
                    jQt.numberspinner('setValue', v);
                } else if (jQt.hasClass("switchbutton-f")) {
                    v == true ? jQt.switchbutton('check') : jQt.switchbutton('uncheck');
                } else if (jQt.hasClass("slider-f")) {
                    jQt.slider('setValue', v);
                } else if (jQt.hasClass("textbox-f")) {
                    jQt.textbox('setValue', v);
                }
            }
        });
        return data;
    },
    editForm: function (data) {//初始化输入框
        var jQtarget = this;
        var jQtarget_ = jQtarget ? jQtarget : $(document);
        var jQt = jQtarget_.find("*[textboxname='" + data.name + "']");
        var color = data.readonly ? "#CBC49D" : "#FFFFFF";//FFFFFF
        if (jQt.length <= 0) {
            var tar = jQtarget_.find("*[name='" + data.name + "']");
            if (!(tar.is(":radio") || tar.is(":checkbox"))) {
                if (data.type == "readonly") {
                    tar.attr('readonly', data.readonly).css('background-color', color);
                }
            }
        } else {
            if (jQt.hasClass("combobox-f")) {
                if (data.type == "readonly") {
                    jQt.combobox('readonly', data.readonly).css('background-color', color);
                }
                if (data.type == "link") {
                    jQt.combobox("loadData", data.value);
                    jQt.combobox('setValue', "");//同时清空值
                }
            } else if (jQt.hasClass("combotree-f")) {
                if (data.type == "readonly") {
                    jQt.combotree('readonly', data.readonly).css('background-color', color);
                }
                if (data.type == "link") {
                    jQt.combotree("loadData", data.value);
                }
            } else if (jQt.hasClass("datetimebox-f")) {
                if (data.type == "readonly") {
                    jQt.datetimebox('readonly', data.readonly).css('background-color', color);
                }
            } else if (jQt.hasClass("datebox-f")) {
                if (data.type == "readonly") {
                    jQt.datebox('readonly', data.readonly).css('background-color', color);
                }
            } else if (jQt.hasClass("numberbox-f")) {
                if (data.type == "readonly") {
                    jQt.numberbox('readonly', data.readonly).css('background-color', color);
                }
            } else if (jQt.hasClass("numberspinner-f")) {
                if (data.type == "readonly") {
                    jQt.numberspinner('readonly', data.readonly).css('background-color', color);
                }
            } else if (jQt.hasClass("switchbutton-f")) {
                if (data.type == "readonly") {
                    jQt.switchbutton('readonly', data.readonly).css('background-color', color);
                }
            } else if (jQt.hasClass("slider-f")) {
                if (data.type == "readonly") {
                    jQt.slider('readonly', data.readonly).css('background-color', color);
                }
            } else if (jQt.hasClass("textbox-f")) {
                if (data.type == "readonly") {
                    jQt.textbox('readonly', data.readonly).css('background', color);
                }
            } else {
                var tar = jQtarget_.find("*[name='" + data.name + "']");
                if (!(tar.is(":radio") || tar.is(":checkbox"))) {
                    if (data.type == "readonly") {
                        tar.attr('readonly', data.readonly).css('background-color', color);
                    }
                }
            }
        }
    }
});

//====================datagrid function start=====================

/**
 * 初始化表单属性
 * @returns {{columns: Array, height, pageSize: number}}
 * @private
 */
function initColumn_(info) {
    var frozenColumns = [];//冻结列
    var frozenColumn = [];//冻结列_子列
    var columns = [];//数据列
    var column = [];//数据列_子列
    var row = 0;
    var count = 0;
    var checkbox_true = {field: '#', title: '#', width: 120, checkbox: true};
    var checkbox_false = {field: '', title: '', width: 120, checkbox: false};
    if (info.column.length > 0) {
        /**
         * column要求先按行排序,再按列排序(只有一行的列表,rownum可以不填)
         */
        row = info.column[0].ROWNUM;
    }
    $.each(info.column, function (i, col) {
        if (row != col.ROWNUM) {
            frozenColumns.push(frozenColumn);
            columns.push(column);
            frozenColumn = [];
            column = [];
            row = col.ROWNUM;
            count++;
        }
        if (column.length == 0 && frozenColumn.length == 0) {//加到首列
            if (info.table.CHECKBOX) {//加载checkbox
                frozenColumn.push(row == info.column[info.column.length - 1].ROWNUM ? checkbox_true : checkbox_false);
                // column.push(row == INFORMATION.column[INFORMATION.column.length - 1].rownum ? checkbox_true : checkbox_false);//这里默认checkbox为固定列
            }
        }
        var obj = {
            field: col.FILED ? col.FILED : "",//列id
            title: col.TITLE ? col.TITLE : "",//列名称
            width: col.WIDTH ? col.WIDTH : 120,//宽度
            belong: col.BELONG ? col.BELONG : "Q",//?
            colspan: col.COLSPAN ? col.COLSPAN : 1,//合并列
            rowspan: col.ROWSPAN ? col.ROWSPAN : 1,//合合行
            halign: col.HALIGN ? col.HALIGN : "center",//标题位置
            align: col.ALIGN ? col.ALIGN : "center",//内容位置
            sortable: col.SORTABLE ? true : false,//是否排序
            editor: {
                type: col.TYPE ? col.TYPE : 'validatebox',//单元格类型
                options: {
                    required: col.REQUIRED ? true : false,//是否必填
                    valueField: 'VALUE',
                    textField: 'TITLE',
                    data: col.VALUE,
                    editable: !col.EDITABLE ? true : false,////是否可编辑
                }
            },
            formatter: function (val, row, index) {//钻取
                if (col.HREF) {
                    return '<a style="color:blue" href="javascript:void(0);" onclick="initHref(\'' + info.table.ID + '\',\'' + col.HREF + '\',' + index + ');">' + (val != undefined ? val : "") + '</a>';
                } else {
                    return val;
                }
            }
        };
        if (col.FROZENCOLUMNS) {
            frozenColumn.push(obj);
        } else {
            column.push(obj);
        }
    });
    frozenColumns.push(frozenColumn);
    columns.push(column);
    var height = info.table.HEIGHT2;//减去datagrid的title
    var pageSize = parseInt((height - 100 - 32.2 * count) / 32.2) - 1;//减去datagrid的toolbar/headtitle/pager,再往上空两行
    return {frozenColumns: frozenColumns, columns: columns, height: height, pageSize: pageSize};
}

/**
 * 传参
 * @private
 */
function queryParams_(info) {
    var obj = {
        input: JSON.stringify(info.condition),
        table: JSON.stringify(new Array(info.table))
    }
    if (window.opener) {
        $.extend(obj, window.opener.PAGE.param);//父页面参数
        obj.DRILLING = 1;//钻取
    }
    return $.extend(
        {},
        info.DIALOG ? $("#" + info.DIALOG.FORM).getForm() : {},
        obj
    );
}

/**
 * 工具栏定义
 * @returns {*[]}
 * @private
 */
function toolbar_(info) {
    var newToolbar = [];
    var toolbar = [
        {
            id: "t-add", text: '添加', iconCls: 'icon-add',
            handler: function () {//添加列表的操作按钮添加，修改，删除等
                //添加时如果没有正在编辑的行，则在datagrid的第一行插入一行
                if (info.table.EDITROW == undefined) {
                    $("#" + info.table.ID).datagrid("insertRow", {
                        index: 0, // index start with 0
                        row: {}
                    });
                    //将新插入的那一行开户编辑状态
                    $("#" + info.table.ID).datagrid("beginEdit", 0);
                    //给当前编辑的行赋值
                    info.table.EDITROW = 0;
                }
            }
        }, '-',
        {
            id: "t-remove", text: '删除', iconCls: 'icon-remove',
            handler: function () {
                var url = "";
                $.each(info.toolbar, function (index, value) {
                    if (value.ID == "t-remove") {
                        url = value.URL;
                    }
                });
                //删除时先获取选择行
                var rows = $("#" + info.table.ID).datagrid("getSelections");
                //选择要删除的行
                if (rows.length > 0) {
                    $.messager.confirm("提示", "你确定要删除吗?", function (r) {
                        if (r) {
                            var obj = {
                                url: ACTION_URL + url,
                                param: {
                                    data: JSON.stringify(rows),
                                }
                            };
                            obj.param = $.extend({}, obj.param, {
                                input: JSON.stringify(info.column),
                                table: JSON.stringify(new Array(info.table))
                            });
                            var e = common_ajax(obj);
                            if (e.code == 200) {
                                Message(e.msg);
                                reload_(info.table.ID);
                            } else {
                                Message(e.msg);
                            }
                        }
                    });
                } else {
                    $.messager.alert("提示", "请选择要删除的行", "error");
                }
            }
        }, '-',
        {
            id: "t-edit", text: '修改', iconCls: 'icon-edit',
            handler: function () {
                //修改时要获取选择到的行
                var rows = $("#" + info.table.ID).datagrid("getSelections");
                //如果只选择了一行则可以进行修改，否则不操作
                if (rows.length == 1) {
                    //当无编辑行时
                    if (info.table.EDITROW == undefined) {
                        //获取到当前选择行的下标
                        var index = $("#" + info.table.ID).datagrid("getRowIndex", rows[0]);
                        //开启编辑
                        $("#" + info.table.ID).datagrid("beginEdit", index);
                        //把当前开启编辑的行赋值给全局变量editRow
                        info.table.EDITROW = index;
                        //当开启了当前选择行的编辑状态之后，
                        //应该取消当前列表的所有选择行，要不然双击之后无法再选择其他行进行编辑
                        $("#" + info.table.ID).datagrid("unselectAll");
                    }
                }
            }
        }, '-',
        {
            id: "t-save", text: '保存', iconCls: 'icon-save',
            handler: function () {
                //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                $("#" + info.table.ID).datagrid("endEdit", info.table.EDITROW);
            }
        }, '-',
        {
            id: "t-redo", text: '取消编辑', iconCls: 'icon-redo',
            handler: function () {
                //取消当前编辑行把当前编辑行罢undefined回滚改变的数据,取消选择的行
                info.table.EDITROW = undefined;
                $("#" + info.table.ID).datagrid("rejectChanges");
                $("#" + info.table.ID).datagrid("unselectAll");
            }
        }, '-',
        {
            id: "t-excle", text: '导入数据', iconCls: 'icon-excle',
            handler: function () {
                var url = "";
                $.each(info.toolbar, function (index, value) {
                    if (value.ID == "t-excle") {
                        url = value.URL;
                    }
                });
                info.DIALOG = {
                    DIV: "div-import",
                    FORM: "form-import",
                    TABLE: "table-import",
                    URL: url
                };
                initForm(info);
                openDialog(info);
            }
        }, '-',
        {
            id: "t-print", text: '导出数据', iconCls: 'icon-print',
            handler: function () {
                var url = "";
                $.each(info.toolbar, function (index, value) {
                    if (value.ID == "t-print") {
                        url = value.URL;
                    }
                });
                info.DIALOG = {
                    DIV: "div-export",
                    FORM: "form-export",
                    FORM2: "form-search",
                    TABLE: "table-export",
                    URL: url
                };
                doExport(info);
                //导出
                // initForm(info);
                // openDialog(info);
            }
        }, '-',
        {
            id: "t-search", text: '查询', iconCls: 'icon-search',
            handler: function () {
                //第一种方法,弹出窗口
                // info.DIALOG = {
                //     DIV: "div-search2",
                //     FORM: "form-search2",
                //     TABLE: "table-search2",
                // };
                // initForm(info);
                // openDialog(info);

                //第二种方法,重新选定查询条件,加载页面
                PAGE.data.INDEX = info.table.INDEX;
                initPage();
            }
        }, '-',
    ];
    $.each(info.toolbar, function (index, value) {
        $.each(toolbar, function (index2, value2) {
            if (value.ID == value2.id && !value.DISABLED) {
                value2.text = value.TEXT ? value.TEXT : value2.text;
                value2.iconCls = value.ICONCLS ? value.ICONCLS : value2.iconCls;
                newToolbar.push(value2);
            }
        });
    });
    return newToolbar;
}

//====================datagrid function end=====================

/**
 * 格式化属性 NA_ME=>naMe
 * @param data
 * @returns {{}}
 */
function JSONProperty(e) {
    var o = {};
    $.each(e, function (key, v) {
        var arr = key.toLowerCase().split('');
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == "_" && i < arr.length - 1) {
                arr[i + 1] = arr[i + 1].toUpperCase();
            }
        }
        o[arr.join("").replace(/\_/g, "")] = v;
    });
    return o;
}

/**
 *格式化属性 NA_ME=>naMe
 * @param e
 * @returns {string}
 * @constructor
 */
function Property(e) {
    var arr = e.toLowerCase().split('');
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == "_" && i < arr.length - 1) {
            arr[i + 1] = arr[i + 1].toUpperCase();
        }
    }
    return arr.join("").replace(/\_/g, "");
}

/**
 * 格式化属性 NA_ME=>naMe
 * @param data
 * @returns {{}}
 */
function toCamelCase(data) {
    var re = new RegExp("\\_[0-9]*[a-z]{1}", "g");
    //var re = /_([0-9]*[a-z]{1})/;
    var str = "";
    var min = /[^a-z]/g;//小写字母
    var datac = {};
    $.each(data, function (k, v) {
        var i = 0;
        //判断是否需要转换
        str = k.replace(min, "");
        if (str.length > 0) {
            datac = data;
            return false;
        }
        k = k.toLowerCase();
        var arr = k.match(re) || [];
        for (var i = 0; i < arr.length; i++) {
            k = (k).replace(arr[i], arr[i].replace("_", "").toUpperCase());
        }
        datac[k] = v;
    });
    return datac;
}

/**
 * href公共方法
 * @param v
 * @returns {{}}
 */
function common_href(v) {
    var URL = v.url + "?";
    $.each(v.param, function (i, v) {
        if (URL.charAt(URL.length - 1) == "?") {
            URL += i + "=" + v;
        } else {
            URL += "&" + i + "=" + v;
        }
    });
    window.location.href = URL;
}

/**
 * ajax公共方法
 * @param v
 * @returns {{}}
 */
function common_ajax(v) {
    console.log(v);
    var arr = {};
    $.ajax({
        url: v.url ? v.url : "",
        data: v.param ? v.param : "",
        dataType: "json",
        type: "post",
        processData: v.type == "formData" ? false : true,
        contentType: v.type == "formData" ? false : "application/x-www-form-urlencoded; charset=UTF-8",
        async: v.async ? true : false,
        beforeSend: function () {
            $.messager.progress({text: '正在处理中...'});
        },
        success: function (e) {
            $.messager.progress('close');
            arr = e;
        },
        error: function (e) {
            $.messager.progress('close');
            arr = e;
        }
    });
    console.log(arr);
    return arr;
}

/**
 * common_json
 * @param url
 * @returns {Array}
 */
function common_json(url) {
    var v = [];
    $.ajax({
        url: url,
        async: false,
        success: function (e) {
            v = e;
        },
        error: function (e) {
            v = e;
        }
    });
    return v;
}

/**
 * 消息提示
 * @param v
 * @constructor
 */
function Message(v) {
    $.messager.alert("消息提示:", v);
}

//=====================日期格式化=========================
/**
 * 日期格式化--年月(201701)
 * for example:
 * monthbox("beginDate");
 */
function monthbox(id, date) {
    $('#' + id).datebox({
        //显示日趋选择对象后再触发弹出月份层的事件，初始化时没有生成月份层
        onShowPanel: function () {
            //触发click事件弹出月份层
            span.trigger('click');
            if (!tds)
            //延时触发获取月份对象，因为上面的事件触发和对象生成有时间间隔
                setTimeout(function () {
                    tds = p.find('div.calendar-menu-month-inner td');
                    tds.click(function (e) {
                        //禁止冒泡执行easyui给月份绑定的事件
                        e.stopPropagation();
                        //得到年份
                        var year = /\d{4}/.exec(span.html())[0],
                            //月份，之前是这样的month = parseInt($(this).attr('abbr'), 10) + 1;
                            month = parseInt($(this).attr('abbr'), 10);
                        //隐藏日期对象
                        $('#' + id).datebox('hidePanel')
                        //设置日期的值
                            .datebox('setValue', year + '' + month);
                    });
                }, 0);
        },
        //配置parser，返回选择的日期
        parser: function (s) {
            if (!s) return new Date();
            // var arr = s.split('-');//之前格式为2017-10时需要，现改为如下
            var arr = new Array();
            arr[0] = s.substring(0, 4);
            arr[1] = s.substring(4);
            return new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, 1);
        },
        //配置formatter，只返回年月 之前是这样的d.getFullYear() + '-' +(d.getMonth());
        formatter: function (d) {
            var currentMonth = (d.getMonth() + 1);
            var currentMonthStr = currentMonth < 10 ? ('0' + currentMonth) : (currentMonth + '');
            return d.getFullYear() + '' + currentMonthStr;
        }
    });

    //日期选择对象
    var p = $('#' + id).datebox('panel'),
        //日期选择对象中月份
        tds = false,
        //显示月份层的触发控件
        span = p.find('span.calendar-text');
    //设置前当月
    if (date) {
        $("#" + id).datebox("setValue", formatterMonth(date));
    }
}
function daybox(id, date) {
    $('#' + id).datebox({
        //显示日趋选择对象后再触发弹出月份层的事件，初始化时没有生成月份层
        onShowPanel: function () {
            return false ;
        },
        //配置parser，返回选择的日期
        parser: function (s) {
            console.log(s);
            if (!s) return new Date();
            var arr = s.split('-');//之前格式为2017-10时需要，现改为如下
            // var arr = new Array();
            return new Date(arr[0],arr[1],arr[2]);
        },
        //配置formatter，只返回年月 之前是这样的d.getFullYear() + '-' +(d.getMonth());
        formatter: function (d) {
            console.log(d);
            var currentMonth = (d.getMonth() + 1);
            var currentMonthStr = currentMonth < 10 ? ('0' + currentMonth) : (currentMonth + '');
            var day = d.getDate() > 9 ? d.getDate() : "0" + d.getDate();
            return d.getFullYear() + '-' + currentMonthStr + "-"+day;
        }
    });

    //日期选择对象
    var p = $('#' + id).datebox('panel'),
        //日期选择对象中月份
        tds = false,
        //显示月份层的触发控件
        span = p.find('span.calendar-text');
    //设置前当月
    if (date) {
        $("#" + id).datebox("setValue", formatterMonth(date));
    }
}
/**
 * 设初始值--年月(201701)
 * for example:
 * $("#createTime").textbox("setValue", formatterMonth());
 */
function formatterMonth(date) {
    //获取年份
    var y = date.getFullYear();
    //获取月份
    var m = date.getMonth() + 1;
    return y + '' + m;
}

/**
 * 设初始值——年月日(20170101)
 * for example:
 * $("#createTime").textbox("setValue", formatterDate());
 */
function formatterDate(date) {
    var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
    var hor = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return date.getFullYear() + '-' + month + '-' + day;
}

//*************** 合并行列************
/**
 * 1.合并行
 * for example:
 * if (!sortFlag) $(this).datagrid("autoMergeCells", ['field_101', 'field_102']);
 * 第一参数为方法名，第二个参数为要合并的列，用逗号隔开
 */
var row_col = new Array();//行列均有合并
$.extend($.fn.datagrid.methods, {
    autoMergeCells: function (jq, fields) {
        return jq.each(function () {
            var target = $(this);
            if (!fields) {
                fields = target.datagrid("getColumnFields");
            }
            var rows = target.datagrid("getRows");
            var i = 0,
                j = 0,
                temp = {};
            for (i; i < rows.length; i++) {
                var row = rows[i];
                j = 0;
                for (j; j < fields.length; j++) {
                    var field = fields[j];
                    var tf = temp[field];
                    if (!tf) {
                        tf = temp[field] = {};
                        tf[row[field]] = [i];
                    } else {
                        var tfv = tf[row[field]];
                        if (tfv) {
                            tfv.push(i);
                        } else {
                            tfv = tf[row[field]] = [i];
                        }
                    }
                }
            }
            $.each(temp, function (field, colunm) {
                $.each(colunm, function () {
                    var group = this;

                    if (group.length > 1) {
                        var before,
                            after,
                            megerIndex = group[0];
                        for (var i = 0; i < group.length; i++) {
                            before = group[i];
                            after = group[i + 1];
                            if (after && (after - before) == 1) {
                                continue;
                            }
                            var rowspan = before - megerIndex + 1;
                            if (rowspan > 1) {
                                var colspan = 1;
                                for (var i in row_col) {
                                    if (row_col[i].index == megerIndex && row_col[i].field == field) {
                                        colspan = row_col[i].colspan;
                                    }
                                }
                                console.log("合并行");
                                console.log(temp);
                                target.datagrid('mergeCells', {
                                    index: megerIndex,
                                    field: field,
                                    rowspan: rowspan,
                                    colspan: colspan,
                                });
                            }
                            if (after && (after - before) != 1) {
                                megerIndex = after;
                            }
                        }
                    }
                });
            });
        });
    }
});

/**
 * 2.合并列
 * for example:
 * mergeColumn(id, data, array);
 * 给出要合并的列（必须是连续的）
 */
function mergeColumn(id, data, array) {
    var filed = '';//定义合并后的属性名
    var leng = 1;// 合并的长度
    // 判断条件是否满足合并的要求
    for (var index = 0; index < data.rows.length; index++) {
        for (var i = 0; i < array.length - 1; i++) {
            //算出合并的列数
            if (data.rows[index][array[i]] == data.rows[index][array[i + 1]]) {
                if (leng == 1) {
                    filed = array[i];
                }
                leng++;
            }
            //合并列
            if (i == array.length - 2 && leng > 1) {
                var merge_column = [{
                    index: index,//合并行号
                    colspan: leng//合并列的数量
                }];
                console.log("合并列");
                console.log(merge_column);
                for (var j = 0; j < merge_column.length; j++) {
                    var object = {
                        index: merge_column[j].index,
                        field: filed,//合并后单元格对应的属性值
                        colspan: merge_column[j].colspan,
                    };
                    row_col.push(object);
                    $('#' + id).datagrid('mergeCells', {
                        index: merge_column[j].index,
                        field: filed,//合并后单元格对应的属性值
                        colspan: merge_column[j].colspan,
                    });
                }
                leng = 1;//还原
            }
        }
    }
}

//****************** 图形模块***************
/**
 * 1.折线图，柱形图
 * for example:
 * null
 */
var imagesBase64 = "";

function chartLineBar(char_data) {
    var attributes = {//注入数据类型
        type: char_data.type,
        smooth: true,//平滑
        itemStyle: {
            normal: {
                label: {
                    show: char_data.flag,
                    textStyle: {
                        fontWeight: 'bolder',
                        fontSize: '12',
                        fontFamily: '微软雅黑'
                    },
                    position: 'top'
                },
            }
        },
        barWidth: 20,//图形宽度
    };
    for (var i in char_data.series) {
        $.extend(char_data.series[i], attributes);
    }
    console.log("传入前台参数:");
    console.log(char_data);
    var chart = echarts.init(document.getElementById(char_data.id)); //找到对应画图区域id
    var option = {
        title: {//标题组件
            text: char_data.text,
            subtext: char_data.subtext,
            x: 'center',
        },
        tooltip: {//提示框组件
            trigger: 'axis'
        },
        toolbox: {//工具栏
            feature: {
                magicType: {//类型切换
                    show: true,
                    type: ['line', 'bar', 'stack', 'tiled'],
                },
                dataView: {//数据视图
                    show: true,
                },
                saveAsImage: {//导出
                    show: true,
                    excludeComponents: ['toolbox'],
                    pixelRatio: 2,
                },
            }
        },
        legend: {//图例组件
            // x: width,//横向位置
            x: 'right',//横向位置
            y: 'center',
            orient: 'vertical',//垂直显示
            data: char_data.legend,
        },
        grid: {//直角坐标系内绘图网格
            left: '3%',
            right: '4%',
            bottom: '3%',
            width: '83%',
            containLabel: true
        },
        xAxis: {//直角坐标系 grid 中的 x 轴
            type: 'category',
            boundaryGap: true,
            axisLabel: {
                interval: 0,
                rotate: 30,
                show: true,
                splitNumber: 30,
                textStyle: {
                    fontFamily: "微软雅黑",
                    fontSize: 12
                }
            },
            axisTick: {//横坐标对齐方式
                alignWithLabel: true
            },
            data: char_data.xAxis,
        },
        yAxis: {//直角坐标系 grid 中的 y 轴
            type: 'value',
            splitNumber: 10,
            axisLine: {show: false},//去掉Y轴竖线
            minInterval: 1,//最小间距
            boundaryGap: [0, 0.1],//坐标轴两端空白策略，数组内数值代表百分比
        },
        series: char_data.series,
        // dataZoom: [
        //     {
        //         type: 'slider',
        //         star: 0,
        //         end: 20 * 100 / char_data.series.length,//横坐标最多显示20条数据,超过则滚动
        //         filterMode: 'filter',
        //     }
        // ]
    };
    chart.clear();//清空数据
    chart.setOption(option);//加载数据
    imagesBase64 = chart.getDataURL({type: 'png',});//echarts自带的获取图形的base64方法,使用全局变量接收
}

/**
 * 2.饼图
 * for example:
 * null
 */
function chartPie(char_data) {
    // 应用饼图区域
    var chart = echarts.init(document.getElementById(char_data.id));
    var option = {
        title: {
            text: char_data.text,
            // subtext: '副标题',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'vertical',
            x: 'right',
            y: 'center',
            data: char_data.legend,
        },
        series: [
            {
                type: 'pie',
                radius: '75%',
                center: ['50%', '60%'],// 设置标题直接带百分比
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            formatter: '{b}:({d}%)'
                        },
                        labelLine: {show: true}
                    }
                },// 设置字体
                label: {
                    normal: {
                        textStyle: {
                            fontWeight: 'bold',
                            fontSize: 15
                        }
                    }
                },
                data: char_data.series,
            }
        ]
    };
    chart.setOption(option, true);// 为echarts对象加载数据
}