/**
 * Created by tiansj on 15/7/12.
 * common层提供可复用的组件，供page层使用。
 */

(function ($) {
    $.fn.extend({
        /**
         * JQuery EasyUI DataGrid 扩展方法
         * 修改DataGrid对象的默认大小，以适应页面宽度。
         * @param heightMargin 高度对页内边距的距离。
         * @param widthMargin 宽度对页内边距的距离。
         * @param minHeight 最小高度。
         * @param minWidth 最小宽度。
         */
        resizeDataGrid: function (heightMargin, widthMargin, minHeight, minWidth) {
            var height = $(document.body).height() - heightMargin;
            var width = $(document.body).width() - widthMargin;
            height = height < minHeight ? minHeight : height;
            width = width < minWidth ? minWidth : width;
            $(this).datagrid('resize', {
                height: height,
                width: width
            });
        },
        /**
         * JQuery EasyUI TreeGrid 扩展方法
         * 修改TreeGrid对象的默认大小，以适应页面宽度。
         * @param heightMargin 高度对页内边距的距离。
         * @param widthMargin 宽度对页内边距的距离。
         * @param minHeight 最小高度。
         * @param minWidth 最小宽度。
         */
        resizeTreeGrid: function (heightMargin, widthMargin, minHeight, minWidth) {
            var height = $(document.body).height() - heightMargin;
            var width = $(document.body).width() - widthMargin;
            height = height < minHeight ? minHeight : height;
            width = width < minWidth ? minWidth : width;
            $(this).treegrid('resize', {
                height: height,
                width: width
            });
        },

        /**
         * Form 表单序列化为JSON对象
         * 使用方法：$('#ffSearch').serializeObject()
         * @returns {{}}
         */
        serializeObject: function () {
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
     * JQuery EasyUI ValidateBox 扩展方法
     */
    $.extend($.fn.validatebox.defaults.rules, {
        minLength: {
            validator: function (value, param) {   //value 为需要校验的输入框的值 , param为使用此规则时存入的参数
                return value.length >= param[0];
            },
            message: '请输入最小{0}位字符.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        maxLength: {
            validator: function (value, param) {
                return param[0] >= value.length;
            },
            message: '请输入最大{0}位字符.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        length: {
            validator: function (value, param) {
                return value.length >= param[0] && param[1] >= value.length;
            },
            message: '请输入{0}-{1}位字符.'
        }
    });

    // extend the 'equals' rule
    $.extend($.fn.validatebox.defaults.rules, {
        equals: {
            validator: function (value, param) {
                return value == $(param[0]).val();
            },
            message: '不相同.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        web: {
            validator: function (value) {
                return /^(http[s]{0,1}|ftp):\/\//i.test($.trim(value));
            },
            message: '网址格式错误.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        mobile: {
            validator: function (value) {
                return /^1[0-9]{10}$/i.test($.trim(value));
            },
            message: '手机号码格式错误.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        checkTrim: {
            validator: function (value) {
                return /^[^ ]+$/i.test($.trim(value));
            },
            message: '格式错误,含有空格字符'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        date: {
            validator: function (value) {
                return /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/i.test($.trim(value));
            },
            message: '曰期格式错误,如2012-09-11.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        numAndLetter: {
            validator: function (value) {
                return /^[A-Za-z0-9]+$/i.test($.trim(value));
            },
            message: '输入格式错误,请输入A-Z，a-z,0-9之间的的字符.'
        }
    });

    $.extend($.fn.validatebox.defaults.rules, {
        email: {
            validator: function (value) {
                return /^[a-zA-Z0-9_+.-]+\@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,4}$/i.test($.trim(value));
            },
            message: '电子邮箱格式错误.'
        },

        chinese: {// 验证中文
            validator: function (value) {
                return /^[\u4e00-\u9fa5]{0,}$/i.test(value);
            },
            message: '请输入中文'
        },
        english: {// 验证英语
            validator: function (value) {
                return /^[A-Za-z]+$/i.test(value);
            },
            message: '请输入英文'
        },
        field: {// 验证
            validator: function (value) {
                return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value);
            },
            message: '格式不正确'
        },
        unnormal: {// 验证是否包含空格和非法字符
            validator: function (value) {
                return /.+/i.test(value);
            },
            message: '输入值不能为空和包含其他非法字符'
        },
        ucode: {
            validator: function (value, param) {
                var s = param && param[0] ? param[0] : 3;
                var e = param && param[1] ? param[1] : 10;
                var reg = new RegExp("^[a-zA-Z][a-zA-Z0-9\\_]{" + s + "," + e + "}$");
                return reg.test(value);
            },
            message: '格式输入错误! 英文开头字符,"_",数字'
        },
        regtxt: {
            validator: function (value, param) {
                var regtxt = param[0];
                var reg = new RegExp(regtxt);
                return reg.test(value);
            },
            message: '格式输入错误!'
        },
        normal: {//包含字符,ABC123,及特殊字符-或_，最大四十
            validator: function (value, param) {
                var s = param && param[0] ? param[0] : 3;
                var e = param && param[1] ? param[1] : 10;
                return /^[0-9a-zA-Z\-_]{0,40}$/i.test(value);
                return reg.test(value);
            },
            message: '格式输入错误! 字符,及特殊字符-或_'

        },
        number: {//包含字符,ABC123,及特殊字符-或_，最大四十
            validator: function (value, param) {
                return /^([0-9]+)$/.test(value);
                return reg.test(value);
            },
            message: '请输入整数'

        },
        capital: {//大写英文字母
            validator: function (value, param) {
                return /^[A-Z]{3}$/.test(value);
                return reg.test(value);
            },
            message: '请输入三位大写英文字母'

        }
    });


    $.extend($.fn.validatebox.defaults.rules, {
        captcha: {
            validator: function (value) {
                var data0 = false;
                $.ajax({
                    type: "POST", async: false,
                    url: contextPath + "/json/valSimulation.action",
                    dataType: "json",
                    data: {"simulation": value},
                    async: false,
                    success: function (data) {
                        data0 = data;
                    }
                });

                return data0;
// 			        	return /^[a-zA-Z0-9]{4}$/i.test($.trim(value));
            },
            message: '验证码错误.'
        }
    });

})(window.jQuery);

function ComboboxOnHidePanel() {
    var valueField = $(this).combobox("options").valueField;
    var textField = $(this).combobox("options").textField;
    var val = $(this).combobox("getValue");  //当前combobox的值
    var text = $(this).combobox("getText");
    var allData = $(this).combobox("getData");   //获取combobox所有数据
    var result = true;      //为true说明输入的值在下拉框数据中不存在
    $.each(allData, function (k, item) {
        if (val == item[valueField] && item[textField] == text) {
            result = false;
        }
    });
    if (result) {
        $(this).combobox("clear");
    }
}

// 全局皮肤模版
var themes = {
    'gray': '/themes/gray/easyui.css',
    'bootstrap': '/themes/bootstrap/easyui.css',
    'default': '/themes/default/easyui.css',
    'metro': '/themes/metro/easyui.css'
};

// 更新皮肤
function updateSkin() {
    if ($.cookie('cs-skin')) {
        var skin = $.cookie('cs-skin');
        $('#swicth-style').attr('href', themes[skin]);
        var self = $('.li-skinitem span[rel=' + skin + ']');
        self.addClass('cs-skin-on');
    }
}

/**
 日期格式化：
 var date = new Date(long time);
 date.Format("yyyy-MM-dd");
 date.Format("yyyy-MM-dd HH:mm:ss");
 var weekStr = "星期" + date.Format("w");
 */
Date.prototype.Format = function (formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];

    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

    str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g, (this.getMonth() + 1));

    str = str.replace(/w|W/g, Week[this.getDay()]);

    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());

    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());

    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());

    return str;
}

