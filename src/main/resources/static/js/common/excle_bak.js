/**
 * url定义区
 */
var JSON_URL = "../local/json/";
var ACTION_URL = "../";
var PARAM_DATA = {};
var WIDTH = "";
var HEIGHT = "";

/**
 * 初始化
 */
$(function () {

    //初始化数据
    var values = [];
    $.ajax({
        url: JSON_URL + "combobox.json",
        async: false,
        success: function (e) {
            values = e;
        }
    });

    //导出下拉框
    $('#combobox_export').combobox({
        editable: true, //是否可编辑
        panelHeight: values.TABLE.length < 6 ? "auto" : 162,
        data: values.TABLE,
        multiple: false,
        valueField: 'ID',
        textField: 'TEXT',
        onSelect: function (e) {
            PARAM_DATA = e;
            console.log(PARAM_DATA);
        }
    });

    //导入下拉框
    var value_import = [];
    $.each(values.TABLE, function (i, v) {
        var a = true;
        $.each(value_import, function (j, w) {
            if ((w.DATABASE == v.DATABASE) && (w.TABLE == v.TABLE)) {
                a = false;
            }
        });
        if (a) {
            value_import.push(v);
        }
    });
    $('#combobox_import').combogrid({
        editable: true, //是否可编辑
        panelHeight: value_import.length < 6 ? "auto" : 162,
        panelWidth: 450,
        data: value_import,
        multiple: false,
        idField: 'TABLE',
        textField: 'TABLE',
        fitColumns: true,
        pagination: true,
        pageSize: 5,
        pageList: [5, 10, 15],
        columns: [[
            {field: 'DATABASE', title: '数据库名', width: 120, halign: 'center'},
            {field: 'TABLE', title: '表名', width: 120, halign: 'center'},
            {field: 'COLUMN', title: '列名', width: 120, halign: 'center', hidden: true}
        ]],
        onSelect: function (e) {
            PARAM_DATA = $("#combobox_import").combogrid("grid").datagrid("getSelected");
            console.log(PARAM_DATA);
        },
    });

    doDataGrid();

});

/**
 * 按钮切换
 * @param v
 */
function choice(v) {
    PARAM_DATA = {};
    $("#div-export").dialog(v == 0 ? "open" : "close");
    $("#div-import").dialog(v == 1 ? "open" : "close");
    if (v == 2) {
        if (!$('#form-search').form('validate')) {
            Message("请完成必填项");
            return;
        }
        $('#w').window('close');
        doDataGrid();
    }
}

/**
 * 加载表格
 * @param v
 */
function doDataGrid(v) {
    WIDTH = $(document).width();
    HEIGHT = $(document).height();
    initDataGrid();
}

/**
 * 导入
 */
function doImport() {

    if (!$('#form-import').form('validate')) {
        Message("请完成必选项");
        return;
    }

    var formData = new FormData(document.getElementById("form-import"));
    $.each(PARAM_DATA, function (i, v) {
        formData.append(i, v);
    });
    var v = {
        url: ACTION_URL + "import",
        // param: getParams("form"),
        formData: formData
    }
    console.log(v);
    $("#div-import").dialog("close");
    $.ajax({
        // async: false,
        data: v.formData,
        type: "post",
        processData: false,
        contentType: false,
        url: v.url,
        beforeSend: function () {
            $.messager.progress({text: '正在处理中...'});
        },
        success: function (e) {
            $.messager.progress('close');
            console.log(e);
            if (e.code == 200) {
                Message("excle数据:" + e.requestData + "</br>" + "导入成功:" + e.responseData + "</br>" + "导入失败:" + (e.requestData - e.responseData));
            } else {
                Message(e.msg);
            }
        },
        error: function (e) {
            $.messager.progress('close');
            console.log(e.msg);
            Message(e.msg);
        }
    });
}

/**
 * 导出
 */
function doExport() {
    if (!$('#form-export').form('validate')) {
        Message("请完成必选项");
        return;
    }
    var v = {
        url: ACTION_URL + "export",
        param: PARAM_DATA,
    };
    console.log(v);
    var URL = v.url + "?";
    $.each(v.param, function (i, v) {
        if (URL.charAt(URL.length - 1) == "?") {
            URL += i + "=" + v;
        } else {
            URL += "&" + i + "=" + v;
        }
    });
    $("#div-export").dialog("close");
    window.location.href = URL;
}

