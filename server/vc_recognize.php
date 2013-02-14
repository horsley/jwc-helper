<?php
/**
 * Created by JetBrains PhpStorm.
 * User: horsley
 * Date: 13-1-19
 * Time: 上午11:33
 * To change this template use File | Settings | File Templates.
 */

define('IMG_WIDTH', 46);
define('IMG_HEIGHT', 20);
define('CHAR_COUNT', 4);
define('PIC_MIME', 'image/png');
define('NULL_COL', str_repeat('0', IMG_HEIGHT));
define('MAX_CHAR_WIDTH', 13); //单字符最大宽度，判定连字
define('MIN_CHAR_WIDTH', 2); //最小字符串宽度，判定结束

$embed_signs = array( //嵌入问题标记
    'wj' => '01100000000000000000',
    'vV' => '00000000111111000000',
    'Kv' => '00000000111000000000',
    'fY' => '00000000001111000000',
);

$char_lib = require(dirname(__FILE__) . '/vc.php'); //加载特征库 全局变量


/**
 * 旋转、二值化的验证码字符串转化
 * @param $pic_content 文件内容的字符串
 * @return array
 */
function vc2str ($pic_content) {
    if (empty($pic_content)) return false;
    $res = imagecreatefromstring($pic_content); //png
    if (!$res) return false;
    $res = imagerotate($res, 270, 0); //左旋270
    $size = array(imagesx($res), imagesy($res));
    $data = array();
    for($i=0; $i < $size[1]; ++$i) {
        for($j=0; $j < $size[0]; ++$j) {
            $rgb = imagecolorat($res,$j,$i);
            $rgbarray = imagecolorsforindex($res, $rgb);
            if($rgbarray['red'] != 0) { //判断条件
                $data[$i][$j]=1;
            } else {
                $data[$i][$j]=0;
            }
        }
    }
    imagedestroy($res);
    return $data;
}

/**
 * 输出型验证码字符串转化
 * @param $pic_content 文件内容的字符串
 */
function dump_vc2str ($pic_content) {
    $res = imagecreatefromstring($pic_content); //png
    $res = imagerotate($res, 270, 0); //左旋270
    $size = array(imagesx($res), imagesy($res));
    for($i=0; $i < $size[1]; ++$i) {
        for($j=0; $j < $size[0]; ++$j) {
            $rgb = imagecolorat($res,$j,$i);
            $rgbarray = imagecolorsforindex($res, $rgb);
            if($rgbarray['red'] != 0) { //判断条件
                echo '<span style="background-color: #002a80">1</span>';
            } else {
                echo 0;
            }
        }
        echo "<br>\n";
    }
    imagedestroy($res);
}

/**
 * 验证码识别
 * 策略：按列扫描，直接把图转化为竖直方向的（顺时针90度）
 *       切分：遇到空行必切，能切好的绝对匹配，如果切出来行数太大证明连字，连字采用模糊匹配 逐个扫描字典
 * @param $data_str_arr
 * @return bool|string
 */
function vc_recognize($data_str_arr) {
    global $char_lib;
    if (empty($data_str_arr)) return false;
    $result = '';
    $cur_ptr = 0; //本来想用数组内置的那一套 key prev next的指针，但其不支持直接设置当前位置

    foreach($data_str_arr as &$c) { //目前最小操作单位为列，合并列数据
        $c = implode($c);
    }

    while(strlen($result) < CHAR_COUNT && $piece = vc_piece($data_str_arr, $cur_ptr)) {
            $candidate_result = array('score' => 0);
            foreach($char_lib as $r => $c) {
                $char_width = strlen($c) / IMG_HEIGHT;
                $sub_piece = implode(array_slice($piece, 0, $char_width));
                if (!strcmp(implode($piece), $c)) { //绝对匹配
                    $candidate_result['char'] = $r;
                    break;
                }
                $similar_count = similar_text($c, $sub_piece, $per);
                $similar_score = $per * 50 + $similar_count;
                /*权重公式，因为这里发现一个很奇怪的现象，从特征上，n是m的子集，用m做匹配，n的匹配度百分数会比m高*/
                if ($similar_score > $candidate_result['score']) {//保存最大d得分的
                    $candidate_result['score'] = $similar_score;
                    $candidate_result['char'] = $r;
                }
                //if (strlen($result) == 2)
                //printf("similar: %s, sc: %d per: %f<br/>\n", $r, $similar_count, $per);
            }
            $result .= $candidate_result['char'];
            $cur_ptr = $cur_ptr - count($piece) + strlen($char_lib[$candidate_result['char']]) / IMG_HEIGHT;
            if ($cur_ptr < IMG_WIDTH) {
                $embed_special = vc_embed_check($data_str_arr[$cur_ptr]);
                if ($embed_special) { $cur_ptr--; } //嵌入问题的话，触发模糊模式，位置退1
            }
    }
    //var_dump($result);
    if (strpos($result, 'l') !== false) {
        return false; //因为小写l和大写I无法区分，遇见算是匹配失败
    } else {
        return $result;
    }
}

/**
 * 取出验证码切片，失败返回假
 * @param $data_str_arr
 * @param $start_ptr 起始列号
 * @return array|bool
 */
function vc_piece($data_str_arr, &$start_ptr) {
    while($start_ptr < IMG_WIDTH && $data_str_arr[$start_ptr] == NULL_COL) { //跳过前面的空列
        $start_ptr++;
    }
    if ($start_ptr == IMG_WIDTH - 1) return false;  //末尾检测
    $char_start = $start_ptr; //起始列号
    while($start_ptr < IMG_WIDTH && $data_str_arr[$start_ptr] != NULL_COL ) { //跳过非空列
        $start_ptr++;
    }
    $char_end = $start_ptr; //终止列号

    //printf("start: %d, end: %d<br/>\n", $char_start, $char_end);
    return array_slice($data_str_arr, $char_start, $char_end - $char_start);
}

/**
 * 验证码字符嵌入检测，检测特定的边界来判定是否发生嵌入
 * @param $special_line
 * @return bool
 */
function vc_embed_check($special_line) {
    global $embed_signs;
    foreach ($embed_signs as $bad) {
        if (!strcmp($special_line ,$bad)) {
            return true;
        }
    }
    return false;
}

/**
 * data uri生成
 * @param $contents
 * @param $mime
 * @return string
 */
function data_uri($contents, $mime)
{
    $base64   = base64_encode($contents);
    return ('data:' . $mime . ';base64,' . $base64);
}