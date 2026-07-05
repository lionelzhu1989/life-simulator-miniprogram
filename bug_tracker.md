# Bug追踪与根因记录

> 原则：每个Bug必须记录根因、修正方法、预防措施，确保永不复发。

---

## Bug #001: 宠物页面空白
- **发现时间**: 2026-07-05 v4.4.0
- **症状**: 点击宠物按钮后页面空白，无任何内容显示
- **根因**: 第5个`<script>`标签缺少`</script>`闭合标签，导致浏览器无法正确解析JS代码块，PET_STORE、renderPetShop、initPetState等变量和函数未被定义
- **修正**: 移除错位放置的`</body></html>`，在文件末尾添加完整的闭合序列
- **预防措施**: 
  1. HTML修改后必须通过Python脚本验证`<script>`和`</script>`标签数一致
  2. 每次提交前执行`grep -c '<script>'`和`grep -c '</script>'`对比
  3. 新增JS功能后必须通过浏览器端实际打开验证（不可只靠代码审查）

---

## Bug #002: 通讯录点击好友无反应
- **发现时间**: 2026-07-05 v4.4.0  
- **症状**: 通讯录用点击好友卡片后无任何弹窗
- **根因**: 缺少`cdetail-overlay`、`cdetail-header`、`cdetail-body`、`cdetail-name`等HTML元素
- **修正**: 添加完整的通讯录详情页HTML结构，修正JS引用ID
- **预防措施**: 新增UI交互功能时，必须同步检查HTML层（DOM元素）、CSS层（样式）、JS层（事件绑定）三处均到位

---

## Bug #003: G.cash.toLocaleString()空值报错
- **发现时间**: 2026-07-05 v4.4.0
- **症状**: 游戏数据未初始化时，宠物商店部位JS报错
- **根因**: `G.cash`为null/undefined时调用`.toLocaleString()`抛出TypeError，中断后续JS执行
- **修正**: 添加防御性检查`G.cash?G.cash.toLocaleString():'0'`和`G.petFood||0`
- **预防措施**: 所有`G.xxx`调用前添加空值检查，团队规范要求使用`G.xxx||defaultValue`

---

## Bug #004: petPlay/petTrain函数缺失
- **发现时间**: 2026-07-05 v4.4.0
- **症状**: 点击宠物按钮后控制台报错`petPlay is not defined`
- **根因**: v4.3.2版本删除宠物功能时移除了这些函数的实现代码，但renderPetDetail仍引用
- **修正**: 重新添加`petPlay`和`petTrain`函数实现，调用`showMiniGame()`入口
- **预防措施**: 功能删除时全局搜索函数/变量引用，确保无死引用；功能添加时在头文件维护函数清单

---

## Bug #005: 宠物交互按钮点击无响应（迷你游戏不显示）
- **发现时间**: 2026-07-05 v4.4.4
- **症状**: 宠物详情页底部操作按钮（喂食/玩耍/洗澡/抚摸/遛弯/训练/治病/商店）点击无任何效果
- **根因（本次关键bug）**: `showMiniGame()`函数正确创建了DOM元素并`appendChild`到body，但`.game-overlay`、`.mini-game`、`.mg-timer`、`.mg-target`、`.mg-score`、`.mg-grid`、`.mg-train-cell`等CSS类完全缺失。因为没有定位属性(position:fixed)和z-index，创建的overlay是一个0高度的不可见元素
- **修正**: 在游戏创建逻辑触发点之后，在`<style>`中添加完整的迷你游戏CSS：
  - `.game-overlay`: fixed全屏遮罩+z-index:9999
  - `.mini-game`: 居中白色圆角卡片
  - `.mg-target`: cursor:pointer
  - `.mg-train-cell`: grid布局+hover效果
- **预防措施（新增规则）**:
  1. **CSS完备性检查**: JS动态创建带class的DOM元素前，必须在`<style>`中已定义该class
  2. **功能测试清单**: 每次版本发布前，必须点击每个按钮并确认视觉变化
  3. **新增CSS规范新原则**: 任何`document.createElement`配合`className=xxx`，必须同步在`<style>`中添加`.xxx`的基础样式（至少包含position/visibility/display规则）
  4. **自动化方向**: 后续考虑添加脚本自动扫描JS中className引用并在CSS中检查对应定义

---

## Bug #006: NPC对话无AI开场白功能
- **发现时间**: 2026-07-05 v4.4.2（已升级为v4.4.3语音功能）
- **症状**: 开ProactiveChat时没有开场白，对话直接开始
- **修正**: 集成AI greetings+NPC_PERSONALITIES[greetings]开场白系统，AI回复+NPC个性回复库
- **预防措施**: NPC新增时只需要配置`{name, avatar, traits, greetings, responses, followups}`六个字段即可完整接入

