# 苔苔小院

屋顶开放式 3D 微缩小屋。厨房、客厅、书房和电脑角共享连续木地板，早餐台、地毯、沙发和书架给每个活动一个位置；卧室和浴室用有宽入口的隔墙遮挡。居民沿开放的通道在各区域之间移动。院子保留菜地、树木、围栏、小兔米米和小熊栗栗。居民保留原先柔和、简洁的圆润比例，以轻微转头、摆手和迈步表现活动。卡片实时显示位置与活动，点击卡片可近看造型，「全景」恢复完整场景。「暂停生活」会暂停作息。光线按钮按午后、黄昏、夜晚顺序切换，室内和院灯在夜间亮起。当前行为由规则驱动，尚未接入 AI。

## 文件

- `index.html`：页面结构、居民活动卡片和按钮；引用静态资源时带版本号以避免浏览器沿用旧场景。
- `style.css`：颜色、排版和手机布局。
- `world-data.js`：功能区标签、通行路线、两位居民的活动计划。调整动线或作息优先改这里。
- `scene.js`：相机、昼夜光线与局部灯具、按房间组织的家具、三维居民与作息动画。它从 jsDelivr 加载 Three.js 0.170.0。

这是网页静态文件目录。可通过 HTTP 静态服务器预览；直接双击 HTML 可能因浏览器 ES 模块限制而无法显示场景。

布局参考：[LDA 住宅设计指南](https://lda.ie/uploads/documents/LDA-Apartment-Typology-Booklet_Rev-00_Spreads.pdf)的活动分区与紧凑动线、[HomeStudio](https://github.com/andrejvysny/HomeStudio) 的参数化家具分组、[Three.js Sims-like House Builder](https://github.com/ch-bas/threejs-sims-house-builder) 的房间模板和家具组合。本项目使用自己的程序化几何与配色，没有复制这些项目的素材。
