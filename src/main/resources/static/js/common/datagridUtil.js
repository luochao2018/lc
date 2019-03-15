/**
 * Created by luochao on on 2018/3/22.
 * EasyUI DataGrid 显示插件
 * dependences : {constant.js, layer.js easyui tooltip}
 */
var DG_STOCK = {};
/*var DG_IDENTITY_ = [];*/
var CBOX_DISPLAY_NAME = '_display_name___';
/**
 * Created by tpeng on 2016/8/16.
 */
var RESULT_CODE = {
    SUCCESS_CODE: 200,
    ERROR_CODE: 500,
    MSG_ERROR: 907,
    NO_LOGIN_CODE: 100,
    ERR_PROC_DEF_DEPLOY: 3002
};

var Constant = {
    BASE_URL: "/api/",
    API_V1_URL: "/api/v1/",
    API_URL: "/api/v1/plugins/",
    CAMEL_CASE: "CamelCase",
    WEB_SOCKET_URL: "ws://" + window.location.host + "/websocket"  //localhost:8084
};
var SHOW_WINDOW_TYPE = "1"; //0:DIV 1:OPEN WINDOW
//@Deprecated
var KEY_RECORD_LOG = "_record_log_key";


/** ---- MSG_ERR ---- */
var MSG_ERR = {
    ERRMSG_COMMON_OPT_SUCCESS: "msg_err:ERRMSG.COMMON.OPT_SUCCESS"
};


var _C = {
    SYS_USER_LIST: 'UserListDataFilter',
    EM_MPD_FILES_ITEM_LIST: 'EmMpdFilesItemListFilter',
    MPD_FILES_LIST: 'EmMpdFilesListFilter'
};

/**
 * 扩展datagrid 两个tip方法
 */
