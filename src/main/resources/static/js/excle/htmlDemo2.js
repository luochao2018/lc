/**
 * 变量
 */
var ACTION_URL = "../";
var JSON_URL = "../local/json/";
var DATAGRID_ID = "";//当前操作表格id
var BOTTOM_DIC = {};//所有bottom
var FORM_DIC = "";//所有表单
var INFORMATION = {};//当前所有信息
var HEIGHT = 0;
var nowDate = formatterDate(new Date());//当前时间
var nowUser = "";//当前登录人

var condition_type = [
    {
        "pkid": 1,
        "title": "文本框",
        "type": "textbox",
        "editable": 0,
        "multiple": 0,
        "multiple": 0,
        "input": '<input class="easyui-textbox" id="@@ID" name="@@NAME" data-options="" style="width:165px;height:22px">'
    },
    {
        "pkid": 2,
        "title": "下拉框",
        "type": "combobox",
        "editable": 0,
        "multiple": 0,
        "input": '<input class="easyui-combobox" id="@@ID" name="@@NAME" data-options=""  style="width:165px;height:22px">'
    },
    {
        "pkid": 3,
        "title": "日期框",
        "type": "datebox",
        "editable": 0,
        "multiple": 0,
        "input": '<input class="easyui-datebox" id="@@ID" name="@@NAME" data-options=""  style="width:165px;height:22px">'
    },
    {
        "pkid": 4,
        "title": "文本框(必填)",
        "type": "textbox",
        "editable": 0,
        "multiple": 0,
        "input": '<input class="easyui-textbox" id="@@ID" name="@@NAME" data-options="required:true"  style="width:165px;height:22px">'
    },
    {
        "pkid": 5,
        "title": "下拉框(必填)",
        "type": "combobox",
        "editable": 0,
        "multiple": 0,
        "input": '<input class="easyui-combobox" id="@@ID" name="@@NAME" data-options="required:true"  style="width:165px;height:22px">'
    },
    {
        "pkid": 6,
        "title": "日期框(必填)",
        "type": "datebox",
        "editable": 0,
        "multiple": 0,
        "input": '<input class="easyui-datebox" id="@@ID" name="@@NAME" data-options="required:true"  style="width:165px;height:22px">'
    }
];


/**
 * 预加载
 */
$(function () {
    $("#datagrid").empty();
    $("#datagrid2").empty();
    $('#search2zgdw').on('change', function () {
        alert(1);
    });
});

/**
 * 加载表单
 * @param v
 */
