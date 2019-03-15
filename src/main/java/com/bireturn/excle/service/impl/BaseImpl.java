package com.bireturn.excle.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.dao.entity.BaseObject;
import com.bireturn.excle.dao.entity.Excle;
import com.bireturn.excle.dao.mapper.BaseMapper;
import com.bireturn.excle.service.IBaseService;
import com.bireturn.excle.util.ClassUtil;
import com.bireturn.excle.util.CodeUtil;
import com.bireturn.excle.util.ImportExcel;
import com.bireturn.excle.util.SqlUtil;
import com.google.gson.Gson;
import net.sf.json.JSONArray;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.bireturn.excle.util.ExportExcel.*;

@Component
public class BaseImpl implements IBaseService {
    @Resource
    BaseMapper baseMapper;
    static SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd ");
    static SqlUtil sqlUtil = new SqlUtil();

    //初始化excle格式
    public Excle setExcle(String sheetName, String[] title, String[] code, String type) {
        Excle excle = new Excle();
        //赋值
//        excle.setUrl("D:\\test.xls");//存储路径
        excle.setSheetName(sheetName);//工作表名
        excle.setTitle(title);//表头名
        excle.setCode(code);//字段名
        excle.setTitleColor("#C9C9C9");//表头颜色
        excle.setRowJColor("#C1EAFF");//奇数行颜色
        excle.setRowOColor("#EDFAFF");//偶数行颜色
        excle.setType(type);//设置导出样式
        excle.setTitleSize((short) 12);//表头字体大小
        excle.setTitleAlign((short) 2);//表头位置[0:default;1:left;2:center;3:right]
        excle.setColumnSize((short) 10);//列字体大小
        excle.setColumnAlign((short) 1);//数据列位置[0:default;1:left;2:center;3:right]
        excle.setWidth(60);//列宽
        return excle;
    }

    //导出excle
    @Override
    public JSONObject exportExcle(Map<String, String> params, HttpServletResponse response) {
        //column格式转化
        params.put("COLUMN", params.get("COLUMN").replaceAll(",", "|"));

        List<JSONObject> jsonObjects = baseMapper.getColumnsByTable(params);

        //code格式转化
        String[] title = new String[jsonObjects.size()];//属性描述(标题)
        String[] code = new String[jsonObjects.size()];//数据库字段
        String[] code2 = new String[jsonObjects.size()];//转为类字段(类字段)
        for (int i = 0; i < jsonObjects.size(); i++) {
            title[i] = jsonObjects.get(i).get("COLUMN_COMMENT").toString();
            code[i] = jsonObjects.get(i).get("COLUMN_NAME").toString();
            code2[i] = CodeUtil.fieldToProperty(jsonObjects.get(i).get("COLUMN_NAME").toString());
        }

        //数据(显示字段)important
        List datas = new ArrayList<BaseObject>();
        datas.add(ClassUtil.initBaseObject(code, code2));

        //设置excle
        Excle excle = setExcle(params.get("TEXT"), title, code2, Excle.XLS_TYPE);//setExcle(名称,标题,类字段,导出类型)

        //导出方法
        exportExcel(datas, excle, response);//exportExcel(数据,excle设置,respose);
        return null;
    }

