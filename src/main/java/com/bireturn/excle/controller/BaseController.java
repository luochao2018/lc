package com.bireturn.excle.controller;

import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.service.IBaseService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 导入导出控制器
 *
 * @author: @luochao
 * @create: 22018-8-27 11:06:30
 */
@RestController
public class BaseController extends BaiscController {
    @Resource
    IBaseService iBaseService;

    @RequestMapping("/export")
    public JSONObject exportExcle(HttpServletRequest request, HttpServletResponse response) {
        return iBaseService.exportExcle(getParamMap(request.getParameterMap()), response);
    }

    @RequestMapping("/import")
    public JSONObject importExcle(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return iBaseService.importExcle((MultipartHttpServletRequest) request);
    }

    @RequestMapping("/select")
    public String selectDataGrid(HttpServletRequest request, HttpServletResponse response) {
        return iBaseService.selectData(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/insert")
    public JSONObject insertDataGrid(HttpServletRequest request, HttpServletResponse response) {
        return iBaseService.insertData(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/update")
    public JSONObject updateDataGrid(HttpServletRequest request, HttpServletResponse response) {
        return iBaseService.updateData(getParamMap(request.getParameterMap()));
    }

    @RequestMapping("/delete")
    public JSONObject deleteDataGrid(HttpServletRequest request, HttpServletResponse response) {
        return iBaseService.deleteData(getParamMap(request.getParameterMap()));
    }

    //NEW
    @RequestMapping("/getInformation2")
    public JSONObject getInformation2(HttpServletRequest request) {
        return iBaseService.getInformation2(getParameterMap(request));
    }

    @RequestMapping("/exportModle")
    public String exportModle(HttpServletRequest request) {
        return iBaseService.exportModle(getParameterMap(request), getModulePath(request));
    }

    @RequestMapping("/importModle")
    public JSONObject importModle(HttpServletRequest request) {
        return iBaseService.importModle((MultipartHttpServletRequest) request);
    }

    @RequestMapping("/selectModle")
    public String selectModle(HttpServletRequest request) {
        return iBaseService.selectModle((getParameterMap(request)));
    }

    @RequestMapping("/selectModle2")
    public String selectModle2(HttpServletRequest request) {
        return iBaseService.selectModle2((getParameterMap(request)));
    }

    @RequestMapping("/insertModle")
    public JSONObject insertModle(HttpServletRequest request) {
        return iBaseService.insertModle((getParameterMap(request)));
    }

    @RequestMapping("/updateModle")
    public JSONObject updateModle(HttpServletRequest request) {
        return iBaseService.updateModle((getParameterMap(request)));
    }

    @RequestMapping("/deleteModle")
    public JSONObject deleteModle(HttpServletRequest request) {
        return iBaseService.deleteModle((getParameterMap(request)));
    }

    @RequestMapping("/getInformation")
    public JSONObject getInformation(HttpServletRequest request) {
        return iBaseService.getInformation((getParameterMap(request)));
    }

}