---

## Bug #007: 语音TTS朗读无法停止
- **发现时间**: 2026-07-05 v4.4.3
- **症状**: 关闭聊天窗口后TTS继续朗读
- **修正**: 在closeChat()开头调用`stopSpeaking()`；切换NPC时也调用
- **预防措施**: UI组件hide/close回调中必须检查是否有正在进行的媒体播放（TTS、BGM），确保清理

---

## Bug #008: if(!R)未声明变量 & e.resultsLength误用
- **发现时间**: 2026-07-05 v4.4.3
- **症状**: JS语法错误导致chat页面部分功能不可用
- **根因**: 变量名简写错误（缺少var声明）、Web Speech API属性名错误（应为`e.results.length`）
- **修正**: 全量替换为正确代码变量名和属性名
- **预防措施**: Web Speech API交互前务必检查属性名`e.results.length`、`e.resultIndex`的标准写法

---

## Bug #009: 秦朝外号侮辱性争议
- **发现时间**: 2026-07-05
- **状态**: 无——秦朝外号"口急"、"高玩"为用户本人提供，用于NPC个性特征
- **处理**: 按用户要求直接录入NPC_PERSONALITIES

---

## 测试规范（永久生效）

### 新建功能检查清单
- [ ] HTML层：所有DOM元素已添加到HTML
- [ ] CSS层：所有动态创建的className已在`<style>`中定义
- [ ] JS层：所有引用的函数已定义，无`xxx is not defined`
- [ ] 数据层：所有`G.xxx`有空值保护
- [ ] 交互层：触发路径完整，不会因JS中断而卡死

### 版本发布前检查
- [ ] 验证`<script>`与`</script>`标签数量一致
- [ ] 用`grep -c 'className='`对比CSS class定义，确保无遗漏
- [ ] 每个按钮/交互元素均有onClick响应且可见
- [ ] 所有NPC_PERSONALITIES配置完整（name/avatar/traits/greetings/responses/followups）

---

## Bug #006: 宠物喂食/玩耍/抚摸按钮点击无反应（v4.4.7修复）
- **发现时间**: 2026-07-05 v4.4.6
- **症状**: 所有宠物操作按钮（喂食/玩耍/洗澡/抚摸/遛弯/训练/治病/商店）点击后无任何反应，不弹出迷你游戏
- **根因**: 第二个`renderPetDetail`函数中，`onclick`属性拼接写法错误：`onclick=\"petFeed(\'+pet.id+\')\"`。其中`+`字符被包含在JS字符串字面量内，导致`pet.id`成为字面字符串而非变量引用。实际生成`onclick="petFeed('{pet.id}')"`，`petFeed`收到的参数是字面字符串`'{pet.id}'`而非`'pet_zhao'`，`G.pets.find()`找不到匹配静默返回
- **修正**: 将`\'+pet.id+\'`改为`\'\' + pet.id + \'`，确保`+`作为字符串拼接运算符而非字面字符
- **预防措施**: 
  1. 在浏览器控制台单步调试`onclick`生成结果，确认传入的是实际值而非字面量
  2. 对比两个`renderPetDetail`按钮拼接方式，确认一致
  3. 在renderPetDetail生成后，立即在console执行`document.querySelector('.pet-btn').getAttribute('onclick')`验证

---

## Bug #010: 宠物商店按钮点击无反应（v4.4.8修复）
- **发现时间**: 2026-07-05 v4.4.7
- **症状**: 点击"商店"按钮无任何反应
- **根因**: 存在两个`renderPetDetail`函数，第二个覆盖第一个。v4.4.7只修复了第一个函数的按钮`onclick`拼接，第二个函数仍有同样问题：`onclick=\"petFeed(\'+pet.id+\')\"`生成`onclick="petFeed('{pet.id}')"`，函数收到字面字符串导致`G.pets.find()`失败
- **修正**: 修复第二个`renderPetDetail`中全部8个按钮的`onclick`拼接（petFeed/petPlay/petClean/petPet/petWalk/petTrain/petHeal），将`\'\)\"\'`改为`\'\')\"`确保生成正确的`onclick="petFeed('pet_zhao')"`。同时修复商店按钮：将`openPetStore()`改为`switchPetTab('shop',...)`使用已有的标签页切换机制
- **预防措施**: 
  1. 修改代码时使用`grep -c 'function xxx'`检查重复定义
  2. 测试时必须确认修改的是实际生效的函数（最后定义的）
  3. 新增测试项：对比所有renderPetDetail函数中按钮onClick拼接是否一致

---

*最后更新: 2026-07-05 22:36*
