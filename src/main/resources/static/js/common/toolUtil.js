/**
 * Created by luochao on 2018/03/22
 * Custom function for lists or chart
 * Last change on 2018/05/08
 */

//*************** 1.合并行列************
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

/**
 * 3.赋初值（总计/小计需要）
 * for example:
 * sumField(item, group_sum);
 */
function initSum(item, group_sum) {
    for (var key in group_sum) {
        if (key != "") {
            group_sum[key] = item[key];
        } else {
            group_sum.key = 0;
        }
    }
}

/**
 * 4.求和total（总计/小计需要）
 * for example:
 * totalSum(group_sum, group_total);
 */
function totalSum(group_sum, group_total) {
    for (var key in group_sum) {
        group_total[key] += group_sum[key];
    }
}

/**
 * 5.传值total=sum（总计/小计需要）
 * for example:
 * totalSum2(group_sum,group_total);
 */
function totalToSum(group_sum, group_total) {
    for (var key in group_sum) {
        group_total[key] = group_sum[key];
    }
}

// ****************** 2.分页操作****************
/**
 * 1.假分页(操作本地数据，即将要分页的值全部传递过来)
 * for example:
 $('#dg').datagrid({
    pagination: true,     //开启分页
    pageSize: 16,         //分页大小
    loadFilter: pagerFilter,//调用分页函数（如果是后台分页则不需要）
});
 */
function pagerFilter(data) {
    if (typeof data.length == 'number' && typeof data.splice == 'function') {   // is array
        data = {
            total: data.length,
            rows: data
        }
    }
    var dg = $(this);
    var opts = dg.datagrid('options');
    var pager = dg.datagrid('getPager');
    pager.pagination({
        onSelectPage: function (pageNum, pageSize) {
            opts.pageNumber = pageNum;
            opts.pageSize = pageSize;
            pager.pagination('refresh', {
                pageNumber: pageNum,
                pageSize: pageSize
            });
            dg.datagrid('loadData', data);
        }
    });
    if (!data.originalRows) {
        data.originalRows = (data.rows);
    }
    var start = (opts.pageNumber - 1) * parseInt(opts.pageSize);
    var end = start + parseInt(opts.pageSize);
    data.rows = (data.originalRows.slice(start, end));
    return data;
}

//****************** 3.筛选条件（单/多）**********************
/**
 * 3.1 筛选条件（单/多）
 * 1.id不为空则带刷新功能更，反之则无
 * 2.flag为true带条件刷新，反之则无
 * for example:
 * screenConditionsFormat(id,flag,condition_group);
 */
function screenConditionsFormat(id, flag, condition_group) {
    //combobox
    for (var i in condition_group) {
        $('#' + condition_group[i].idName).combobox({
            editable: id ? true : false, //是否可编辑
            data: condition_group[i].valName,
            multiple: condition_group[i].multiple,
            valueField: 'VALUE',
            textField: 'TEXT',
            onSelect: function () {
                if (id) {
                    if (flag) {
                        if (conditions()) {
                            onSearch_(id);
                        }
                    } else {
                        onSearch_(id);
                    }
                }
            }
        });
    }
}

/**
 * 3.2 生成列表
 * for example:
 * initColumns(data)
 */
function initColumns(data) {
    var array = [];
    $.each(data, function (i, val) {
        var object = {filed: val.value, title: val.text, width: 120, belong: "Q", align: 'center', sortable: true};
        array.push(object);
    });
    return array;
}

// ************* 4.日期*******************
/**
 * 1.设初始值——年月日(20170101)
 * for example:
 * $("#createTime").textbox("setValue", formatterDate());
 */
function formatterDate() {
    var date = new Date();
    var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0" + (date.getMonth() + 1);
    var hor = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return date.getFullYear() + '-' + month + '-' + day;
}

/**
 * 2.设初始值--年月(201701)
 * for example:
 * $("#createTime").textbox("setValue", formatterYearMonth());
 */
function formatterYearMonth() {
    var date = new Date();
    //获取年份
    var y = date.getFullYear();
    //获取月份
    var m = date.getMonth() + 1;
    return y + '' + m;
}

