package com.bireturn.excle.controller;

import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.service.IGeneralService;
import com.google.gson.Gson;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 导入导出控制器
 *
 * @author: @luochao
 * @create: 22018-8-27 11:06:30
 */
@RestController
public class GeneralController extends BaiscController {
    @Resource
    IGeneralService iGeneralService;

    @RequestMapping("/commonSelect")
    public String commonSelect(HttpServletRequest request) {
        return new Gson().toJson(iGeneralService.commonSelect(getParamMap(request.getParameterMap())));
    }

    @RequestMapping("/commonSelectById")
    public JSONObject commonSelectById(HttpServletRequest request) {
        return iGeneralService.commonSelectById(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/echartSelect")
    public JSONObject echartSelect(HttpServletRequest request) {
        return iGeneralService.echartSelect(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/commonInsert")
    public JSONObject commonInsert(HttpServletRequest request) {
        return iGeneralService.commonInsert(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/commonUpdate")
    public JSONObject commonUpdate(HttpServletRequest request) {
        return iGeneralService.commonUpdate(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/commonDelete")
    public JSONObject commonDelete(HttpServletRequest request) {
        return iGeneralService.commonDelete(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/commonBySql")
    public JSONObject commonBySql(HttpServletRequest request) {
        return iGeneralService.commonBySql(getParamMap(request.getParameterMap()));
    }

    @RequestMapping(value = "/commonExport", produces = "application/octet-stream;charset=UTF-8")
    @ResponseBody
    public ResponseEntity<byte[]> commonExport(HttpServletRequest request) {
        return iGeneralService.commonExport(getParameterMap(request), getModulePath(request));
    }

}