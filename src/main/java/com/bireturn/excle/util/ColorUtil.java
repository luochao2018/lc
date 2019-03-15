package com.bireturn.excle.util;
/**
 * 颜色十六进制转化为RGB
 * 输出 byte[] = {r,g,b};
 *
 * luochao
 * 2018-7-20 11:19:17
 */
import java.awt.*;

public class ColorUtil {
    public static byte[] parseToColor(String color) {
        //如果含有"#",则除去
        if(color.indexOf("#")!=-1){
            color = color.substring(1);
        }
        Color convertedColor = Color.ORANGE;
        byte rgb[] = new byte[3];
        try {
            //转为16进制
            convertedColor = new Color(Integer.parseInt(color, 16));
            //16进制转rgb
            rgb[0] = (byte)convertedColor.getRed();//r
            rgb[1] = (byte)convertedColor.getGreen();//g
            rgb[2] = (byte)convertedColor.getBlue();//b
        } catch(NumberFormatException e) {
            // codes to deal with this exception
            System.out.println( e);
        }
        return rgb;
    }
}