$.extend($.fn.datagrid.methods, {
    /**
     * 打开提示功能
     * @param {} jq
     * @param {} params 提示消息框的样式
     * @return {}
     */
    doCellTip: function (jq, params) {
        function showTip(data, td, e) {
            if ($(td).text() == "")
                return;
            data.tooltip.text($(td).text()).css({
                top: (e.pageY + 10) + 'px',
                left: (e.pageX + 20) + 'px',
                'z-index': $.fn.window.defaults.zIndex,
                display: 'block'
            });
        };
        return jq.each(function () {
            var grid = $(this);
            var options = $(this).data('datagrid');
            if (!options.tooltip) {
                var panel = grid.datagrid('getPanel').panel('panel');
                var defaultCls = {
                    'border': '1px solid #333',
                    'padding': '2px',
                    'color': '#333',
                    'background': '#f7f5d1',
                    'position': 'absolute',
                    'word-wrap': 'break-word',
                    'max-width': '200px',
                    'border-radius': '4px',
                    '-moz-border-radius': '4px',
                    '-webkit-border-radius': '4px',
                    'display': 'none'
                }
                var tooltip = $("<div id='celltip'></div>").appendTo('body');
                tooltip.css($.extend({}, defaultCls, params.cls));
                options.tooltip = tooltip;
                panel.find('.datagrid-header').each(function () {
                    var delegateEle = $(this).find('> div.datagrid-header-inner').length ? $(this).find('> div.datagrid-header-inner')[0] : this;
                    $(delegateEle).undelegate('td', 'mouseover').undelegate('td', 'mouseout').undelegate('td', 'mousemove').delegate('td', {
                        'mouseover': function (e) {
                            if (params.delay) {
                                if (options.tipDelayTime)
                                    clearTimeout(options.tipDelayTime);
                                var that = this;
                                options.tipDelayTime = setTimeout(function () {
                                    showTip(options, that, e);
                                }, params.delay);
                            }
                            else {
                                showTip(options, this, e);
                            }

                        },
                        'mouseout': function (e) {
                            if (options.tipDelayTime)
                                clearTimeout(options.tipDelayTime);
                            options.tooltip.css({
                                'display': 'none'
                            });
                        },
                        'mousemove': function (e) {
                            var that = this;
                            if (options.tipDelayTime)
                                clearTimeout(options.tipDelayTime);
                            //showTip(options, this, e);
                            options.tipDelayTime = setTimeout(function () {
                                showTip(options, that, e);
                            }, params.delay);
                        }
                    });
                });
                var bodyObj = panel.find('.datagrid-body');
                $(bodyObj).on('mouseover', 'td', function (e) {
                    if ($(this).find('table.datagrid-btable').length > 0) return;
                    if (params.delay) {
                        if (options.tipDelayTime)
                            clearTimeout(options.tipDelayTime);
                        var that = this;
                        options.tipDelayTime = setTimeout(function () {
                            showTip(options, that, e);
                        }, params.delay);
                    }
                    else {
                        showTip(options, this, e);
                    }

                }).on('mouseout', 'td', function (e) {
                    if ($(this).find('table.datagrid-btable').length > 0) return;
                    if (options.tipDelayTime)
                        clearTimeout(options.tipDelayTime);
                    options.tooltip.css({
                        'display': 'none'
                    });
                }).on('mousemove', 'td', function (e) {
                    if ($(this).find('table.datagrid-btable').length > 0) return;
                    var that = this;
                    if (options.tipDelayTime)
                        clearTimeout(options.tipDelayTime);
                    //showTip(options, this, e);
                    options.tipDelayTime = setTimeout(function () {
                        showTip(options, that, e);
                    }, params.delay);
                })
            }

        });
    },
    /**
     * 关闭消息提示功能
     *
     * @param {}
     *            jq
     * @return {}
     */
    cancelCellTip: function (jq) {
        return jq.each(function () {
            var data = $(this).data('datagrid');
            if (data.tooltip) {
                data.tooltip.remove();
                data.tooltip = null;
                var panel = $(this).datagrid('getPanel').panel('panel');
                panel.find('.datagrid-body').undelegate('td', 'mouseover').undelegate('td', 'mouseout').undelegate('td', 'mousemove')
            }
            if (data.tipDelayTime) {
                clearTimeout(data.tipDelayTime);
                data.tipDelayTime = null;
            }
        });
    },

    /**
     * 拓展CellEdit功能
     * @param jq
     * @param param
     * @returns {*}
     */
    editCell: function (jq, param) {
        return jq.each(function () {
            var opts = $(this).datagrid('options');
            var fields = $(this).datagrid('getColumnFields', true).concat($(this).datagrid('getColumnFields'));
            for (var i = 0; i < fields.length; i++) {
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
                if (fields[i] != param.field) {
                    col.editor = null;
                }
            }
            $(this).datagrid('beginEdit', param.index);
            var $dg = $(this);
            var ed = $(this).datagrid('getEditor', {index: param.index, field: param.field});
            if (ed != null) {
                if ($(ed.target).hasClass('textbox-f')) {
                    $(ed.target).textbox('textbox')/*.unbind('blur').bind('blur', function(){
                        $dg.datagrid('endEdit', param.index); //you bug
                    })*/.unbind('keypress').bind('keypress', function (e) {
                        if (e.which == 13) {
                            $dg.datagrid('endEdit', param.index);
                        }
                    }).focus();
                }
            }
            for (var i = 0; i < fields.length; i++) {
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
        });
    }
});

/*var mview = $.extend($.fn.datagrid.defaults.view, {
    onBeforeRender : function(target, rows) {
        var identity = $(target).attr('identity');
        if(DG_STOCK[identity].options.enableLineEdit){
            $.each(rows, function (k, item) {
                item['__'] = '<img src="/css/icons/page_edit.png" />';
            });
        }
    }
});*/

(function ($) {

    $.fn.MyDataGrid = function (options) {
        var opts = $.extend({}, $.fn.MyDataGrid.defaults, options);
        if (!validOptions_(opts)) { //验证必要参数
            return this;
        }
        if (opts.columns.param) {
            asynBindDataGrid(this, opts);
        } else {
            BindDataGrid(this, opts, '');
        }
    };

    function asynBindDataGrid(thiz, opts) {
        opts._params = {};
        opts._params.url = opts.columns.url;
        opts._params = $.extend({}, opts._params, opts.columns.param);
        var url = opts.columns.url ? opts.columns.url : "/api/v1/system/dgcols";
        var data = opts.columns.param ? opts.columns.param : {};
        var functionCode = data.FunctionCode || '';
        AjaxCall_(url, data, function (result) {
                if (result.code != RESULT_CODE.SUCCESS_CODE) {
                    layer.msg(result.msg, {icon: 5});
                    return;
                }
                var columns_ = result.data;
                if (opts.columns.alter) {
                    $.each(columns_, function (k, v) {
                        if (opts.columns.alter[v.field]) {
                            columns_[k] = $.extend({}, columns_[k], opts.columns.alter[v.field]);
                        }
                    });
                }
                opts.ocolumns = opts.columns;
                opts.columns = columns_;
                BindDataGrid(thiz, opts, functionCode);
            },
            function (jqXHR, textStatus, errorThrown) {
                alert(textStatus);
            });

    }

    function BindDataGrid(thiz, opts, fcode) {
        var columns_ = opts.columns;
        opts.identity = opts.identity || thiz.selector.replace("#", '');
        var menuFunc = function (e, rowIndex, rowData) {
            if (opts.treeField) {
                $(thiz).treegrid('select', rowData[opts.idField]);
            } else {
                $(thiz).datagrid('selectRow', rowIndex);
            }
            $("#menu_" + opts.identity).menu("destroy");
            var $menu = $("<div id='menu_" + opts.identity + "'/>").menu();
            if (!opts.contextMenus) {
                return;
            }
            var MStock = {};
            var isItem = false;
            $.each(opts.contextMenus, function (k, idata) {
                var vflag = true;
                if (idata.auth && idata.auth != "") {
                    vflag = VALID_AUTH(idata.auth);
                }
                idata.id = idata.id || 'item' + k;
                var i18nText = idata.text ? idata.text : idata.i18nText;
                if (vflag) {
                    $menu.menu('appendItem', {
                        id: idata.id,
                        text: idata.text,
                        iconCls: idata.iconCls,
                        onclick: idata.onclick
                    });
                    isItem = true;
                }
                MStock[i18nText] = {enable: true, display: true};
            });
            if (!isItem)
                return;
            var isAllCover = true;
            if (opts.validAuth && typeof(opts.validAuth) == 'function') {
                var rowData = {};
                if (opts.treeField) {
                    rowData = $(thiz).treegrid('getSelected');
                } else {
                    rowData = $(thiz).datagrid('getSelected');
                }

                opts.validAuth(rowData, MStock, rowIndex);
                $.each(MStock, function (k, v) {
                    if (v.display === true) {
                        isAllCover = false;
                        return false;
                    }
                });
                $.each(MStock, function (k, v) {
                    var item = $menu.menu('findItem', $.i18n.t(k));

                    if (item && v.enable == false) {
                        $menu.menu('disableItem', item.target);
                    }
                    if (item && v.display == false) {
                        $menu.menu('removeItem', item.target);
                    }
                });
            } else {
                isAllCover = false;
            }
            if (!isAllCover) {
                $menu.menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
            }
        };
        var onLoadSuccess = opts.onLoadSuccess;
        opts.onLoadSuccess = null;
        var onBeforeLoad = opts.onBeforeLoad;
        opts.onBeforeLoad = null;
        var onEndEdit = opts.onEndEdit;
        opts.onEndEdit = null;
        var onBeforeEdit = opts.onBeforeEdit;
        opts.onBeforeEdit = null;
        var onBeginEdit = opts.onBeginEdit;
        opts.onBeginEdit = null;
        var onClickCell = opts.onClickCell;
        opts.onClickCell = null;
        var loader = opts.loader || function (_7ff, _800, _801) {
            var opts = $(this).datagrid("options");
            if (!opts.url || !opts.firstLoad) {
                opts.firstLoad = true;//首次加载是否提交
                return false;
            }
            _7ff = {
                page: 1,
                rows: 17
            };
            $.ajax({
                type: opts.method, url: opts.url, data: _7ff, dataType: "json", success: function (jdata) {
                    // if (!AjaxSuccess(jdata)) {//错误提示
                    //     return;
                    // }
                    if (jdata.code != 200) {
                        MsgAlert({content: jdata.msg, type: 'error'});
                        return;
                    }
                    var list = isArray(jdata.data) ? jdata.data : jdata.rows;
                    var data = {total: jdata.total || 0, rows: list || [], data: jdata.rows};
                    window.PAGE_DATA = $.extend(window.PAGE_DATA || {}, jdata.storage || {});
                    //window.DG_REQS = $.extend(window.DG_REQS||{}, {opts.identity : true });
                    _800(data);
                    if (typeof(InitLoadDGSuccess_) == 'function') {
                        InitLoadDGSuccess_();
                    }
                }
            });
        };
        opts.enableLineEdit = typeof(opts.enableLineEdit) == 'undefined' ? false : opts.enableLineEdit;
        opts.enableCellEdit = typeof(opts.enableCellEdit) == 'undefined' ? false : opts.enableCellEdit;
        opts.rownumbers = typeof(opts.rownumbers) != 'undefined' ? opts.rownumbers : true;
        var opt_ = {
            width: typeof(opts.width) != 'undefined' ? opts.width : '100%',
            height: typeof(opts.height) != 'undefined' ? opts.height : '100%',
            columns: typeof(opts.columns) != 'undefined' ? opts.columns : [],
            striped: typeof(opts.striped) != 'undefined' ? opts.striped : true,
            pagination: typeof(opts.pagination) != 'undefined' ? opts.pagination : true,
            singleSelect: typeof(opts.singleSelect) != 'undefined' ? opts.singleSelect : true,
            checkOnSelect: typeof(opts.checkOnSelect) != 'undefined' ? opts.checkOnSelect : false,
            selectOnCheck: typeof(opts.selectOnCheck) != 'undefined' ? opts.selectOnCheck : false,
            iconCls: typeof(opts.iconCls) != 'undefined' ? opts.iconCls : '',
            loadMsg: typeof(opts.loadMsg) != 'undefined' ? opts.loadMsg : "加载中...",
            rownumbers: typeof(opts.rownumbers) != 'undefined' ? opts.rownumbers : false,
            queryParams: typeof(opts.queryParams) != 'undefined' ? opts.queryParams : false,
            loader: loader,
            onBeforeLoad: function (param) {
                var firstLoad = opts.firstLoad;
                if (firstLoad == "false" || typeof (firstLoad) == "undefined") {
                    $(this).attr("firstLoad", "true");
                    return false;
                }
                return true;
            },
            //view : mview,
            onLoadSuccess: function (data) {
                try {
                    getDG(opts.identity).datagrid('doCellTip', {'max-width': '200px'});
                    clearEditStorage($(thiz));
                } catch (e) {
                }
                if (typeof (onLoadSuccess) == 'function') {
                    onLoadSuccess(data);
                }
                if (typeof (opts.onLoadSuccessOnce) == 'function' && !opts.loadCount) {
                    opts.loadCount = (opts.loadCount ? opts.loadCount : 0) + 1;
                    opts.onLoadSuccessOnce(data);
                }
            },
            onBeforeEdit: function (index, row) {
                if (typeof (onBeforeEdit) == 'function') {
                    onBeforeEdit(index, row);
                }
            },
            onBeginEdit: function (index, row) {
                if (typeof (onBeginEdit) == 'function') {
                    onBeginEdit(index, row);
                }
            },
            onEndEdit: function (index, row, changes) {
                var options_ = getDgOpts(opts.identity).options;
                if (options_.enableLineEdit || options_.enableCellEdit) {
                    var eds = getDG(opts.identity).datagrid('getEditors', index);
                    for (var i = 0; i < eds.length; i++) {
                        var ed = eds[i];
                        if (ed.type == "combobox" || ed.type == 'combogrid') {
                            row[ed.field + CBOX_DISPLAY_NAME] = $(ed.target).combobox('getText');
                        }
                    }
                }
                if (typeof (onEndEdit) == 'function') {
                    onEndEdit(index, row, changes, opts.__editfield);
                }
            },
            onClickCell: function (index, field, value) {
                var options_ = getDgOpts(opts.identity).options;
                if (options_.enableCellEdit) {
                    var opt = getDgOpts(opts.identity);
                    var $dg = getDG(opts.identity);
                    var rows = $dg.datagrid('getRows');
                    //var row = rows[index];
                    if (opts.__l_editindex != undefined) {//row.__editing == true){ //任意行编辑如果正在处理，不进行操作 <注：页面自定义的onClickCell事件也不执行>
                        return;
                    } else {
                        if (opts.__c_editindex != undefined) {
                            if (!$dg.datagrid('validateRow', opts.__c_editindex)) {
                                MsgAlert({content: '验证失败', type: 'error'});
                                return;
                            } else {
                                $dg.datagrid('endEdit', opts.__c_editindex);
                                //$dg.datagrid('updateRow', {index:index, row:{'__c_editing': false, '__editfield' : '' }}); //与上行顺序不可变
                                opts.__c_editindex = undefined;
                                opts.__editfield = undefined;
                            }
                        }
                        //$dg.datagrid('updateRow', {index:index, row:{'__c_editing': true, '__editfield' : field }}); //与下行顺序不可变
                        opts.__c_editindex = index;
                        opts.__editfield = field;
                        $dg.datagrid('editCell', {index: index, field: field});
                    }
                }
                if (typeof (onClickCell) == 'function') {
                    onClickCell(index, field, value);
                }
            },
            onRowContextMenu: opts.onRowContextMenu || function (e, rowIndex, rowData) {
                e.preventDefault();
                if (!opts.contextMenus) {
                    return;
                }
                menuFunc(e, rowIndex, rowData);
            },
            onDblClickRow: opts.onDblClickRow || function (e, rowIndex, rowData) {
                e.preventDefault();
                menuFunc(e, rowIndex, rowData);
            }
        };
        if (opts.data) {
            opt_.url = '';
        } else {
            if (opts.url) {
            } else if (opts._params && opts._params.FunctionCode) {
                opt_.url = '/api/v1/plugins/' + opts._params.FunctionCode;
            } else {
                opt_.url = opts.url;
                if (!opt_.url) {
                    opts.data = opts.data || {total: 0, rows: []};
                }
            }
        }
        if (!opts.resize) {
            opt_.resize = function () {
                return {
                    height: $(window).height() - $("fieldset").height() - 15,
                    width: $(window).width()
                };
            };
        }
        var toolbar_ = [];
        if (opts.toolbar && typeof(opts.toolbar) == 'object') {
            toolbar_ = buildToolBar(opts.toolbar, opts);
        }
        if (toolbar_ && toolbar_.length > 0) {
            opts.toolbar = handleToolbar_(toolbar_);
        }
        if (_C && fcode && _C[fcode]) {
            opt_.queryParams = $.extend({}, {_c: _C[fcode]}, opts.queryParams || {});
        }
        opts = $.extend({}, opts, opt_);
        var $h = -1;
        try {
            if (typeof(opts.resize) == 'function') {
                var $wd = opts.resize();
                $h = $wd ? $wd.height : -1;
            } else {
                $h = opts.resize.height || -1
            }
            if ($h > 0) {
                opts.pageSize = parseInt($h / 32);
                opts.pageList = [pageSize];
            }
        } catch (ex) {
        }
        if (opts.pageSize <= 0) {
            opts.pageSize = 15;
        }
        var dg_ = null;
        var _data = opts.data;
        opts.data = undefined;
        if (opts.treeField) {
            opts.onContextMenu = function (e, row) {
                opt_.onRowContextMenu(e, null, row);
            };
            dg_ = $(thiz).treegrid(opts);
        } else {
            dg_ = $(thiz).datagrid(opts);
        }
        $(thiz).attr('identity', opts.identity);
        DG_STOCK[opts.identity] = {
            owner: thiz, columns: columns_, dgtype: opts.treeField ? "treegrid" : "datagrid",
            treeField: opts.treeField, queryParams: opts.queryParams,
            params: opts._params, url: opts.url, options: opts
        };
        if (opts.treeField) {
            if (_data)
                dg_.treegrid('loadData', _data);
        } else {
            if (_data)
                dg_.datagrid('loadData', _data);
        }

        var options_ = getDgOpts(opts.identity).options;
        var $dg = getDG(opts.identity);
        //$tds.find(".datagrid-editcell-rownumber").removeClass("datagrid-editcell-rownumber");
        if (options_.enableLineEdit) {
            var $tds = $dg.parent().find(".datagrid-view1");
            //$tds.off('click','*[datagrid-row-index]');
            var $header = $dg.parent().find(".datagrid-htable");
            $header.find(".datagrid-header-rownumber").html('<img src="/css/icons/page_edit.png" />');
            //$tds.find(".datagrid-cell-rownumber").addClass('datagrid-editcell-rownumber');
            $tds.on("click", '*[datagrid-row-index]', function (event) {
                var idx = parseInt($(this).attr("datagrid-row-index"));
                var row = $dg.datagrid('getRows')[idx];
                if (options_.lineEditWhole) {
                    if (isIndexEditing($dg, idx)) {
                        return;
                    }
                    $dg.datagrid('beginEdit', idx);
                    regainEditRow($dg, idx);
                } else {
                    var ___editcount = row.___editcount ? row.___editcount : 0;
                    if (opts.__c_editindex != undefined && opts.__c_editindex == idx) {
                        return;
                    }
                    if (row.__editing) {
                        return;
                        /* if(!$dg.datagrid('validateRow', idx)){
                             MsgAlert({ content : '验证失败', type :'error' });
                             return;
                         }
                         $dg.datagrid('endEdit', idx);
                         $dg.datagrid('updateRow', {index:idx,row:{'__editing': false }}); //与上行顺序不可变
                         opts.__l_editindex = undefined;*/
                    } else {
                        $dg.datagrid('updateRow', {
                            index: idx,
                            row: {'__editing': true, '___editcount': ___editcount + 1}
                        }); //与下行顺序不可变
                        $dg.datagrid('beginEdit', idx);
                        opts.__l_editindex = idx;
                    }
                }
            });
            $tds.on("click", '*[datagrid-row-index] img.e_ok_', function (event) {
                var idx = parseInt($(this).parents("*[datagrid-row-index]").attr("datagrid-row-index"));
                var row = $dg.datagrid('getRows')[idx];
                if (row.__editing) {
                    if (!$dg.datagrid('validateRow', idx)) {
                        MsgAlert({content: '验证失败', type: 'error'});
                        return;
                    }
                    $dg.datagrid('endEdit', idx);
                    setTimeout(function () {
                        $dg.datagrid('updateRow', {index: idx, row: {'__editing': false}}); //与上行顺序不可变
                        opts.__l_editindex = undefined;
                    }, 0);
                }
            });
            $tds.on("click", '*[datagrid-row-index] img.e_cancel_', function (event) {
                var idx = parseInt($(this).parents("*[datagrid-row-index]").attr("datagrid-row-index"));
                var row = $dg.datagrid('getRows')[idx];
                if (row.__editing) {
                    $dg.datagrid('cancelEdit', idx);
                    setTimeout(function () {
                        $dg.datagrid('updateRow', {index: idx, row: {'__editing': false}}); //与上行顺序不可变
                        opts.__l_editindex = undefined;
                    }, 0);

                }
            });
        } else {
            var $tds = $dg.parent().find(".datagrid-view1");
            //$tds.off('click','*[datagrid-row-index]');
            var $header = $dg.parent().find(".datagrid-htable");
            $header.find(".datagrid-header-rownumber").html('');
            $tds.find('*[datagrid-row-index]').unbind("click"); //, function(event){});
            $tds.find('*[datagrid-row-index] img.e_ok_').unbind("click");
            $tds.on('*[datagrid-row-index] img.e_cancel_').unbind("click");

            // $tds.on("click", '*[datagrid-row-index] img.e_ok_', function(event){});
            // $tds.on("click", '*[datagrid-row-index] img.e_cancel_', function(event){});
        }

        if (opt_.pagination) {
            var p = dg_.datagrid('getPager');
            $(p).pagination({
                showPageList: opts.showPageList != undefined ? opts.showPageList : true
            });
        }
        dg_.datagrid('resize', resize_(opts));


        $(window).resize(function () {
            setTimeout(function () {
                var res_ = resize_(opts);
                res_.width = res_.width - 24;
                dg_.datagrid('resize', res_);
                setTimeout(function () {
                    res_ = resize_(opts);
                    dg_.datagrid('resize', res_);
                }, 100);
            }, 100);
            /*console.log(opts.identity)
             console.log(resize_(opts));*/
        });
        dg_.datagrid('doCellTip', {'max-width': '200px'});
    }

    var TOOL_BAR = {
        "COMMON_ADD": function () {
            return {
                id: 'btnAdd',
                iconCls: 'icon-add'
            }
        },
        "COMMON_EDIT": function () {
            return {
                id: 'btnEdit',
                iconCls: 'icon-edit'
            }
        },
        "COMMON_DEL": function () {
            return {
                id: 'btnDel',
                iconCls: 'icon-remove'
            }
        },
        "COMMON_RELOAD": function () {
            return {
                id: 'btnReload',
                iconCls: 'icon-reload'
            }
        },
        "COMMON_UPLOAD": function () {
            return {
                id: 'btnUpload',
                iconCls: 'icon-20130406125647919_easyicon_net_16'
            }
        },
        "COMMON_DOWNLOAD": function () {
            return {
                id: 'btnDownload',
                iconCls: 'icon-20130406125519344_easyicon_net_16'
            }
        }
    };

    function buildToolBar(toolbar, opts) {
        var toolbar_ = [];
        $.each(toolbar, function (k, v) {
            if (typeof(v) != 'string' && v.key) {
                var v_ = $.extend({}, TOOL_BAR[v.key](), v);
                toolbar_.push(v_);
            } else {
                toolbar_.push(v);
            }
        });
        return toolbar_;
    }

    $.fn.MyDataGrid.defaults = {
        identity: '',
        url: '' // url
        , columns: [] // easyui datagrid columns
        , title: ''
        , toolbar: []
        , resize: null
    };

    function resize_(opts, dg_) {
        var width_ = $(document.body).width();
        var height_ = $(document.body).height();
        if (typeof(opts.resize) == 'function') {
            var r_ = opts.resize.call();
            width_ = r_['width'] ? r_['width'] : (r_[0] ? r_[0] : width_);
            height_ = r_['height'] ? r_['height'] : (r_[1] ? r_[1] : height_);
        }
        return {height: height_, width: width_};
    }

    function validOptions_(opts) {
        var m = ["columns"];
        var isc = true;
        $.each(m, function (k, v) {
            if (!opts[v] || (typeof(opts[v]) == 'string' && opts[v] == '')) {
                CLog("ERROR", "options [" + v + "] is required!")
                isc = false;
            }
        });
        return isc;
    }

    function CLog(err, msg) {
        if (window.console && window.console.log)
            console.log(err + ":" + msg);
        if (err == "ALERT") {
            alert(msg);
        }
    }

})(jQuery);

var edit_storage = {};

function insertEditRow($dg, rowData) {
    var editkey = $dg.data('editkey');
    if (!editkey) {
        editkey = "editkey_" + new Date().getTime();
        $dg.data('editkey', editkey);
    }
    $dg.datagrid('appendRow', rowData || {});
    var index = $dg.datagrid('getRows').length - 1
    $dg.datagrid('beginEdit', index);
    var storage = edit_storage[editkey] || [];
    if ($.inArray(index, storage) == -1) {
        storage.push(index);
        edit_storage[editkey] = storage;
    }
}

function regainEditRow($dg, index) {
    var editkey = $dg.data('editkey');
    if (!editkey) {
        editkey = "editkey_" + new Date().getTime();
        $dg.data('editkey', editkey);
    }
    var storage = edit_storage[editkey] || [];
    if ($.inArray(index, storage) == -1) {
        storage.push(index);
        edit_storage[editkey] = storage;
    }
}

function isIndexEditing($dg, index) {
    var editkey = $dg.data('editkey');
    if (!editkey) {
        editkey = "editkey_" + new Date().getTime();
        $dg.data('editkey', editkey);
    }
    var storage = edit_storage[editkey] || [];
    return $.inArray(index, storage) > -1;
}

function clearEditStorage($dg) {
    var editkey = $dg.data('editkey');
    if (editkey) {
        edit_storage[editkey] = [];
        delete (edit_storage[editkey])
    }
}

function getEditChangeData($dg) {
    var editkey = $dg.data('editkey');
    var indexs = edit_storage[editkey] || [];
    var chg = [];
    var isc = true;
    for (var i = 0; i < indexs.length; i++) {
        var b = $dg.datagrid('validateRow', indexs[i]);
        if (!b) {
            isc = false;
            break;
        }
    }
    if (isc) {
        for (var i = 0; i < indexs.length; i++) {
            $dg.datagrid('endEdit', indexs[i]);
        }
    } else {
        MsgAlert({content: '验证失败', type: 'error'});
        return null;
    }
    var rows = $dg.datagrid('getRows');
    for (var i = 0; i < indexs.length; i++) {
        if (rows.length > indexs[i]) {
            chg.push(rows[indexs[i]]);
        }
    }
    clearEditStorage($dg);
    return chg;
}

/**
 * 结束Cell编辑
 * @type {undefined}
 * @private
 */
var editCellIndex_ = undefined;

function endCellEditing(identity) {
    if (editCellIndex_ == undefined) {
        return true
    }
    var $dg = getDG(identity);
    if ($dg.datagrid('validateRow', editCellIndex_)) {
        $dg.datagrid('endEdit', editCellIndex_);
        editCellIndex_ = undefined;
        return true;
    } else {
        return false;
    }
}

function handleColumns_(columns_) {
    if (!columns_) {
        return columns_;
    }
    $.each(columns_, function (k, v) {
        if (v['field'] && v['functionCode']) {
            v['title'] = $.i18n.t('data_grid:RES.' + v['functionCode'] + ".DG." + v['field']);
        }
        if (v['type'] == 'datetime') {
            v['formatter'] = v['formatter'] || formatDateTime;
        } else if (v['type'] == 'date') {
            v['formatter'] = v['formatter'] || formatDate;
        } else if (v['type']) {
            v['formatter'] = v['formatter'] || function (value, row, index) {
                return formatDateTo(value, v['type'])
            };
        }
        if (v['editor']) {
            var edtype = v['editor']['type'];
            if (edtype == 'combobox' || edtype == 'combogrid') {
                v['formatter'] = v['formatter'] || function (value, row, index) {
                    return row[v['field'] + CBOX_DISPLAY_NAME];
                };
            } else if (edtype == 'checkbox') {
                v['formatter'] = v['formatter'] || function (value, row, index) {
                    if (v['editor']['options']['on'] == value) {
                        return v['editor']['options']['ontxt'];
                    } else if (v['editor']['options']['off'] == value) {
                        return v['editor']['options']['offtxt'];
                    }
                };
            }

        }
    });
    return columns_;
}

function handleToolbar_(toolbar) {
    var toolbar_ = toolbar.concat();
    $.each(toolbar_, function (k, item) {
        if (typeof(item) == 'object') {
            var result = true;
            if (item['auth']) {
                result = VALID_AUTH(item['auth']);
            }
            if (!result) {
                toolbar[k] = "REMOVE";
                if (typeof(toolbar_[k + 1]) == 'string' && toolbar_[k + 1] == '-')
                    toolbar[k + 1] = "REMOVE";
            }
        }
    });
    var tbar = [];
    $.each(toolbar, function (k, d) {
        if (toolbar[k] != 'REMOVE') {
            tbar.push(d);
        }
    });
    return tbar;
}

function getDgOpts(identity) {
    var result = {};

    if (identity && identity != "") {
        result = DG_STOCK[identity];
    } else {
        $.each(DG_STOCK, function (k, item) {
            result = item;
            return true;
        });
    }
    return result;
}

function getDG(identity) {
    var dgopt = getDgOpts(identity);
    if (!dgopt)
        return null;
    return $(dgopt.owner);
}

function onSearch_(identity, fromId, breforSearch) {
    fromId = fromId || "#ffSearch";
    var dgopt = getDgOpts(identity);
    var $dg = $(dgopt.owner);
    var url = dgopt.url;
    if ($dg && url) {
        var queryParams = $(fromId).serializeObject();
        queryParams = $.extend({}, dgopt.queryParams, dgopt._params, queryParams);
        if (typeof(breforSearch) == 'function') {
            breforSearch(queryParams);
        }
        clearAdvancedQueryData(queryParams);
        if (dgopt.treeField) {
            $dg.treegrid('load', queryParams);
        } else {
            $dg.datagrid('load', queryParams);
        }
    }
}

function onClear_(identity, fromId) {
    fromId = fromId || "#ffSearch";
    $(fromId).form('clear');
    onSearch_(identity, fromId);
}

/** 添加/编辑 */
function common_add_edit_(edopt) {
    var rowData = {};
    if (edopt.isEdit) {
        var dgopt = getDgOpts(edopt.identity);
        rowData = $(dgopt.owner).datagrid('getSelected');
        if (!rowData) {
            //layer.msg($.i18n.t('msg_err:ERRMSG.COMMON.NO_SELECT_ROW_ERROR'), {icon: 5});
            return;
        }
    }
    edopt.param = edopt.param || {};
    var title_ = edopt.isEdit ? 'common:COMMON_OPERATION.EDIT' : 'common:COMMON_OPERATION.ADD';
    if (edopt.title) {
        title_ = edopt.title;
    }
    edopt.param = $.extend({}, rowData, edopt.param)
    ShowWindowIframe({
        width: edopt.width ? edopt.width : 600,
        height: edopt.height ? edopt.height : 320,
        title: title_,
        param: edopt.param,
        url: edopt.url
    });
}

function common_page_(edopt) {
    var rowData = {};
    if (edopt.checkRowData) {
        var dgopt = getDgOpts(edopt.identity);
        rowData = $(dgopt.owner).datagrid('getSelected');
        if (!rowData) {
            MsgAlert({PWindow: window, content: $.i18n.t('msg_err:ERRMSG.COMMON.NO_SELECT_ROW_ERROR')});
            return;
        }
    }
    edopt.param = edopt.param || {};
    var title_ = edopt.checkRowData ? $.i18n.t('common:COMMON_OPERATION.EDIT') : $.i18n.t('common:COMMON_OPERATION.ADD');
    if (edopt.title) {
        title_ = edopt.title;
    }
    edopt.param = $.extend({}, rowData, edopt.param);
    ShowWindowIframe({
        width: edopt.width ? edopt.width : 600,
        height: edopt.height ? edopt.height : 320,
        title: title_,
        param: edopt.param,
        url: edopt.url
    });
}

/** 通用删除 */
function common_delete_(copt) {
    common_confirm_(copt);
}

function common_confirm_(copt) {
    copt = $.extend({}, {checkRowData: true}, copt);
    var rowData = {};
    if (copt.checkRowData) {
        rowData = getDG(copt.identity).datagrid('getSelected');
        if (!rowData) {
            layer.msg($.i18n.t('msg_err:ERRMSG.COMMON.NO_SELECT_ROW_ERROR'), {icon: 5});
            return;
        }
    }
    var ci18next = copt.cfmI18next ? copt.cfmI18next : 'msg_err:ERRMSG.COMMON.DEL_CONFIRM';
    layerConfirm_({
        content: $.i18n.t(ci18next),
        yesFunc: function (index) {
            var d_ = {};
            $.each((copt.param ? copt.param : {pkid: "PKID"}), function (k, v) {
                if (typeof(v) == 'string') {
                    d_[k] = rowData[v] != undefined ? rowData[v] : "";
                }
            });
            d_.FunctionCode = copt.FunctionCode;
            if (copt.param.data)
                d_ = $.extend({}, d_, copt.param.data);
            MaskUtil.mask("处理中...");
            InitFuncCodeRequest_({
                data: d_,
                successCallBack: function (jdata) {
                    MaskUtil.unmask();
                    layerStandardMsg_(jdata, index, function () {
                        common_reload_(copt);
                        if (copt.successCallBack) {
                            copt.successCallBack(jdata);
                        }
                    });
                }
            });
        }
    });
}

function common_update_(copt) {
    copt = $.extend({}, {checkRowData: true}, copt);
    var rowData = {};
    if (copt.checkRowData) {
        rowData = getDG(copt.identity).datagrid('getSelected');
        if (!rowData) {
            layer.msg($.i18n.t('msg_err:ERRMSG.COMMON.NO_SELECT_ROW_ERROR'), {icon: 5});
            return;
        }
    }
    var ci18next = copt.cfmI18next ? copt.cfmI18next : 'msg_err:ERRMSG.COMMON.DEL_CONFIRM';

    layerConfirm_({
        content: ci18next,
        yesFunc: function (index) {
            var d_ = {};
            $.each((copt.param ? copt.param : {pkid: "PKID"}), function (k, v) {
                if (typeof(v) == 'string') {
                    d_[k] = rowData[v] ? rowData[v] : "";
                }
            });
            d_.FunctionCode = copt.FunctionCode;
            if (copt.param.data)
                d_ = $.extend({}, d_, copt.param.data);
            if (typeof copt.CallRequest == 'function') {
                copt.CallRequest(d_);
                return;
            }
            InitFuncCodeRequest_({
                data: d_,
                successCallBack: function (jdata) {
                    layerStandardMsg_(jdata, index, function () {
                        common_reload_(copt);
                    });
                }
            });
        }
    });
}


/** 导入/上传 */
function common_uploadFile(edopt) {
    var title_ = $.i18n.t('common:COMMON_OPERATION.UPLOAD');
    ShowWindowIframe({
        width: 575,
        height: 200,
        title: title_,
        param: $.extend({}, edopt.param),
        url: "/views/impoertExcelData/attachment_add.shtml"
    });
}

/** 导入/上传（文件不上传FTP，导入成功后再决定是否上传） */
function common_uploadFile2(edopt) {
    var title_ = $.i18n.t('common:COMMON_OPERATION.UPLOAD');
    ShowWindowIframe({
        width: 575,
        height: 200,
        title: title_,
        param: $.extend({}, edopt.param),
        url: "/views/impoertExcelData/attachment_import.shtml"
    });
}

//下载
function downFile(pkid, filename) {
    InitFuncCodeRequest_({
        data: {pkid: pkid, filename: filename, FunctionCode: 'ATTACHMENT_DOWN'},
        successCallBack: function (jdata) {
            if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                doPost(Constant.API_URL + "/ATTACHMENT_DOWN", {pkid: pkid, filename: filename, down: 'Y'});
            } else {
                MsgAlert({content: jdata.msg, type: 'error'});
            }
        }
    });
}

