package com.bireturn.excle.dao.entity;

import com.adm.common.FileHandleFactroy;
import com.adm.handle.model.ExcelOpreateConfig;
import org.apache.commons.io.FileUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;

/**
 * <p>
 * 所属模块: [fileHandle包操作类]
 * </p>
 * <p>
 * 功能描述: []
 * </p>
 *
 * @author liuhaoyu
 * @update:[日期YYYY-MM-DD][更改人姓名][变更描述]
 * @version 1.0
 */
public class FileHandleUtils {
    /**
     * <p>功能描述:[下载excel模板到指定位置]</p>
     *
     * @param fromSheet
     * @param toSheet
     * @param sourceFile
     * @param targetFile
     * @return
     * @author:liuhaoyu
     * @update:[日期YYYY-MM-DD][更改人姓名][变更描述]
     */
    public static ResponseEntity<byte[]> downloadExcelModel(String fromSheet, String toSheet, String sourceFile, String targetFile) throws IOException {
        // 创建模板复制文件到指定位置
        FileHandleFactroy factroy = new FileHandleFactroy();
        ExcelOpreateConfig config = ExcelOpreateConfig.getInstance();
        config.setFromSheet(fromSheet);
        config.setToSheet(toSheet);
        config.setSourceFile(sourceFile);
        config.setTargetFile(targetFile);
        factroy.downloadExcelModel(config);
        // 找到目标文件
        File file = new File(targetFile);
        // 开启下载
        return startDownload(file, "download.xls");
    }

    /**
     * <p>功能描述:[开启下载. 在需要开启下载的接口的@RequestMapping里面添加 produces="application/octet-stream;charset=UTF-8"]</p>
     *
     * @param file
     * @param fileName
     * @return
     * @throws IOException
     */
    public static ResponseEntity<byte[]> startDownload(File file, String fileName) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", fileName);
        return new ResponseEntity<byte[]>(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
    }
}
