// 初始化检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

// 用户输入 UID，后端生成并返回唯一凭证
async function fetchNewCookie() {
    const uidInput = document.getElementById('uid-input');
    const uid = uidInput.value.trim();

    if (!uid) {
        alert("请输入 UID 以获取凭证");
        return;
    }

    // 模拟后端算法：UID -> 加密生成 Cookie
    // const generatedCookie = "MF_" + btoa(uid + "salt_2025").substring(0, 16);

    try {
        const result = await window.API.registerByUID(uid);
        if (result.success) {
            // 将拿到的“Cookie”填入下方的登录框
            document.getElementById('cookie-input').value = result.cookie;
            alert("凭证生成成功！请妥善保存您的 Cookie。");
            // console.log(`UID: ${uid} -> Cookie: ${generatedCookie}`);
        }
    } catch (error) {
        // 捕获后端传回的“用户已存在”错误
        alert("错误: " + error.message);
    }
    
}


// 用户输入 Cookie 尝试登录
async function handleCookieLogin() {
    const cookieInput = document.getElementById('cookie-input');
    const inputCookie = cookieInput.value.trim();
    
    if (!inputCookie || inputCookie.length < 5) {
        alert("无效的 Cookie 凭证");
        return;
    }

    try {
        const result = await window.API.loginByCookie(inputCookie);
        
        if (result.success) {
            // 核心：保存凭证和解析出来的真实 user_id
            localStorage.setItem('active_cookie', inputCookie);
            localStorage.setItem('user_id', result.user_id); 
            
            checkLoginStatus();
            alert(`欢迎回来，UID: ${result.user_id}`);
            
            // 登录成功后刷新页面内容（如：加载我的歌单）
            if (window.loadPage) loadPage('home'); 
        }
    } catch (error) {
        alert("验证失败: " + error.message);
    }

    // 模拟登录成功逻辑 
    // 假设符合 MF_ 开头的都算成功
    // if (inputCookie.startsWith("MF_")) {
    //     localStorage.setItem('active_cookie', inputCookie);
    //     checkLoginStatus();
    //     alert("登录成功！已进入赛博空间");
    // } else {
    //     alert("Cookie 验证失败，凭证错误");
    // }
}

// 退出登录
function handleLogout() {
    if (confirm("确定要退出当前会话吗？")) {
        localStorage.removeItem('active_cookie');
        localStorage.removeItem('user_id');
        checkLoginStatus(); // 立即刷新 UI
        window.location.reload();  // 如果 SPA 需要重置某些全局状态
    }
}

//  刷新 UI 上的登录状态
function checkLoginStatus() {
    const activeCookie = localStorage.getItem('active_cookie');
    const userId = localStorage.getItem('user_id');
    const label = document.getElementById('current-session-label');
    const box = document.getElementById('login-status-box');
    const cookieInput = document.getElementById('cookie-input');
    const logoutBtn = document.getElementById('btn-logout');

    if (activeCookie) {
        // 已登录状态
        label.innerText = `已登录 (UID: ${userId})`;
        label.classList.replace('text-red-400', 'text-emerald-400');
        label.classList.replace('bg-red-500/10', 'bg-emerald-500/10');
        box.classList.add('border-emerald-500/20');
        
        cookieInput.value = activeCookie; // 回填凭证
        logoutBtn.classList.remove('hidden'); // 显示退出按钮
    } else {
        // 未登录状态
        label.innerText = "未登录";
        label.classList.replace('text-emerald-400', 'text-red-400');
        label.classList.replace('bg-emerald-500/10', 'bg-red-500/10');
        box.classList.remove('border-emerald-500/20');
        
        cookieInput.value = ""; 
        logoutBtn.classList.add('hidden'); // 隐藏退出按钮
    }
}

// function checkLoginStatus() {
//     const activeCookie = localStorage.getItem('active_cookie');
//     const label = document.getElementById('current-session-label');
//     const box = document.getElementById('login-status-box');
//     const cookieInput = document.getElementById('cookie-input');

//     if (activeCookie) {
//         label.innerText = "已登录 (SESSION ACTIVE)";
//         label.classList.replace('text-red-400', 'text-emerald-400');
//         label.classList.replace('bg-red-500/10', 'bg-emerald-500/10');
//         box.classList.add('border-emerald-500/20');
//         cookieInput.value = activeCookie; // 回填
//     } else {
//         label.innerText = "未登录";
//         label.classList.replace('text-emerald-400', 'text-red-400');
//         label.classList.replace('bg-emerald-500/10', 'bg-red-500/10');
//         box.classList.remove('border-emerald-500/20');
//     }
// }

function toggleSettings() {
    const modal = document.getElementById('user-settings-modal');
    const panel = document.getElementById('settings-panel');
    
    if (modal.classList.contains('hidden')) {
        // 移除隐藏类，让容器出现在 DOM 中
        modal.classList.remove('hidden');
        
        // 稍微延时，让浏览器捕捉到 translate-x-full 的初始位置，然后再变 0
        // 滑动 动画效果
        setTimeout(() => {
            panel.classList.remove('translate-x-full');
        }, 10);
    } else {
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
    const html = document.documentElement;  // 获取 html 标签

    if (mode === 'light') {
        slider.style.transform = 'translateX(100%)';
        slider.classList.replace('bg-indigo-600', 'bg-amber-500'); // 亮色 // 亮橙色
        
        lightBtn.classList.replace('text-slate-500', 'text-white');
        darkBtn.classList.replace('text-white', 'text-slate-500');

        html.classList.add('light-mode'); 
        console.log("已切换至亮色模式");
        
    } else {
        slider.style.transform = 'translateX(0)';
        slider.classList.replace('bg-amber-500', 'bg-indigo-600');
        
        darkBtn.classList.replace('text-slate-500', 'text-white');
        lightBtn.classList.replace('text-white', 'text-slate-500');

        html.classList.remove('light-mode');
        console.log("已切换至暗色模式");
    }

    // 存入本地存储，下次打开页面自动应用
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


