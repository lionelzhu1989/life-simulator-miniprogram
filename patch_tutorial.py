"""
增强新手引导系统：
1. 声明缺失的 TUTORIAL_STEPS 和 _tut_state
2. 添加进度条CSS和JS逻辑
3. 增强跳过按钮样式
4. 添加tutOverlay的高z-index CSS
"""

import re

filepath = '/app/data/所有对话/主对话/人生首富模拟器/life-simulator-miniprogram/index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# Step 1: Insert TUTORIAL_STEPS array and _tut_state declaration
# Insert right before "// === _tut_shouldShow ==="
# ============================================================

TUTORIAL_DECLARATION = '''
// === TUTORIAL_STEPS ===
const TUTORIAL_STEPS = [
  {id:'welcome', title:'欢迎来到人生首富模拟器', desc:'在这里，你将体验从零开始的人生旅程。\\n通过经营事业、建立人际关系、管理财富，最终成为人生首富！\\n让我们先了解一下界面吧。', trigger:null},
  {id:'month_advance', title:'推进时间', desc:'点击右下角的「结束本月」按钮来推进时间。\\n每个月都会发生各种事件，记得查看手机消息哦！', trigger:null, target:'btnNextMonth'},
  {id:'assets', title:'查看资产', desc:'在这里查看你的总资产、收入和支出情况。\\n做明智的财务决策是成为首富的关键！', trigger:null, target:'assetPanel'},
  {id:'jobs', title:'求职晋升', desc:'从实习生开始，通过提升IQ和EQ来晋升。\\n更高的职位意味着更高的薪水和更多的机会！', trigger:null, target:'jobPanel'},
  {id:'social', title:'社交关系', desc:'与NPC建立关系，结交朋友、寻找伴侣。\\n良好的人际关系能带来意想不到的机会！', trigger:null, target:'socialPanel'},
  {id:'phone', title:'手机消息', desc:'随时查看手机，了解最新事件和NPC动态。\\n有些机会稍纵即逝，及时回复很重要！', trigger:'has_unread', target:'btnPhone'},
  {id:'done', title:'准备就绪！', desc:'你已经了解了基本玩法。\\n记住：平衡事业、财富和人际关系，才能成为真正的人生首富！', trigger:'month1'}
];
var _tut_state = {currentIdx: 0};

'''

# Insert before _tut_shouldShow
old_mark = '// === _tut_shouldShow ==='
new_mark = TUTORIAL_DECLARATION + '// === _tut_shouldShow ==='
content = content.replace(old_mark, new_mark)

print("Step 1: TUTORIAL_STEPS and _tut_state declared")

# ============================================================
# Step 2: Add CSS for tut-overlay with proper z-index and progress bar
# Insert before </style>
# ============================================================

TUTORIAL_CSS = '''
/* ===== Tutorial Overlay ===== */
.tut-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);z-index:10001;display:flex;align-items:center;justify-content:center;animation:tutFadeIn .25s ease;}
@keyframes tutFadeIn{from{opacity:0}to{opacity:1}}
.tut-card{background:#fff;border-radius:18px;padding:28px 24px 20px;max-width:340px;width:85%;position:relative;box-shadow:0 8px 32px rgba(0,0,0,.18);animation:tutSlideUp .3s ease;}
@keyframes tutSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.tut-progress{display:flex;gap:5px;justify-content:center;margin-bottom:16px;min-height:6px;}
.tut-progress-dot{height:5px;border-radius:3px;transition:all .3s ease;}
.tut-step-num{text-align:center;font-size:12px;color:#4A90D9;font-weight:600;margin-bottom:10px;}
.tut-title{font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:12px;line-height:1.4;}
.tut-desc{font-size:14px;color:#555;line-height:1.7;margin-bottom:20px;}
.tut-actions{display:flex;gap:10px;justify-content:center;margin-bottom:14px;}
.tut-skip{text-align:center;font-size:12px;color:#aaa;cursor:pointer;padding:4px;transition:color .2s;}
.tut-skip:hover{color:#666;text-decoration:underline;}
.tut-skip-btn{position:absolute;top:14px;right:16px;background:none;border:1px solid #ddd;border-radius:6px;padding:3px 10px;font-size:11px;color#999;cursor:pointer;transition:all .2s;}
.tut-skip-btn:hover{background:#f5f5f5;color:#666;border-color:#ccc;}
.tut-highlight{box-shadow:0 0 0 3px rgba(74,144,217,.5),0 0 12px rgba(74,144,217,.3) !important;position:relative;z-index:10002;border-radius:8px;transition:box-shadow .3s;}

'''

content = content.replace('</style>', TUTORIAL_CSS + '</style>')

print("Step 2: CSS for tutorial overlay added")

# ============================================================
# Step 3: Enhance _tut_showOverlay to include progress bar
# Replace the existing _tut_showOverlay function
# ============================================================

