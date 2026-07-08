# 防护体系 Guardrail

> 本文件是「人生首富模拟器」项目的强制防护清单，每次修改 JS/HTML 后必须逐项通过。

---

## 🚫 永远不要做的事

1. **禁止用 Python 脚本批量替换 `<script>` 内的 JS 代码**（A/E 类最大来源，6/16 例）
   - 改而行：`read_file → edit_file` 单行精准编辑
2. **禁止手动修改 `NODE_PERSONALITIES` / `NPCS` 映射后未检查全部引用点**
   - 全称+别名（wife→spouse.jpg, courseTeacher→colleague.jpg）都要更新
3. **禁止在 JOBS/CAREERS 等核心数据中插入包含单引号/双引号的文本**
   - 如需包含，必须走 `edit_file` 精确替换，不留残留引号
4. **禁止修改 `_avt()` / `_ic()` 不同时测试 emoji 和路径两种输入**

---

## 🟢 L1：代码修改后立即执行（阻断 80% A/E 类）

> 修改任何 JS/HTML 后，必须执行以下全部三项：

### L1.1 JS 语法检查
```bash
cd /app/data/所有对话/主对话/人生首富模拟器/life-simulator-miniprogram/
# 提取所有 script 块（去掉<script>和</script>行）
awk '/^<script>/{flag=1;next}/^<\/script>/{flag=0}flag' index.html > /tmp/check.js
node --check /tmp/check.js && echo "✅ L1.1 PASS" || echo "❌ L1.1 FAIL"
```
**标准：零 SyntaxError**

### L1.2 标签配对
```bash
open=$(grep -c '<script>' index.html)
close=$(grep -c '</script>' index.html)
[ "$open" = "$close" ] && echo "✅ L1.2 PASS ($open pairs)" || echo "❌ L1.2 FAIL (open=$open close=$close)"
```
**标准：开闭数量完全相等**

### L1.3 script 内无 CSS
```bash
# script 块内不应出现 CSS 属性（如 color:、font-size:、margin: 等）
awk '/^<script>/{flag=1;next}/^<\/script>/{flag=0}flag' index.html | grep -cP '^\s*[a-z-]+:\s*[^;}]+[;}]' && echo "❌ L1.3 FAIL" || echo "✅ L1.3 PASS"
```
**标准：0 命中**

### L1.4 关键字符串完整性
```bash
# 检查修复特征码是否在线上仍然存在
curl -s https://lionelzhu1989.github.io/life-simulator-miniprogram/ | grep -q "数据定义" && echo "✅ L1.4 PASS" || echo "❌ L1.4 FAIL (feature code missing)"
```
**标准：特征码存在**

---

## 🟡 L2：功能验证（阻断 B/C 类）

> L1 全部 PASS 后执行：

### L2.1 入口函数存在性
```bash
func_list="startGame hideModal switchInvestTab switchPetTab refreshLife saveGame loadGame"
for f in $func_list; do
  grep -q "function $f" index.html && echo "✅ $f" || echo "❌ $f MISSING"
done
```
**标准：全部存在**

### L2.2 avatar/icon 渲染点闭环检查
```bash
# 所有 img/ 开头的路径渲染必须走 _avt() 或 _ic()
grep -n "img/avatars\|img/icons" index.html | grep -v "_avt\|_ic\|//\|/\*" | head -5
# 期望输出为空（说明没有绕过 _avt/_ic 的直接引用）
```
**标准：无绕过函数直接的 img/ 路径拼接**

### L2.3 统一渲染入口一致性
```bash
# _avt 和 _ic 必须同时存在
grep -q "function _avt" index.html && echo "✅ _avt" || echo "❌ _avt MISSING"
grep -q "function _ic" index.html && echo "✅ _ic" || echo "❌ _ic MISSING"
```
**标准：两个函数均存在**

---

## 🔴 L3：发布前全量验证（阻断全类型）

> 只在 commit + push 之前执行一次：

### L3.1 线上 HTTP 可访问
```bash
code=$(curl -s -o /dev/null -w "%{http_code}" https://lionelzhu1989.github.io/life-simulator-miniprogram/)
[ "$code" = "200" ] && echo "✅ L3.1 PASS (HTTP $code)" || echo "❌ L3.1 FAIL (HTTP $code)"
```

### L3.2 修复特征码验证
```bash
# 确认修复后的关键代码已部署
curl -s https://lionelzhu1989.github.io/life-simulator-miniprogram/ | grep -q "// ========== 数据定义" && echo "✅ L3.2 PASS" || echo "❌ L3.2 FAIL"
```

### L3.3 Avatar 文件完整性（手动）
目录：`img/avatars/` 应包含以下文件（直接映射）：
- boss.jpg, mom.jpg, dad.jpg, spouse.jpg, colleague.jpg, classmate.jpg, banker.jpg, zhang_chief.jpg
- wife.jpg → spouse软链, husband.jpg → dad软链, courseTeacher.jpg → colleague软链

---

## 📋 快速一键检查（修改后直接跑）

```bash
cd /app/data/所有对话/主对话/人生首富模拟器/life-simulator-miniprogram/
# L1.1
awk '/^<script>{flag=1;next}/^<\/script>/{flag=0}flag' index.html > /tmp/check.js
node --check /tmp/check.js && echo "✅ L1.1 PASS" || echo "❌ L1.1 FAIL"
# L1.2
o=$(grep -c '<script>' index.html); c=$(grep -c '</script>' index.html); [ "$o" = "$c" ] && echo "✅ L1.2 PASS ($o pairs)" || echo "❌ L1.2 FAIL"
# L1.3
awk '/^<script>/{flag=1;next}/^<\/script>/{flag=0}flag' index.html | grep -cP '^\s*[a-z-]+:\s*[^;}]+[;}]' | grep -q "^0$" && echo "✅ L1.3 PASS" || echo "❌ L1.3 FAIL"
# L2.3
grep -q "function _avt" index.html && echo "✅ _avt" || echo "❌ _avt MISSING"
grep -q "function _ic" index.html && echo "✅ _ic" || echo "❌ _ic MISSING"
```

---

## 🚨 事故应急响应

发现线上问题时，按以下顺序处理：
1. 确认问题类型（A语法/B渲染/C引用/D数据/E转义）
2. 用 `git log --oneline -5` 确认最近一次修改
3. 如果语法错误 → 回滚到上一个 commit + 修复
4. 如果渲染问题 → 检查 `_avt()`/`_ic()` 调用链
5. 如果引用错误 → 检查函数名/作用域/生命周期
6. 修复后必须通过 L1+L2 才能 push

---

*本文档与 `bug_analysis_v2.md` 配套使用。故障归因分析见后者。*
*最后更新：2026-07-08（包含 A11 修复后的验证数据）*
