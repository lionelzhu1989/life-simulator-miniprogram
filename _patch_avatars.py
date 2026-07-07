#!/usr/bin/env python3
"""Patch index.html: replace emoji avatars with AI-generated QQ-style images."""
import re

SRC = "/app/data/所有对话/主对话/人生首富模拟器/life-simulator-miniprogram/index.html"
DST = SRC  # overwrite in place (already git tracked)

with open(SRC, "r", encoding="utf-8") as f:
    html = f.read()

# ── 1. Map npc ids → image filenames ──
AVATAR_MAP = {
    "mom":        "mom",
    "dad":        "dad",
    "boss":       "boss",
    "colleague":  "colleague",
    "hr":         "boss",          # reuse boss for HR
    "bestie":     "classmate",     # reuse classmate for bestie
    "classmate":  "classmate",
    "mysterious": "zhang_chief",   # mysterious person → conservative official
    "banker":     "banker",
    "realtor":    "colleague",     # reuse colleague for realtor
    "spouse":     "spouse",
    "child":      "classmate",     # child → reuse classmate (simplified)
    "delivery":   "colleague",
    "system":     "zhang_chief",
    "wife":       "wife",
    "husband":    "husband",
    "gymCoach":   "dad",           # reuse dad body type
    "neighbor":   "mom",           # reuse mom for neighbor
    "exColleague":"colleague",
    "mentor":     "courseTeacher",
    "scammer":    "zhang_chief",
}

# ── 2. Build replacement patterns for avatar fields ──
# Pattern: 'xxx',avatar:'EMOJI'  →  'xxx',avatar:'img/avatars/FILE.jpg'
def replace_avatar_definition(text):
    """Replace avatar values in NPCS / NPCS2 object literals."""
    # Match patterns like:  key:{name:'...',avatar:'EMOJI',...}
    # Also:  spouse:{name:'小徐',avatar:'💑'}
    for npc_id, fname in AVATAR_MAP.items():
        # avatar:'EMOJI' → avatar:'img/avatars/FILE.jpg'
        pattern = rf"(avatar\s*:\s*')[^?]*?('{re.escape(npc_id)}" if False else None
        pass
    
    # simpler: replace every known emoji avatar in the definition blocks
    emoji_to_img = {
        "👩":  "img/avatars/mom.jpg",
        "👨":  "img/avatars/dad.jpg",
        "👨\u200d💼": "img/avatars/boss.jpg",
        "👩\u200d💻": "img/avatars/colleague.jpg",
        "👩\u200d💼": "img/avatars/boss.jpg",
        "🍻":  "img/avatars/classmate.jpg",
        "🎓":  "img/avatars/classmate.jpg",
        "🎭":  "img/avatars/zhang_chief.jpg",
        "🏦":  "img/avatars/banker.jpg",
        "🏠":  "img/avatars/colleague.jpg",
        "💑":  "img/avatars/spouse.jpg",
        "👦":  "img/avatars/classmate.jpg",
        "📦":  "img/avatars/colleague.jpg",
        "📱":  "img/avatars/zhang_chief.jpg",
        "👩":  "img/avatars/wife.jpg",
        "👨":  "img/avatars/husband.jpg",
        "🏋️": "img/avatars/dad.jpg",
        "🧑\u200d🦳": "img/avatars/mom.jpg",
        "👨\u200d🔬": "img/avatars/colleague.jpg",
        "🧑\u200d🏫": "img/avatars/courseTeacher.jpg",
        "🏋️": "img/avatars/dad.jpg",
    }
    
    # Replace in definition blocks:  avatar:'EMOJI'
    for emoji, path in emoji_to_img.items():
        # only replace inside avatar:'...' context
        text = text.replace(f"avatar:'{emoji}'", f"avatar:'{path}'")
        text = text.replace(f"avatar: '{emoji}'", f"avatar: '{path}'")
        # Also in npcAvatar:npc.avatar assignment
        text = text.replace(f"'{emoji}'", f"'{path}'")
    
    return text

html = replace_avatar_definition(html)

# ── 3. Fix rendering logic – emoji in chat preview → <img> ──
# Original:  html+='<div class="msg-preview-avatar">'+npc.avatar+'</div>'
# When npc.avatar is already a path like 'img/avatars/mom.jpg', we need <img>
# Detect when avatar value contains 'img/' and wrap in <img>

# Pattern in msgPreview rendering:  npc.avatar  inside string concatenation
# Replace the chat preview rendering block
old_preview = 'html+=\u003cdiv class=\"msg-preview-avatar\"\u003e\u002bnpc.avatar+\u003c/div\u003e'
new_preview = 'html+=\u003cimg src=\"\'+npc.avatar+\'\" class=\"msg-preview-avatar-img\"\u003e'
html = html.replace(old_preview, new_preview)

# Also fix friend list avatar rendering (contact-avatar div)
# Pattern:  <div class="contact-avatar">'+npc.avatar+'</div>
old_contact = 'class=\"contact-avatar\"\u003e'
new_contact = 'class=\"contact-avatar\"\u003e\u003cimg src=\"'
# ... this gets complex; let's add CSS to style the img inside

# ── 4. Add CSS for avatar images ──
avatar_css = """
.avatar-img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.15);}
.msg-preview-avatar-img{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #e0e0e0;flex-shrink:0;}
.friend-avatar-img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff;}
"""

# Insert CSS before </style>
html = html.replace("</style>", avatar_css + "</style>")

# ── 5. Fix NPCMeetScene avatar rendering ──
# Original:  html += '<div style="font-size:28px;">'+avatar+'</div>'
# When avatar is now a path, wrap in <img>
# Multiple occurrences of this pattern
meet_avatar_pattern = re.compile(
    r'(html\s*\+=".*?)(font-size:28px;[\'"]>\s*\+\s*avatar\s*\+\s*</div>)(.*?")',
    re.DOTALL
)
# Simpler: replace directly
html = html.replace(
    "font-size:28px;\"\u003e+avatar+\u003c/div\u003e",
    "width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.2);\"\u003e\u003cimg src=\"'+avatar+'\" style=\"width:100%;height:100%;border-radius:50%;object-fit:cover;\"\u003e\u003c/div\u003e"
)

# ── 6. Also handle: scene avatar rendering with 'me' NPC ──
# Original:  var avatar = (MEETABLE_NPCS[sceneKey]||{}).avatar || '👤';
# This already reads from object, will get 'img/avatars/xxx.jpg' now, so rendering needs <img> wrap
# The rendering code uses:  '<div style="font-size:28px;">'+avatar+'</div>'
# Already handled above

with open(DST, "w", encoding="utf-8") as f:
    f.write(html)

print("✅ Avatar patch complete")
print(f"   Total replacements: emoji → img paths")
