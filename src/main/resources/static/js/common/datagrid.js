/**
 * Created by luochao on on 2018-10-8 14:26:24
 * EasyUI DataGrid
 */
// var WIDTH = $(document).width();
// var HEIGHT = $(document).height();
(function ($) {
    //getForm,setForm,MyDataGrid
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
        MyDataGrid:function (options) {
            var opt_default = DefaultDataGrid();
            var opts_my = $.extend({}, options);
            var opts = $.extend({}, opt_default, opts_my);
            console.log(opts);
            var opts = $(this).datagrid("options");
        }
    });
})(jQuery);

/**
 * 初始化DefaultDataGrid
 */
function DefaultDataGrid() {
    var defaultDataGrid = {
        title: "查询结果",//表格标题  
        iconCls: 'icon-large-smartart', //图标
        loadMsg: '数据加载中......',
        width: '100%',
        height: 500,
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
        pageSize: 10,//分页大小  
        showPageList: true,
        // pageNumber: 1,//第几页显示（默认第一页，可以省略）  
        pageList: [10, 20, 30],//设置每页记录条数的列表   
        url: "",//获取数据地址  
        columns: [],
        queryParams: "", //查询参数
        onRowContextMenu: "", //右键。[表头(tab)右键onHeaderContextMenu,树形(tree)右键onContextMenu]
        onBeforeLoad: function (param) {
            var firstLoad = $(this).attr("firstLoad");
            if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                $(this).attr("firstLoad", "true");
                return false;
            }
            return true;
        },//首次不加载数据
        onDblClickRow: "",//双击开启编辑行
        onAfterEdit: "",//结束编辑,提交
        toolbar: "",
    };
    return defaultDataGrid;
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
    $('#' + id).setForm(val);
}

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
            console.log("success");
            arr = e;
        },
        error: function (e) {
            $.messager.progress('close');
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