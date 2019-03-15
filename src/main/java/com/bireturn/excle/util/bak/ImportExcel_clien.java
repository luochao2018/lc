package com.bireturn.excle.util.bak;

import com.alibaba.fastjson.JSONObject;
import com.bireturn.excle.util.ImportExcel;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.InputStream;
import java.util.List;

public class ImportExcel_clien {
    /**
     * 针对Student类进行导入的操作
     *
     * @returnList<Student>
     */
    public static List<JSONObject> importExcel(MultipartHttpServletRequest params) throws Exception {
        InputStream in = null;
        List<List<Object>> listob = null;
        MultipartFile file = params.getFile("file");
        if (file.isEmpty()) {
            throw new Exception("文件不存在！");
        }
        in = file.getInputStream();
        listob = new ImportExcel().getBankListByExcel(in, file.getOriginalFilename());
        in.close();

        for(int i=0;i<listob.size();i++){
            List<Object> list = listob.get(i);
            for (int j=0;j<list.size();j++){
                System.out.println(list.get(j));
            }
        }
        // 该处可调用service相应方法进行数据保存到数据库中，现只对数据输出


        return null;
    }
}