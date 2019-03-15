package com.bireturn.excle.controller;

import javax.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class BaiscController {

    /**
     * <p>功能描述:[修改getParameterMap为标准map]</p>
     *
     * @param request
     * @return
     * @author:liuhaoyu
     * @update:[日期YYYY-MM-DD][更改人姓名][变更描述]
     */
    public Map<String, String> getParameterMap(HttpServletRequest request) {
        Map properties = request.getParameterMap();
        // 返回值Map
        Map<String, String> returnMap = new HashMap<String, String>();
        Iterator entries = properties.entrySet().iterator();
        Map.Entry entry;
        String name = "";
        String value = "";
        while (entries.hasNext()) {
            entry = (Map.Entry) entries.next();
            name = (String) entry.getKey();
            Object valueObj = entry.getValue();
            if (null == valueObj) {
                value = "";
            } else if (valueObj instanceof String[]) {
                String[] values = (String[]) valueObj;
                for (int i = 0; i < values.length; i++) {
                    value = values[i] + ",";
                }
                value = value.substring(0, value.length() - 1);
            } else {
                value = valueObj.toString();
            }
            try {
                returnMap.put(name, URLDecoder.decode(value, "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }
        return returnMap;
    }

    public Map<String, String> getParamMap(Map requestMap) {
        Map<String, String> paramMap = new HashMap<String, String>();
        Iterator<Map.Entry<String, String[]>> it = requestMap.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, String[]> entry = it.next();
            if (entry.getValue().length == 1) {
                paramMap.put(entry.getKey(), entry.getValue()[0]);
            } else {
                String[] values = entry.getValue();
                String value = "";
                for (int i = 0; i < values.length; i++) {
                    value = values[i] + ",";
                }
                value = value.substring(0, value.length() - 1);
                paramMap.put(entry.getKey(), value);
            }
        }
        return paramMap;
    }

    /**
     * 获取项目绝对路径
     *
     * @param request
     * @return
     * @author:liuhaoyu
     * @update:[日期YYYY-MM-DD][更改人姓名][变更描述]
     */
    public String getModulePath(HttpServletRequest request) {
        return request.getSession().getServletContext().getRealPath("/");
    }
}