function getIformation(v) {
    //获取表单信息
    var url = "column.json";
    var column = common_json(url);
    url = "condion.json";
    var condition = common_json(url);
    url = "formT.json";
    var formT = common_json(url);
    url = "condition_value.json";
    var condition_value = common_json(url);
    url = "menu.json";
    var menu = common_json(url);
    url = "toolbar.json";
    var toolbar = common_json(url);
    url = "table.json";
    var table = common_json(url);
    FORM_DIC = table;

    var array = v.split(",");
    //判断是否联动,联动关系
    var totalHeight = 0;//数据库height总值
    var bottomHeight = 0;//联动表高度
    var datagrid2 = false;//判断是否加载了联动表
    BOTTOM_DIC = {};//bottom字典,用于切换
    $.each(array, function (i, j) {
        table[j].position = table[j].position ? table[j].position : 1;
        table[j].width = table[j].width ? table[j].width : 1;
        table[j].height = table[j].height ? table[j].height : 1;
        if (table[j].position == 1) {
            totalHeight += table[j].height;
        } else {
            bottomHeight = 300;
        }
    });

    //初始化
    $("#datagrid").empty();
    $("#datagrid2").empty();
    $.each(array, function (i, j) {
        //加载主表查询
        if (i == 0) {
            initForm(
                {
                    table: table[j],
                    ftable: "table-search2"
                },
                {
                    condition: condition[j],
                    condition_type: condition_type,//这里在后台处理后传值
                    condition_value: condition_value[j],
                });
            HEIGHT = ($(document).height() - $("#top").height() - $("#div-search2").height() - bottomHeight - 40);
        }
        var param = {
            height: table[j].position == 1 ? table[j].height / totalHeight * HEIGHT : bottomHeight - 40,//表格高度
            editRow: undefined,//编辑行控制
            table: table[j],//表格属性
            menu: menu[j],//右键菜单
            toolbar: toolbar[j],//工具栏
            condition: {
                condition: condition[j],
                condition_type: condition_type,//这里在后台处理后传值
                condition_value: condition_value[j],
            },//查询条件
            formT: {
                condition: formT[j],
                condition_type: condition_type,//这里在后台处理后传值
                condition_value: condition_value[j],
            },//form表单
            column: column[j],//表格列
        };
        //添加表格
        if (table[j].position == 1) {
            $("#datagrid").append('<table id="' + param.table.id + '"></table>');
        } else {
            if (!datagrid2) {
                $("#datagrid2").append('<div id="bottom" class="easyui-tabs" narrow="true" style="width:100%; height: ' + bottomHeight + 'px"></div>');
                datagrid2 = true;
            }
            BOTTOM_DIC[param.table.title] = param.table.id;
            $("#bottom").append('<div title="' + param.table.title + '" style="display: none; padding: 2px; overflow: hidden;"><table id="' + param.table.id + '"></table></div>');
        }
        INFORMATION = param;
        initDataGrid();//初始化datagrid
    });
    initTab();//初始化bottom
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
function load_(id, val) {
    $("#" + id).datagrid('load', val);
}

/**
 * 本地刷新
 * @param id
 * @param val
 * @private
 */
function loadData_(id, val) {
    $("#" + id).datagrid('loadData', val);
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
    $.each(value, function (i, j) {
        value[i] = "";
    });
    $("#" + id).setForm(value);
}

/**
 * 查询
 * @param o
 */
function doSearch(o) {
    console.log($("#form-search2").getForm());
    if (typeof(o) == 'string') {
        o = JSON.parse(o);
    }
    if (!$('#' + o.ftable).form('validate')) {
        return;
    }
    if (o.ftable) {
        $('#' + o.div).dialog('close');
    }
    load_(o.table.id, $.extend({}, $("#" + o.ftable).getForm(), {FORM_PKID: o.table.pkid, FORM_TABLE: o.table.table}));
}

/**
 * 编辑提交
 * @param o
 */
function doEdit(o) {
    if (typeof(o) == 'string') {
        o = JSON.parse(o);
    }
    if (!$('#' + o.ftable).form('validate')) {
        return;
    }
    $('#' + o.div).dialog('close');
    var v = {
        url: ACTION_URL + "updateModle",
        param: {
            FORM_PKID: o.table.pkid,
            FORM_TABLE: o.table.table
        }
    };
    v.param = $.extend({}, $("#" + o.ftable).getForm(), v.param);
    var e = common_ajax(v);
    console.log(e);
    //刷新所有表
    reload_(o.table.id);//刷新自身
    var pid = o.table.pid.split(",");
    var sid = o.table.sid.split(",");
    $.each(pid, function (i, j) {
        if (j) {
            reload_(j);//刷新父表
        }
    });
    $.each(sid, function (i, j) {
        if (j) {
            reload_(j);//刷新子表
        }
    });
}

/**
 * 关闭
 * @param o
 */
function doClose(o) {
    if (typeof(o) == 'string') {
        o = JSON.parse(o);
    }
    console.log(o);
    $('#' + o.div).dialog('close');
}

/**
 * 导入
 */
function doImport(o) {
    if (typeof(o) == 'string') {
        o = JSON.parse(o);
    }
    if (!$('#form-import' + o.ftable).form('validate')) {
        return;
    }
    var formData = new FormData(document.getElementById("form-import"));
    formData.append("FORM_PKID", o.table.pkid);
    formData.append("FORM_TABLE", o.table.table);
    var v = {
        url: ACTION_URL + "importModle",
        param: formData,
        type: "formData"
    };
    $("#file").textbox('setText', '');//清空
    $("#div-import").dialog("close");
    var e = common_ajax(v);
    if (e.code == 200) {
        Message("导入数据:" + e.real + "</br>" + "导入成功:" + e.success + "</br>" + "导入失败:" + (e.real - e.success));
    } else {
        Message(e.msg);
    }
    reload_(o.table.id);//刷新自身
    var pid = o.table.pid.split(",");
    var sid = o.table.sid.split(",");
    $.each(pid, function (i, j) {
        if (j) {
            reload_(j);//刷新父表
        }
    });
    $.each(sid, function (i, j) {
        if (j) {
            reload_(j);//刷新子表
        }
    });
}

/**
 * 导出
 */
function doExport(o) {
    if (typeof(o) == 'string') {
        o = JSON.parse(o);
    }
    $("#div-export").dialog("close");
    var v = {
        url: ACTION_URL + "exportModle",
        param: {
            FORM_PKID: o.table.pkid,
            FORM_TABLE: o.table.table
        }
    };
    v.param = $.extend({}, $("#" + o.ftable).getForm(), $("#form-export").getForm(), v.param);
    common_href(v);
}

/**
 * //禁用/启用设置
 * @param data
 */
function readonlyText(data) {
    var value = [];
    if (data.banName) {
        $("#" + data.id).editForm({type: "readonly", name: data.banName, readonly: true});
        value = data.banValue.split("*");
        if (value.length == 1) {//等于
            if (value[0] == data.value) {
                $("#" + data.id).editForm({type: "readonly", name: data.banName, readonly: false});
            }
        } else if (value.length == 3) {//包含字符串
            if (data.value.indexOf(value[1]) != -1) {
                $("#" + data.id).editForm({type: "readonly", name: data.banName, readonly: false});
            }
        } else if (value[1] == "" || value[1] == null) {//以字符串开头
            if (data.value.indexOf(value[0]) == 0) {
                $("#" + data.id).editForm({type: "readonly", name: data.banName, readonly: false});
            }
        } else if (value[0] == "" || value[0] == null) {//以字符串结尾
            if (data.value.substring(data.value.length - value[1].length) == value[1]) {
                $("#" + data.id).editForm({type: "readonly", name: data.banName, readonly: false});
            }
        }
    }
}

/**
 * //输入框联动
 * @param data
 */
function linkText(data) {
    var value = [];
    if (data.linkName) {
        if (data.value == data.linkUrl) {
            $("#" + data.id).editForm({type: "link", name: data.linkName, value: [{title: "联动值", value: "联动值"}]});
        } else {
            $("#" + data.id).editForm({type: "link", name: data.linkName, value: []});
        }
    }
}

//切换bottomTab
function initTab() {
    $('#bottom').tabs({
        border: true,
        narrow: true,
        onSelect: function (title) {
            DATAGRID_ID = BOTTOM_DIC[title];
            reload_(BOTTOM_DIC[title]);
        }
    });
}

/**
 * 初始化表单
 * @param v
 */
function initForm(id, v) {
    var button = '<a href="javascript:void(0)" class="easyui-linkbutton a_@@class" data-options="plain:true,iconCls:\'icon-@@icon\'">@@title</a>';
    var param = "";
    var tr = "tr";
    var th = "background: #D4D4D4;text-align: right;width:" + $(document).width() / (2 * id.table.queryNum) + "px";
    var td = "border:solid #ccc 1px;background: #fdfdfd;text-align: left;width:" + $(document).width() / (2 * id.table.queryNum) + "px";

    //生成button
    $("." + id.ftable).empty();
    if (id.ftable == "import") {//导入
        param = JSON.stringify({
            table: id.table,
            ftable: "form-import"
        });
        $("." + id.ftable).append(button.replace(/@@class/g, id.ftable).replace(/@@icon/g, "ok").replace(/@@title/g, "确定"));
        //绑定事件
        $(".a_" + id.ftable).click(function () {
            doImport(param);
        });
    } else if (id.ftable == "export") {//导出
        param = JSON.stringify({
            table: id.table,
            ftable: "form-search"
        });
        $("." + id.ftable).append(button.replace(/@@class/g, id.ftable).replace(/@@icon/g, "ok").replace(/@@title/g, "确定"));
        //绑定事件
        $(".a_" + id.ftable).click(function () {
            doExport(param);
        });
    } else {
        //清空表单信息
        $("#" + id.ftable).empty();
        //重新布局
        if (id.ftable == "table-search2") {//主表查询
            tr = "tr2";//避免影响主表查询
            var num = parseInt(v.condition.length / id.table.queryNum);
            $("#div-search2").height(v.condition.length % id.table.queryNum == 0 ? num * 30 + 35 : (num + 1) * 30 + 35);
            param = JSON.stringify({
                table: id.table,
                ftable: "form-search2"
            });
            $("." + id.ftable).append(button.replace(/@@class/g, id.ftable).replace(/@@icon/g, "search").replace(/@@title/g, "查询"));
            $("." + id.ftable).append(button.replace(/@@class/g, "clear").replace(/@@icon/g, "reload").replace(/@@title/g, "清空"));
            //绑定事件
            $(".a_" + id.ftable).click(function () {
                doSearch(param);
            });
            $(".a_clear").click(function () {
                reset2_("form-search2", $("#form-search2").getForm());
            });
        } else if (id.ftable == "table-dg") {//编辑表单
            var num = parseInt(v.condition.length / id.table.formNum);
            $('#div-dg').dialog({
                height: v.condition.length % id.table.formNum == 0 ? num * 31 + 78 : (num + 1) * 31 + 78,
                width: v.condition.length == 1 ? id.table.formNum * 200 : id.table.formNum * 2 * 200,
                resizable: true,//改变大小
                title: id.table.title,//名称
            });
            param = JSON.stringify({
                table: id.table,
                ftable: "form-dg",
                div: "div-dg"
            });
            $("." + id.ftable).append(button.replace(/@@class/g, "edit").replace(/@@icon/g, "ok").replace(/@@title/g, "确定"));
            $("." + id.ftable).append(button.replace(/@@class/g, "close").replace(/@@icon/g, "no").replace(/@@title/g, "关闭"));
            //绑定事件
            $(".a_edit").click(function () {
                doEdit(param);
            });
            $(".a_close").click(function () {
                doClose(param);
            });
        } else {//子表查询
            var num = parseInt(v.condition.length / id.table.formNum);
            $('#div-search').dialog({
                height: v.condition.length % id.table.formNum == 0 ? num * 31 + 78 : (num + 1) * 31 + 78,
                width: v.condition.length == 1 ? id.table.formNum * 200 : id.table.formNum * 2 * 200,
                resizable: true,//改变大小
                title: id.table.title,//名称
            });
            param = JSON.stringify({
                table: id.table,
                ftable: "form-search",
                div: "div-search"
            });
            $("." + id.ftable).append(button.replace(/@@class/g, id.ftable).replace(/@@icon/g, "search").replace(/@@title/g, "查询"));
            //绑定事件
            $(".a_" + id.ftable).click(function () {
                doSearch(param);
            });
        }

        //生成表单信息
        $.each(v.condition, function (i, j) {
            var condition_type = {};//获取input类型
            var condition_value = [];//获取input值
            var inputId = id.ftable.split("-")[1] + j.name;//定义输入框id
            $.each(v.condition_type, function (x, y) {
                if (y.pkid == j.type) {
                    condition_type = y;
                }
            });
            $.each(v.condition_value, function (x, y) {
                if (y.filed == j.value) {
                    condition_value.push(y);
                }
            });

            //生成输入框
            if (id.ftable == "table-search2") {
                if (i == 0 || i % (id.table.queryNum) == 0) {
                    tr += i;
                    $("#" + id.ftable).append("<tr class='" + tr + "'><th style='" + th + "'>" + j.title + ":</th><td style='" + td + "'>" + condition_type.input.replace(/@@NAME/g, j.name).replace(/@@ID/g, inputId) + "</td></tr>");
                } else {
                    $("." + tr).append("<th style='" + th + "'>" + j.title + ":</th><td style='" + td + "'>" + condition_type.input.replace(/@@NAME/g, j.name).replace(/@@ID/g, inputId) + "</td>");
                }
            } else {
                if (id.table.formNum > 0) {
                    if (i == 0 || i % (id.table.formNum) == 0) {
                        tr += i;
                        $("#" + id.ftable).append("<tr class='" + tr + "'><th class='th'>" + j.title + ":</th><td class='td'>" + condition_type.input.replace(/@@NAME/g, j.name).replace(/@@ID/g, inputId) + "</td></tr>");
                    } else {
                        $("." + tr).append("<th class='th'>" + j.title + ":</th><td class='td'>" + condition_type.input.replace(/@@NAME/g, j.name).replace(/@@ID/g, inputId) + "</td>");
                    }
                } else {
                    $("#" + id.ftable).append("<tr><th class='th'>" + j.title + ":</th><td class='td'>" + condition_type.input.replace(/@@NAME/g, j.name).replace(/@@ID/g, inputId) + "</td></tr>");
                }
            }

            //输入框联动
            if (j.linkByName) {
                condition_value = [];
            }

            //输入框初始化
            if (condition_type.type == "combobox") {//下拉框
                $('#' + inputId).combobox({
                    editable: condition_type.editable ? false : true, //是否可编辑
                    panelHeight: condition_value.length < 6 ? "auto" : 162,
                    data: condition_value,
                    multiple: condition_type.multiple ? true : false,
                    valueField: 'value',
                    textField: 'title',
                    onSelect: function (e) {
                        //禁用/启用设置
                        if (j.banName) {
                            readonlyText({
                                banByName: j.name,
                                banName: j.banName,
                                banValue: j.banValue,
                                value: e.value,
                                id: id.ftable,
                            });
                        }

                        //输入框联动
                        if (j.linkName) {
                            linkText({
                                linkByName: j.name,
                                linkName: j.linkName,
                                linkUrl: j.linkUrl,
                                value: e.value,
                                id: id.ftable,
                            });
                        }
                    },
                    onLoadSuccess: function () {
                    }
                });
            }
            if (condition_type.type == "monthbox") {//日期
                monthbox(j.name, "");
            }

            //回填默认值
            var json = {};
            json[j.name] = j.default;
            $("#" + id.ftable).setForm(json);

            //禁用/启用设置
            if (j.banByName) {
                readonlyText({
                    banByName: j.banByName,
                    banName: j.name,
                    banValue: j.banValue,
                    value: $("#form-" + id.ftable.split("-")[1]).getForm()[j.banByName],
                    id: id.ftable,
                });
            }

            //输入框联动
            if (j.linkByName) {
                linkText({
                    linkByName: j.linkByName,
                    linkName: j.name,
                    linkUrl: j.linkUrl,
                    value: $("#form-" + id.ftable.split("-")[1]).getForm()[j.linkByName],
                    id: id.ftable,
                });
            }

        });
    }
    $.parser.parse();//重新渲染
}

/**
 * 初始化菜单
 * @param o
 */
function initMenu(o) {
    $("#menu").empty();//清空菜单
    //添加菜单元素
    $.each(o.menu, function (i, j) {
        $('#menu').menu('appendItem', {
            id: j.id,
            text: j.text,
            auth: j.auth,
            iconCls: j.iconCls,
            disabled: j.disabled,
            href: j.href ? j.href : "#",
            // onclick: j.onclick
        });
        if (!j.disabled) {//不禁用时才重定义onclick
            //增加
            if (j.id == "m-add") {
                $("#m-add").click(function () {
                    initForm({table: o.table, ftable: "table-dg"}, o.formT);
                    $("#div-dg").dialog("open");
                });
            }
            //删除
            if (j.id == "m-remove") {
                $("#m-remove").click(function () {
                    //删除时先获取选择行
                    var rows = [];
                    rows.push(o.row);
                    //选择要删除的行
                    $.messager.confirm("提示", "你确定要删除吗?", function (r) {
                        if (r) {
                            var o = {
                                url: ACTION_URL + "deleteModle",
                                param: {
                                    data: JSON.stringify(rows),
                                    FORM_PKID: INFORMATION.table.pkid,
                                    FORM_TABLE: INFORMATION.table.table
                                }
                            };
                            var e = common_ajax(o);
                            if (e.code == 200) {
                                Message(e.msg);
                                reload_(INFORMATION.table.id);
                            } else {
                                Message(e.msg);
                            }
                        }
                    });
                });
            }
            //修改
            if (j.id == "m-edit") {
                $("#m-edit").click(function () {
                    var rows = o.row;
                    initForm({table: o.table, ftable: "table-dg"}, o.formT);
                    var data = {
                        url: ACTION_URL + "selectModle",
                        param: $.extend({}, rows, {
                            FORM_PKID: INFORMATION.table.pkid,
                            FORM_TABLE: INFORMATION.table.table
                        }),
                    };
                    var e = common_ajax(data);
                    $("#form-dg").setForm(e.rows[0]);
                    $("#div-dg").dialog("open");
                });
            }
            //查看
            if (j.id == "m-search") {
                $("#m-search").click(function () {
                    var rows = o.row;
                    initForm({table: o.table, ftable: "table-dg"}, o.formT);
                    $(".a_edit").remove();//移除确定按钮
                    var data = {
                        url: ACTION_URL + "selectModle",
                        param: $.extend({}, rows, {
                            FORM_PKID: INFORMATION.table.pkid,
                            FORM_TABLE: INFORMATION.table.table
                        }),
                    };
                    var e = common_ajax(data);
                    $("#form-dg").setForm(e.rows[0]);
                    $("#div-dg").dialog("open");
                });
            }
        }
    });
}

/**
 * 初始化表格
 * @param v
 */
function initDataGrid() {
    var init = initColumn_();
    var queryParams = queryParams_();
    var toolbar = toolbar_();
    //定义datagrid
    $("#" + INFORMATION.table.id).datagrid({
        title: INFORMATION.table.title,//表格标题  
        iconCls: 'icon-large-smartart', //图标
        loadMsg: '数据加载中......',
        width: '100%',
        height: init.height,
        fitColumns: true, //列自适应宽度
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
        pageSize: init.pageSize,//分页大小  
        showPageList: true,
        // pageNumber: 1,//第几页显示（默认第一页，可以省略）  
        pageList: [10, init.pageSize, 30],//设置每页记录条数的列表   
        url: ACTION_URL + "selectModle",//获取数据地址  
        // data: INFORMATION.data,//数据
        frozenColumns: init.frozenColumns,
        columns: init.columns,
        queryParams: queryParams,//查询参数
        onClickRow: onClickRow_,//单击事件
        onRowContextMenu: onRowContextMenu_,
        onBeforeLoad: onBeforeLoad_,//首次不加载数据
        onDblClickRow: onDblClickRow_,//双击
        onAfterEdit: onAfterEdit_,//结束编辑,提交
        toolbar: toolbar,
        rowStyler: rowStyler_
    });
    datagridEnd_();
}

/**
 * 表单获取/赋值
 */
$.fn.extend({
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
        if (transform && transform == "CamelCase") {
            data = toCamelCase(data);
        }
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
function initColumn_() {
    var frozenColumns = [];//冻结列
    var frozenColumn = [];//冻结列_子列
    var columns = [];//数据列
    var column = [];//数据列_子列
    var row = 0;
    var count = 0;
    var checkbox_true = {field: '#', title: '#', width: 120, checkbox: true};
    var checkbox_false = {field: '', title: '', width: 120, checkbox: false};
    if (INFORMATION.column.length > 1) {
        /**
         * column要求先按行排序,再按列排序(只有一行的列表,rownum可以不填)
         */
        row = INFORMATION.column[0].rownum;
    }
    $.each(INFORMATION.column, function (i, col) {
        if (row != col.rownum) {
            frozenColumns.push(frozenColumn);
            columns.push(column);
            frozenColumn = [];
            column = [];
            row = col.rownum;
            count++;
        }
        if (column.length == 0 && frozenColumn.length == 0) {//加到首列
            if (INFORMATION.table.checkbox == 1) {//加载checkbox
                frozenColumn.push(row == INFORMATION.column[INFORMATION.column.length - 1].rownum ? checkbox_true : checkbox_false);
                // column.push(row == INFORMATION.column[INFORMATION.column.length - 1].rownum ? checkbox_true : checkbox_false);//这里默认checkbox为固定列
            }
        }
        var o = {
            field: col.filed ? col.filed : "",//列id
            title: col.title ? col.title : "",//列名称
            width: col.width ? col.width : 120,//宽度
            belong: col.belong ? col.belong : "Q",//?
            colspan: col.colspan ? col.colspan : 1,//合并列
            rowspan: col.rowspan ? col.rowspan : 1,//合合行
            halign: col.halign ? col.halign : "center",//标题位置
            align: col.align ? col.align : "center",//内容位置
            sortable: col.sortable == 0 ? false : true,//是否排序
            editor: {
                type: col.type ? col.type : 'validatebox',//单元格类型
                options: {
                    required: col.required == 0 ? false : true,//是否必填
                }
            }
        };
        if (col.frozenColumns) {
            frozenColumn.push(o);
        } else {
            column.push(o);
        }
    });
    frozenColumns.push(frozenColumn);
    columns.push(column);
    console.log(columns);
    var height = INFORMATION.height;//减去datagrid的title
    var pageSize = parseInt((height - 132 - 32.2 * count) / 32.2) - 1;//减去datagrid的toolbar/headtitle/pager,再往上空两行
    return {frozenColumns: frozenColumns, columns: columns, height: height, pageSize: pageSize};
}

/**
 * 传参
 * @private
 */
function queryParams_() {
    var pid = INFORMATION.table.pid.split(",");
    var pkid = "";
    $.each(FORM_DIC, function (i, j) {
        if (j.id == pid[0]) {
            pkid = j.pkid;
        }
    });
    if (pkid) {
        return $.extend({}, {PKID: pkid}, {FORM_PKID: INFORMATION.table.pkid, FORM_TABLE: INFORMATION.table.table});//默认PKID关联
    } else {
        return $.extend({}, $("#form-search").getForm(), {
            FORM_PKID: INFORMATION.table.pkid,
            FORM_TABLE: INFORMATION.table.table
        });
    }
}

/**
 * 左键
 * @private
 */
function onClickRow_(index, row) {
    var sid = INFORMATION.table.sid.split(",");
    DATAGRID_ID = DATAGRID_ID && DATAGRID_ID != INFORMATION.table.id ? DATAGRID_ID : sid[0];//如果没有绑定元素,绑定第一个子id
    if (!DATAGRID_ID) {
        return;
    }
    var formPkid = 0;
    var formTable = "";
    $.each(FORM_DIC, function (i, j) {
        if (j.id == DATAGRID_ID) {
            formPkid = j.pkid;
            formTable = j.table;
        }
    });
    load_(DATAGRID_ID, $.extend({}, row, {FORM_PKID: formPkid, FORM_TABLE: formTable}));//加载联动表单
}

/**
 * 右键
 * @param e
 * @param rowIndex
 * @param rowData
 * @private
 */
function onRowContextMenu_(e, rowIndex, rowData) { //右键时触发事件
    if ($.isEmptyObject(rowData) || $.isEmptyObject(INFORMATION.menu)) {
        return;
    }
    initMenu({"table": INFORMATION.table, "menu": INFORMATION.menu, "row": rowData, "formT": INFORMATION.formT});
    e.preventDefault(); //阻止浏览器捕获右键事件
    $(this).datagrid("clearSelections"); //取消所有选中项
    $(this).datagrid("selectRow", rowIndex); //根据索引选中该行
    $('#menu').menu('show', {
        left: e.pageX,//在鼠标点击处显示菜单
        top: e.pageY
    });
}

/**
 * 双击
 * @param rowIndex
 * @param rowData
 * @private
 */
function onDblClickRow_(rowIndex, rowData) {
    initForm({table: INFORMATION.table, ftable: "table-dg"}, INFORMATION.formT);
    var o = {
        url: ACTION_URL + "selectModle",
        param: $.extend({}, rowData, {FORM_PKID: INFORMATION.table.pkid, FORM_TABLE: INFORMATION.table.table}),
    };
    var e = common_ajax(o);
    $("#form-dg").setForm(e.rows[0]);
    $("#div-dg").dialog("open");
}

/**
 * 提交前
 * @param param
 * @returns {boolean}
 * @private
 */
function onBeforeLoad_(param) {
    var firstLoad = $(this).attr("firstLoad");
    if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
        $(this).attr("firstLoad", "true");
        return false;
    }
    return true;
}

/**
 * 提交后
 * @param rowIndex
 * @param rowData
 * @param changes
 * @private
 */
function onAfterEdit_(rowIndex, rowData, changes) {
    //endEdit该方法触发此事件
    var row = datagrid.datagrid("getData").rows[rowIndex];  //获取当前行的值
    var inserted = datagrid.datagrid('getChanges', 'inserted');
    var updated = datagrid.datagrid('getChanges', 'updated');
    if (inserted.length < 1 && updated.length < 1) {
        INFORMATION.editRow = undefined;
        datagrid.datagrid('unselectAll');
        return;
    }
    var url = ACTION_URL;
    if (!($.isEmptyObject(inserted))) {
        url += "insertModle";
    }
    if (!($.isEmptyObject(updated))) {
        url += "updateModle";
    }
    //当前表操作
    var o = {
        url: url,
        param: $.extend({}, row, {FORM_PKID: INFORMATION.table.pkid, FORM_TABLE: INFORMATION.table.table})
    };
    var e = common_ajax(o);
    if (e.code == 200) {
        $("#" + INFORMATION.table.id).datagrid("acceptChanges");
        Message(e.msg);
        INFORMATION.editRow = undefined;
        reload_(INFORMATION.table.id);
    } else if (e.code == 300) {
        $.messager.alert('添加失败', '抱歉！您没有权限！', 'warning');
    } else {
        $("#" + INFORMATION.table.id).datagrid("beginEdit", INFORMATION.editRow);
        $.messager.alert('警告操作', '未知错误！请重新刷新后提交！', 'warning');
    }
    $("#" + INFORMATION.table.id).datagrid("unselectAll");
    //联动表操作
    var pid = INFORMATION.table.pid.split(",");
    var sid = INFORMATION.table.sid.split(",");
    $.each(pid, function (i, j) {
        if (j) {
            reload_(j);//刷新父表
        }
    });
    $.each(sid, function (i, j) {
        if (j) {
            reload_(j);//刷新子表
        }
    });
}

/**
 * 工具栏定义
 * @returns {*[]}
 * @private
 */
function toolbar_() {
    var newToolbar = [];
    var toolbar = [
        {
            id: "t-add", text: '添加', iconCls: 'icon-add',
            handler: function () {//添加列表的操作按钮添加，修改，删除等
                //添加时如果没有正在编辑的行，则在datagrid的第一行插入一行
                if (INFORMATION.editRow == undefined) {
                    $("#" + INFORMATION.table.id).datagrid("insertRow", {
                        index: 0, // index start with 0
                        row: {}
                    });
                    //将新插入的那一行开户编辑状态
                    $("#" + INFORMATION.table.id).datagrid("beginEdit", 0);
                    //给当前编辑的行赋值
                    INFORMATION.editRow = 0;
                }
            }
        }, '-',
        {
            id: "t-remove", text: '删除', iconCls: 'icon-remove',
            handler: function () {
                //删除时先获取选择行
                var rows = $("#" + INFORMATION.table.id).datagrid("getSelections");
                //选择要删除的行
                if (rows.length > 0) {
                    $.messager.confirm("提示", "你确定要删除吗?", function (r) {
                        if (r) {
                            var o = {
                                url: ACTION_URL + "deleteModle",
                                param: {
                                    data: JSON.stringify(rows),
                                    FORM_PKID: INFORMATION.table.pkid,
                                    FORM_TABLE: INFORMATION.table.table
                                }
                            };
                            var e = common_ajax(o);
                            if (e.code == 200) {
                                Message(e.msg);
                                reload_(INFORMATION.table.id);
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
                var rows = $("#" + INFORMATION.table.id).datagrid("getSelections");
                //如果只选择了一行则可以进行修改，否则不操作
                if (rows.length == 1) {
                    //当无编辑行时
                    if (INFORMATION.editRow == undefined) {
                        //获取到当前选择行的下标
                        var index = $("#" + INFORMATION.table.id).datagrid("getRowIndex", rows[0]);
                        //开启编辑
                        $("#" + INFORMATION.table.id).datagrid("beginEdit", index);
                        //把当前开启编辑的行赋值给全局变量editRow
                        INFORMATION.editRow = index;
                        //当开启了当前选择行的编辑状态之后，
                        //应该取消当前列表的所有选择行，要不然双击之后无法再选择其他行进行编辑
                        $("#" + INFORMATION.table.id).datagrid("unselectAll");
                    }
                }
            }
        }, '-',
        {
            id: "t-save", text: '保存', iconCls: 'icon-save',
            handler: function () {
                //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                $("#" + INFORMATION.table.id).datagrid("endEdit", INFORMATION.editRow);
            }
        }, '-',
        {
            id: "t-redo", text: '取消编辑', iconCls: 'icon-redo',
            handler: function () {
                //取消当前编辑行把当前编辑行罢undefined回滚改变的数据,取消选择的行
                INFORMATION.editRow = undefined;
                $("#" + INFORMATION.table.id).datagrid("rejectChanges");
                $("#" + INFORMATION.table.id).datagrid("unselectAll");
            }
        }, '-',
        {
            id: "t-excle", text: '导入数据', iconCls: 'icon-excle',
            handler: function () {
                initForm({table: INFORMATION.table, ftable: "export"}, []);
                $("#div-export").dialog("open");
            }
        }, '-',
        {
            id: "t-print", text: '导出数据', iconCls: 'icon-print',
            handler: function () {
                initForm({table: INFORMATION.table, ftable: "import"}, []);
                $("#div-import").dialog("open");
            }
        }, '-',
        {
            id: "t-search", text: '查询', iconCls: 'icon-search',
            handler: function () {
                initForm({table: INFORMATION.table, ftable: "table-search"}, INFORMATION.condition);
                $('#div-search').dialog('open');
            }
        }, '-',
    ];
    $.each(INFORMATION.toolbar, function (i, j) {
        $.each(toolbar, function (x, y) {
            if (j.id == y.id && !j.disabled) {
                y.text = j.text ? j.text : y.text;
                y.iconCls = j.iconCls ? j.iconCls : y.iconCls;
                newToolbar.push(y);
            }
        });
    });
    return newToolbar;
}

/**
 * 数据行背景设置
 * @param index
 * @param row
 * @returns {string}
 * @private
 */
function rowStyler_(index, row) {//行样式
    if (1 == 2) {
        return 'background-color:pink;color:blue;font-weight:bold;';
    }
}

/**
 * datagrid初始化结束处理
 * @private
 */
function datagridEnd_() {
    if (INFORMATION.table.firstload == 1) {
        $("#" + INFORMATION.table.id).datagrid("options").queryParams = $.extend(
            {},
            $("#" + INFORMATION.table.id).datagrid("options").queryParams,
            {FORM_PKID: INFORMATION.table.pkid, FORM_TABLE: INFORMATION.table.table}
        );
        reload_(INFORMATION.table.id);
    }
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
    var datac = {};
    $.each(data, function (k, v) {
        var i = 0;
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
    })
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
        url: JSON_URL + url,
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
 * mergeColumn(id,index, data, myArray);
 * 给出要合并的列（必须是连续的）
 */
function mergeColumn(id, index, data, myArray) {
    var filed = '';//定义合并后的属性名
    var leng = 1;// 合并的长度
    // 判断条件是否满足合并的要求
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i] == myArray[i + 1] && myArray[i] != undefined) {
            if (leng == 1) {
                for (key in data.rows[index]) {
                    if (data.rows[index][key] == myArray[i]) {
                        filed = key;//将第一个属性名作为合并后的属性名
                        break;
                    }
                }
            }
            leng++;
        } else if (leng > 1) {// 判断是否满足合并条件
            var merge_column = [{
                index: index,//合并行号
                colspan: leng//合并列的数量
            }];
            for (var i = 0; i < merge_column.length; i++) {
                var object = {
                    index: merge_column[i].index,
                    field: filed,//合并后单元格对应的属性值
                    colspan: merge_column[i].colspan,
                };
                row_col.push(object);
                $('#' + id).datagrid('mergeCells', {
                    index: merge_column[i].index,
                    field: filed,//合并后单元格对应的属性值
                    colspan: merge_column[i].colspan,
                });
            }
            leng = 1;//还原
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
    chart.setOption(option);// 为echarts对象加载数据
}