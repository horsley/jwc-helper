暨南大学教务处助手插件
============
*只是想更方便的使用教务处那套系统*

##说明

**抱怨为什么不能用之前，请先耐心看完这个文档**

本插件可以帮你 **自动刷新** 选课，但是限制依然是教务处的2秒内不能重复刷新，人工点也是2秒刷新，用插件只是让你省事，它不快因为它并不能超越这个限制，私下约定换课的同学无需过分担心。你说有没有可能约定换课被抢走了呢？有，如果刷新间隔刚好落在中间，概率很低，且人工也同样有这个可能。

##功能

### 1. 登陆辅助

![截图](http://horsley.github.com/jwc-helper/screenshots/s1.png "验证码识别")

这个不用解释了，有些时候不一定能正确识别，请自行校正。

### 2. 课程表日历导出
在教务系统左栏操作菜单选择“选课管理系统” -> “课程表与考试表”，你会发现导出课程表和考试表
的按钮旁边新添加了一个按钮“导出本学期课程日历”。

![截图](http://horsley.github.com/jwc-helper/screenshots/s2.png "日历导出")

点击之后需要一定的时间生成日历，生成完成之后可以点击下载日历

![截图](http://horsley.github.com/jwc-helper/screenshots/s3.png "日历导出")

日历格式为标准iCal格式，可用于导入Google Calender/Apple iCal/Microsoft Outlook等日历工具
日历包含课程名、上课时间、上课地点等，可以同步到手机和设定提醒，具体方法可参考文末提供链接或自行搜索。

### 3. 自动刷新选课
在教务系统左栏操作菜单选择“选课管理系统” -> “学生选课与查询”，点击页面中的开课列表查找课程
当查找结果显示出单一一个课程的时候可以选择使用“自动选课”

![截图](http://horsley.github.com/jwc-helper/screenshots/s4.png "自动选课")

点击该按钮之后启动自动选课，工具将会自动检测当前课程容量和已选人数，若还有剩余容量可以选课
则工具会帮你自动点击选课并确认，若当前剩余容量不足，则工具会在2秒后（选课系统规定刷新时间不能小于2秒）
*自动刷新* 页面，并重复以上过程直到选课成功或者手工停止自动选课

![截图](http://horsley.github.com/jwc-helper/screenshots/s5.png "自动选课")
![截图](http://horsley.github.com/jwc-helper/screenshots/s6.png "自动选课")

####注意
1. 按照选课通知，一般在第一阶段都可以超容量选课，所以 **请勿在第一阶段使用自动选课功能**
2. 自动选课只能同时监控 **一个课程**，如果出现自动选课按钮为灰色状态说明下方课程列表中
课程数量超过1个，此时应该使用排课班号（唯一，而课程编号不唯一）和对应课程类别（例如
“通识教育选修课”或者“可选全部课程”）来搜索开课列表，这样出来的结果课程数量就会只有1个
![截图](http://horsley.github.com/jwc-helper/screenshots/s7.png "不能自动选课")

3. **为什么插件完全不能用？我看不到装了之后有任何变化，你截图上的按钮都看不到。**
    本插件是为chrome设计的，如果你在使用一些所谓的双核浏览器，例如360安全浏览器、猎豹、世界之窗等，
我不保证你可以正常使用，你可以先检查一下你的双核浏览器是不是在极速内核的模式下打开的教务处。
4. 我想同时刷几个课程，但是教务处提示请不要2秒内反复刷新。嗯，简单点说，就是不可以，不要太贪心。

##安装

为了方便插件自动更新和维护，从1.1版本开始插件发布在Chrome WebStore官方商店。
请从chrome商店进行安装，[进入商店](https://chrome.google.com/webstore/detail/%E6%9A%A8%E5%8D%97%E5%A4%A7%E5%AD%A6%E6%95%99%E5%8A%A1%E5%A4%84%E5%8A%A9%E6%89%8B/mjcchjdgibfhdcnioainjmolhghfallo)

**使用旧版本（1.0/1.0.1等从微盘等渠道下载的版本）的同学，你需要先手工删除旧版本，再安装新版本**，新版本开始可以自动更新，打开你的扩展程序设置页面，如果发现如下图的旧版本（主要核对：旧版ID是faf开头的，新版是mjc开头的，并且在右方有提示并非来自Chrome网上应用店），请点击右方的垃圾桶图标进行删除
![截图](http://horsley.github.com/jwc-helper/screenshots/old_version.jpg "旧版本")

###更新记录
+ 2013/3/5 版本1.0.0发布
+ 2013/3/8 版本1.0.1，因为日历合并有时出现bug和一些官方压力，不强制推送更新
    - 更新1：在刷新期间添加提示已刷新次数，感谢 @Kim智柔
    - 更新2：合并课程表连续课程为一个日历活动条目，感谢 @不大太明白
+ 2013/7/2 版本1.1 发布在chrome商店，添加了说明
    + 更新1：安装后自动打开本文档
    + 更新2：刷新过程提示已刷新次数 

###相关链接
+ [RFC5545：Internet Calendaring and Scheduling Core Object Specification (iCalendar)](http://tools.ietf.org/html/rfc5545)
+ [Google日历：同步您的 Apple 设备](http://support.google.com/calendar/bin/answer.py?hl=zh-Hans&answer=151674)
+ [Google日历：从 iCalendar 或 CSV 文件中导入活动](http://support.google.com/calendar/bin/answer.py?hl=zh-Hans&answer=37118)
+ [iPhone日历说明和导入方法](http://apple.178.com/201103/93488614354.html)
+ [iCloud：将数据从“日历”或 iCal 手动导入到 iCloud 日历](http://support.apple.com/kb/HT4967?viewlocale=zh_CN)
