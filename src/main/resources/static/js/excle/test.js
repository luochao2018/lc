/**
 * url定义区
 */
var JSON_URL = "../local/json/";
var ACTION_URL = "../";
var PARAM_DATA = {};
var WIDTH = "";
var HEIGHT = "";
var identity = "#dg";

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
        param: formData,
        type: "formData"
    }
    $("#div-import").dialog("close");
    var data = common_ajax(v);
    if (data.code == 200) {
        Message("excle数据:" + data.requestData + "</br>" + "导入成功:" + data.responseData + "</br>" + "导入失败:" + (data.requestData - data.responseData));
    } else {
        Message(data.msg);
    }
}

/**
 * 导出
 */
function doExport() {
    if (!$('#form-export').form('validate')) {
        Message("请完成必选项");
        return;
    }
    $("#div-export").dialog("close");
    var v = {
        url: ACTION_URL + "export",
        param: PARAM_DATA,
    };
    common_href(v);
}

/**
 * dg初始化
 * @param v
 */

function initDataGrid(v) {
    var editRow = undefined; //定义全局变量：当前编辑的行
    var height = HEIGHT - $("#top").height() - 40;
    var pageSize = parseInt((height - 100) / 32.2) - 1;
    var datagrid = $(identity).MyDataGrid({
        width: '100%',
        height: height,
        identity: identity,
        url: ACTION_URL + "select",//数据来源
        // firstLoad: false,
        //显示格式
        columns: [
            [
                {field: '', title: '', width: 120, checkbox: true},
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
        contextMenus: [
            {
                id: "m-edit", text: "编辑", auth: "",//编辑
                onclick: function () {
                    var rowdata = getDG(identity).datagrid('getSelected');
                    ShowWindowIframe({
                        width: 900,
                        height: 150,
                        title: '编辑信息',
                        param: {
                            pkid: rowdata.PKID,
                            OPRATE: 'EDIT',
                        },
                        url: "/views/alertValueMaintenance/dm_re_ucl_kvalu_edit.shtml"
                    });
                }
            }
            , {
                id: "m-browse", text: "浏览", auth: "",//浏览
                onclick: function () {
                    var rowdata = getDG(identity).datagrid('getSelected');
                    ShowWindowIframe({
                        width: 900,
                        height: 150,
                        title: '浏览信息',
                        param: {
                            pkid: rowdata.PKID,
                            OPRATE: 'DETAIL',
                        },
                        url: "/views/alertValueMaintenance/dm_re_ucl_kvalu_edit.shtml"
                    });
                }
            }
            , {
                id: "m-delete", text: "删除", auth: "",//删除
                onclick: function () {
                    $.messager.confirm('', '确定删除?', function (r) {
                        if (r) {
                            var rowdata = getDG(identity).datagrid('getSelected');
                            InitFuncCodeRequest_({
                                data: {pkid: rowdata.PKID, FunctionCode: "DM_RE_UCL_KVALU_DELETE"},
                                successCallBack: function (jdata) {
                                    if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                                        MsgAlert({content: jdata.msg, type: 'success'});
                                        getDG(identity).datagrid('reload');//刷新
                                    } else {
                                        MsgAlert({content: jdata.msg, type: 'error'});
                                    }
                                }
                            });
                        }
                    });
                }
            }
        ],
        onDblClickRow: function (rowIndex, rowData) {
            // if (editRow == undefined) {
            //     datagrid.datagrid("beginEdit", rowIndex);
            //     editRow = rowIndex;
            // }
            var v = {
                url: ACTION_URL + "select",
                param: rowData,
            };
            var data = common_ajax(v);
            setParams("form-dg", toProperty(data.rows[0]));
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
            if (!($.isEmptyObject(inserted))) {
                url += "insert";
            }
            if (!($.isEmptyObject(updated))) {
                url += "update";
            }
            var v = {
                url: url,
                param: row,
                // param: {data:JSON.stringify(datagrid.datagrid("getData").rows)},
                // param: {data:datagrid.datagrid("getData").rows}
            };
            var data = common_ajax(v);
            if (data.code == 200) {
                datagrid.datagrid("acceptChanges");
                Message(data.msg);
                editRow = undefined;
                datagrid.datagrid("reload");
            } else if (data.code == 300) {
                $.messager.alert('添加失败', '抱歉！您没有权限！', 'warning');
            } else {
                datagrid.datagrid("beginEdit", editRow);
                $.messager.alert('警告操作', '未知错误！请重新刷新后提交！', 'warning');
            }
            datagrid.datagrid("unselectAll");
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
                                var v = {
                                    url: ACTION_URL + "delete",
                                    param: {PKID: ids.join(',')}
                                };
                                var data = common_ajax(v);
                                if (data.code == 200) {
                                    Message(data.msg);
                                    datagrid.datagrid('reload');
                                } else if (data.code == 300) {
                                    $.messager.alert('删除失败', '对不起，您没有权限！', 'warning');
                                } else {
                                    $.messager.alert('删除失败', '没有删除任何数据！', 'warning');
                                }
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
        ]
    });
}