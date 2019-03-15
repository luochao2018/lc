package com.bireturn.excle.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.dao.mapper.BaseMapper;
import com.bireturn.excle.dao.mapper.GeneralMapper;
import com.bireturn.excle.service.IGeneralService;
import com.bireturn.excle.util.CodeUtil;
import com.bireturn.excle.util.SqlUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.bireturn.excle.util.ExportExcel.exportExcel2;

@Component
public class GeneralImpl implements IGeneralService {
    @Resource
    GeneralMapper generalMapper;
    @Resource
    BaseMapper baseMapper;
    static SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd ");
    static SqlUtil sqlUtil = new SqlUtil();

    @Override
    public JSONObject commonSelect(Map<String, String> paramMap) {
        JSONObject resultObject = new JSONObject();
        JSONArray input = JSONArray.parseArray(paramMap.get("input"));
        JSONArray table = JSONArray.parseArray(paramMap.get("table"));
        String rows = paramMap.get("rows");
        String page = paramMap.get("page");
        paramMap.remove("input");
        paramMap.remove("export");
        paramMap.remove("table");
        paramMap.remove("rows");
        paramMap.remove("page");
        //将查询条件放入title
        List listTitles = new ArrayList();
        JSONObject columns = new JSONObject();
        Iterator it = paramMap.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            String key = entry.getKey().toString();
            String value = entry.getValue().toString();
            JSONObject titles = new JSONObject();
            titles.put("FILED", CodeUtil.propertyToField(key));
            titles.put("TITLE",value);
            listTitles.add(titles);
        }
        columns.put("title", table.getJSONObject(0).get("CHANGE_TITLE"));
        columns.put("titles", listTitles);

        //查询列
        String column = table.getJSONObject(0).getString("SQL");
        if (column == null || "".equals(column)) {
            column = "*";
        }
        //分页操作
        if (page != null && !"".equals(page) && rows != null && !"".equals(rows)) {
            int page_ = Integer.parseInt(page);
            if (page_ > 0) {
                page_ = page_ - 1;
            }
            paramMap.put("@@limit", page_ * Integer.parseInt(rows) + "@@and" + rows);
        }
        //执行sql
        String sql = SqlUtil.getSelect(table.getJSONObject(0).getString("DATABASE_TABLE"), column, paramMap, input, sqlUtil, SqlUtil.TYPE_MYSQL);
        List<JSONObject> data = generalMapper.selectSQL(sql);

        //将查询数据列放入fields
        List listFields = new ArrayList();
        if(data.size()>0){
            Iterator<String> iterator = data.get(0).keySet().iterator();
            //循环并得到key列表
            while (iterator.hasNext()) {
                // 获得key
                String key = iterator.next();
                //获得key值对应的value
                JSONObject fields = new JSONObject();
                fields.put("FILED", key);
                fields.put("TITLE",key);
                listFields.add(fields);
            }
        }
        columns.put("field", table.getJSONObject(0).get("CHANGE_FILED"));
        columns.put("fields", listFields);
        resultObject.put("columns",columns);