/** 下载HTTP方式 */
function downFile2(pkid, myurl, filename) {
    InitFuncCodeRequest_({
        data: {pkid: pkid, myurl: myurl, filename: filename, FunctionCode: 'SYS_HTTP_FTP_DOWN'},
        successCallBack: function (jdata) {
            if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                doPost(Constant.API_URL + "SYS_HTTP_FTP_DOWN", {
                    pkid: pkid,
                    myurl: myurl,
                    filename: filename,
                    down: 'Y'
                });
            } else {
                MsgAlert({content: jdata.msg, type: 'error'});
            }
        }
    });
}

function deleteFile(pkid) {
    if (!confirm("是否刪除"))
        return;
    InitFuncCodeRequest_({
        data: {pkid: pkid, FunctionCode: 'ATTACHMENT_DEL'},
        successCallBack: function (jdata) {
            if (jdata.code == 200) {
                MsgAlert({content: jdata.msg ? jdata.msg : $.i18n.t('msg_tip:TIP.COMMON.OPT_SUCCESS')});
                reload_()
            }
        }
    });
}


/** 下载 */
function common_download_(copt) {
    var dgopt = getDgOpts(copt.identity);
    var $dg = $(dgopt.owner);
    var rowData = $dg.datagrid('getSelected');
    if (!rowData) {
        layer.msg($.i18n.t('msg_err:ERRMSG.COMMON.NO_SELECT_ROW_ERROR'), {icon: 5});
        return;
    }

    /* var d_ = {};
     $.each((copt.param ? copt.param : {FILE_KEY:"FILE_KEY"}),function(k,v){
         if(typeof(v) == 'string'){
             d_[k] = rowData[v] ? rowData[v] : "";
         }
     });*/
}

