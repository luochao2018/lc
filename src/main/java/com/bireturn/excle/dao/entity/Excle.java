package com.bireturn.excle.dao.entity;

public class Excle {
    public static final String XLSX_TYPE = "xlsx";
    public static final String XLS_TYPE = "xls";
    private String url;//存储路径
    private String sheetName;//工作表名
    private String[] title;//表头名
    private String[] code;//字段名
    private String titleColor;//表头颜色
    private String rowJColor;//奇数行颜色
    private String rowOColor;//偶数行颜色
    private String type;//导出类型
    private short titleSize;//表头字体大小
    private short titleAlign;//表头位置[0:default;1:left;2:center;3:right]
    private short columnSize;//数据列字体大小
    private short columnAlign;//数据列位置[0:default;1:left;2:center;3:right]
    private int width;//列宽

    public Excle(String url, String sheetName, String titleColor, String rowJColor, String rowOColor,String type, short titleSize, short titleAlign, short columnSize, short columnAlign, int width) {
        this.url = url;
        this.sheetName = sheetName;
        this.titleColor = titleColor;
        this.rowJColor = rowJColor;
        this.rowOColor = rowOColor;
        this.type = type;
        this.titleSize = titleSize;
        this.titleAlign = titleAlign;
        this.columnSize = columnSize;
        this.columnAlign = columnAlign;
        this.width = width;
    }

    public Excle() {
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getSheetName() {
        return sheetName;
    }

    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

    public String[] getTitle() {
        return title;
    }

    public void setTitle(String[] title) {
        this.title = title;
    }

    public String[] getCode() {
        return code;
    }

    public void setCode(String[] code) {
        this.code = code;
    }

    public String getTitleColor() {
        return titleColor;
    }

    public void setTitleColor(String titleColor) {
        this.titleColor = titleColor;
    }

    public String getRowJColor() {
        return rowJColor;
    }

    public void setRowJColor(String rowJColor) {
        this.rowJColor = rowJColor;
    }

    public String getRowOColor() {
        return rowOColor;
    }

    public void setRowOColor(String rowOColor) {
        this.rowOColor = rowOColor;
    }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public short getTitleSize() {
        return titleSize;
    }

    public void setTitleSize(short titleSize) {
        this.titleSize = titleSize;
    }

    public short getTitleAlign() {
        return titleAlign;
    }

    public void setTitleAlign(short titleAlign) {
        this.titleAlign = titleAlign;
    }

    public short getColumnSize() {
        return columnSize;
    }

    public void setColumnSize(short columnSize) {
        this.columnSize = columnSize;
    }

    public short getColumnAlign() {
        return columnAlign;
    }

    public void setColumnAlign(short columnAlign) {
        this.columnAlign = columnAlign;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }
}
