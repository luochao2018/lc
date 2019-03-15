package com.bireturn.excle.util;

import com.adm.common.FileHandleFactroy;
import com.adm.handle.model.FileBaseConfig;
import com.adm.utils.FileUtils;
import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.dao.entity.Excle;
import com.bireturn.excle.dao.entity.FileHandleUtils;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.hssf.util.HSSFColor;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.*;

public class ExportExcel {

    private static SimpleDateFormat SDF = null;//获取系统时间

    /**
     * 方法描述:生成调用的方法
     *
     * @param collection 表数据集合
     * @param excle      excle数据集合
     * @throws Exception void
     * @author luochao  2018-7-20 10:11:07
     */
    public static HSSFWorkbook exportExcel(Collection<?> collection, Excle excle, HttpServletResponse response) {
        HSSFWorkbook wb = new HSSFWorkbook();
        try {
            response.setContentType("application/octet-stream");
            //默认Excel名称
            response.setHeader("Content-disposition", "attachment;filename=" + URLEncoder.encode(excle.getSheetName(), "UTF-8") + ".xls");
            response.flushBuffer();
            OutputStream os = response.getOutputStream();//输出流
            wb = generateExcelforObject(collection, excle);
            wb.write(os);
        } catch (Exception e) {
            System.out.println(e);
        }
        return wb;
    }

    private static HSSFWorkbook generateExcelforObject(Collection<?> collection, Excle excle) throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        HSSFWorkbook wb = new HSSFWorkbook();
        HSSFSheet sheet = wb.createSheet();//工作表
        HSSFRow row = null;//工作行
        short rowNum = 0;//行号

        //判断数据有效性
        if (collection == null || collection.size() < 1) {
            return wb; //无数据则返回
        }
        if (excle.getTitle() == null || excle.getTitle().length < 1) {
            return wb; //表头为空则返回
        }
        if (excle.getCode() == null || excle.getCode().length < 1) {
            return wb; //无字段则返回
        }
        if (excle.getTitle().length != excle.getCode().length) {
            return wb;    //两个数组长度不同则返回
        }

        //设置工作簿的名称
        wb.setSheetName(0, StringUtils.isEmpty(excle.getSheetName()) ? "sheet1" : excle.getSheetName());

        //自定义颜色区
        HSSFPalette customPalette = wb.getCustomPalette();//获取表格属性
        setHSSFColor(customPalette, HSSFColor.INDIGO.index, StringUtils.isEmpty(excle.getTitleColor()) ? "ffffff" : excle.getTitleColor());//INDIGO:标题背景色
        setHSSFColor(customPalette, HSSFColor.PLUM.index, StringUtils.isEmpty(excle.getRowJColor()) ? "ffffff" : excle.getRowJColor());//PLUM:数据单行背景色
        setHSSFColor(customPalette, HSSFColor.BROWN.index, StringUtils.isEmpty(excle.getRowOColor()) ? "ffffff" : excle.getRowOColor());//BROWN:数据偶行背景色

        //=====设置标题样式=====
        HSSFCellStyle titleStyle = wb.createCellStyle();//标题样式
        HSSFFont titleFont = wb.createFont();//设置标题字体样式
        short titleIndex[] = {
                HSSFCellStyle.SOLID_FOREGROUND,//设置单元格背景样式
                HSSFColor.INDIGO.index,//设置单元格背景颜色
                HSSFCellStyle.BORDER_THIN,//设置单元格上下左右部线加粗
                HSSFColor.BLACK.index,//上下左右边框颜色
                excle.getTitleAlign(),//设置单元格字符位置
                0,//字体样式[0:黑体;1:宋体]
                HSSFColor.BLACK.index,//设置字体颜色
                excle.getTitleSize(),//设置字体大小
                HSSFFont.BOLDWEIGHT_NORMAL//设置字体样式(正常)
        };//样式设置

        //======设置奇数行样式====
        HSSFCellStyle columnStyle1 = wb.createCellStyle();//数据列样式_奇数
        HSSFFont columnFont = wb.createFont();//设置数据字体样式
        short columnIndex1[] = {
                HSSFCellStyle.SOLID_FOREGROUND,//设置单元格背景样式
                HSSFColor.PLUM.index,//设置单元格背景颜色
                HSSFCellStyle.BORDER_THIN,//设置单元格上下左右部线加粗
                HSSFColor.BLACK.index,//上下左右边框颜色
                excle.getColumnAlign(),//设置单元格字符位置
                1,//字体样式[0:黑体;1:宋体]
                HSSFColor.BLACK.index,//设置字体颜色
                excle.getColumnSize(),//设置字体大小
                HSSFFont.BOLDWEIGHT_NORMAL//设置字体样式(正常)
        };//样式设置