function common_reload_(copt) {
    var dgopt = getDgOpts(copt.identity);
    var $dg = $(dgopt.owner);
    if ($dg)
        $dg.datagrid("reload");
}

var _AdvancedQueryParam = '_q0mz_';

function doAdvancedQuery(identity, queryData) {
    var dgopt = getDgOpts(identity);
    var $dg = $(dgopt.owner);
    var url = dgopt.url;
    if ($dg && url) {
        var queryParams = $.extend({}, dgopt.queryParams, queryData || {});
        /*if(typeof(breforSearch) == 'function'){
            breforSearch(queryParams);
        }*/
        if (dgopt.treeField) {
            $dg.treegrid('load', queryParams);
        } else {
            $dg.datagrid('load', queryParams);
        }
    }
}

function clearAdvancedQuerySortData(data) {
    if (typeof(data[_AdvancedQueryParam + 'sort']) != 'undefined') {
        data[_AdvancedQueryParam + 'sort'] = '';
    }
}

function clearAdvancedQueryData(data) {
    if (typeof(data[_AdvancedQueryParam]) != 'undefined') {
        data[_AdvancedQueryParam] = '';
    }
    if (typeof(data[_AdvancedQueryParam + 'sort']) != 'undefined') {
        data[_AdvancedQueryParam + 'sort'] = '';
    }
}