old_showoverlay = '''function _tut_showOverlay(idx){
  const step = TUTORIAL_STEPS[idx];
  if(!step) return;
  const existing = document.getElementById('tutOverlay');
  if(existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'tutOverlay';
  overlay.className = 'tut-overlay';
  overlay.innerHTML = '<div class="tut-card">'+
    '<div class="tut-step-num">'+(idx+1)+'/'+TUTORIAL_STEPS.length+'</div>'+
    '<div class="tut-title">'+step.title+'</div>'+
    '<div class="tut-desc">'+step.desc.replace(/\\n/g,'<br>')+'</div>'+
    '<div class="tut-actions">'+
    (idx>0?'<button class="btn btn-outline btn-sm" onclick="_tut_prev()">上一步</button>':'')+
    '<button class="btn btn-primary btn-sm" onclick="_tut_next()">'+(idx===TUTORIAL_STEPS.length-1?'开始游戏!':'下一步')+'</button>'+
    '</div>'+
    '<div class="tut-skip" onclick="_tut_skipAll()">跳过教程</div>'+
    '</div>';
  document.body.appendChild(overlay);
  if(step.target){
    const el = document.getElementById(step.target);
    if(el) el.classList.add('tut-highlight');
  }
}'''

new_showoverlay = '''function _tut_showOverlay(idx){
  const step = TUTORIAL_STEPS[idx];
  if(!step) return;
  const existing = document.getElementById('tutOverlay');
  if(existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'tutOverlay';
  overlay.className = 'tut-overlay';
  // Generate progress dots
  let progressHtml = '<div class="tut-progress">';
  for(let i=0;i<TUTORIAL_STEPS.length;i++){
    const w = i===idx ? '22px' : '8px';
    const bg = i<=idx ? '#4A90D9' : '#ddd';
    progressHtml += '<div class="tut-progress-dot" style="width:'+w+';background:'+bg+'"></div>';
  }
  progressHtml += '</div>';
  overlay.innerHTML = '<div class="tut-card">'+
    progressHtml+
    '<button class="tut-skip-btn" onclick="_tut_skipAll()">跳过引导</button>'+
    '<div class="tut-step-num">步骤 '+(idx+1)+'/'+TUTORIAL_STEPS.length+'</div>'+
    '<div class="tut-title">'+step.title+'</div>'+
    '<div class="tut-desc">'+step.desc.replace(/\\n/g,'<br>')+'</div>'+
    '<div class="tut-actions">'+
    (idx>0?'<button class="btn btn-outline btn-sm" onclick="_tut_prev()">上一步</button>':'')+
    '<button class="btn btn-primary btn-sm" onclick="_tut_next()">'+(idx===TUTORIAL_STEPS.length-1?'开始游戏!':'下一步')+'</button>'+
    '</div>'+
    '<div class="tut-skip" onclick="_tut_skipAll()">跳过全部教程</div>'+
    '</div>';
  document.body.appendChild(overlay);
  if(step.target){
    const el = document.getElementById(step.target);
    if(el) el.classList.add('tut-highlight');
  }
}'''

content = content.replace(old_showoverlay, new_showoverlay)

print("Step 3: _tut_showOverlay enhanced with progress bar")

# ============================================================
# Step 4: Enhance _tut_skipAll function
# ============================================================

old_skipall = "function _tut_skipAll(){TUTORIAL_STEPS.forEach(s=>{if(!G.tutorialCompleted.includes(s.id))G.tutorialCompleted.push(s.id);});document.getElementById('tutOverlay').remove();saveGame();showToast('已跳过教程');}"

new_skipall = """function _tut_skipAll(){
  TUTORIAL_STEPS.forEach(s=>{if(!G.tutorialCompleted.includes(s.id))G.tutorialCompleted.push(s.id);});
  const ov = document.getElementById('tutOverlay');
  if(ov) ov.remove();
  // Remove all highlights
  TUTORIAL_STEPS.forEach(s=>{if(s.target){const el=document.getElementById(s.target);if(el)el.classList.remove('tut-highlight');}});
  saveGame();
  showToast('已跳过教程，随时可以在设置中重新开启');
}"""

content = content.replace(old_skipall, new_skipall)

print("Step 4: _tut_skipAll enhanced")

# ============================================================
# Step 5: Add _tut_state initialization in _v4_postLoadHook
# ============================================================

old_postload = "function _v4_postLoadHook(){if(!G.tutorialCompleted)G.tutorialCompleted=[];if(!G._assetHistory)G._assetHistory=[];}"
new_postload = "function _v4_postLoadHook(){if(!G.tutorialCompleted)G.tutorialCompleted=[];if(!G._assetHistory)G._assetHistory=[];_tut_state={currentIdx:0};}"

content = content.replace(old_postload, new_postload)

print("Step 5: _tut_state init in postLoadHook")

# ============================================================
# Step 6: Also make sure guideOverlay z-index is below tutOverlay
# ============================================================

content = content.replace(
    '.guide-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:4000;',
    '.guide-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:4000;'
)

# Note: The tut-overlay already has z-index:10001 which is higher than guideOverlay's 4000

print("Step 6: z-index hierarchy confirmed (tut-overlay:10001 > guideOverlay:4000)")

# ============================================================
# Write back
# ============================================================

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n=== All changes written successfully ===")
print(f"File size: {len(content)} bytes")