function formatDateTime(value) {
    if (value) {
        try {
            return new Date(value).Format("yyyy-MM-dd HH:mm:ss");
        } catch (e) {
        }
    }
    return "";
}

function formatDateTo(value, format) {
    if (value) {
        try {
            return new Date(value).Format(format);
        } catch (e) {
        }
    }
    return "";
}

function formatDate(value) {
    try {
        if (value && typeof (value) == 'string') {
            value = value.replace(new RegExp(/-/gm), "/")
            return new Date(value).Format("yyyy-MM-dd");
        } else if (value) {
            return new Date(value).Format("yyyy-MM-dd");
        }
    } catch (e) {
    }
    return "";
}

/*
 *  文件上传封装
 */
function file_upload(op) {
    var options = {
        secureuri: false, //是否需要安全协议，一般设置为false
        fileElementId: 'file', //文件上传域的ID
        dataType: 'json', //返回值类型 一般设置为json
        success: function (data, status)  //服务器成功响应处理函数
        {
        },
        error: function (data, status, e)//服务器响应失败处理函数
        {
            alert(e);
        }
    }
    options = jQuery.extend(options, op);
    $.ajaxFileUpload(options);
}

/**
 * 验证input file 文件后缀类型
 * @param jQfile
 * @param extStr
 * @returns {boolean}
 * @private
 */
function validFileSuffix_(jQfile, extStr) {
    var filepath = jQfile.val();
    var extStart = filepath.lastIndexOf(".");
    var ext = filepath.substring(extStart, filepath.length).toUpperCase();
    extStr = ("," + extStr + ",").toUpperCase();
    if (extStr.indexOf("," + ext + ",") > -1) {
        return true;
    } else {
        return false;
    }
}

function ShowWindowIframe(opts) {
    if (SHOW_WINDOW_TYPE == '1') {
        ShowWindowIframe1(opts);
    } else if (SHOW_WINDOW_TYPE == '2') {
        ShowWindowIframe2(opts);
    }
}

function ShowWindowIframe1(opts) {
    var time_ = new Date().getTime();
    var url_ = opts.url; //"";
    /*var i = opts.url.indexOf("?");
    if (i > -1) {
        url_ = opts.url + (i == opts.url.length - 1 ? "" : "&") + "_v_=" + time_
    } else {
        url_ = opts.url + "?_v_=" + time_
    }*/
    opts = $.extend({}, opts,  {url: url_});
    var win_key_ = 'win_0_' + time_;
    var GParam = getParentParam1_();
    var PWindow = GParam['PWindow'] || window.top;
    var OWindow = window;
    opts.param = opts.param || {};

    var caKey = encodeBase64_(opts.url + "@" + JSONstringify(opts.param));
    window.top.SWIN = window.top.SWIN ||{};
    if(window.top.SWIN[caKey]){
        if(window.top.SWIN[caKey].closed){
            delete (window.top.SWIN[caKey]);
        }else{
            window.top.SWIN[caKey].blur();setTimeout(window.top.SWIN[caKey].focus(),0);
            return;
        }
    }

    var w_ = $(PWindow.document).width() - 20;
    var h_ = $(PWindow.document).height();
    opts.width = typeof(opts.width) == 'string' && opts.width.indexOf('px') > -1 ? parseInt(opts.width.replace('px')) : opts.width;
    opts.height = typeof(opts.height) == 'string' && opts.height.indexOf('px') > -1 ? parseInt(opts.height.replace('px')) : opts.height;
    var width_ = typeof(opts.width) == 'string' && opts.width.indexOf('%') > -1 ? w_ * (parseInt(opts.width.replace('%')) / 100) : opts.width;
    var height_ = typeof(opts.height) == 'string' && opts.height.indexOf('%') > -1 ? h_ * (parseInt(opts.height.replace('%')) / 100) : opts.height;
    var l_ = (w_ - width_) / 2;
    var t_ = (h_ - height_) / 2;
    var SWindow = window.open(opts.url, win_key_, 'toolbar=no,scrollbars=yes,status=no,menubar=no,directories=no,resizable=no,height=' + height_ + ',width=' + width_ + ',left=' + l_ + ',top=' + t_);
    window.top.SWIN[caKey] = SWindow;

    opts.param = $.extend({}, {OWindow: OWindow, PWindow: PWindow, SWindow: SWindow, WIN_KEY: win_key_}, opts.param);
    window['WindowParam'] = window['WindowParam'] || {};
    window['WindowParam']['K' + win_key_] = opts.param;

    window.onunload = function () {
        CloseWindowIframe1(false);
    };

    var wkey = $("iframe[name='" + OWindow.name + "']", PWindow.document).data('id');
    var warry = PWindow.P_WINDOWS[wkey] || [];
    warry.push({WINDOW: SWindow});
    PWindow.P_WINDOWS[wkey] = warry;
    setTimeout(function () {
        try {
            $(SWindow.document).attr('title', $.i18n.t(opts.title));
        } catch (e) {
        }
    }, 200);
}

function encodeBase64_(str){
    var _s = new Base64().encode(str);
    return _s;
}