/**
 * 3.日期格式化--年月(201701)
 * for example:
 * getDateBox("beginDate");
 */
function getDateBox(id) {
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
    //$("#"+id).datebox("setValue", formatterYearMonth());
}

// ****************** 5.功能控件*******************
/**
 * 1.查询，高级查询，更多&收起，新增
 * for example:
 * initControl(id)
 */
function initControl(id) {
    // 查询
    $(".searchBtn").click(function () {
        if (conditions()) {
            onSearch_(id);
        }
    });
    // 高级查询
    $(".rido_Btn").click(function () {
        helpQuery(id, 'ffSearch', function () {
            if (conditions()) {
                onSearch_(id);
            }
        });
    });
    // 绑定回车事件：输入xxx，回车即可查询
    $(document).keyup(function (event) {
        if (event.keyCode == 13) {
            if (conditions()) {
                onSearch_(id);
            }
        }
    });
    //  更多&收起
    $(".moreBtn").click(function () {
        var message = $(".moreBtn").text();
        if (message == "更多") {
            $(".moreBtn").text("收起");
            $(".trs").show();
        } else {
            $(".moreBtn").text("更多");
            $(".trs").hide();
        }
        //重新加载
        InitDataGrid();
    });
    //  新增
    $(".add_Btn").click(function () {
        do_add();
    });
}

/**
 * 2.导出Excel
 * for example:
 * doExcleExport(url,id)
 * 传入url:即后台接口;id:form表单
 */
function doExcleExport(url, id) {
    var data = {imagesBase64: imagesBase64};
    var value = $('#' + id).serialize();
    var arrays = value.split("&");
    for (var i in arrays) {
        var array = arrays[i].split("=");
        data[array[0]] = array[1];
    }
    console.log(data);
    console.log(url);
    doPost(url, data);
}

/**
 * 3 编辑/禁止
 */
function doReadonly(data, flag) {
    for (var i in data) {
        $("#" + data[i]).combobox('readonly', flag);
        $("#" + data[i]).textbox('readonly', flag);
        $("#" + data[i]).datebox('readonly', flag);
    }
}

//************** 6.高度设置**************
/**
 * 1.初始化表格高度
 * for example:
 * tableSize()
 */
function tableSize() {
    return {height: $(document.body).height() - $("fieldset").height() - $("#tt").height() - 15, width: '100%'};
}

/**
 * 2.初始化图形高度
 * for example:
 * chartSize(id)
 */
function chartSize(id) {
    if ($("#" + id).height() < 90) {//不展示数据表格
        $("#" + id).css({"height": $(document.body).height() - $("fieldset").height() - 15, "width": '100%'});
    }
}

//*************** 7.编辑功能拓展***************
/**
 * 1.编辑初始化
 * for example:
 * InitEdit(param, detail_result, edit_result)
 * param为对象{pkid:主键,id:父界面id}，detail_result为明细函数标识，edit_result为编辑函数标识
 */
//修改初始化
function InitEdit(param, detail_result, edit_result) {
    if (param && param.pkid) {
        InitFuncCodeRequest_({
            data: {pkid: param.pkid, FunctionCode: detail_result},
            successCallBack: function (jdata) {
                console.log(jdata);
                if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                    console.log("传入的jdata:" + JSON.stringify(jdata));
                    ParseFormField_(jdata.data[0], null, Constant.CAMEL_CASE);//注入数据
                    InitEditForm_(param, edit_result);
                } else {
                    MsgAlert({content: jdata.msg, type: 'error'});
                }
            }
        })
    } else {
        InitEditForm_(param, edit_result);
    }
}

/**
 * 2.编辑提交
 * for example:
 * InitEditForm_(param,edit_result)
 * param为对象{pkid:主键,id:父界面id}，edit_result为编辑函数标识
 */
