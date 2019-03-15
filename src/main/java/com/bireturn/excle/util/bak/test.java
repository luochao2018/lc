package com.bireturn.excle.util.bak;

import com.bireturn.excle.util.CodeUtil;

import java.text.SimpleDateFormat;
import java.util.Date;

public class test {
    public static void main(String[] args) {
        String str1 = "abcDefG";
        String str2 = "ABC_DEF_G";
        String filed = CodeUtil.propertyToField(str1);
        String property = CodeUtil.fieldToProperty(filed);

        System.out.println("filed:"+filed);
        System.out.println("property:"+property);
        System.out.println(str1.equals(property));
        System.out.println(str2.equals(filed));

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String s = sdf.format(new Date());
        System.out.println(s);

    }
}
