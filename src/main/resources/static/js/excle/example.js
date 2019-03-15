/**
 * 变量
 */
var ACTION_URL = "../";
var MENU_ARRAY = [];
var DATAGRID_ID = "dg";//表id
var FORM_PKID = 1;//表单id

/**
 * 预加载
 */
$(function () {
    //获取表单信息
    var v = {
        url: ACTION_URL + "getInformation",
        param: {FORM_PKID: FORM_PKID}
    };
    var info = common_ajax(v);
    initForm(info);
    initDataGrid(info);
    rightMenu();
});

/**
 * 按钮切换
 * @param v
 */
function choice(v) {
    $("#div-export").dialog(v == 0 ? "open" : "close");
    $("#div-import").dialog(v == 1 ? "open" : "close");
    if (v == 2) {
        if (!$('#form-search').form('validate')) {
            return;
        }
        $('#w').window('close');
        $("#" + DATAGRID_ID).datagrid('load', $.extend({}, getParams("form-search"), {FORM_PKID: FORM_PKID}));
    }
}

/**
 * 刷新
 * @param id
 * @private
 */
function reload_(id) {
    $("#" + id).datagrid('reload');
}

function load_(id, val) {
    $("#" + id).datagrid('load', v);
}

function loadData_(id, val) {
    $("#" + id).datagrid('loadData', v);
}

/**
 * 导入
 */
function doImport() {
    if (!$('#form-import').form('validate')) {
        return;
    }
    var formData = new FormData(document.getElementById("form-import"));
    formData.append("FORM_PKID", FORM_PKID);
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
}

/**
 * 导出
 */
function doExport() {
    $("#div-export").dialog("close");
    var v = {
        url: ACTION_URL + "exportModle",
        param: {FORM_PKID: FORM_PKID}
    };
    v.param = $.extend({}, getParams("form-search"), getParams("form-export"), v.param);
    common_href(v);
}

/**
 * 初始化表单
 * @param v
 */
function initForm(v) {
    // //查询条件
    $.each(v.getCondition, function (i, v) {
        $("#search-table").append("<tr><th class='th'>" + v.COLUMN_NAME + ":</th><td class='td'>" + v.INPUT.replace(/@@COLUMN/g, Property(v.COLUMN)) + "</td></tr>");
    });
    $.parser.parse();//重新加载样式
}

/**
 * dg初始化表格
 * @param v
 */
function initDataGrid(v) {
    var columns = [];//父列
    var column = [];//子列
    var editRow = undefined; //定义全局变量：当前编辑的行
    var height = $(document).height() - $("#top").height() - 40;
    var pageSize = parseInt((height - 100) / 32.2) - 1;

    column.push({field: '', title: '', width: 120, checkbox: true});//checkbox
    $.each(v.getDisplay, function (i, col) {
        var required = false;//验证
        if (col.COLUMN == "NAME") {
            required = true;
        }
        var o = {
            field: col.COLUMN, title: col.COLUMN_NAME, width: '120px', belong: "Q", align: 'center', sortable: true,
            editor: {type: 'validatebox', options: {required: required}}
        };
        column.push(o);
    });
    columns.push(column);

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
        // singleSelect: true,//每次只能选中1行
        pageSize: pageSize,//分页大小  
        showPageList: true,
        // pageNumber: 1,//第几页显示（默认第一页，可以省略）  
        pageList: [10, pageSize, 30],//设置每页记录条数的列表   
        url: ACTION_URL + "selectModle",//获取数据地址  
        // data: v.data,//数据
        columns: columns,
        queryParams: $.extend({}, getParams("form-search"), {FORM_PKID: FORM_PKID}), //查询参数
        onRowContextMenu: function (e, rowIndex, rowData) { //右键时触发事件
            if (MENU_ARRAY.length < 1) {
                return;
            }
            e.preventDefault(); //阻止浏览器捕获右键事件
            $(this).datagrid("clearSelections"); //取消所有选中项
            $(this).datagrid("selectRow", rowIndex); //根据索引选中该行
            $('#menu').menu('show', {
                left: e.pageX,//在鼠标点击处显示菜单
                top: e.pageY
            });
            // e.preventDefault();  //阻止浏览器自带的右键菜单弹出
        },
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
            setParams("form-dg", JSONProperty(e.rows[0]));
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
                url += "insertModle";
            }
            if (!($.isEmptyObject(updated))) {
                url += "updateModle";
            }
            var v = {
                url: url,
                param: $.extend({}, row, {FORM_PKID: FORM_PKID})
            };
            var e = common_ajax(v);
            if (e.code == 200) {
                datagrid.datagrid("acceptChanges");
                Message(e.msg);
                editRow = undefined;
                reload_(DATAGRID_ID);
            } else if (e.code == 300) {
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
                                var v = {
                                    url: ACTION_URL + "deleteModle",
                                    param: {
                                        data: JSON.stringify(rows),
                                        FORM_PKID: FORM_PKID
                                    }
                                };
                                var e = common_ajax(v);
                                if (e.code == 200) {
                                    Message(e.msg);
                                    reload_(DATAGRID_ID);
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
            {
                text: '导入数据', iconCls: 'icon-excle',
                handler: function () {
                    choice(1);
                }
            }, '-',
            {
                text: '导出数据', iconCls: 'icon-print',
                handler: function () {
                    choice(0);
                }
            }, '-',
        ],
    });
    reload_(DATAGRID_ID);
}

/**
 * 右键菜单
 * @returns {*[]}
 * @constructor
 */
function rightMenu() {
    $("#menu").empty();
    MENU_ARRAY = [
        {
            id: "m-edit", text: "编辑", auth: "",//编辑
            onclick: function () {
                var rowdata = $("#dg").datagrid('getSelected');
                console.log(rowdata);
            }
        }, {
            id: "m-browse", text: "浏览", auth: "",//浏览
            onclick: function () {
                var rowdata = $("#dg").datagrid('getSelected');
                console.log(rowdata);
            }
        }, {
            id: "m-delete", text: "删除", auth: "",//删除
            onclick: function () {
                $.messager.confirm('', '确定删除?', function (r) {
                    if (r) {
                        var rowdata = $("#dg").datagrid('getSelected');
                        console.log(rowdata);
                    }
                });
            }
        }
    ];
    $.each(MENU_ARRAY, function (i, v) {
        $('#menu').append('<div class="' + v.id + '" iconCls="' + v.iconCls + '" onclick="' + v.onclick + '">' + v.text + '</div>');
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
 * 传入id,清空表单
 * @param id
 * @returns {*|jQuery}
 * clearParams("form")
 */
function clearParams(id) {
    $('#' + id).clearForm();
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
    },
    clearForm: function () {
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
    }
});

/**
 * 格式化属性
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
 * 消息提示
 * @param v
 * @constructor
 */
function Message(v) {
    $.messager.alert("消息提示:", v);
}