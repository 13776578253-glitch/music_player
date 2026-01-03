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

// window.GlobalCollect = {
//     activeIds: [], // 记录当前要收藏哪些歌曲

//     // 打开弹窗
//     async open(songIds) {
//         // 1. 统一格式：转为数组
//         this.activeIds = Array.isArray(songIds) ? songIds : [songIds];
        
//         const modal = document.getElementById('add-to-playlist-modal');
//         const content = document.getElementById('modal-content');
        
//         // 2. 显示蒙版
//         modal.classList.remove('hidden');
//         setTimeout(() => {
//             modal.classList.add('opacity-100');
//             content.classList.remove('scale-95');
//         }, 10);

//         // 3. 加载用户的歌单
//         await this.renderPlaylists();
//     },

//     close() {
//         const modal = document.getElementById('add-to-playlist-modal');
//         modal.classList.remove('opacity-100');
//         document.getElementById('modal-content').classList.add('scale-95');
//         setTimeout(() => modal.classList.add('hidden'), 300);
//     },

//     async renderPlaylists() {
//         const listContainer = document.getElementById('modal-playlist-list');
//         listContainer.innerHTML = '<div class="p-4 text-center text-slate-500">正在获取你的歌单...</div>';
        
//         try {
//             const playlists = await API.getUserPlaylists(); // 调用 api.js 里的获取歌单列表接口
//             listContainer.innerHTML = '';
            
//             playlists.forEach(pl => {
//                 const div = document.createElement('div');
//                 div.className = "flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition";
//                 div.onclick = () => this.submit(pl.id);
//                 div.innerHTML = `
//                     <img src="${pl.cover || 'src/assets/default_cover.jpg'}" class="w-12 h-12 rounded-lg object-cover">
//                     <div>
//                         <p class="text-sm font-medium text-white">${pl.title}</p>
//                         <p class="text-xs text-slate-500">${pl.song_count} 首歌曲</p>
//                     </div>
//                 `;
//                 listContainer.appendChild(div);
//             });
//         } catch (e) {
//             listContainer.innerHTML = '<div class="p-4 text-red-400">加载失败，请重试</div>';
//         }
//     },

//     async submit(targetPlaylistId) {
//         const result = await API.batchAddSongsToPlaylist(targetPlaylistId, this.activeIds);
//         if (result.success) {
//             alert("添加成功！");
//             this.close();
//             // 如果你在歌单详情页，需要重置一下勾选状态
//             if(window.CurrentPlaylist) window.CurrentPlaylist.exitBatchMode();
//         }
//     }
// };

window.GlobalCollect = {
    activeIds: [],

    async open(songIds) {
        console.log("[GlobalCollect] 收到原始数据:", songIds);

        // 1. 强制标准化数据：无论传入 Set, 数组还是字符串，统一转为字符串数组
        if (songIds instanceof Set) {
            this.activeIds = Array.from(songIds).map(id => String(id));
        } else if (Array.isArray(songIds)) {
            this.activeIds = songIds.map(id => String(id));
        } else {
            this.activeIds = [String(songIds)];
        }

        console.log("[GlobalCollect] 最终处理 ID 数组:", this.activeIds);

        // 2. 显示 UI：手动控制 display 确保优先级
        const modal = document.getElementById('add-to-playlist-modal');
        const content = document.getElementById('modal-content');
        
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex'; // 强制 flex
            setTimeout(() => {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }, 10);
        }

        // 3. 渲染歌单列表
        await this.renderPlaylists();
    },

    async renderPlaylists() {
        const listContainer = document.getElementById('modal-playlist-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<div class="py-10 text-center text-slate-500 text-sm">正在获取歌单...</div>';

        try {
            // 调用 API 获取用户创建的歌单
            const playlists = await window.API.getUserPlaylists();
            listContainer.innerHTML = '';

            if (playlists.length === 0) {
                listContainer.innerHTML = '<div class="py-10 text-center text-slate-500 text-sm">暂无歌单，先去创建一个吧</div>';
                return;
            }

            playlists.forEach(pl => {
                const item = document.createElement('div');
                item.className = "flex items-center gap-3 p-3 hover:bg-indigo-600/20 rounded-xl cursor-pointer transition-all group";
                item.onclick = () => this.submit(pl.id);
                item.innerHTML = `
                    <div class="w-12 h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                        <img src="${pl.cover || 'src/assets/default_cover.jpg'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate group-hover:text-indigo-400">${pl.title}</p>
                        <p class="text-[10px] text-slate-500 uppercase">${pl.song_count || 0} Songs</p>
                    </div>
                    <i class="fa-solid fa-plus text-slate-700 group-hover:text-indigo-500 text-xs"></i>
                `;
                listContainer.appendChild(item);
            });
        } catch (e) {
            console.error(e);
            listContainer.innerHTML = '<div class="py-10 text-center text-rose-400 text-sm">歌单加载失败</div>';
        }
    },

    async submit(targetPlaylistId) {
        try {
            // 直接调用 API 批量添加
            const result = await window.API.batchAddSongsToPlaylist(targetPlaylistId, this.activeIds);
            if (result.success) {
                this.toast(`成功收藏 ${this.activeIds.length} 首歌曲`);
                this.close();
                
                // 联动：如果在歌单页且处于批量模式，则退出
                if (window.CurrentPlaylist && typeof window.CurrentPlaylist.exitBatchMode === 'function') {
                    window.CurrentPlaylist.exitBatchMode();
                }
            }
        } catch (e) {
            alert("收藏失败: " + e.message);
        }
    },

    close() {
        const modal = document.getElementById('add-to-playlist-modal');
        const content = document.getElementById('modal-content');
        if (modal) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }, 200);
        }
    },

    toast(msg) {
        const t = document.createElement('div');
        t.className = "fixed top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-8 py-3 rounded-full shadow-2xl z-[10001] animate-bounce font-bold";
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }
};