    //导入excle
    @Override
    public JSONObject importExcle(MultipartHttpServletRequest params) {
        String sql = "INSERT INTO `infoportal`.`ws_report_columns` (\n" +
                "\t`PKID`,`FILED`,`TITLE`,`ROWNUM`,`FROZENCOLUMNS`,\n" +
                "\t`WIDTH`,`HALIGN`,`ALIGN`,`COLSPAN`,`ROWSPAN`,`SORTABLE`,`NOEXPORT`,\n" +
                "\t`DISABLE`,`REQUIRED`,`TYPE`,`VALUE`\n" +
                ")VALUES(\n" +
                "\t\t(\n" +
                "SELECT \n" +
                "CASE WHEN COUNT(a.FILED)<1 THEN  (SELECT MAX(b.PKID+0)+1 FROM `infoportal`.`ws_report_columns` b) ELSE 1 END\n" +
                "FROM `infoportal`.`ws_report_columns` a\n" +
                "WHERE a.FILED = '@@field'),-- 主键\n" +
                "\t\t'@@field',-- field\n" +
                "\t\t'@@title',-- title\n" +
                "\n" +
                "\t\t'1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)\n" +
                ";";

        JSONObject resultObject = new JSONObject();
        MultipartFile file = params.getFile("file");
        List<Map> list = new ArrayList<>();
        int runSql = 0;

        //获取文件内容
        InputStream in = null;
        List<List<Object>> listObject = null;
        try {
            if (file.isEmpty()) {
                resultObject.put("code", 501);
                resultObject.put("msg", "文件不存在");
                return resultObject;
            }
            in = file.getInputStream();
            listObject = new ImportExcel().getBankListByExcel(in, file.getOriginalFilename());
            in.close();
        } catch (Exception e) {
            resultObject.put("code", 502);
            resultObject.put("msg", e);
            return resultObject;
        }

        //判断是否满足导入条件
        if (listObject.size() < 2) {
            resultObject.put("code", 503);
            resultObject.put("msg", "导入模板错误");
            return resultObject;
        }
        int sucess = 0;
        for (int i = 2; i < listObject.size(); i++) {
            String filed = listObject.get(i).get(0).toString();
            String title = listObject.get(i).get(1).toString();
            String sql2 = sql.replaceAll("@@field", filed).replaceAll("@@title", title);
            try {
                runSql = baseMapper.insertSQL(sql2);
            } catch (Exception e) {
                resultObject.put("code", 300);
                resultObject.put("msg", (filed + "(" + title + "),已存在"));
            }
            if (runSql == 1) {
                sucess++;
            }
        }


        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        resultObject.put("requestData", listObject.size() - 2);
        resultObject.put("responseData", sucess);
        return resultObject;
    }

    //查询数据
    @Override
    public String selectData(Map<String, String> params) {
        JSONObject resultObject = new JSONObject();
        String table = "dm_local.student_copy";
        Map<String, String> column = new HashMap<>();
        column.put("column", "*");
        if (!(params.get("page") == null || "".equals(params.get("page")) || params.get("rows") == null || "".equals(params.get("rows")))) {
            params.put("@@limit", (Integer.parseInt(params.get("page")) - 1) * Integer.parseInt(params.get("rows")) + "@@and" + params.get("rows"));
        }
        params.remove("page");
        params.remove("rows");
        List<JSONObject> resultList = baseMapper.selectSQL(SqlUtil.getSelect(table, column, params));
        params.remove("@@limit");
        int resultSize = baseMapper.selectSQL(SqlUtil.getSelect(table, column, params)).size();

        //rows存放每页记录 ，这里的两个参数名是固定的，必须为 total和 rows
        resultObject.put("code", resultSize > 0 ? 200 : 300);
        resultObject.put("msg", resultSize > 0 ? "success" : "error");
        resultObject.put("rows", resultList);
        resultObject.put("total", resultSize);
        return new Gson().toJson(resultObject);
    }

    //插入数据
    @Override
    public JSONObject insertData(Map<String, String> params) {
        JSONObject resultObject = new JSONObject();
        List<Map> list = new ArrayList<>();
        list.add(params);
        String table = "dm_local.student_copy";
        int runSql = baseMapper.insertSQL(SqlUtil.getInsert(table, list, sqlUtil));

        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        return resultObject;
    }

    //更新数据
    @Override
    public JSONObject updateData(Map<String, String> params) {
        JSONObject resultObject = new JSONObject();
        String table = "dm_local.student_copy";
        int runSql = baseMapper.updateSQL(SqlUtil.getUpdate(table, params, sqlUtil));

        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        return resultObject;
    }

    //删除数据
    @Override
    public JSONObject deleteData(Map<String, String> params) {
        JSONObject resultObject = new JSONObject();
        String table = "dm_local.student_copy";
        int runSql = baseMapper.deleteSQL(SqlUtil.getDelete(table, params, sqlUtil));

        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        return resultObject;
    }

