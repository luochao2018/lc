package com.bireturn.excle.dao.mapper;


import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.dao.entity.BaseObject;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface BaseMapper {

    //根据表名,获取数据列
    List<JSONObject> getColumnsByTable(Map<String, String> param);

    //查询数据,返回数据
    List<JSONObject> selectPageList(Map param);

    //查询数据,返回总数
    int selectPageSize(Map param);

    //查询语句
    List<JSONObject> selectSQL(@Param("sql") String param);

    List<BaseObject> selectSQL2(@Param("sql") String param);

    //插入语句
    int insertSQL(@Param("sql") String param);

    //修改语句
    int updateSQL(@Param("sql") String param);

    //删除语句
    int deleteSQL(@Param("sql") String param);

    List<JSONObject> getInformation2(Map<String, String> paramMap);

    List<JSONObject> getTable(Map<String, String> paramMap);

    List<JSONObject> getDisplay(Map<String, String> paramMap);

    List<JSONObject> getExport(Map<String, String> paramMap);

    List<JSONObject> getCondition(Map<String, String> paramMap);

    List<JSONObject> getTableByInfoId(Map<String, String> parameterMap);

    List<JSONObject> getTableByTableId(Map<String, String> parameterMap);

    List<JSONObject> getDisplayColumnByTableId(Map<String, String> parameterMap);

    List<JSONObject> getExportColumnByTableId(Map<String, String> parameterMap);

    List<JSONObject> getInputByTableId(Map param);

    List<JSONObject> getOnclickByTableId(Map param);

    List<JSONObject> getPidByTableId(Map param);

    List<JSONObject> getSidByTableId(Map param);

    List<JSONObject> getColspanByTableId(Map param);

    List<JSONObject> getRowspanByTableId(Map param);

    List<JSONObject> getInputTypeByType(Map param);

    List<JSONObject> getInputValueByValue(Map param);

    List<JSONObject> getInfoByInfoId(Map<String, String> parameterMap);
}
