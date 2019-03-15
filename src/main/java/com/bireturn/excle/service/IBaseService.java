package com.bireturn.excle.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpServletResponse;
import java.util.Map;

public interface IBaseService {

    //导出excle信息
    JSONObject exportExcle(Map<String, String> params, HttpServletResponse response);

    //导入excle信息
    JSONObject importExcle(MultipartHttpServletRequest params);

    //查询
    String selectData(Map<String, String> params);

    //插入
    JSONObject insertData(Map<String, String> params);

    //修改
    JSONObject updateData(Map<String, String> params);

    //删除
    JSONObject deleteData(Map<String, String> params);

    //获取表单信息
    JSONObject getInformation2(Map<String, String> paramMap);

    String exportModle(Map<String, String> paramMap, String modulePath);

    JSONObject importModle(MultipartHttpServletRequest request);

    String selectModle(Map<String, String> paramMap);

    JSONObject insertModle(Map<String, String> parameterMap);

    JSONObject updateModle(Map<String, String> parameterMap);

    JSONObject deleteModle(Map<String, String> parameterMap);

    String selectModle2(Map<String, String> parameterMap);

    JSONObject getInformation(Map<String, String> parameterMap);
}
