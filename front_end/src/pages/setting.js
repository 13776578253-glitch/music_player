// 初始化检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

// 用户输入 UID，生成唯一凭证
async function fetchNewCookie(event) {
    const uidInput = document.getElementById('uid-input');
    const uid = uidInput.value.trim();

    if (!uid) {
        alert("请输入 UID 以获取凭证");
        return;
    }

    // 处理按钮状态
    const btn = event?.target || document.getElementById('btn-get-uid'); 
    if(btn) btn.disabled = true;

    const salt = "salt_2025";
    const generatedCookie = "MF_" + btoa(uid + salt).substring(0, 16);

    try {
        const result = await window.API.registerByUID(uid, generatedCookie);
        if (result.success) {
            document.getElementById('cookie-input').value = generatedCookie;
            // const confirmSave = confirm(`凭证生成成功！\n\n您的专属 Cookie 为：${generatedCookie}\n\n该凭证已自动填入登录框。请务必妥善保存此字符串`);
            
            alert(`凭证生成成功！\n\n您的专属凭证为：${generatedCookie}\n\n请务必妥善保存。`);
            // if (confirmSave) {
            //     navigator.clipboard.writeText(generatedCookie);
            //     alert("已复制到剪贴板");
            // }
        }
    } catch (error) {
        alert("错误: " + error.message);
    } finally {
        if(btn) btn.disabled = false;
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
            window.CurrentUID = result.user_id;
            
            checkLoginStatus();
            alert(`欢迎回来，UID: ${result.user_id}`);
            
            // 登录成功后刷新页面内容（如：加载我的歌单）
            // if (window.loadPage) loadPage('home'); 
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

window.GlobalCollect = {
    activeIds: [],

    async open(songIds) {
        console.log("[GlobalCollect] 收到原始数据:", songIds);

        if (songIds instanceof Set) {
            this.activeIds = Array.from(songIds).map(id => String(id));
        } else if (Array.isArray(songIds)) {
            this.activeIds = songIds.map(id => String(id));
        } else {
            this.activeIds = [String(songIds)];
        }

        console.log("[GlobalCollect] 最终处理 ID 数组:", this.activeIds);

        const modal = document.getElementById('add-to-playlist-modal');
        const content = document.getElementById('modal-content');
        
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex'; 
            setTimeout(() => {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }, 10);
        }

        await this.renderPlaylists();
    },

    async renderPlaylists() {
    const listContainer = document.getElementById('modal-playlist-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="py-10 text-center text-slate-500 text-sm">正在加载歌单...</div>';

    try {
            // 获取 API 返回的数据
            const response = await window.API.getMyCreatedPlaylists();
            console.log("[GlobalCollect] 原始响应:", response);

            const list = Array.isArray(response) ? response : (response.playlists || []);

            listContainer.innerHTML = '';

            if (list.length === 0) {
                listContainer.innerHTML = '<div class="py-10 text-center text-slate-500 text-sm">暂无自建歌单</div>';
                return;
            }

            list.forEach(pl => {
                const pid = pl.playlist_id; 
                const title = pl.title || "未命名歌单";
                const cover = pl.url || 'src/assets/default_cover.jpg'; // 对应 JSON 中的 url
                const count = pl.song_count || 0;

                const item = document.createElement('div');
                item.className = "flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-white/10 mb-1";
                
                // 绑定点击事件
                item.onclick = () => this.submit(pid);
                
                item.innerHTML = `
                    <div class="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-slate-800 relative">
                        <img src="${cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='src/assets/default_cover.jpg'">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">${title}</p>
                        <p class="text-[10px] text-slate-500 font-medium mt-0.5 tracking-wider">${count} 首歌曲</p>
                    </div>
                    <div class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-all shadow-sm">
                        <i class="fa-solid fa-plus text-[10px] text-slate-400 group-hover:text-white"></i>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        } catch (e) {
            console.error("[GlobalCollect] 渲染失败:", e);
            listContainer.innerHTML = '<div class="py-10 text-center text-rose-400 text-sm font-medium">识别歌单数据异常</div>';
        }
    },

    async submit(target_playlist_id) {
        if (!target_playlist_id) return;
        
        try {
            console.log(`[GlobalCollect] 正在收藏到歌单: ${target_playlist_id}, 歌曲列表:`, this.activeIds);
            
            // 调用 api.js 中的接口
            const result = await window.API.batchAddSongsToPlaylist(target_playlist_id, this.activeIds);

            if (result.success) {
                this.showToast(`成功收藏 ${this.activeIds.length} 首歌`);
                this.close();
                // 成功后如果有必要，可以刷新一下 user 界面或 playlist 界面
                if (window.CurrentPlaylist && window.CurrentPlaylist.exitBatchMode) {
                    window.CurrentPlaylist.exitBatchMode();
                }
            } else {
                alert(result.message || "操作失败，可能歌曲已存在");
            }
        } catch (error) {
            alert("网络连接失败，请检查后端服务");
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
    },

    //  Toast 提示函数
    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = "fixed top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-2xl z-[10001] animate-bounce text-sm font-bold";
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }
};