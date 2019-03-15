package com.bireturn.excle.util;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * table=>database.table/table
 * condition=> and ... and ..
 */

public class SqlUtil {

    private String pkid = "PKID";//主键
    private static String select = "select @@column from @@table where 1=1 @@condition";//查询
    private static String insert = "insert into @@table (@@column) values @@value";//插入
    private static String update = "update @@table set @@value where 1=1 @@condition";//更新
    private static String delete = "delete from @@table where 1=1 @@condition";//删除
    public static String CURD_INSERT = "添加";
    public static String CURD_UPDATE = "修改";
    public static String CURD_DELETE = "删除";
    public static String CURD_SELECT = "查询";
    public static String TYPE_MYSQL = "MYSQL";
    public static String TYPE_ORACLE = "ORACLE";

    public String getPkid() {
        return pkid;
    }

    public void setPkid(String pkid) {
        this.pkid = pkid;
    }

    public SqlUtil() {
    }

    public SqlUtil(String pkid) {
        this.pkid = pkid;
    }

    //查询1
    public static String getSelect(String table, String column, String condition) {
        return select.replaceAll("@@column", column).replaceAll("@@table", table).replaceAll("@@condition", condition);
    }

    //查询2
    public static String getSelect(String table, Map column, String condition) {
        String code = "ifnull(@@code,'') @@code,";
        String column2 = "";
        Iterator it = column.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            column2 += code.replaceAll("@@code", CodeUtil.propertyToField(entry.getKey().toString()));
        }
        column2 = column2.substring(0, column2.length() - 1);
        return select.replaceAll("@@column", column2).replaceAll("@@table", table).replaceAll("@@condition", condition);
    }

    //查询3(根据主键查找)
    public static String getSelect(String table, String column, Map param, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid()) || param.get(sqlUtil.getPkid()) == null || "".equals(param.get(sqlUtil.getPkid()))) {
            return null;
        }
        String condition = " and `" + CodeUtil.propertyToField(sqlUtil.getPkid()) + "`=" + sqlValue(param.get(sqlUtil.getPkid()));
        return select.replaceAll("@@column", column).replaceAll("@@table", table).replaceAll("@@condition", condition);
    }

    //查询4(根据查询条件查找)
    public static String getSelect(String table, String column, Map param, com.alibaba.fastjson.JSONArray input, SqlUtil sqlUtil, String type) {
        boolean getPage = false;//是否分页
        String[] page = new String[2];
        String condition = "";//过滤条件
        //构建条件
        Iterator it = param.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            String key = entry.getKey().toString();
            String value = entry.getValue().toString();
            if ("DRILLING".equals(key)) {//钻取(添加主键)
                condition += " and " + sqlFiled(sqlUtil.getPkid()) + "=" + sqlValue(param.get(sqlUtil.getPkid()));
                continue;
            }
            if (key == null || "".equals(key) || value == null || "".equals(value)) {//没有值
                continue;
            }
            if ("@@limit".equals(key)) {//分页
                String[] array = value.split("@@and");
                page[0] = array[0];
                page[1] = array[1];
                getPage = true;
                continue;
            }
            if (input.size() > 0) {
                if (!"null".equals(input.getJSONObject(0).toString())) {
                    for (int i = 0; i < input.size(); i++) {//过滤条件
                        Object objName = input.getJSONObject(i).get("NAME");
                        String name = (objName != null) ? objName.toString() : "";
                        Object objFiled = input.getJSONObject(i).get("FILED");
                        String filed = (objFiled != null) ? objFiled.toString() : "";
                        if (key.equals(name) || key.equals(filed)) {
                            Object objRelation = input.getJSONObject(i).get("RELATION");
                            String relation = (objRelation != null) ? objRelation.toString() : "";
                            if (relation == null || "".equals(relation) || "=".equals(relation)) {
                                //等于
                                condition += " and " + sqlFiled(filed) + "=" + sqlValue(value);
                                break;
                            } else if (relation.indexOf("like") != -1) {
                                //模糊查询
                                condition += " and " + sqlFiled(filed) + relation + "'%" + value + "%'";
                            } else {
                                //其他条件
                                condition += " and " + sqlFiled(filed) + relation + sqlValue(value);
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!getPage) {
            type = "";
        }
        return getPage(select.replaceAll("@@column", column).replaceAll("@@table", table).replaceAll("@@condition", condition), type, page);
    }

    //查询5(根据查询条件查找)
    public static String getSelectByList(String table, String column, Map param, List<JSONObject> input, SqlUtil sqlUtil, String type) {
        boolean getPage = false;//是否分页
        String[] page = new String[2];
        String condition = "";//过滤条件
        //构建条件
        Iterator it = param.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            String key = entry.getKey().toString();
            String value = entry.getValue().toString();
            if ("DRILLING".equals(key)) {//钻取(添加主键)
                condition += " and " + sqlFiled(sqlUtil.getPkid()) + "=" + sqlValue(param.get(sqlUtil.getPkid()));
                continue;
            }
            if ("@@limit".equals(key)) {//分页
                String[] array = value.split("@@and");
                page[0] = array[0];
                page[1] = array[1];
                getPage = true;
                continue;
            }
            if (key == null || "".equals(key) || value == null || "".equals(value)) {//没有值
                continue;
            }
            for (int i = 0; i < input.size(); i++) {//过滤条件
                Object objName = input.get(i).get("NAME");
                String name = (objName != null) ? objName.toString() : "";
                Object objFiled = input.get(i).get("FILED");
                String filed = (objFiled != null) ? objFiled.toString() : "";
                if (key.equals(name) || key.equals(filed)) {
                    Object objRelation = input.get(i).get("RELATION");
                    String relation = (objRelation != null) ? objRelation.toString() : "";
                    if (relation == null || "".equals(relation) || "=".equals(relation)) {
                        //等于
                        condition += " and " + sqlFiled(filed) + "=" + sqlValue(value);
                        break;
                    } else if (relation.indexOf("like") != -1) {
                        //模糊查询
                        condition += " and " + sqlFiled(filed) + relation + "'%" + value + "%'";
                    } else {
                        //其他条件
                        condition += " and " + sqlFiled(filed) + relation + sqlValue(value);
                        break;
                    }
                }
            }
        }
        if (!getPage) {
            type = "";
        }
        return getPage(select.replaceAll("@@column", column).replaceAll("@@table", table).replaceAll("@@condition", condition), type, page);
    }

    //分页处理
    public static String getPage(String sql, String type, String[] page) {
        String mysql = "SELECT a.* FROM(@@sql) a LIMIT @@index,@@page";
        String oracle = "SELECT b.* FROM( SELECT a.*,ROWNUM rn FROM(@@sql) a WHERE ROWNUM<=@@end) b WHERE b.rn>=@@start";
        if (TYPE_MYSQL.equals(type)) {
            sql = mysql.replaceAll("@@sql", sql).replaceAll("@@index", page[0]).replaceAll("@@page", page[1]);
        } else if (TYPE_ORACLE.equals(type)) {
            sql = oracle.replaceAll("@@sql", sql).replaceAll("@@start", (Integer.parseInt(page[0]) + 1 + "")).replaceAll("@@end", (Integer.parseInt(page[0]) + Integer.parseInt(page[1]) + ""));
        }
        return sql;
    }

    //查询5
    public static String getSelect(String table, Map column, Map value) {
        String condition = "";
        String limit = "";
        String value_eq = "and @@key = @@value ";//map.put("key或者KEY","Value");
        String value_nq = "and @@key <> @@value ";//map.put("key或者KEY","@@!=Value");
        String value_lq = "and @@key < @@value ";//map.put("key或者KEY","@@<Value");
        String value_rq = "and @@key > @@value ";//map.put("key或者KEY","@@>Value");
        String value_between = "and @@key between @@value1 and @@value2 ";//map.put("key或者KEY","@@betweenValue1@@andValue2");
        String value_like = "and @@key like @@value ";//map.put("key或者KEY","@@likeValue");
        String value_nlike = "and @@key not like @@value ";//map.put("key或者KEY","@@nlikeValue");
        String value_limit = "limit @@value1,@@value2 ";//map.put("@@limit","Value1@@andValue2");
        String code = "ifnull(@@code,'') @@code,";
        String column2 = "";
        Iterator it = column.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            if ("*".equals(entry.getKey().toString())) {
                column2 += entry.getKey().toString() + ",";
            } else {
                column2 += code.replaceAll("@@code", CodeUtil.propertyToField(entry.getKey().toString()));
            }
        }
        column2 = column2.substring(0, column2.length() - 1);
        Iterator it2 = value.entrySet().iterator();
        while (it2.hasNext()) {
            String values = "";
            Map.Entry entry = (Map.Entry) it2.next();
            if (!(entry.getValue() == null || "".equals(entry.getValue().toString()))) {
                if ("@@limit".equals(entry.getKey().toString())) {
                    String[] array = entry.getValue().toString().split("@@and");
                    limit = value_limit.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value1", array[0]).replaceAll("@@value2", array[1]);
                } else if (entry.getValue().toString().contains("@@nlike")) {
                    values = value_nlike.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value", sqlValue(entry.getValue())).replaceAll("@@nlike", "");
                } else if (entry.getValue().toString().contains("@@like")) {
                    values = value_like.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value", sqlValue(entry.getValue())).replaceAll("@@like", "");
                } else if ((entry.getValue().toString().contains("@@between")) && (entry.getValue().toString().contains("@@and"))) {
                    String[] array = entry.getValue().toString().split("@@and");
                    values = value_between.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value1", sqlValue(array[0])).replaceAll("@@value2", sqlValue(array[1])).replaceAll("@@between", "");
                } else if (entry.getValue().toString().contains("@@>")) {
                    values = value_rq.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value", sqlValue(entry.getValue())).replaceAll("@@>", "");
                } else if (entry.getValue().toString().contains("@@<")) {
                    values = value_lq.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value", sqlValue(entry.getValue())).replaceAll("@@<", "");
                } else if (entry.getValue().toString().contains("@@!=")) {
                    values = value_nq.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value", sqlValue(entry.getValue())).replaceAll("@@!=", "");
                } else {
                    values = value_eq.replaceAll("@@key", CodeUtil.propertyToField(entry.getKey().toString())).replaceAll("@@value", sqlValue(entry.getValue()));
                }
            }
            condition += values;
        }
        return select.replaceAll("@@column", column2).replaceAll("@@table", table).replaceAll("@@condition", condition + limit);
    }

    //插入一条Map
    public static String getInsert(String table, Map value, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid())) {
            return null;
        }
        String column = "";
        String values = "";
        Iterator it = value.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            if (!(sqlUtil.getPkid().equals(CodeUtil.propertyToField(entry.getKey().toString()))) && entry.getValue() != null && !"".equals(entry.getValue().toString())) {
                column += CodeUtil.propertyToField(entry.getKey().toString()) + ",";
                values += sqlValue(entry.getValue()) + ",";
            }
        }
        column += sqlUtil.getPkid();
        values = "(" + values + sqlValue(UUID.randomUUID()) + ")";
        if (table == null || "".equals(table) || "".equals(column) || "".equals(values)) {
            return null;
        }
        return insert.replaceAll("@@table", table).replaceAll("@@column", column).replaceAll("@@value", values);
    }

    //插入多条List<Map>
    public static String getInsert(String table, List<Map> value, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid())) {
            return null;
        }
        String column = "";
        String values = "";
        for (int i = 0; i < value.size(); i++) {
            String valSql = "(@@valSql),";
            String valStr = "";
            Iterator it = value.get(i).entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry entry = (Map.Entry) it.next();
                if (!(sqlUtil.getPkid().equals(CodeUtil.propertyToField(entry.getKey().toString()))) && entry.getValue() != null && !"".equals(entry.getValue().toString())) {
                    if (i == 0) {
                        column += CodeUtil.propertyToField(entry.getKey().toString()) + ",";
                    }
                    valStr += sqlValue(entry.getValue()) + ",";
                }
            }
            valStr += sqlValue(UUID.randomUUID());
            valSql = valSql.replaceAll("@@valSql", valStr);
            values += valSql;
        }
        column += sqlUtil.getPkid();
        values = values.substring(0, values.length() - 1);
        if (table == null || "".equals(table) || "".equals(column) || "".equals(values)) {
            return null;
        }
        return insert.replaceAll("@@table", table).replaceAll("@@column", column).replaceAll("@@value", values);
    }

    //修改一条Map
    public static String getUpdate(String table, Map value, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid()) || value.get(sqlUtil.getPkid()) == null || "".equals(value.get(sqlUtil.getPkid()))) {
            return null;
        }
        String condition = "and " + sqlUtil.getPkid() + "=@@PKID";
        String values = "";
        Iterator it = value.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry entry = (Map.Entry) it.next();
            if (!(sqlUtil.getPkid().equals(CodeUtil.propertyToField(entry.getKey().toString())))) {
                values += CodeUtil.propertyToField(entry.getKey().toString()) + "=" + sqlValue(entry.getValue()) + ",";
            }
        }
        values = values.substring(0, values.length() - 1);
        condition = condition.replaceAll("@@PKID", sqlValue(value.get(sqlUtil.getPkid())));
        return update.replaceAll("@@table", table).replaceAll("@@value", values).replaceAll("@@condition", condition);
    }

    //删除一条String
    public static String getDelete(String table, Map value, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid()) || value.get(sqlUtil.getPkid()) == null || "".equals(value.get(sqlUtil.getPkid()))) {
            return null;
        }
        String condition = " and " + sqlUtil.getPkid() + " = '@@PKID'".replaceAll("@@PKID", value.get(sqlUtil.getPkid()).toString());
        return delete.replaceAll("@@table", table).replaceAll("@@condition", condition);
    }

    //删除多条Map(key,'id1,id2,id3')(待修改)
    public static String getDelete2(String table, Map value, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid())) {
            return null;
        }
        String condition = "and " + sqlUtil.getPkid() + " in(@@PKID)";
        String values = "";
        for (String i : ((Map.Entry) value.entrySet().iterator().next()).getValue().toString().split(",")) {
            values += sqlValue(i) + ",";
        }
        values = values.substring(0, values.length() - 1);
        condition = condition.replaceAll("@@PKID", values);
        return delete.replaceAll("@@table", table).replaceAll("@@condition", condition);
    }

    //删除多条JSONArray([{},{},{}])
    public static String getDelete(String table, JSONArray value, SqlUtil sqlUtil) {
        if (sqlUtil.getPkid() == null || "".equals(sqlUtil.getPkid())) {
            return null;
        }
        String condition = "and " + sqlUtil.getPkid() + " in(@@PKID)";
        String values = "";
        for (int i = 0; i < value.size(); i++) {
            values += sqlValue(value.getJSONObject(i).get(sqlUtil.getPkid())) + ",";
        }
        values = values.substring(0, values.length() - 1);
        condition = condition.replaceAll("@@PKID", values);
        return delete.replaceAll("@@table", table).replaceAll("@@condition", condition);
    }

    //key转化a=>`a`
    public static String sqlFiled(Object o) {
        String filed = "";
        if (o != null) {
            filed = o.toString();
        }
        if ("".equals(filed)) {
            filed = null;
        } else {
            filed = "`" + filed + "`";
        }
        return filed;
    }

    //value转化a=>'a'/(null||"")=>null
    public static String sqlValue(Object o) {
        String value = "";
        if (o != null) {
            value = o.toString();
        }
        if ("".equals(value)) {
            value = null;
        } else {
            value = "'" + value + "'";
        }
        return value;
    }

}