        //获取总数
        if (!"".equals(paramMap.get("@@limit")) && paramMap.get("@@limit") != null) {
            sql = SqlUtil.getSelect(table.getJSONObject(0).getString("DATABASE_TABLE"), column, "");
            int total = generalMapper.selectSQL(sql).size();
            resultObject.put("total", total);
        }
        //rows存放每页记录 ，这里的两个参数名是固定的，必须为 total和 rows
        resultObject.put("code", 200);
        resultObject.put("msg", data.size() > 0 ? "success" : "没有找到数据");
        resultObject.put("rows", data);
        resultObject.put("table", table);
        return resultObject;
    }

    @Override
    public JSONObject commonSelectById(Map<String, String> paramMap) {
        return getTableObj(SqlUtil.CURD_SELECT, paramMap, sqlUtil);
    }

    @Override
    public JSONObject echartSelect(Map<String, String> paramMap) {
        JSONObject resultObject = commonSelect(paramMap);
        JSONObject echart = new JSONObject();
        List<JSONObject> data = (List<JSONObject>) resultObject.get("rows");//数据源
        List legend = new ArrayList<String>();//数据轴
        try {
            Map<String, Object> legendMap = data.get(0);
            Iterator it = legendMap.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry entry = (Map.Entry) it.next();
                Object key = entry.getKey();
                if (key != null && !"X轴".equals(key)) {
                    legend.add(key);
                }
            }
            echart = getEchartObj(legend, "X轴", (List<JSONObject>) resultObject.get("rows"));
        } catch (IndexOutOfBoundsException e) {
            echart.put("legend", legend);
            echart.put("xAxis", legend);
            echart.put("series", legend);
        } catch (Exception e) {
            echart.put("legend", legend);
            echart.put("xAxis", legend);
            echart.put("series", legend);
            resultObject.put("code", 300);
            resultObject.put("msg", "数据错误");
        }
        resultObject.put("echart", echart);
        return resultObject;
    }

    @Override
    public JSONObject commonInsert(Map<String, String> paramMap) {
        return getTableObj(SqlUtil.CURD_INSERT, paramMap, sqlUtil);
    }

    @Override
    public JSONObject commonUpdate(Map<String, String> paramMap) {
        return getTableObj(SqlUtil.CURD_UPDATE, paramMap, sqlUtil);
    }

    @Override
    public JSONObject commonDelete(Map<String, String> paramMap) {
        return getTableObj(SqlUtil.CURD_DELETE, paramMap, sqlUtil);
    }

    @Override
    public JSONObject commonBySql(Map<String, String> paramMap) {
        JSONObject resultObject = new JSONObject();
        String sql = paramMap.get("sql");
        List<JSONObject> data = generalMapper.selectSQL(sql);
        resultObject.put("code", data.size() > 0 ? 200 : 300);
        resultObject.put("msg", data.size() > 0 ? "success" : "没有找到数据");
        resultObject.put("rows", data);
        return resultObject;
    }

    @Override
    public ResponseEntity<byte[]> commonExport(Map<String, String> paramMap, String modulePath) {
        Map param = new HashMap();
        param.put("tableId", paramMap.get("tableId"));
        ResponseEntity<byte[]> responseEntity = null;
        try {
            List<JSONObject> table = baseMapper.getTableByTableId(paramMap);
            List<JSONObject> export = baseMapper.getExportColumnByTableId(paramMap);
            param.put("identity", 1);
            List<JSONObject> condition = baseMapper.getInputByTableId(param);
            String sql = SqlUtil.getSelectByList(table.get(0).getString("DATABASE_TABLE"), "*", paramMap, condition, sqlUtil, SqlUtil.TYPE_MYSQL);
            List<JSONObject> data = generalMapper.selectSQL(sql);
            List<JSONObject> datas = new ArrayList<>();//导出值
            Map<String, String> titleMap = new LinkedHashMap<>();//标题
            Map<String, String> titleSort = new HashMap<>();//排序
            for (int i = 0; i < export.size(); i++) {
                titleMap.put(export.get(i).getString("FILED"), export.get(i).getString("TITLE"));
                titleSort.put(export.get(i).getString("FILED"), (i + 1) + "");
            }
            //处理数据
            for (JSONObject jsonObject : data) {
                Iterator<String> it = jsonObject.keySet().iterator();
                while (it.hasNext()) {
                    String key = it.next();
                    //日期格式化
                    if (jsonObject.get(key) instanceof Date) {
                        jsonObject.put(key, formatter.format(jsonObject.get(key)));
                    }
                }
                JSONObject link = new JSONObject(new LinkedHashMap());
                Iterator<String> it_sort = titleMap.keySet().iterator();
                while (it_sort.hasNext()) {
                    String key = it_sort.next();
                    //排序
                    link.put(key, jsonObject.getString(key));
                }
                datas.add(link);
            }
            responseEntity = exportExcel2(datas, titleMap, titleSort, modulePath, table.get(0).getString("TITLE"));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return responseEntity;
    }

    //return getTableObj
    private JSONObject getTableObj(String curd, Map<String, String> paramMap, SqlUtil sqlUtil) {
        JSONObject resultObject = new JSONObject();
        JSONArray table = JSONArray.parseArray(paramMap.get("table"));
        JSONArray data = JSONArray.parseArray(paramMap.get("data"));
        paramMap.remove("table");
        paramMap.remove("input");
        paramMap.remove("data");
        if ("null".equals(data.getJSONObject(0).toString())) {//一条json记录
            resultObject = commonRunSql(curd, paramMap, table, sqlUtil);
            if (resultObject.get("run") == null || "".equals(resultObject.get("run"))) {
                return resultObject;
            }
        } else {//多条json数组
            for (int i = 0; i < data.size(); i++) {
                Iterator it = data.iterator();
                Map<String, String> param = new HashMap<>();
                while (it.hasNext()) {
                    Map.Entry entry = (Map.Entry) it.next();
                    String key = entry.getKey().toString();
                    String value = entry.getValue() == null ? "" : entry.getValue().toString();
                    param.put(key, value);
                }
                resultObject = commonRunSql(curd, param, table, sqlUtil);
                if (resultObject.get("run") == null || "".equals(resultObject.get("run"))) {
                    return resultObject;
                } else if (resultObject.getIntValue("run") == 0) {
                    break;//操作失败,终止运行
                }
            }
        }
        resultObject.put("code", resultObject.getIntValue("run") > 0 ? 200 : 300);
        resultObject.put("msg", resultObject.getIntValue("run") > 0 ? (curd + "成功") : (curd + "失败"));
        return resultObject;
    }

    //return commonRunSql
    private JSONObject commonRunSql(String curd, Map<String, String> paramMap, JSONArray table, SqlUtil sqlUtil) {
        JSONObject resultObject = new JSONObject();
        String sql = "";
        int run = 0;
        if (SqlUtil.CURD_INSERT.equals(curd)) {//增加
            sql = SqlUtil.getInsert(table.getJSONObject(0).getString("DATABASE_TABLE"), paramMap, sqlUtil);
        } else if (SqlUtil.CURD_DELETE.equals(curd)) {//删除
            sql = SqlUtil.getDelete(table.getJSONObject(0).getString("DATABASE_TABLE"), paramMap, sqlUtil);
        } else if (SqlUtil.CURD_UPDATE.equals(curd)) {//修改
            sql = SqlUtil.getUpdate(table.getJSONObject(0).getString("DATABASE_TABLE"), paramMap, sqlUtil);
        } else if (SqlUtil.CURD_SELECT.equals(curd)) {//查询
            sql = SqlUtil.getSelect(table.getJSONObject(0).getString("DATABASE_TABLE"), "*", paramMap, sqlUtil);
        }
        try {
            if (SqlUtil.CURD_INSERT.equals(curd)) {//增加
                run = generalMapper.insertSQL(sql);
            } else if (SqlUtil.CURD_DELETE.equals(curd)) {//删除
                run = generalMapper.deleteSQL(sql);
            } else if (SqlUtil.CURD_UPDATE.equals(curd)) {//修改
                run = generalMapper.updateSQL(sql);
            } else if (SqlUtil.CURD_SELECT.equals(curd)) {//查询
                run = 1;
                List<JSONObject> data = generalMapper.selectSQL(sql);
                resultObject.put("rows", data);
            }
        } catch (Exception e) {
            resultObject.put("code", 400);
            resultObject.put("msg", "语法错误");
            return resultObject;
        }
        resultObject.put("run", run);
        return resultObject;
    }

    // return echart
    private JSONObject getEchartObj(List legendList, String xAxisStr, List<JSONObject> dataList) throws Exception {
        JSONObject resultObject = new JSONObject();
        List<String> xAxis = new ArrayList<String>();
        JSONArray series = new JSONArray();
        boolean xAxis_ = true;
        for (Object legend : legendList) {
            JSONObject tmpObj = new JSONObject();
            tmpObj.put("name", legend.toString());
            List<String> seriesData = new ArrayList<String>();
            for (int i = 0; i < dataList.size(); i++) {
                if (xAxis_) {
                    Object object = dataList.get(i).get(xAxisStr);
                    if (object != null) {
                        xAxis.add(object.toString());
                    }
                }
                Object object = dataList.get(i).get(legend.toString());
                if (object != null) {
                    seriesData.add(object.toString());
                }
            }
            xAxis_ = false;
            tmpObj.put("data", seriesData);
            series.add(tmpObj);
        }
        resultObject.put("legend", legendList);
        resultObject.put("xAxis", xAxis);
        resultObject.put("series", series);
        return resultObject;
    }
}