function InitEditForm_(param, edit_result) {
    initCheck();//重新加载数据
    var $form = $("#mform");
    $form.form({
        onSubmit: function () {
            if (conditions()) {
                var isValidate = $(this).form('validate');
                if (!isValidate) {
                    return false;
                }
                var data = $form.serializeObject();
                data.worker = getLoginInfo().userName;//操作人
                data = Object.assign(data, param.otherObject);//添加额外的条件
                data = $.extend({}, data, {FunctionCode: edit_result});//编辑
                InitFuncCodeRequest_({
                    data: data,
                    successCallBack: function (jdata) {
                        if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                            MsgAlert({content: jdata.msg, type: 'success'});
                            window.opener.getDG('dg').datagrid('reload');
                            if (param.id && param.id != 'dg') {
                                window.opener.getDG(param.id).datagrid('reload');
                            }
                            setTimeout(function () {
                                CloseWindowIframe();
                            }, 1000);
                        } else if (jdata.code == 201) {
                            MsgAlert({content: jdata.data, type: 'success'});
                            setTimeout(function () {
                                CloseWindowIframe();
                            }, 1000);
                        } else {
                            MsgAlert({content: jdata.msg, type: 'error'});
                        }
                    }
                });
                return false;
            }
        }
    });
}

/**
 * 3.编辑关闭
 * for example:
 * null
 */
function closeEdit() {
    $.messager.confirm('', '是否保存?', function (r) {
        if (r) {
            $("#mform").submit();
        } else {
            setTimeout(function () {
                CloseWindowIframe();
            }, 500);
            // param.OWindow.reload_();
        }
    });
}

//************* 8.表格操作******************
/**
 * 1.判断是否存在编辑中的行
 * for example:
 * null
 */
var editIndex = null;

function endEditing(id) {
    if (editIndex == null) {
        return true
    }
    if ($('#' + id).datagrid('validateRow', editIndex)) {
        $('#' + id).datagrid('endEdit', editIndex);
        editIndex = null;
        return true;
    } else {
        return false;
    }
}

/**
 * 2.datagrid行点击事件
 * for example:
 * null
 */
function onClickRow(index, row) {
    if (editIndex != index) {
        if (endEditing(this.id)) {
            $("#" + this.id).datagrid("selectRow", index).datagrid("beginEdit", index);
            editIndex = index;
        } else {
            $("#" + this.id).datagrid("selectRow", editIndex);
        }
    } else {
        console.log('未关闭编辑,当前editIndex=' + editIndex + ',当前index=' + index);
    }
}

/**
 * 3.关闭行编辑
 * for example:
 * null
 */
function endEdit(id, rowsData) {
    for (var i in rowsData) {
        $('#' + id).datagrid('endEdit', i);
    }
    endEditIndex();
}

function endEditIndex() {
    editIndex = null;
}

/**
 * 4.添加一行
 * for example:
 * null
 */
function addRows(id) {
    if (endEditing(id)) {
        $("#" + id).datagrid("appendRow", {});
        editIndex = $("#" + id).datagrid("getRows").length - 1;
        $("#" + id).datagrid("selectRow", editIndex).datagrid("beginEdit", editIndex);
    }
}

/**
 * 5.删除一行
 * for example:
 * null
 */
function delRows(id) {
    $.messager.confirm('', '确定删除?', function (r) {
        if (r) {
            if (editIndex == null) {
                return
            }
            $('#' + id).datagrid('cancelEdit', editIndex).datagrid('deleteRow', editIndex);
            editIndex = null;
        }
    });
}

/**
 * 6.撤销修改
 * for example:
 * null
 */
function rejectRows(id) {
    $('#' + id).datagrid('rejectChanges');
    editIndex = null;
}

//****************** 9.图形模块***************
/**
 * 1.折线图，柱形图
 * for example:
 * null
 */
var imagesBase64 = "";

function initChartLineBar(char_data) {
    chartSize(char_data.id);//设置图形大小
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
        dataZoom: [
            {
                type: 'slider',
                star: 0,
                end: 20 * 100 / char_data.series.length,//横坐标最多显示20条数据,超过则滚动
                filterMode: 'filter',
            }
        ]
    };
    chart.setOption(option);//加载数据
    imagesBase64 = chart.getDataURL({type: 'png',});//echarts自带的获取图形的base64方法,使用全局变量接收
}

/**
 * 2.饼图
 * for example:
 * null
 */
function initChartPie(id, text, legend, series) {
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