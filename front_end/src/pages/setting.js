// 初始化检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

/**
 * 逻辑 A: 用户输入 UID，获得一个 Cookie (类似注册/找回)
 */
function fetchNewCookie() {
    const uid = document.getElementById('uid-input').value;
    if (!uid) {
        alert("请输入 UID 以获取凭证");
        return;
    }

    // 模拟后端算法：UID -> 加密生成 Cookie
    // 在你的 C 库作业中，这可以是一个 hash 算法
    const generatedCookie = "MF_" + btoa(uid + "salt_2025").substring(0, 16);
    
    // 自动填充到 Cookie 输入框，让用户知道拿到了凭证
    document.getElementById('cookie-input').value = generatedCookie;
    
    alert("凭证已生成，请妥善保存您的 Cookie！");
    console.log(`UID: ${uid} -> Cookie: ${generatedCookie}`);
}

/**
 * 逻辑 B: 用户输入 Cookie 尝试登录
 */
function handleCookieLogin() {
    const inputCookie = document.getElementById('cookie-input').value;
    
    if (!inputCookie || inputCookie.length < 5) {
        alert("无效的 Cookie 凭证");
        return;
    }

    // 模拟登录成功逻辑 (实际应发送给后端校验)
    // 假设符合 MF_ 开头的都算成功
    if (inputCookie.startsWith("MF_")) {
        localStorage.setItem('active_cookie', inputCookie);
        checkLoginStatus();
        alert("登录成功！已进入赛博空间");
    } else {
        alert("Cookie 验证失败，凭证错误");
    }
}

/**
 * 刷新 UI 上的登录状态
 */
function checkLoginStatus() {
    const activeCookie = localStorage.getItem('active_cookie');
    const label = document.getElementById('current-session-label');
    const box = document.getElementById('login-status-box');
    const cookieInput = document.getElementById('cookie-input');

    if (activeCookie) {
        label.innerText = "已登录 (SESSION ACTIVE)";
        label.classList.replace('text-red-400', 'text-emerald-400');
        label.classList.replace('bg-red-500/10', 'bg-emerald-500/10');
        box.classList.add('border-emerald-500/20');
        cookieInput.value = activeCookie; // 回填
    } else {
        label.innerText = "未登录";
        label.classList.replace('text-emerald-400', 'text-red-400');
        label.classList.replace('bg-emerald-500/10', 'bg-red-500/10');
        box.classList.remove('border-emerald-500/20');
    }
}

function toggleSettings() {
    const modal = document.getElementById('user-settings-modal');
    const panel = document.getElementById('settings-panel');
    
    if (modal.classList.contains('hidden')) {
        // 第一步：移除隐藏类，让容器出现在 DOM 中
        modal.classList.remove('hidden');
        
        // 第二步：稍微延时，让浏览器捕捉到 translate-x-full 的初始位置，然后再变 0
        // 这样才会有滑动的动画效果
        setTimeout(() => {
            panel.classList.remove('translate-x-full');
        }, 10);
    } else {
        // 关闭逻辑：先滑回去
        panel.classList.add('translate-x-full');
        
        // 等动画播完（300ms），再彻底隐藏
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

function setTheme(mode) {
    const slider = document.getElementById('theme-slider');
    const darkBtn = document.getElementById('btn-dark');
    const lightBtn = document.getElementById('btn-light');
    const html = document.documentElement; // 获取 html 标签

    if (mode === 'light') {
        // 1. 移动滑块到右侧
        slider.style.transform = 'translateX(100%)';
        slider.classList.replace('bg-indigo-600', 'bg-amber-500'); // 亮色用亮橙色
        
        // 2. 修改图标颜色
        lightBtn.classList.replace('text-slate-500', 'text-white');
        darkBtn.classList.replace('text-white', 'text-slate-500');

        // 3. 全局样式切换 (这里你可以根据具体需求修改 body 背景)
        // 示例：给 html 加上 light 类，你在 CSS 中定义 .light body { background: #f8fafc; }
        html.classList.add('light-mode'); 
        console.log("已切换至亮色模式");
        
    } else {
        // 1. 移动滑块回左侧
        slider.style.transform = 'translateX(0)';
        slider.classList.replace('bg-amber-500', 'bg-indigo-600');
        
        // 2. 修改图标颜色
        darkBtn.classList.replace('text-slate-500', 'text-white');
        lightBtn.classList.replace('text-white', 'text-slate-500');

        // 3. 移除亮色类
        html.classList.remove('light-mode');
        console.log("已切换至暗色模式");
    }

    // 可选：存入本地存储，下次打开页面自动应用
    localStorage.setItem('pref-theme', mode);
}

function updateThemeButtons(mode) {
    const darkBtn = document.getElementById('btn-dark');
    const lightBtn = document.getElementById('btn-light');
    if(!darkBtn || !lightBtn) return;

    if(mode === 'light') {
        lightBtn.classList.add('text-white');
        darkBtn.classList.remove('text-white');
    } else {
        darkBtn.classList.add('text-white');
        lightBtn.classList.remove('text-white');
    }
}

// 页面加载时自动应用保存的主题
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('pref-theme') || 'dark';
    setTheme(savedTheme);
});