    //===获取界面信息(新版)
    @Override
    public JSONObject getInformation2(Map<String, String> paramMap) {
        JSONObject resultObject = new JSONObject();
        List<JSONObject> getCondition = baseMapper.getCondition(paramMap);
        List<JSONObject> getTable = baseMapper.getTable(paramMap);
        List<JSONObject> getDisplay = baseMapper.getDisplay(paramMap);
        resultObject.put("code", 200);
        resultObject.put("msg", "information");
        resultObject.put("getTable", getTable);
        resultObject.put("getDisplay", getDisplay);
        resultObject.put("getCondition", getCondition);
        return resultObject;
    }

    //导出(新版)
    @Override
    public String exportModle(Map<String, String> paramMap, String modulePath) {
        String fileName = "1".equals(paramMap.get("export")) ? "" : "_模板";//导出数据/模板
        List<JSONObject> datas = new ArrayList<>();//导出值
        List<JSONObject> getCondition = getCondition(paramMap);//条件
        List<JSONObject> getExport = getExport(paramMap);//导出的字段
        if (getExport.size() < 1) {
            return "导出异常";
        }
        JSONObject code = new JSONObject();//导出字段
        Map<String, String> titleMap = new LinkedHashMap<>();//标题
        Map<String, String> titleSort = new HashMap<>();//排序
        Map<String, String> condition = new HashMap<>();//条件
        for (int i = 0; i < getCondition.size(); i++) {
            String key = CodeUtil.fieldToProperty(getCondition.get(i).getString("COLUMN"));
            condition.put(key, paramMap.get(key));
        }
        for (int i = 0; i < getExport.size(); i++) {
            code.put(getExport.get(i).getString("COLUMN"), getExport.get(i).getString("COLUMN"));
            titleMap.put(getExport.get(i).getString("COLUMN"), getExport.get(i).getString("COLUMN_NAME"));
            titleSort.put(getExport.get(i).getString("COLUMN"), (i + 1) + "");
        }
        //获取数据
        List<JSONObject> getDatas = new ArrayList<>();
        if ("".equals(fileName)) {
            getDatas = baseMapper.selectSQL(SqlUtil.getSelect(getExport.get(0).get("DATABASE") + "." + getExport.get(0).get("TABLE"), titleMap, condition));
        } else {
            getDatas.add(code);
        }
        //处理数据
        for (JSONObject jsonObject : getDatas) {
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
        exportExcel2(datas, titleMap, titleSort, modulePath, getExport.get(0).getString("TABLE_NAME") + fileName);
        return null;
    }

    //导入(新版)
    @Override
    public JSONObject importModle(MultipartHttpServletRequest request) {
        JSONObject resultObject = new JSONObject();
        MultipartFile file = request.getFile("file");//导入文件
        Map<String, String> paramMap = new HashMap<>();
        paramMap.put("FORM_PKID", request.getParameter("FORM_PKID"));
        List<JSONObject> getTable = getTable(paramMap);//导入表
        if (getTable.size() != 1) {
            resultObject.put("code", 500);
            resultObject.put("msg", "未找到导入表");
            return resultObject;
        }
        String table = getTable.get(0).get("DATABASE") + "." + getTable.get(0).get("TABLE");
        String version = CodeUtil.getSimpleDateFormatTime(new Date());//导入版本
        List<Map> list = new ArrayList<>();
        int runSql = 0;
        InputStream in = null;
        List<List<Object>> listObject = null;
        try {
            if (file.isEmpty()) {
                resultObject.put("code", 400);
                resultObject.put("msg", "文件不存在");
                return resultObject;
            }
            in = file.getInputStream();
            listObject = new ImportExcel().getBankListByExcel(in, file.getOriginalFilename());//获取文件内容
            in.close();
        } catch (Exception e) {
            resultObject.put("code", 401);
            resultObject.put("msg", e);
            return resultObject;
        }
        if (listObject.size() < 2) {
            resultObject.put("code", 402);
            resultObject.put("msg", "导入模板错误");
            return resultObject;
        }
        //重新组装数据
        for (int i = 2; i < listObject.size(); i++) {
            Map<String, String> map = new HashMap<>();
            for (int j = 0; j < listObject.get(1).size(); j++) {
                map.put(CodeUtil.propertyToField(listObject.get(1).get(j).toString()), (j <= (listObject.get(i).size() - 1)) ? listObject.get(i).get(j).toString() : "");
            }
            map.put("VERSION", version);//添加版本号,用做标识
            list.add(map);
            //批量导入,每个批次1000条,间隔时间500ms
            if ((i == (listObject.size() - 1)) || (list.size() == 1000)) {
                runSql = baseMapper.insertSQL(SqlUtil.getInsert(table, list, sqlUtil));
                if (runSql == 0) {
                    break;
                }
                try {
                    list = new ArrayList<>();
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }
        List<JSONObject> responseData = baseMapper.selectSQL(SqlUtil.getSelect(table, "*", "and version='" + version + "'"));
        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        resultObject.put("real", listObject.size() - 2);
        resultObject.put("success", responseData.size());
        return resultObject;
    }

    @Override
    public String selectModle(Map<String, String> paramMap) {
        JSONObject resultObject = new JSONObject();
        List<JSONObject> getTable = getTable(paramMap);//导入表
        if (getTable.size() != 1) {
            resultObject.put("code", 500);
            resultObject.put("msg", "未找到数据表");
            resultObject.put("rows", new int[0]);
            resultObject.put("total", 0);
            return new Gson().toJson(resultObject);
        }
        String table = getTable.get(0).get("DATABASE") + "." + getTable.get(0).get("TABLE");
        if (!(paramMap.get("page") == null || "".equals(paramMap.get("page")) || paramMap.get("rows") == null || "".equals(paramMap.get("rows")))) {
            int page = Integer.parseInt(paramMap.get("page"));
            if (page > 0) {
                page = page - 1;
            }
            paramMap.put("@@limit", page * Integer.parseInt(paramMap.get("rows")) + "@@and" + paramMap.get("rows"));
        }
        paramMap.remove("page");
        paramMap.remove("rows");
        Map<String, String> column = new HashMap<>();
        column.put("*", "*");
        List<JSONObject> rows = baseMapper.selectSQL(SqlUtil.getSelect(table, column, paramMap));
        paramMap.remove("@@limit");
        int total = baseMapper.selectSQL(SqlUtil.getSelect(table, column, paramMap)).size();
        resultObject.put("code", 200);
        resultObject.put("msg", "");
        //rows存放每页记录 ，这里的两个参数名是固定的，必须为 total和 rows
        resultObject.put("rows", rows);
        resultObject.put("total", total);
        return new Gson().toJson(resultObject);
    }

    @Override
    public String selectModle2(Map<String, String> paramMap) {
        JSONObject resultObject = new JSONObject();
        String table = "dm_local.apu";
        if (!(paramMap.get("page") == null || "".equals(paramMap.get("page")) || paramMap.get("rows") == null || "".equals(paramMap.get("rows")))) {
            int page = Integer.parseInt(paramMap.get("page"));
            if (page > 0) {
                page = page - 1;
            }
            paramMap.put("@@limit", page * Integer.parseInt(paramMap.get("rows")) + "@@and" + paramMap.get("rows"));
        }
        paramMap.remove("page");
        paramMap.remove("rows");
        Map<String, String> column = new HashMap<>();
        column.put("column", "*");
        List<JSONObject> rows = baseMapper.selectSQL(SqlUtil.getSelect(table, column, paramMap));
        paramMap.remove("@@limit");
        int total = baseMapper.selectSQL(SqlUtil.getSelect(table, column, paramMap)).size();
        resultObject.put("code", 200);
        resultObject.put("msg", "");
        //rows存放每页记录 ，这里的两个参数名是固定的，必须为 total和 rows
        resultObject.put("rows", rows);
        resultObject.put("total", total);
        return new Gson().toJson(resultObject);
    }

    @Override
    public JSONObject getInformation(Map<String, String> parameterMap) {
        JSONObject resultObject = new JSONObject();
        List<JSONObject> listAll = new ArrayList<>();
        Map param = new HashMap();
        //获取info
        List<JSONObject> info = baseMapper.getInfoByInfoId(parameterMap);
        //获取table
        List<JSONObject> table = baseMapper.getTableByInfoId(parameterMap);
        if (table.size() < 1 || info.size() < 1) {
            resultObject.put("code", 300);
            resultObject.put("msg", "没有找到表单信息");
            return resultObject;
        }
        for (int i = 0; i < table.size(); i++) {
            JSONObject jsonObject = new JSONObject();
            //处理table
            param.put("tableId", table.get(i).get("PKID"));
            //1.获取联动父id
            List<JSONObject> pid = baseMapper.getPidByTableId(param);
            table.get(i).put("PID", toArray("PID", pid));
            //2.获取联动子id
            List<JSONObject> sid = baseMapper.getSidByTableId(param);
            table.get(i).put("SID", toArray("SID", sid));
            //3.获取合并的列
            List<JSONObject> colspan = baseMapper.getColspanByTableId(param);
            table.get(i).put("COLSPAN", toArray("COLSPAN", colspan));
            //4.获取合并的行
            List<JSONObject> rowspan = baseMapper.getRowspanByTableId(param);
            table.get(i).put("ROWSPAN", toArray("ROWSPAN", rowspan));

            //获取显示的column
            List<JSONObject> column = baseMapper.getDisplayColumnByTableId(param);
            //处理column
            param.put("column", "column");
            column = toListJSONObject(param, column);
            param.remove("column");

            //获取导出的column
            List<JSONObject> export = baseMapper.getExportColumnByTableId(param);

            //获取condition
            param.put("identity", 1);
            List<JSONObject> condition = baseMapper.getInputByTableId(param);
            //处理condition
            condition = toListJSONObject(param, condition);

            //获取menu
            List<JSONObject> menu = baseMapper.getOnclickByTableId(param);

            //获取formT
            param.put("identity", 2);
            List<JSONObject> formT = baseMapper.getInputByTableId(param);
            //处理formT
            formT = toListJSONObject(param, formT);

            //获取toolbar
            List<JSONObject> toolbar = baseMapper.getOnclickByTableId(param);

            jsonObject.put("table", table.get(i));
            jsonObject.put("column", column);
            jsonObject.put("export", export);
            jsonObject.put("condition", condition);
            jsonObject.put("formT", formT);
            jsonObject.put("menu", menu);
            jsonObject.put("toolbar", toolbar);
            listAll.add(jsonObject);
        }

        resultObject.put("code", 200);
        resultObject.put("msg", "success");
        resultObject.put("html", info.get(0));
        resultObject.put("info", listAll);
        return resultObject;
    }

    @Override
    public JSONObject insertModle(Map<String, String> parameterMap) {
        JSONObject resultObject = new JSONObject();
        List<JSONObject> getTable = getTable(parameterMap);
        if (getTable.size() != 1) {
            resultObject.put("code", 500);
            resultObject.put("msg", "未找到数据表");
            return resultObject;
        }
        String table = getTable.get(0).get("DATABASE") + "." + getTable.get(0).get("TABLE");
        int runSql = baseMapper.insertSQL(SqlUtil.getInsert(table, parameterMap, sqlUtil));
        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        return resultObject;
    }

    @Override
    public JSONObject updateModle(Map<String, String> parameterMap) {
        JSONObject resultObject = new JSONObject();
        List<JSONObject> getTable = getTable(parameterMap);
        if (getTable.size() != 1) {
            resultObject.put("code", 500);
            resultObject.put("msg", "未找到数据表");
            return resultObject;
        }
        String table = getTable.get(0).get("DATABASE") + "." + getTable.get(0).get("TABLE");
        int runSql = baseMapper.updateSQL(SqlUtil.getUpdate(table, parameterMap, sqlUtil));
        resultObject.put("code", runSql > 0 ? 200 : 300);
        resultObject.put("msg", runSql > 0 ? "success" : "error");
        return resultObject;
    }

    @Override
    public JSONObject deleteModle(Map<String, String> parameterMap) {
        JSONObject resultObject = new JSONObject();
//        List<JSONObject> getTable = getTable(parameterMap);
//        if (getTable.size() != 1) {
//            resultObject.put("code", 500);
//            resultObject.put("msg", "未找到数据表");
//            return resultObject;
//        }
//        String table = getTable.get(0).get("DATABASE") + "." + getTable.get(0).get("TABLE");
//        JSONArray paramMap = JSONArray.fromObject(parameterMap.get("data"));
//        int runSql = baseMapper.deleteSQL(SqlUtil.getDelete(table, paramMap, sqlUtil));
//        resultObject.put("code", runSql > 0 ? 200 : 300);
//        resultObject.put("msg", runSql > 0 ? "success" : "error");
        return resultObject;
    }

    //通过jsonobject导出
    public ResponseEntity<byte[]> exportModleByJSONObject(Map<String, String> paramMap, String modulePath) {
        String fileName = "1".equals(paramMap.get("export")) ? "" : "_模板";//导出数据/模板
        List<JSONObject> datas = new ArrayList<>();//导出值
        List<JSONObject> getCondition = getCondition(paramMap);//条件
        List<JSONObject> getExport = getExport(paramMap);//导出的字段
        if (getExport.size() < 1) {
            return null;
        }
        JSONObject code = new JSONObject();//导出字段
        Map<String, String> titleMap = new LinkedHashMap<>();//标题
        Map<String, String> titleSort = new HashMap<>();//排序
        Map<String, String> condition = new HashMap<>();//条件
        for (int i = 0; i < getCondition.size(); i++) {
            String key = CodeUtil.fieldToProperty(getCondition.get(i).getString("COLUMN"));
            condition.put(key, paramMap.get(key));
        }
        for (int i = 0; i < getExport.size(); i++) {
            code.put(getExport.get(i).getString("COLUMN"), getExport.get(i).getString("COLUMN"));
            titleMap.put(getExport.get(i).getString("COLUMN"), getExport.get(i).getString("COLUMN_NAME"));
            titleSort.put(getExport.get(i).getString("COLUMN"), (i + 1) + "");
        }
        //获取数据
        List<JSONObject> getDatas = new ArrayList<>();
        if ("".equals(fileName)) {
            getDatas = baseMapper.selectSQL(SqlUtil.getSelect(getExport.get(0).get("DATABASE") + "." + getExport.get(0).get("TABLE"), titleMap, condition));
        } else {
            getDatas.add(code);
        }
        //处理数据
        for (JSONObject jsonObject : getDatas) {
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
        return exportExcel2(datas, titleMap, titleSort, modulePath, getExport.get(0).getString("TABLE_NAME") + fileName);
    }

    //通过类导出
    public ResponseEntity<byte[]> exportModleByClass(Map<String, String> paramMap, String modulePath) {
        List<JSONObject> getCondition = getCondition(paramMap);//条件
        List<JSONObject> getExport = getExport(paramMap);//导出的字段
        if (getExport.size() < 1) {
            return null;
        }
        Map<String, String> titleMap = new LinkedHashMap<>();
        Map<String, String> titleSort = new HashMap<>();
        Map<String, String> condition = new HashMap<>();//条件
        for (int i = 0; i < getCondition.size(); i++) {
            String key = CodeUtil.fieldToProperty(getCondition.get(i).getString("COLUMN"));
            condition.put(key, paramMap.get(key));
        }
        for (int i = 0; i < getExport.size(); i++) {
            String key = CodeUtil.fieldToProperty(getExport.get(i).getString("COLUMN"));
            titleMap.put(key, getExport.get(i).getString("COLUMN_NAME"));
            titleSort.put(key, (i + 1) + "");
        }
        //获取数据
        List<BaseObject> getDatas = baseMapper.selectSQL2(SqlUtil.getSelect(getExport.get(0).get("DATABASE") + "." + getExport.get(0).get("TABLE"), titleMap, condition));
        return exportExcel3(getDatas, titleMap, titleSort, modulePath, getExport.get(0).getString("TABLE_NAME"));
    }

    //getInfo
    public List<JSONObject> getInfo(Map<String, String> paramMap) {
        List<JSONObject> list = baseMapper.getInformation2(paramMap);
        paramMap.remove("FORM_PKID");
        paramMap.remove("FORM_TABLE");
        return list;
    }

    //getTable
    public List<JSONObject> getTable(Map<String, String> paramMap) {
        List<JSONObject> list = baseMapper.getTable(paramMap);
        paramMap.remove("FORM_PKID");
        paramMap.remove("FORM_TABLE");
        return list;
    }

    //getDisplay
    public List<JSONObject> getDisplay(Map<String, String> paramMap) {
        List<JSONObject> list = baseMapper.getDisplay(paramMap);
        paramMap.remove("FORM_PKID");
        return list;
    }

    //getExport
    public List<JSONObject> getExport(Map<String, String> paramMap) {
        List<JSONObject> list = baseMapper.getExport(paramMap);
        paramMap.remove("FORM_PKID");
        paramMap.remove("FORM_TABLE");
        return list;
    }

    //getCondition
    public List<JSONObject> getCondition(Map<String, String> paramMap) {
        List<JSONObject> list = baseMapper.getCondition(paramMap);
        return list;
    }

    //return []
    public String[] toArray(String key, List<JSONObject> jsonObjects) {
        List list = new ArrayList();
        for (int i = 0; i < jsonObjects.size(); i++) {
            if (jsonObjects.get(i).get(key) != null && !"".equals(jsonObjects.get(i).get(key))) {
                list.add(jsonObjects.get(i).get(key));
            }
        }
        String[] strings = new String[list.size()];
        list.toArray(strings);
        return strings;
    }

    //return List<JSONObject>
    public List<JSONObject> toListJSONObject(Map param, List<JSONObject> objects) {
        for (int i = 0; i < objects.size(); i++) {
            if (objects.get(i).get("TYPE") != null && !"".equals(objects.get(i).get("TYPE"))) {
                //处理objects
                //1.获取type
                param.put("type", objects.get(i).get("TYPE"));
                List<JSONObject> objectsType = baseMapper.getInputTypeByType(param);
                if ("column".equals(param.get("column"))) {
                    objects.get(i).put("TYPE", objectsType.get(0).get("TYPE"));
                    objects.get(i).put("EDITABLE", objectsType.get(0).get("EDITABLE"));
                } else {
                    objects.get(i).put("TYPE", objectsType.get(0));
                }
                //获取value
                //1.通过sql
                List<JSONObject> objectsValue = new ArrayList<>();
                if (objects.get(i).get("SQL") != null && !"".equals(objects.get(i).get("SQL"))) {
                    if (objects.get(i).get("LINKNAME") == null || "".equals(objects.get(i).get("LINKNAME")) || !objects.get(i).get("FILED").equals(objects.get(i).get("LINKNAME"))) {
                        objectsValue = baseMapper.selectSQL(objects.get(i).get("SQL").toString());
                    }
                } else {
                    param.put("value", objects.get(i).get("VALUE"));
                    try {
                        objectsValue = baseMapper.getInputValueByValue(param);
                    } catch (Exception e) {
                        objectsValue = new ArrayList<>();
                    }
                }
                objects.get(i).put("VALUE", objectsValue);
            }
        }
        return objects;
    }

    // return echart
    private JSONObject getEchartObj(List<Map<String, String>> legendMapList, String xAxisStr, List<JSONObject> dataList) throws Exception {
        JSONObject resultObject = new JSONObject();
        List<String> legend = new ArrayList<String>();
        List<String> xAxis = new ArrayList<String>();
        JSONArray series = new JSONArray();
        boolean xAxis_ = true;
        for (Map<String, String> legendMap : legendMapList) {
            for (String key : legendMap.keySet()) {
                legend.add(legendMap.get(key));
                JSONObject tmpObj = new JSONObject();
                tmpObj.put("name", legendMap.get(key));
                List<String> seriesData = new ArrayList<String>();
                for (int i = 0; i < dataList.size(); i++) {
                    if (xAxis_) {
                        Object object = dataList.get(i).get(xAxisStr);
                        if (object == null) {
                            object = "";
                        }
                        xAxis.add(object.toString());
                    }
                    Object object = dataList.get(i).get(key);
                    if (object == null) {
                        object = "";
                    }
                    seriesData.add(object.toString());
                }
                xAxis_ = false;
                tmpObj.put("data", seriesData);
                series.add(tmpObj);
            }
        }
        resultObject.put("legend", legend);
        resultObject.put("xAxis", xAxis);
        resultObject.put("series", series);
        return resultObject;
    }
}
