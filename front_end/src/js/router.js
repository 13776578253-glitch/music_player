
const pageRoutes = {
    home: 'src/pages/home/home.html',
    rank: 'src/pages/rank/rank.html',
    user:   'src/pages/user/user.html',
    playlist: 'src/pages/playlist/playlist.html'
};

// 页面处理器注册表
window.PageHandlers = {};

async function loadPage(pageName, params = {}) {
    const container = document.getElementById('dynamic-content');
    window.currentPageParams = params;

    // 1. Loading 动画
    container.innerHTML = `<div class="flex justify-center items-center h-64 text-indigo-400">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
    </div>`;

    try {
        const path = pageRoutes[pageName];
        if (!path) throw new Error("页面不存在");

        const res = await fetch(path);
        const html = await res.text();

        // 2. 注入 HTML 并重载脚本
        container.innerHTML = html;
        executePageScripts(container);

        // 3. 【核心稳定逻辑】显式触发初始化
        // 轮询检查该页面的 Handler 是否已注册
        let retryCount = 0;
        const checkHandler = setInterval(() => {
            if (window.PageHandlers[pageName]) {
                console.log(`[Router] 激活页面脚本: ${pageName}`);
                window.PageHandlers[pageName](params);
                clearInterval(checkHandler);
            } else if (retryCount > 50) { // 5秒超时
                console.warn(`[Router] 页面脚本 ${pageName} 注册超时`);
                clearInterval(checkHandler);
            }
            retryCount++;
        }, 100); // 每100ms检查一次，确保异步JS加载完成

    } catch (err) {
        console.error("加载失败:", err);
    }
}

function executePageScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

window.loadPage = loadPage;

async function handlePlay(songId) {
    console.log("准备播放歌曲 ID:", songId);
    
    // 1. 调用你写好的 API 获取数据
    const songData = await API.getSongDetail(songId);
    
    // 2. 将获取到的数据直接传给 Player 的 play 方法
    if (songData) {
        Player.play(songData);
    } else {
        console.error("未找到歌曲数据");
    }
}