        //=====设置偶数行样式=====
        HSSFCellStyle columnStyle2 = wb.createCellStyle();//数据列样式_偶数
        short columnIndex2[] = {
                HSSFCellStyle.SOLID_FOREGROUND,//设置单元格背景样式
                HSSFColor.BROWN.index,//设置单元格背景颜色
                HSSFCellStyle.BORDER_THIN,//设置单元格上下左右部线加粗
                HSSFColor.BLACK.index,//上下左右边框颜色
                excle.getColumnAlign(),//设置单元格字符位置
                1,//字体样式[0:黑体;1:宋体]
                HSSFColor.BLACK.index,//设置字体颜色
                excle.getColumnSize(),//设置字体大小
                HSSFFont.BOLDWEIGHT_NORMAL//设置字体样式(正常)
        };//样式设置

        //设置标题
        row = sheet.createRow(rowNum);
        setTitle(row, excle.getTitle(), wb, setHSSFCellStyle(titleStyle, titleFont, titleIndex));
        // 设置列宽
        for (int i = 0; i < excle.getCode().length; i++) {
            sheet.setColumnWidth(i, excle.getWidth() * 100); //第一个参数代表列id(从colNum开始),第2个参数代表宽度值
        }
        for (Iterator<?> iter = collection.iterator(); iter.hasNext(); ) {
            Object exportEle = iter.next();
            // 行对象
            row = sheet.createRow(++rowNum);
            //设置对应值;隔行换色
            setRow(row, excle.getCode(), exportEle, rowNum % 2 == 0 ? setHSSFCellStyle(columnStyle1, columnFont, columnIndex1) : setHSSFCellStyle(columnStyle2, columnFont, columnIndex2));
        }
        // 合并单元格
//        CellRangeAddress region = new CellRangeAddress(5, 5, 0, 2);//起始行号，终止行号， 起始列号，终止列号
//        sheet.addMergedRegion(region);
        return wb;
    }

    /**
     * 方法描述: 为Excel页中的每个横行设置标题
     *
     * @param row
     * @param strMeaning
     * @param wb
     * @throws IllegalAccessException
     * @throws InvocationTargetException
     * @throws NoSuchMethodException     void
     * @author luochao  2018-7-20 9:22:39
     */
    @SuppressWarnings("deprecation")
    private static void setTitle(HSSFRow row, String[] strMeaning, HSSFWorkbook wb, HSSFCellStyle style) throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        for (int k = 0; k < strMeaning.length; k++) {
            HSSFCell cell = row.createCell((short) k);
            cell.setCellStyle(style);// 加载样式
            cell.setCellValue(strMeaning[k]);// 加载数据
        }
    }

    /**
     * 方法描述: 为Excel页中的每个横行设置值
     *
     * @param row
     * @param strName
     * @param exportModel
     * @throws IllegalAccessException
     * @throws InvocationTargetException
     * @throws NoSuchMethodException     void
     * @author luochao  2018-7-20 9:22:26
     */
    @SuppressWarnings("deprecation")
    private static void setRow(HSSFRow row, String[] strName, Object exportModel, HSSFCellStyle style) throws IllegalAccessException, InvocationTargetException, NoSuchMethodException {
        Object temp = null;
        for (int k = 0; k < strName.length; k++) {
            // Cell对象
            HSSFCell cell = row.createCell((short) k);
            //设置对应值
            try {
                //检查该实体是否有这个属性
                temp = PropertyUtils.getProperty(exportModel, strName[k]);
            } catch (Exception e) {
                e.getStackTrace();
                continue;
            }
            if (temp == null) {
                cell.setCellValue(StringUtils.EMPTY);
            } else {
                if (temp instanceof Date) {
                    cell.setCellValue(getDateTimeFormat().format(Date.class.cast(temp)));
                } else if (NumberUtils.isNumber(temp.toString())) {
                    cell.setCellValue(Double.parseDouble(temp.toString()));
                } else {
                    cell.setCellValue(temp.toString());
                }
            }
            cell.setCellStyle(style);
        }
    }

    /**
     * 方法描述: 自定义颜色样式
     *
     * @return HSSFPalette
     * @author luochao  2018-7-20 10:38:40
     */
    public static HSSFPalette setHSSFColor(HSSFPalette hssfPalette, short index, String color) {
        byte[] rgb = ColorUtil.parseToColor(color);
        hssfPalette.setColorAtIndex(index, rgb[0], rgb[1], rgb[2]);//自定义颜色
        return hssfPalette;
    }

    /**
     * 方法描述: 设置单元格及字体样式
     *
     * @return HSSFCellStyle
     * @author luochao  2018-7-20 10:38:40
     */
    public static HSSFCellStyle setHSSFCellStyle(HSSFCellStyle style, HSSFFont font, short[] styles) {

        // 设置标题表格样式
        style.setFillPattern(styles[0]); //设置单元格背景样式
        style.setFillForegroundColor(styles[1]);//设置单元格背景颜色
        style.setBorderBottom(styles[2]);  //设置单元格下部线加粗
        style.setBottomBorderColor(styles[3]);//下边框颜色
        style.setBorderLeft(styles[2]);  //设置单元格左部线加粗
        style.setLeftBorderColor(styles[3]);//左边框颜色
        style.setBorderRight(styles[2]);  //设置单元格右部线加粗
        style.setRightBorderColor(styles[3]);//右边框颜色
        style.setBorderTop(styles[2]);   //设置单元格上部线加粗
        style.setTopBorderColor(styles[3]);//上边框颜色
        style.setAlignment(styles[4]);  //设置水平对齐的样式为居中对齐;
        style.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);//设置垂直对齐的样式为居中对齐;
        style.setWrapText(true);//设置自动换行

        //设置标题字体样式
        font.setFontName(styles[5] > 0 ? "宋体" : "黑体");
        font.setColor(styles[6]);  //设置字体颜色
        font.setFontHeightInPoints(styles[7]); //设置字体大小
        font.setBoldweight(styles[8]);  //设置字体加粗

        // 把字体应用到当前的样式
        style.setFont(font);
        return style;
    }

    /**
     * 方法描述: 获取系统时间格式[yyyy-MM-dd]
     *
     * @return SimpleDateFormat
     * @author luochao  2018-7-20 10:38:40
     */
    public static SimpleDateFormat getDateFormat() {
        if (SDF == null) {
            SDF = new SimpleDateFormat("yyyy-MM-dd");
        }
        return SDF;
    }

    /**
     * 方法描述: 获取系统精确时间格式[yyyy-MM-dd hh:mm:ss]
     *
     * @return SimpleDateFormat
     * @author luochao  2018-7-20 10:38:40
     */
    public static SimpleDateFormat getDateTimeFormat() {
        if (SDF == null) {
            SDF = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        }
        return SDF;
    }

    /**
     * 导出模板2(JSONObject)
     * @param datas
     * @param titleMap
     * @param titleSort
     * @param modulePath
     * @param fileName
     * @return
     * @throws IOException
     */
    public static ResponseEntity<byte[]> exportExcel2(List<JSONObject> datas, Map<String, String> titleMap, Map<String, String> titleSort, String modulePath, String fileName){
        String randString = UUID.randomUUID().toString().substring(0, 30);//定义pkid
        FileBaseConfig fileBaseConfig = new FileBaseConfig();
        fileBaseConfig.setTitleNM(titleMap);
        fileBaseConfig.setTitleSort(titleSort);
        fileBaseConfig.setExcelType(FileBaseConfig.XLS_TYPE);
        fileBaseConfig.setSaveFilePath(modulePath + "download" + File.separator + randString);
        FileHandleFactroy fileHandleFactroy = new FileHandleFactroy();

        // 创建导出文件夹
        FileUtils.createFolder(modulePath);
        FileUtils.createFolder(modulePath + "download");
        FileUtils.createFolder(fileBaseConfig.getSaveFilePath());
        // 执行导出
        try {
            fileHandleFactroy.exportExcelFileByJsonString(datas, fileBaseConfig);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 获取文件
        List<File> list = Arrays.asList(FileUtils.getFileList(fileBaseConfig.getSaveFilePath()));
        // 添加到流
        ResponseEntity<byte[]> responseEntity = null;
        try {
            responseEntity = FileHandleUtils.startDownload(list.get(0), new String(fileName.getBytes("gb2312"), "iso-8859-1") + ".xls");
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 删除导出文件
        FileUtils.deleteAllFiles(fileBaseConfig.getSaveFilePath());
        FileUtils.delFolder(fileBaseConfig.getSaveFilePath());
        return responseEntity;
    }

    /**
     * 导出模板3(Class)[暂无法使用]
     * @param datas
     * @param titleMap
     * @param titleSort
     * @param modulePath
     * @param fileName
     * @return
     * @throws IOException
     */
    public static ResponseEntity<byte[]> exportExcel3(List<?> datas, Map<String, String> titleMap, Map<String, String> titleSort, String modulePath, String fileName) {
        String randString = UUID.randomUUID().toString().substring(0, 30);//定义pkid
        FileBaseConfig fileBaseConfig = new FileBaseConfig();
        fileBaseConfig.setTitleNM(titleMap);
        fileBaseConfig.setTitleSort(titleSort);
        fileBaseConfig.setExcelType(FileBaseConfig.XLS_TYPE);
        fileBaseConfig.setSaveFilePath(modulePath + "download" + File.separator + randString);
        FileHandleFactroy fileHandleFactroy = new FileHandleFactroy();

        // 创建导出文件夹
        FileUtils.createFolder(modulePath);
        FileUtils.createFolder(modulePath + "download");
        FileUtils.createFolder(fileBaseConfig.getSaveFilePath());
        // 执行导出
        fileHandleFactroy.exportSingleExcelFile(datas, fileBaseConfig);
        // 获取文件
        List<File> list = Arrays.asList(FileUtils.getFileList(fileBaseConfig.getSaveFilePath()));
        // 添加到流
        ResponseEntity<byte[]> responseEntity = null;
        try {
            responseEntity = FileHandleUtils.startDownload(list.get(0), new String(fileName.getBytes("gb2312"), "iso-8859-1") + ".xls");
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 删除导出文件
        FileUtils.deleteAllFiles(fileBaseConfig.getSaveFilePath());
        FileUtils.delFolder(fileBaseConfig.getSaveFilePath());
        return responseEntity;
    }
}