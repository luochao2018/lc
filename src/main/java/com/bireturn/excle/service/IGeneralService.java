package com.bireturn.excle.service;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface IGeneralService {
    JSONObject commonSelect(Map<String, String> parameterMap);

    JSONObject commonSelectById(Map<String, String> paramMap);

    JSONObject echartSelect(Map<String, String> paramMap);

    JSONObject commonInsert(Map<String, String> paramMap);

    JSONObject commonUpdate(Map<String, String> paramMap);

    JSONObject commonDelete(Map<String, String> paramMap);

    JSONObject commonBySql(Map<String, String> paramMap);

    ResponseEntity<byte[]> commonExport(Map<String, String> paramMap, String modulePath);
}