/**
 *
 * @param jQtarget
 * @param cht （除去eht后的，固定值或比例值）
 * @param cwd（除去ewd后的，固定值或比例值）
 * @param eht number 去除的高 固定值
 * @param ewd number 去除的宽 固定值
 * @returns {{width: number, height: number}}
 */
function tabs_standard_resize(jQtarget, cht, cwd, eht, ewd) {
    var wd = jQtarget.width();
    var ht = jQtarget.height();
    var b_ = 0;
    if (jQtarget.hasClass('easyui-tabs') || jQtarget.parents('.easyui-tabs').length > 0) {
        b_ = 6;
    }
    var kwd = wd - b_ - (typeof(ewd) == 'undefined' ? 0 : ewd);
    var kht = ht - 5 - 40 - (typeof(eht) == 'undefined' ? 0 : eht);
    cwd = typeof(cwd) == 'undefined' ? 0 : (cwd <= 1.0 && cwd > 0 ? kwd * cwd : cwd);
    cht = typeof(cht) == 'undefined' ? 0 : (cht <= 1.0 && cht > 0 ? kht * cht : cht);
    return {
        width: kwd - cwd, height: kht - cht
    };
}

function insertFailRow(identity, index) {
    getDG(identity).datagrid('updateRow', {index: index, row: {'__editing': true, '___editcount': 1}}); //与下行顺序不可变
    getDG(identity).datagrid('beginEdit', index);
}

function diableDatagrid(identity, enable) {
    getDgOpts(identity).options.enableLineEdit = enable;
    getDG(identity).datagrid('reload');
}