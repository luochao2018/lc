package com.bireturn.excle.dao.mapper;


import com.alibaba.fastjson.JSONObject;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface GeneralMapper {
    //查询语句
    List<JSONObject> selectSQL(@Param("sql") String param);

    //插入语句
    int insertSQL(@Param("sql") String param);

    //修改语句
    int updateSQL(@Param("sql") String param);

    //删除语句
    int deleteSQL(@Param("sql") String param);
}