/**
 * dg初始化
 * @param v
 */
function initDataGrid(v) {
    var editRow = undefined; //定义全局变量：当前编辑的行
    console.log(v);
    var height = HEIGHT - $("#top").height() - 40;
    var pageSize = parseInt((height - 100) / 32.2) - 1;
    //定义全局变量datagrid
    var datagrid = $("#dg").MyDataGrid({
        title: "查询结果",//表格标题  
        iconCls: 'icon-large-smartart', //图标
        loadMsg: '数据加载中......',
        width: '100%',
        height: height,
        // fitColumn: false, //列自适应宽度
        striped: true, //行背景交换
        nowap: true, //列内容多时自动折至第二行
        border: false,
        // idField: 'packetid', //主键
        // sortName : 'packetid',//排序字段
        // sortOrder : 'desc',//排序方式
        remoteSort: false,//关闭服务器排序
        collapsible: true,//可折叠
        pagination: true,//开启分页 
        singleSelect: true,//每次只能选中1行
        pageSize: pageSize,//分页大小  
        showPageList: true,
        // pageNumber: 1,//第几页显示（默认第一页，可以省略）  
        pageList: [10, pageSize, 30],//设置每页记录条数的列表   
        url: ACTION_URL + "select",//获取数据地址  
        columns: [
            [
                {field:'',title:'',width:120,checkbox:true},
                {
                    field: 'BIRTH', title: 'BIRTH', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: false}}
                },
                {
                    field: 'TEST', title: 'TEST', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: true}}
                },
                {
                    field: 'NAME', title: 'NAME', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: true}}
                },
                {
                    field: 'AGE', title: 'AGE', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: true}}
                },
            ]
        ],
        queryParams: getParams("form-search"), //查询参数
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
        },//首次不加载数据
        onDblClickRow: function (rowIndex, rowData) {
            // if (editRow == undefined) {
            //     datagrid.datagrid("beginEdit", rowIndex);
            //     editRow = rowIndex;
            // }
            var v = {
                url: ACTION_URL + "select",
                param: rowData,
            };
            var e = common_ajax(v);
            setParams("form-dg", toProperty(e.rows[0]));
            $("#div-dg").dialog("open");


        },//双击开启编辑行
        onAfterEdit: function (rowIndex, rowData, changes) {
            //endEdit该方法触发此事件
            var row = datagrid.datagrid("getData").rows[rowIndex];  //获取当前行的值
            var inserted = datagrid.datagrid('getChanges', 'inserted');
            var updated = datagrid.datagrid('getChanges', 'updated');
            if (inserted.length < 1 && updated.length < 1) {
                editRow = undefined;
                datagrid.datagrid('unselectAll');
                return;
            }
            var url = ACTION_URL;
            if (inserted.length > 0) {
                url += "insert";
            }
            if (updated.length > 0) {
                url += "update";
            }
            //提交后台处理
            $.ajax({
                url: url,
                type: 'post',
                data: row,
                beforeSend: function () {
                    $.messager.progress({text: '正在处理中...'});
                },
                success: function (e) {
                    $.messager.progress('close');
                    if (e.code == 200) {
                        datagrid.datagrid("acceptChanges");
                        Message(e.msg);
                        editRow = undefined;
                        datagrid.datagrid("reload");
                    } else if (e.code == 300) {
                        $.messager.alert('添加失败', '抱歉！您没有权限！', 'warning');
                    } else {
                        datagrid.datagrid("beginEdit", editRow);
                        $.messager.alert('警告操作', '未知错误！请重新刷新后提交！', 'warning');
                    }
                    datagrid.datagrid("unselectAll");
                }
            });
        },//结束编辑,提交
        toolbar: [{
            text: '添加', iconCls: 'icon-add',
            handler: function () {//添加列表的操作按钮添加，修改，删除等
                //添加时如果没有正在编辑的行，则在datagrid的第一行插入一行
                if (editRow == undefined) {
                    datagrid.datagrid("insertRow", {
                        index: 0, // index start with 0
                        row: {}
                    });
                    //将新插入的那一行开户编辑状态
                    datagrid.datagrid("beginEdit", 0);
                    //给当前编辑的行赋值
                    editRow = 0;
                }
            }
        }, '-',
            {
                text: '删除', iconCls: 'icon-remove',
                handler: function () {
                    //删除时先获取选择行
                    var rows = datagrid.datagrid("getSelections");
                    //选择要删除的行
                    if (rows.length > 0) {
                        $.messager.confirm("提示", "你确定要删除吗?", function (r) {
                            if (r) {
                                var ids = [];
                                for (var i = 0; i < rows.length; i++) {
                                    ids.push(rows[i].PKID);
                                }
                                //将选择到的行存入数组并用,分隔转换成字符串，ids.join(',')
                                //本例只是前台操作没有与数据库进行交互所以此处只是弹出要传入后台的id
                                $.ajax({
                                    url: ACTION_URL + "delete",
                                    type: 'post',
                                    data: {PKID: ids.join(',')},
                                    beforeSend: function () {
                                        $.messager.progress({text: '正在处理中...'});
                                    },
                                    success: function (e) {
                                        $.messager.progress('close');
                                        if (e.code == 200) {
                                            Message(e.msg);
                                            datagrid.datagrid('reload');
                                        } else if (e.code == 300) {
                                            $.messager.alert('删除失败', '对不起，您没有权限！', 'warning');
                                        } else {
                                            $.messager.alert('删除失败', '没有删除任何数据！', 'warning');
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        $.messager.alert("提示", "请选择要删除的行", "error");
                    }
                }
            }, '-',
            {
                text: '修改', iconCls: 'icon-edit',
                handler: function () {
                    //修改时要获取选择到的行
                    var rows = datagrid.datagrid("getSelections");
                    //如果只选择了一行则可以进行修改，否则不操作
                    console.log(editRow);
                    if (rows.length == 1) {
                        //当无编辑行时
                        if (editRow == undefined) {
                            //获取到当前选择行的下标
                            var index = datagrid.datagrid("getRowIndex", rows[0]);
                            //开启编辑
                            datagrid.datagrid("beginEdit", index);
                            //把当前开启编辑的行赋值给全局变量editRow
                            editRow = index;
                            //当开启了当前选择行的编辑状态之后，
                            //应该取消当前列表的所有选择行，要不然双击之后无法再选择其他行进行编辑
                            datagrid.datagrid("unselectAll");
                        }
                    }
                }
            }, '-',
            {
                text: '保存', iconCls: 'icon-save',
                handler: function () {
                    //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                    datagrid.datagrid("endEdit", editRow);
                    // var row = datagrid.datagrid("getData").rows[editRow];  //获取当前行的值
                    // if(!($.isEmptyObject(row))){
                    //     editRow = undefined;
                    // }
                }
            }, '-',
            {
                text: '取消编辑', iconCls: 'icon-redo',
                handler: function () {
                    //取消当前编辑行把当前编辑行罢undefined回滚改变的数据,取消选择的行
                    editRow = undefined;
                    datagrid.datagrid("rejectChanges");
                    datagrid.datagrid("unselectAll");
                }
            }, '-',
        ],
    });
}

function initDataGrid2(v) {
    var editRow = undefined; //定义全局变量：当前编辑的行
    console.log(v);
    var height = HEIGHT - $("#top").height() - 40;
    var pageSize = parseInt((height - 100) / 32.2) - 1;
    //定义全局变量datagrid
    var datagrid = $("#dg").datagrid({
        title: "查询结果",//表格标题  
        iconCls: 'icon-large-smartart', //图标
        loadMsg: '数据加载中......',
        width: '100%',
        height: height,
        // fitColumn: false, //列自适应宽度
        striped: true, //行背景交换
        nowap: true, //列内容多时自动折至第二行
        border: false,
        // idField: 'packetid', //主键
        // sortName : 'packetid',//排序字段
        // sortOrder : 'desc',//排序方式
        remoteSort: false,//关闭服务器排序
        collapsible: true,//可折叠
        pagination: true,//开启分页 
        singleSelect: true,//每次只能选中1行
        pageSize: pageSize,//分页大小  
        showPageList: true,
        // pageNumber: 1,//第几页显示（默认第一页，可以省略）  
        pageList: [10, pageSize, 30],//设置每页记录条数的列表   
        url: ACTION_URL + "select",//获取数据地址  
        columns: [
            [
                {field:'',title:'',width:120,checkbox:true},
                {
                    field: 'BIRTH', title: 'BIRTH', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: false}}
                },
                {
                    field: 'TEST', title: 'TEST', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: true}}
                },
                {
                    field: 'NAME', title: 'NAME', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: true}}
                },
                {
                    field: 'AGE', title: 'AGE', width: '120px', belong: "Q", align: 'center', sortable: true,
                    editor: {type: 'validatebox', options: {required: true}}
                },
            ]
        ],
        queryParams: getParams("form-search"), //查询参数
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
        },//首次不加载数据
        onDblClickRow: function (rowIndex, rowData) {
            // if (editRow == undefined) {
            //     datagrid.datagrid("beginEdit", rowIndex);
            //     editRow = rowIndex;
            // }
            var v = {
                url: ACTION_URL + "select",
                param: rowData,
            };
            var e = common_ajax(v);
            setParams("form-dg", toProperty(e.rows[0]));
            $("#div-dg").dialog("open");


        },//双击开启编辑行
        onAfterEdit: function (rowIndex, rowData, changes) {
            //endEdit该方法触发此事件
            var row = datagrid.datagrid("getData").rows[rowIndex];  //获取当前行的值
            var inserted = datagrid.datagrid('getChanges', 'inserted');
            var updated = datagrid.datagrid('getChanges', 'updated');
            if (inserted.length < 1 && updated.length < 1) {
                editRow = undefined;
                datagrid.datagrid('unselectAll');
                return;
            }
            var url = ACTION_URL;
            if (inserted.length > 0) {
                url += "insert";
            }
            if (updated.length > 0) {
                url += "update";
            }
            //提交后台处理
            $.ajax({
                url: url,
                type: 'post',
                data: row,
                beforeSend: function () {
                    $.messager.progress({text: '正在处理中...'});
                },
                success: function (e) {
                    $.messager.progress('close');
                    if (e.code == 200) {
                        datagrid.datagrid("acceptChanges");
                        Message(e.msg);
                        editRow = undefined;
                        datagrid.datagrid("reload");
                    } else if (e.code == 300) {
                        $.messager.alert('添加失败', '抱歉！您没有权限！', 'warning');
                    } else {
                        datagrid.datagrid("beginEdit", editRow);
                        $.messager.alert('警告操作', '未知错误！请重新刷新后提交！', 'warning');
                    }
                    datagrid.datagrid("unselectAll");
                }
            });
        },//结束编辑,提交
        toolbar: [{
            text: '添加', iconCls: 'icon-add',
            handler: function () {//添加列表的操作按钮添加，修改，删除等
                //添加时如果没有正在编辑的行，则在datagrid的第一行插入一行
                if (editRow == undefined) {
                    datagrid.datagrid("insertRow", {
                        index: 0, // index start with 0
                        row: {}
                    });
                    //将新插入的那一行开户编辑状态
                    datagrid.datagrid("beginEdit", 0);
                    //给当前编辑的行赋值
                    editRow = 0;
                }
            }
        }, '-',
            {
                text: '删除', iconCls: 'icon-remove',
                handler: function () {
                    //删除时先获取选择行
                    var rows = datagrid.datagrid("getSelections");
                    //选择要删除的行
                    if (rows.length > 0) {
                        $.messager.confirm("提示", "你确定要删除吗?", function (r) {
                            if (r) {
                                var ids = [];
                                for (var i = 0; i < rows.length; i++) {
                                    ids.push(rows[i].PKID);
                                }
                                //将选择到的行存入数组并用,分隔转换成字符串，ids.join(',')
                                //本例只是前台操作没有与数据库进行交互所以此处只是弹出要传入后台的id
                                $.ajax({
                                    url: ACTION_URL + "delete",
                                    type: 'post',
                                    data: {PKID: ids.join(',')},
                                    beforeSend: function () {
                                        $.messager.progress({text: '正在处理中...'});
                                    },
                                    success: function (e) {
                                        $.messager.progress('close');
                                        if (e.code == 200) {
                                            Message(e.msg);
                                            datagrid.datagrid('reload');
                                        } else if (e.code == 300) {
                                            $.messager.alert('删除失败', '对不起，您没有权限！', 'warning');
                                        } else {
                                            $.messager.alert('删除失败', '没有删除任何数据！', 'warning');
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        $.messager.alert("提示", "请选择要删除的行", "error");
                    }
                }
            }, '-',
            {
                text: '修改', iconCls: 'icon-edit',
                handler: function () {
                    //修改时要获取选择到的行
                    var rows = datagrid.datagrid("getSelections");
                    //如果只选择了一行则可以进行修改，否则不操作
                    console.log(editRow);
                    if (rows.length == 1) {
                        //当无编辑行时
                        if (editRow == undefined) {
                            //获取到当前选择行的下标
                            var index = datagrid.datagrid("getRowIndex", rows[0]);
                            //开启编辑
                            datagrid.datagrid("beginEdit", index);
                            //把当前开启编辑的行赋值给全局变量editRow
                            editRow = index;
                            //当开启了当前选择行的编辑状态之后，
                            //应该取消当前列表的所有选择行，要不然双击之后无法再选择其他行进行编辑
                            datagrid.datagrid("unselectAll");
                        }
                    }
                }
            }, '-',
            {
                text: '保存', iconCls: 'icon-save',
                handler: function () {
                    //保存时结束当前编辑的行，自动触发onAfterEdit事件如果要与后台交互可将数据通过Ajax提交后台
                    datagrid.datagrid("endEdit", editRow);
                    // var row = datagrid.datagrid("getData").rows[editRow];  //获取当前行的值
                    // if(!($.isEmptyObject(row))){
                    //     editRow = undefined;
                    // }
                }
            }, '-',
            {
                text: '取消编辑', iconCls: 'icon-redo',
                handler: function () {
                    //取消当前编辑行把当前编辑行罢undefined回滚改变的数据,取消选择的行
                    editRow = undefined;
                    datagrid.datagrid("rejectChanges");
                    datagrid.datagrid("unselectAll");
                }
            }, '-',
        ],
    });
}

/**
 * 获取参数,返回json
 * @param id
 * @returns {*|jQuery}
 * getParams("form")
 */
function getParams(id) {
    return $('#' + id).getForm();
}

/**
 * 传入json,回填表单
 * @param id
 * @returns {*|jQuery}
 * setParams("form")
 */
function setParams(id, value) {
    var val = $('#' + id).getForm();
    $.each(val, function (i, v) {
        val[i] = value[i];
    });
    console.log(val);
    $('#' + id).setForm(val);
}

$.fn.extend({
    getForm: function () {
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
    setForm: function (jsonValue) {
        var obj = this;
        $.each(jsonValue, function (name, ival) {
            var $oinput = obj.find("input[name=" + name + "]");
            if ($oinput.attr("type") == "checkbox") {
                if (ival !== null) {
                    var checkboxObj = $("[name=" + name + "]");
                    var checkArray = ival.split(";");
                    for (var i = 0; i < checkboxObj.length; i++) {
                        for (var j = 0; j < checkArray.length; j++) {
                            if (checkboxObj[i].value == checkArray[j]) {
                                checkboxObj[i].click();
                            }
                        }
                    }
                }
            }
            else if ($oinput.attr("type") == "radio") {
                $oinput.each(function () {
                    var radioObj = $("[name=" + name + "]");
                    for (var i = 0; i < radioObj.length; i++) {
                        if (radioObj[i].value == ival) {
                            radioObj[i].click();
                        }
                    }
                });
            }
            else if ($oinput.attr("type") == "textarea") {
                obj.find("[name=" + name + "]").html(ival);
            }
            else {
                obj.find("[name=" + name + "]").val(ival);
            }
        });
    }
});

/**
 * 格式化属性
 * @param data
 * @returns {{}}
 */
function toProperty(e) {
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
 * ajax公共方法
 * @param v
 * @returns {{}}
 */
function common_ajax(v) {
    var arr = {};
    $.ajax({
        url: v.url ? v.url : "",
        data: v.param ? v.param : "",
        dataType: "json",
        type: "post",
        async: v.async ? true : false,
        success: function (e) {
            console.log("success");
            arr = e;
        },
        error: function (e) {
            console.log("error");
            arr = e;
        }
    });
    return arr;
}

/**
 * 消息提示
 * @param v
 * @constructor
 */
function Message(v) {
    $.messager.alert("消息提示:", v);
}