function JSONstringify(o) {
    var cache = [];
    return JSON.stringify(o, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if(isWindow(value)){
                return;
            }
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
}

function isWindow(obj){
    if(!obj || !obj.window || !obj.document )
        return false;
    var expando = "dom"+(new Date-0)    //生成一个随机变量名
    var doc = obj.document;
    //全局解析代码，IE的eval只对原作用域有效
    //加之eval与with是 html5严格模式下要禁止的东西，弃之不用！
    try{
        var js =  doc.createElement("script");
        var head = doc.getElementsByTagName("head")[0];
        head.insertBefore(js,head.firstChild);
        js.text = expando + " = {};"
        head.removeChild(js);
        var ret =  (doc.parentWindow || doc.defaultView)[expando] === obj[expando];
        obj[expando] = void 0;
    }catch(e){
        return false;
    }
    return ret;
}

function ShowWindowIframe2(opts) {
    var time_ = new Date().getTime();
    var url_ = "";
    var i = opts.url.indexOf("?");
    if (i > -1) {
        url_ = opts.url + (i == opts.url.length - 1 ? "" : "&") + "_v_" + time_
    } else {
        url_ = opts.url + "?_v_" + time_
    }
    opts = $.extend({}, {url: url_}, opts);
    var win_key_ = 'win_0_' + time_;
    opts.param = opts.param || {};
    opts.param = $.extend({}, {OWindow: window, PWindow: parent, WIN_KEY: win_key_}, opts.param);
    var pkey = opts.param['P_'] ? opts.param['P_'] : "K" + win_key_;
    opts.param.PWindow.document[pkey] = opts.param;
    var jqWindow = opts.param.PWindow.$("<div id='" + win_key_ + "' class='_iwin' />");
    window.top.EY_WINDOWS[win_key_] = jqWindow;
    jqWindow.window({
        width: opts.width,
        height: opts.height,
        minimizable: opts.minimizable ? opts.minimizable : true,
        maximizable: opts.maximizable ? opts.maximizable : true, draggable: true,
        onMove: function (left, top) { // popwindow拖动时触发，限制弹出框拖动范围
            if (left < 0) {
                jqWindow.window("resize", {left: 0});
            }
            if (top < 0) {
                jqWindow.window("resize", {top: 0});
            }
        },
        onMinimize: function () {
            //最下化移动到任务栏
            window.top.addTag($.i18n.t(opts.title), {
                key: win_key_,
                attrs: {win_key_: win_key_},
                tagClick: function (target) {
                    var state = jqWindow.data("state");
                    if (state == 'open') {
                        jqWindow.data('state', 'minimize');
                        jqWindow.window('minimize');
                    } else {
                        jqWindow.data('state', 'open');
                        jqWindow.window('open');
                    }

                },
                tagRemove: function (target) {
                    jqWindow.window('close');
                }
            });
            jqWindow.data('state', 'minimize');
        },
        modal: opts.modal ? opts.modal : false,
        title: $.i18n.t(opts.title),
        content: '<iframe name="' + win_key_ + '" style="width:100%;height:98%;border:0;" '
        + 'frameborder="0" src="' + opts.url + '"></iframe>',
        onClose: function () {
            window.top.$("span.tag[key_='" + win_key_ + "']").remove();
            window.top.EY_WINDOWS[win_key_] = null;
            opts.param.PWindow.$("#" + win_key_).window('destroy');
            opts.param.PWindow.document[pkey] = undefined;
            var closeCb = opts.param['CloseCallBack'];
            if (typeof(closeCb) == 'function') {
                closeCb(opts.param);
                return;
            }
            //(opts.param['CloseCallBback']||'WinIframeOnClose');
            /* if(typeof(opts.param.OWindow[closeCb]) == 'function'){
             opts.param.OWindow[closeCb](opts.param);
             return;
             }
             if(typeof(opts.param.PWindow[closeCb]) == 'function'){
             opts.param.PWindow[closeCb](opts.param);
             return;
             }*/
        }
    });
    opts.param.PWindow.$('#' + win_key_).parent().find('.panel-title').attr('data-i18n', opts.title);
}

/**
 * layer
 * @param opts
 * @constructor 作废
 */
function ShowWindowIframe3(opts) {
    if (opts.param)
        document[opts.param['p_'] ? opts.param['p_'] : 'UrlParam_'] = opts.param;
    var url_ = "";
    var i = opts.url.indexOf("?");
    if (i > -1) {
        url_ = opts.url + (i == opts.url.length - 1 ? "" : "&") + "_v_" + new Date().getTime()
    } else {
        url_ = opts.url + "?_v_" + new Date().getTime()
    }
    var options_ = {
        type: 2,
        title: opts.title,
        shade: 0.8,
        maxmin: false, //最大化最小化按钮
        area: [opts.width + 'px', opts.height + 'px'], //宽高
        content: url_
    };
    if (opts.btn) {
        var btn_ = [];
        var n = 1;
        $.each(opts.btn, function (k, v) {
            btn_.push(k);
            options_['btn' + n] = v;
            n++;
        });
        options_.btn = btn_;
    }
    (opts.parent ? parent.layer : layer).open(options_);
}

function CloseSWindowIframe() {
    CloseWindowIframe1();
}

function CloseWindowIframe() {
    if (SHOW_WINDOW_TYPE == '1') {
        CloseWindowIframe1(true);
    } else if (SHOW_WINDOW_TYPE == '2') {
        CloseWindowIframe2();
    }
}

function findSWindows(swindow) {
    var wins = [];
    var SWindow;
    $.each(swindow['WindowParam'], function (k, p) {
        if (p.SWindow) {
            wins.push(p.SWindow);
            wins = wins.concat(findSWindows(p.SWindow));
        }
    });
    return wins;
}

function CloseWindowIframe1(flag) {
    var wins = findSWindows(window);
    if (flag) {
        wins.unshift(window);
    }
    for (var i = wins.length - 1; i > -1; i--) {
        wins[i].close();
    }
}

function CloseWindowIframe2() {
    var opts = getParentParam_();
    opts.PWindow.$("#" + opts.WIN_KEY).window('destroy');
}

function setWinTitle(title) {
    if (SHOW_WINDOW_TYPE == '1') {
        setWinTitle1(title);
    } else if (SHOW_WINDOW_TYPE == '2') {
        setWinTitle2(title);
    }
}

function setWinTitle1(title) {
    $(window.document).attr('title', title);
}

function setWinTitle2(title) {
    var opts = getParentParam2_();
    opts.PWindow.$("#" + opts.WIN_KEY).window('setTitle', title);
}

function MsgPrompt(opts) {
    var time_ = new Date().getTime();
    var win_key_ = 'win_0_' + time_;
    opts = $.extend({}, {
        title: "提示",
        msg: "请输入内容:",
        content: '<input class="messager-input" type="text">',
        yes: function () {
            var r = $("#" + win_key_).find("input:text").val();
            var isClose_ = true;
            if (opts.yesFunc) {
                isClose_ = opts.yesFunc(r);
                isClose_ = isClose_ == undefined ? true : false;
            }
            if (isClose_) {
                $("#" + win_key_).window('destroy');
            }
        },
        no: function () {
            var r = $("#" + win_key_).find("input:text").val();
            var isClose_ = true;
            if (opts.noFunc) {
                isClose_ = opts.noFunc(r);
                isClose_ = isClose_ == undefined ? true : false;
            }
            if (isClose_) {
                $("#" + win_key_).window('destroy');
            }
        }
    }, opts);
    var h = '<div class="messager-body panel-body panel-body-noborder window-body" title="" style="min-height: 36px;">' +
        '<div class="messager-icon messager-question"></div><div>'
        + opts.msg + '</div><br><div style="clear:both;"></div><div>'
        + opts.content + '</div></div>' +
        '<div style="padding: 5px; text-align: center;">' +
        '<a href="javascript:void(0);" id="_yes" class="easyui-linkbutton" icon="icon-ok">确定</a> ' +
        '&nbsp;&nbsp;&nbsp;&nbsp;' +
        '<a href="javascript:void(0);" id="_no" class="easyui-linkbutton"' +
        ' icon="icon-cancel">取消</a>' +
        '</div>';

    $("<div id='" + win_key_ + "' />").window({
        width: opts.width || 380,
        height: opts.height || 180,
        minimizable: opts.minimizable || false,
        maximizable: opts.maximizable || false,
        modal: opts.modal ? opts.modal : true,
        title: opts.title,
        content: h,
        onClose: function () {
            $("#" + win_key_).window('destroy');
        }
    });
    $("#" + win_key_).find("#_yes").bind("click", function () {
        opts.yes()
    });
    $("#" + win_key_).find("#_no").bind("click", function () {
        opts.no()
    });
}

function MsgAlert3(opts) {
    //error,question,info,warning.
    opts = $.extend({}, {
        title: '提示', content: '操作完成!', type: 'info', callback: function () {
        }, PWindow: parent, time: 3
    }, opts);
    opts.PWindow.$.messager.alert(opts.title, opts.content, opts.type, opts.callback);
    if (opts.time) {
        var interval;
        var time = 1000;
        var x = opts.time;
        interval = opts.PWindow.setInterval(fun, time);
        function fun() {
            --x;
            if (x == 0) {
                opts.PWindow.$(".messager-body").window('destroy');
                if (interval) {
                    opts.PWindow.clearInterval(interval);
                }
            }
            opts.PWindow.$(".messager-window .panel-title").text(opts.title + "（" + x + "秒后关闭）");
        }
    }
}

function MsgAlert(opts) {
    var icon_ = {'info': 1, 'error': 5, 'warn': 3};
    //var win = getParentParam_().PWindow || window;
    opts = $.extend({}, {PWindow: window, type: 'info'}, opts);
    if (opts.type == 'error' || opts.type == 'warn') {
        opts.PWindow.layer.msg(opts.content, {closeBtn: [0, true], time: -1, icon: icon_[opts.type]});
    } else {
        opts.PWindow.layer.msg(opts.content, {icon: icon_[opts.type]});
    }
}

/*function MsgAlert2(opts) {
 var icon_ = {'info': 1, 'error': 5};
 opts = $.extend({}, {PWindow: parent, type: 'info'}, opts);
 if (opts.type == 'error') {
 opts.PWindow.layer.msg(opts.content, {closeBtn: [0, true], time: -1, icon: icon_[opts.type]});
 } else {
 opts.PWindow.layer.msg(opts.content, {icon: icon_[opts.type]});
 }
 }*/

function getParentParam_(pkey) {
    if (SHOW_WINDOW_TYPE == '1') {
        return getParentParam1_(pkey);
    } else if (SHOW_WINDOW_TYPE == '2') {
        return getParentParam2_(pkey);
    }
}

function getParentParam1_(pkey) {
    /*    var PWindow = window['PWindow'] || window.top;
     return PWindow[pkey] || {};*/
    pkey = pkey ? pkey : "K" + window.name;
    var qParam = GetRequestString();
    var res = {};
    if (window.opener != null && !window.opener.closed) {
        res = window.opener['WindowParam'] ? window.opener['WindowParam'][pkey] : {};
    }
    return $.extend({}, qParam, res);
}

function getParentParam2_(pkey) {
    pkey = pkey ? pkey : "K" + window.name;
    var qParam = GetRequestString();
    var res = parent.document[pkey] || {};
    return $.extend({}, qParam, res);
}

function GetRequestString() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function AjaxCall_(url, args, func_s, func_e, opts) {
    var options = {
        url: url,
        data: args,
        success: function (result) {
            if (AjaxSuccess(result)) {
                if ($.isFunction(func_s)) {
                    func_s(result);
                } else {
                    MsgAlert({content: result, type: 'error'});
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if ($.isFunction(func_e)) {
                func_e(errorThrown);
            } else {
                MsgAlert({content: errorThrown, type: 'error'});
            }
        }
    };
    options = $.extend({}, options, (opts || {}));
    Ajax_(options);
}

function AjaxSuccess(result) {
    if (!result) {
        return false;
    }
    if (result.code == RESULT_CODE.NO_LOGIN_CODE) {
        //MsgAlert({ content : jdata.msg ? jdata.msg : $.i18n.t('msg_err:ERRMSG.COMMON.OPT_SUCCESS')  });
        layer.open({
            icon: 5,
            content: $.i18n.t('msg_err:ERRMSG.COMMON.NOT_LOGIN'),
            yes: function (index, layero) {
                var PWindow = getParentParam_().PWindow;
                if (PWindow) {
                    PWindow.top.closeAllPWindows();
                    PWindow.doPost("/security/redirect", {path: "/login.shtml"});
                    //PWindow.location.href = "/login.shtml";
                    window.close();
                } else {
                    //window.location.href = "/login.shtml";
                    doPost("/security/redirect", {path: "/login.shtml"});
                }
                layer.close(index);
            }
        });
        return false;
    }
    if (result && result.msg) {
        result.msg = $.i18n.t("msg_err:" + result.msg);
        var reg = new RegExp("#\{[0-9]{1,}\}", 'g');
        var res = result.msg.match(reg) || [];
        for (var i = 0; i < res.length; i++) {
            result.msg = result.msg.replace(res[i], ((result.msgData && result.msgData[i]) || ''));
        }
    }
    return true;
}

function Ajax_(opts) {
    opts = $.extend({}, {
        type: 'post', data: '', dataType: 'json'}, opts);
    $.ajax(opts);
}

function ParseFormField_(data, jQtarget, transform) {
    if (!data) return;
    if (transform && transform == "CamelCase") {
        data = toCamelCase(data);
    }
    var jQtarget_ = jQtarget ? jQtarget : $(document);
    $.each(data, function (k, v) {
        var jQt = jQtarget_.find("*[textboxname='" + k + "']");
        if (jQt.length <= 0) {
            var tar = jQtarget_.find("*[name='" + k + "']");
            if(!(tar.is(":radio") || tar.is(":checkbox"))){
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
}

function toCamelCaseArray(dt) {
    var data = [];
    $.each(dt, function (k, v) {
        data.push(toCamelCase(v));
    });
    return data;
}

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

function toUnderlineCaseArray(dt) {
    var data = [];
    $.each(dt, function (k, v) {
        data.push(toUnderlineCase(v));
    });
    return data;
}

function toUnderlineCase(data) {
    var re = new RegExp("[A-Z]{1}", "g");
    var datac = {};
    $.each(data, function (k, v) {
        var arr = k.match(re) || [];
        for (var i = 0; i < arr.length; i++) {
            k = (k.replace(arr[i], "_" + arr[i]));
        }
        k = k.toUpperCase();
        datac[k] = v;
    });
    return datac;
}

function layerConfirm_(opts) {
    opts = $.extend({}, {OWindow: window, PWindow: parent, title: "提示"}, opts);
    $.messager.confirm(opts.title, opts.content, function (r) {
        if (r) {
            if (opts.yesFunc && typeof(opts.yesFunc) == 'function') {
                opts.yesFunc();
            }
        } else {
            if (opts.noFunc && typeof(opts.noFunc) == 'function') {
                opts.noFunc();
            }
        }
    });
}

function layerConfirm_1(text, btnText, yesFunc, noFunc) {
    var index_ = layer.confirm(text, {
        btn: btnText && btnText.length > 0 ? btnText : [$.i18n.t('common:COMMON_OPERATION.SURE'), $.i18n.t('common:COMMON_OPERATION.CANCEL')]//按钮
    }, function () {
        if (yesFunc && typeof(yesFunc) == 'function') {
            yesFunc(index_);
        }
    }, function () {
        if (noFunc && typeof(noFunc) == 'function') {
            noFunc(index_);
        }
    });
}

function layerConfirm2_(text, btnText, yesFunc, noFunc) {
    layer.msg(text, {
        time: 0 //不自动关闭
        ,
        btn: btnText && btnText.length > 0 ? btnText : [$.i18n.t('common:COMMON_OPERATION.SURE'), $.i18n.t('common:COMMON_OPERATION.CANCEL')]//按钮
        ,
        yes: function (index) {
            if (yesFunc && typeof(yesFunc) == 'function') {
                yesFunc(index);
            } else {
                layer.close(index);
            }
        }
        ,
        no: function (index) {
            if (noFunc && typeof(noFunc) == 'function') {
                noFunc(index);
            } else {
                layer.close(index);
            }
        }
    });
}

/** 标准格式AjaxCall_ */
function layerStandardAjaxCall_(options) {
    var idex = null;
    if (typeof(options.loading) == 'undefined') {
        // options.loading = true;
    }
    if (options.loading) {
        idex = layer.load(1);
    }
    var success_ = options.success;
    options.success = null;
    options = $.extend({}, options, {
        success: function (jdata) {
            if (AjaxSuccess(jdata)) {
                if (success_ && typeof(success_) == 'function') {
                    if (idex)
                        layer.close(idex);
                    success_(jdata, idex);
                } else {
                    layerStandardMsg_(jdata, idex);
                }
            }
        }
    });
    Ajax_(options);
}

/** 标准格式msg */
function layerStandardMsg_(jdata, layerIndex, successFunc_) {
    if (layerIndex)
        layer.close(layerIndex);
    if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
        MsgAlert({content: jdata.msg ? jdata.msg : $.i18n.t('msg_err:ERRMSG.COMMON.SUCCESS_CODE')});
        if (successFunc_ && typeof(successFunc_) == 'function') {
            successFunc_();
        }
    } else {
        MsgAlert({content: jdata.msg, type: 'error'});
    }
}

function MsgLoading(msg) {
    var load = parent.layer.msg(msg || '处理中...', {time: 0, shade: [0.3, '#393D49'], icon: 16});
    return load;
}

function MsgLoadingClose(index) {
    parent.layer.close(index);
}

/**
 * 提示错误，并跳转页面到错误页
 */
function layerErrorPage(errMsg, errPage) {
    MsgAlert({content: errMsg, type: 'error'});
    window.location.href = "/" + errPage + ".html";
}

var I18N_LOAD = false;

// $(function () {
//     var CURRENT_MODULE = ""; //$("#i18n_").attr("module");
//     var namespaces = ["common", "msg_err", "msg_tip", "data_grid", "page"];
//     CURRENT_MODULE = CURRENT_MODULE ? CURRENT_MODULE : "common";
//     if (CURRENT_MODULE != 'common') {
//         namespaces.push(CURRENT_MODULE);
//     }
//     var i18nLng = $.cookie('i18next');
//     $.i18n.init({
//         getAsync:false,
//         lng: i18nLng ? i18nLng : "zh",
//         resGetPath: "/locales/__lng__/__ns__.json",
//         ns: {
//             namespaces: namespaces,
//             defaultNs: CURRENT_MODULE
//         },
//         fallbackLng: false
//     }, function (t) {
//         $(document).i18n();
//         $("select option[data-i18n]").each(function () {
//             var i18n_ = $(this).attr("data-i18n");
//             if (i18n_ != "") {
//                 $(this).text($.i18n.t(i18n_));
//             }
//         });
//         I18N_LOAD = true;
//         if (typeof(i18nCallBack) == "function") {
//             i18nCallBack();
//         }
//     });
// });

function _WarpTreeMenuData(treeData, toplvl, fields, datacallback) {
    var tdata_ = [];
    $.each(treeData[toplvl], function (k1, v1) {
        var r_ = _WarpTreeMenu(treeData, (v1[fields[0]] + ''), (v1[fields[1]] + ''), fields, datacallback);
        if (r_)
            tdata_.push(r_);
    });
    return tdata_;
}

/**
 * 组装 easyui-tree 的数据格式
 * @param treeData
 * @param key
 * @param pkey
 * @returns {{id: *, text: *, state: string}}
 * @private
 */
function _WarpTreeMenu(treeData, key, pkey, fields, datacallback) {

    var tdata_ = _FindItemTreeData(treeData, key, pkey, fields);

    if (!tdata_) {
        return null;
    }
    var data_ = {
        id: tdata_.id,
        text: tdata_.name,
        checked: tdata_.checked == 1 ? true : false,
        state: 'open',
        attributes: {url: tdata_.url, i18nText: tdata_.i18nText}
    };
    if (typeof(datacallback) == 'function') {
        data_ = datacallback(tdata_)
    }
    var children_ = [];
    var pdata_ = treeData[tdata_[fields[0]] + ''];
    $.each((pdata_ ? pdata_ : []), function (k, v) {
        var r_ = _WarpTreeMenu(treeData, (v[fields[0]] + ''), (v[fields[1]] + ''), fields, datacallback);
        if (r_)
            children_.push(r_);
    });
    if (children_.length != 0) {
        //data_.state = 'closed';
        data_.checked = false;
        data_.children = children_;
    }
    return data_;
}

/**
 * 根据key 获取Tree数据 {object}
 * @param treeData
 * @param key
 * @param pkey
 * @returns {*}
 * @private
 */
function _FindItemTreeData(treeData, key, pkey, fields) {
    var r_ = null;
    var pdata_ = treeData[pkey];
    $.each((pdata_ ? pdata_ : []), function (k, v) {
        if (v && typeof(v) == 'object' && (v[fields[0]] + '') == key) {
            r_ = v;
            return false;
        }
    });
    return r_;
}

/**
 * 将array对象的某个key属性 转换成 字符串“v,v1,v2”格式
 * @param arry
 * @param key
 * @returns {*}
 */
function ArrayCollect_(arry, key) {
    if (!arry || arry.length <= 0)
        return "";
    var c = [];
    $.each(arry, function (k, v) {
        c.push(v[key]);
    });
    return c.join(",");
}

function getLoginInfo() {
    if (window.top.document['_LOGIN_USER']) {
        return window.top.document['_LOGIN_USER'];
    }
    return getParentParam_().PWindow.document['_LOGIN_USER'];
}

/**
 * 权限认证
 * @param vauth
 * @returns {*}
 * @constructor
 */
function VALID_AUTH(vauth) {
    if( getLoginInfo().userId == 1){
        return true;
    }
    if (getParentParam_().PWindow && typeof(getParentParam_().PWindow.AM_AUTH_) != 'undefined' && typeof(getParentParam_().PWindow.VALID_AUTH) == 'function') {
        return getParentParam_().PWindow.VALID_AUTH(vauth);
    }
    if (typeof(parent.AM_AUTH_) != 'undefined' && typeof(parent.VALID_AUTH) == 'function') {
        return parent.VALID_AUTH(vauth);
    } else if (typeof(AM_AUTH_) != 'undefined' && typeof(VALID_AUTH) == 'function') {
        return VALID_AUTH(vauth);
    }else if (typeof(top.AM_AUTH_) != 'undefined' && typeof(top.VALID_AUTH) == 'function') {
        return top.VALID_AUTH(vauth);
    }
    console.log("authority fail!");
    return false;
}

$(function () {
    InitValidAuth();
});

function InitValidAuth() {
    $("*[auth]").each(function (k, m) {
        var vauth = $(this).attr("auth");
        var sauth = $(this).attr("auth-with");
        if ($.trim(vauth) == "") {
            return false;
        }
        var result = VALID_AUTH(vauth);
        if (!result) {
            $(this).remove();
            if (sauth && $.trim(sauth) != "") {
                $(sauth).remove();
            }
        }
    });
}
var queue = [];
var lock = false;
function InitFuncCodeRequest_(opts) {
    var url = "";
    if (opts.data && opts.data.FunctionCode) {
        url = '/api/v1/plugins/' + opts.data.FunctionCode;
    } else {
        url = opts.url ? opts.url : (opts.data && opts.data.url ? opts.data.url : "");
    }
    if (url == "") {
        alert("Url is empty!");
        return;
    }
    opts = $.extend({}, opts, {url: url, success: opts.successCallBack})
    layerStandardAjaxCall_(opts);
    /*queue.push({
     url: url,
     data: opts.data,
     success: function (jdata) {
     opts.successCallBack(jdata);
     lock = false;
     request_();
     }
     });
     request_();*/
}

function request_() {
    if (!lock) {
        var res = queue.pop();
        if (res) {
            layerStandardAjaxCall_(res);
            lock = true;
        }
    }

}

function HandleTreeData_(arry, pid) {
    var treeData = {};
    $.each(arry || [], function (k, it) {
        var m = !(treeData[it[pid]]) ? [] : (treeData[it[pid]]);
        m.push(it);
        treeData[it[pid]] = m;
    });
    return treeData;
}

function WarpTreeGridData_(treeData, toplvl, fields, handleFunc) {
    var tdata_ = [];
    $.each(treeData[toplvl], function (k1, v1) {
        var r_ = _WarpTreeGridData(treeData, (v1[fields[0]] + ''), (v1[fields[1]] + ''), fields, handleFunc);
        if (r_)
            tdata_.push(r_);
    });
    return tdata_;
}

/**
 * 处理准备TreeGrid 数据
 * @param treeData
 * @param key
 * @param pkey
 * @param fields
 * @returns {*}
 * @private
 */
function _WarpTreeGridData(treeData, key, pkey, fields, handleFunc) {
    var tdata_ = _FindTreeGridData(treeData, key, pkey, fields);
    if (!tdata_) {
        return null;
    }
    var data_ = tdata_;
    var children_ = [];
    var pdata_ = treeData[tdata_[fields[0]] + ''];
    $.each((pdata_ ? pdata_ : []), function (k, v) {
        var r_ = _WarpTreeGridData(treeData, (v[fields[0]] + ''), (v[fields[1]] + ''), fields, handleFunc);
        if (r_) {
            children_.push(r_);
        }
    });
    if (children_.length != 0) {
        data_.children = children_;
    }
    if (typeof(handleFunc) == 'function') {
        handleFunc(data_);
    }
    return data_;
}

function _FindTreeGridData(treeData, key, pkey, fields) {
    var r_ = null;
    var pdata_ = treeData[pkey];
    $.each((pdata_ ? pdata_ : []), function (k, v) {
        if (v && typeof(v) == 'object' && (v[fields[0]] + '') == key) {
            r_ = v;
            return false;
        }
    });
    return r_;
}


function toDateDiffStr(sint) {
    if (!sint) {
        return "";
    }
    try {
        sint = parseInt(sint);
    } catch (e) {
        return "";
    }
    var day = Math.floor(sint / (24 * 3600));
    sint = sint % (24 * 3600);
    var hour = Math.floor(sint / 3600);
    sint = sint % 3600;
    var min = Math.floor(sint / 60);
    var sec = sint % 60;
    var r = '';
    if (day || r != '') {
        r += day + "天";
    }
    if (hour || r != '') {
        r += hour + "时";
    }
    if (min || r != '') {
        r += min + "分";
    }
    if (sec || r != '') {
        r += sec + "秒";
    }
    return r; //day+"天"+hour+"时"+min+"分"+sec+"秒";
}

function toMsTimeString(value) {
    if (!value) return '';
    var ms = value % 1000;
    value = Math.floor(value / 1000);
    var r = toDateDiffStr(value);
    return r ? r : ms + "毫秒";
}

function parseExpression(k, map) {
    var re = new RegExp("\\$\\{([a-zA-Z0-9]*)\\}", "g");
    var arr = k.match(re) || [];
    for (var i = 0; i < arr.length; i++) {
        var key = arr[i].replace("${", "").replace("}", "");
        if (map[key]) {
            k = (k).replace(arr[i], map[key]);
        } else {
            k = (k).replace(arr[i], "");
        }
    }
    return k;
}


function doPost(url, data) {
    var con = "<form id='_f0_rm' method='post' action='" + url + "'></form>"
    $("#_f0_rm").remove();
    $("body").append(con);
    var fm = $("#_f0_rm");
    $.each(data, function (k, it) {
        var input = $("<input type='hidden' name='" + k + "' />");
        input.val(it);
        fm.append(input);
    });
    $("#_f0_rm").submit();
}



/*function getLoginInfo2() {
    return window.top.document['_LOGIN_USER'];
}*/

function setLoginInfo(data) {
    window.top.document['_LOGIN_USER'] = data;
}

function excelExport(identity, fileName, data, jsParamfunc) {
    var opt = getDgOpts(identity);
    functionCode = (data && data.functionCode) || opt.params.FunctionCode;
    var options = getDG(identity).datagrid('options');
    var queryParams = options.queryParams;
    queryParams.page = options.pageNumber||1;
    queryParams.rows = options.pageSize||10;
    var res = '';
    /*if (typeof (jsParamfunc) == 'function') {
        var m = jsParamfunc();
        $.each(m, function (k, v) {
            res += "var " + k + "=" + JSON.stringify(v) + ';';
        });
        var c = '';
        var alter = opt.options.ocolumns.alter;
        if (alter) {
            $.each(alter, function (k, v) {
                var r1 = '';
                $.each(v, function (k1, v1) {
                    r1 += r1 == '' ? k1 + ':' + v1 : ',' + k1 + ':' + v1;
                });
                c += c == '' ? k + ' : ' + '{' + r1 + '}' : ',' + k + ' : ' + '{' + r1 + '}';
            });
        }
        res += "var alter = {" + c + '};';
    }*/
    ShowWindowIframe({
        width: 400,
        height: 320,
        title: 'Excel导出',
        param: $.extend({
            DG_PARAMS: queryParams || {},
            functionCode: functionCode,
            fileName: fileName,
            JS_PARAM: res
        }, data || {}),
        url: '/views/excel_export.shtml'
    });
}

function insertDGRow(identity, record) {
    var index = getDG(identity).datagrid('getRows').length;
    getDG(identity).datagrid('insertRow', {index: index, row: record});
}

function updateDGRow(identity, index, record) {
    getDG(identity).datagrid('updateRow', {index: index, row: record});
}

function formatterDate(date) {
    var day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    var month = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : "0"
        + (date.getMonth() + 1);
    var hor = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
    var min = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
    var sec = date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();
    return date.getFullYear() + '-' + month + '-' + day+" "+hor+":"+min+":"+sec;
};

function DomainCodeToMap_(list) {
    var d = {};
    $.each(list, function (k, it) {
        if (it != null && it.VALUE) {
            d[it.VALUE] = it.TEXT;
        }

    });
    return d;
}

function isEmpty(obj) {
    return obj == undefined || obj == null || obj == '';
}

function isArray(data) {
    return typeof(data) == 'object' && Object.prototype.toString.call(data) == "[object Array]";
}

/* 列表附件悬浮窗口 */
function InitSuspend(target, eventMap, ident) {
    if(!ident){
        ident = 'Suspend_000001';
    }
    $("#"+ident).remove();
    //$('ul.suspend').remove();
    var jQSuspend = $('<ul/>', {'class': 'suspend', id: ident })
        .css({display: 'none'})
        .appendTo($('body'));

    jQSuspend.on({
        'mouseover': function (event) {
            $(this).show();
        },
        'mouseout': function (event) {
            $(this).hide();
        }
    });
    $(document).on('mouseover', target, function (event) {
        var thiz = this;
        jQSuspend.html("");
        var callback = function (content) {
            jQSuspend.css({display: 'block', top: event.clientY + "px", left: event.clientX + "px"});
            jQSuspend.html(content);
            if (jQSuspend.children().length == 0) {
                jQSuspend.hide();
            }
            InitValidAuth();
        }
        if (typeof(eventMap['onmouseover']) == 'function') {
            eventMap['onmouseover'](thiz, event, callback, jQSuspend);
        }
    });
}
/* 列表附件悬浮窗口 */
function InitSuspend_(target, eventMap) {
    $('ul.suspend').remove();
    var jQSuspend = $('<ul/>', {'class': 'suspend'})
        .css({display: 'none'})
        .appendTo($('body'));

    jQSuspend.on({
        'click': function (event) {
            $(this).show();
        },
        'click': function (event) {
            $(this).hide();
        }
    });
    $(document).on('click', target, function (event) {
        var thiz = this;
        jQSuspend.html("");
        var callback = function (content) {
            jQSuspend.css({display: 'block', top: event.clientY - 40 + "px", left: event.clientX + "px"});
            jQSuspend.html(content);
            if (jQSuspend.children().length == 0) {
                jQSuspend.hide();
            }
        }
        if (typeof(eventMap['onclick']) == 'function') {
            eventMap['onclick'](thiz, event, callback, jQSuspend);
        }
    });
}
function easyuiWidgetDestroy(jQitem) {
    var parent = jQitem.parent();
    var name = jQitem.attr('textboxname');
    var ohtml = jQitem.prop('outerHTML');
    var jQohtml = $(ohtml);
    jQohtml.removeClass().attr('name', name);
    parent.html(jQohtml);
}
function bindFormonSearch_(targetForm, jsfunconSearch_) {
    targetForm = targetForm || "#ffSearch";
    //$(targetForm).find(":input[type='text']").each(function(k,it){
    $(":input", targetForm).each(function (k, it) {
        $(it).bind('keypress', function (event) {
            if (event.keyCode == "13") {
                if (typeof (jsfunconSearch_) == 'function' && jsfunconSearch_ != null) {
                    jsfunconSearch_();
                } else {
                    onSearch_()
                }
            }

        });
        if ($(it).hasClass("combobox-f")) {
            //$(it).combobox({
            //    keyHandler: {
            //        enter: function () {
            //            var values = $(this).combobox("getValues");
            //            $(this).combobox("setValues", values);
            //            $(this).combobox("hidePanel");
            //            //下面增加你自己想要处理的逻辑
            //            //TODO
            //            if (typeof (jsfunconSearch_) == 'function' && jsfunconSearch_ != null) {
            //                jsfunconSearch_();
            //            } else {
            //                onSearch_()
            //            }
            //        }
            //    },
            //    onSelect: function () {
            //        $(this).combo("textbox").focus();
            //    }
            //});
            $(it).combobox("options").keyHandler.enter = function () {
                var values = $(this).combobox("getValues");
                $(this).combobox("setValues", values);
                $(this).combobox("hidePanel");
                //下面增加你自己想要处理的逻辑
                //TODO
                if (typeof (jsfunconSearch_) == 'function' && jsfunconSearch_ != null) {
                    jsfunconSearch_();
                } else {
                    onSearch_()
                }
            }
            $(it).combobox({
                onSelect: function () {
                    $(this).combo("textbox").focus();
                }
            })
        }
        else if ($(it).hasClass("combogrid-f")) {
            $(it).combogrid('options').keyHandler.enter = function () {
                var values = $(this).combogrid("getValues");
                $(this).combogrid("setValues", values);
                $(this).combogrid("hidePanel");
                //下面增加你自己想要处理的逻辑
                //TODO
                if (typeof (jsfunconSearch_) == 'function' && jsfunconSearch_ != null) {
                    jsfunconSearch_();
                } else {
                    onSearch_()
                }
            }
        }
        else if ($(it).hasClass("datebox-f")) {
            $(it).datebox('options').keyHandler.enter = function () {
                var state = $.data(this, 'datebox');
                var opts = state.options;
                var current = state.calendar.calendar('options').current;
                var text = $(this).datebox('getText')
                if (current && text != "" && text != undefined && text != null) {
                    setValue(this, text == dateFormatterToTrue(text) ? opts.formatter.call(this, current) : dateFormatterToTrue(text));
                    $(this).combo('hidePanel');
                }
                //TODO
                if (typeof (jsfunconSearch_) == 'function' && jsfunconSearch_ != null) {
                    jsfunconSearch_();
                } else {
                    onSearch_()
                }
            }
            $(it).datebox({
                onSelect: function () {
                    $(this).combo("textbox").focus();
                }
            })
        }
    })
}
/**
 * 格式化日期，
 * @returns {*}
 */
function dateFormatterToTrue(data) {
    var DATE_FORMAT = /^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/;
    if (DATE_FORMAT.test(data)) {
        return data;
    }
    var year = data.substring(0, 2);
    year = '20' + year;
    var mm = data.substring(2, 4);
    var dd = data.substring(4, 6);
    if (data.length > 6) {
        var hh = data.substring(6, 8);
        var ss = data.substring(8, 10);
        return year + "-" + mm + "-" + dd + " " + hh + ":" + ss;
    }
    else {
        return year + "-" + mm + '-' + dd
    }

}
function setValue(target, value, remainText) {
    $(target).combo('setValue', value);
    //var state = $.data(target, 'datebox');
    //var opts = state.options;
    //var calendar = state.calendar;
    //calendar.calendar('moveTo', opts.parser.call(target, value));
    //if (remainText) {
    //    $(target).combo('setValue', value);
    //} else {
    //    if (value) {
    //        value = opts.formatter.call(target, calendar.calendar('options').current);
    //    }
    //    $(target).combo('setText', value).combo('setValue', value);
    //}
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

//查询是否有权限 通过权限
function checkAuthority(key, id) {
    id = id || getLoginInfo().accountId;//默认采用当前登录人信息
    var success;
    InitFuncCodeRequest_({
        data: {key: key, id: id, FunctionCode: 'SYS_CHECHK_SOLE_AUTHORITY'},
        async: false,
        successCallBack: function (jdata) {
            if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                if (jdata.data.IS_CHECKED == "1")
                    success = true
                else
                    success = false
            } else {
                MsgAlert({content: jdata.msg ? jdata.msg : jdata.data, type: 'error'});
            }
        }
    })
    return success;
}

//查询是否有权限 通过角色权限
function checkAuthorityByRole(role, id) {
    id = id || getLoginInfo().accountId;//默认采用当前登录人信息
    var success;
    InitFuncCodeRequest_({
        data: {role: role, id: id, FunctionCode: 'SYS_CHECHK_SOLE_AUTHORITY_ROLE'},
        async: false,
        successCallBack: function (jdata) {
            if (jdata.code == RESULT_CODE.SUCCESS_CODE) {
                if (jdata.data.NUM == "1")
                    success = true
                else
                    success = false
            } else {
                MsgAlert({content: jdata.msg ? jdata.msg : jdata.data, type: 'error'});
            }
        }
    })
    return success;
}

var PageUtil = {

    CBX_DATA_YN : [{'TEXT':'是','VALUE':'Y'},{'TEXT':'否','VALUE':'N'}],

    /**
     * 用于页面初始化ComboBox
     * @param target
     * @param options
     * @constructor
     */
    InitCombobox : function (target, options) {
        if(options.onlyview && options.editable == undefined){
            options.editable = false;
        }
        var value = options.value;
        if(value == undefined){
            try{
                value = $(target).combobox('getValues');
            }catch(e){}
        }
        var data = options.data;
        if(data == undefined){
            try{
                data = $(target).combobox('getData');
            }catch(e){}
        }
        $(target).combobox({
            panelHeight: options.panelHeight || '150',
            editable: options.editable == undefined ? true : options.editable,
            onlyview: options.onlyview == undefined ? false : options.onlyview,
            data: data || [],
            valueField: options.valueField || 'VALUE',
            textField: options.textField || 'TEXT',
            onSelect: options.onSelect || function(){},
            value : value == undefined ? "" : value
        });
    },

    InitComboboxGrid : function (target, options) {
        if(options.onlyview && options.editable == undefined){
            options.editable = false;
        }
        var value = options.value;
        if(value == undefined){
            try{
                value = $(target).combogrid('getValues');
            }catch(e){}
        }
        var data = options.data;
        if(data == undefined){
            try{
                data = $(target).combogrid('grid').datagrid('getData');
            }catch(e){}
        }

        $(target).combogrid({
            panelHeight: options.panelHeight || '150',
            editable: options.editable == undefined ? true : options.editable,
            onlyview: options.onlyview == undefined ? false : options.onlyview,
            data: data || [],
            valueField: options.valueField || 'VALUE',
            textField: options.textField || 'TEXT',
            onSelect: options.onSelect || function(){},
            value : value == undefined ? "" : value
        });
    },

    InitTextBox : function (target, options) {
        $(target).textbox(options);
    }
};

var MaskUtil = (function(){

    var $mask,$maskMsg;

    var defMsg = '正在处理...';

    function init(){
        if(!$mask){
            $mask = $("<div class=\"datagrid-mask mymask\"></div>").appendTo("body");
        }
        if(!$maskMsg){
            $maskMsg = $("<div class=\"datagrid-mask-msg mymask\">"+defMsg+"</div>")
                .appendTo("body").css({'font-size':'12px'});
        }

        $mask.css({width:"100%",height:$(document).height()});

        $maskMsg.css({
            left:($(document.body).outerWidth(true) - 190) / 2,top:($(window).height() - 45) / 2,
        });

    }

    return {
        mask:function(msg){
            init();
            $mask.show();
            $maskMsg.html(msg||defMsg).show();
        }
        ,unmask:function(){
            $mask.hide();
            $maskMsg.hide();
        }
    }

}());

/** 上传 */
function common_upload_(edopt){
    var title_ =  $.i18n.t('common:COMMON_OPERATION.UPLOAD');
    ShowWindowIframe({
        width:  575,
        height: 400,
        title: title_,
        param: $.extend({},edopt.param),
        url: '/views/ws/attachment/attachment/attachment_add.shtml'
    });
}

/**  */
function SettingEasyUIBoxProperty(target, inputType, type, value){
    $(target).combobox({required:true, editable:true, onlyview:false, value: value});

}
/*
$('#interval').numberbox({required:false,editable:false,onlyview:true});
$("#intervalUnit").combobox({required:false,editable:false,onlyview:true});
$("#fixDate").datetimebox({required:true,editable:true, onlyview:false});
$("#intvlDesc").textbox({required:false, editable:true, onlyview:false });*/


/*var cacheSaveData = function (elemId, versionId) {
    if(!localData.isLocalStorage){
        return;
    }
    var isCache = $.cookie(elemId);
    if(isCache){
        return;
    }
    var v = "";
    var $node = $(elemId);
    if($node.length < 1){
        return;
    }
    v = $node.html();
    if("" != v){
       var isOk = localData.set(elemId, v);
       if(isOk){
           $.cookie(elemId, versionId, {path: '/' });
       }
    }
}*/


function hps(_s) {
    var s = _s.substring(0, 3);
    var s0 = _s.substring(_s.length - 3);
    _s = s.split("").reverse().join("") + _s + s0.split("").reverse().join("");
    return _s;
}