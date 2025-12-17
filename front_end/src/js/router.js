// 路由配置表保持不变
const pageRoutes = {
    home: 'src/pages/home/home.html',
    rank: 'src/pages/rank/rank.html',
    my:   'src/pages/my/my.html',
    playlist: 'src/pages/playlist/playlist.html' 
};

// 修改 loadPage，增加第二个参数 params
async function loadPage(pageName, params = {}) {
    const container = document.getElementById('dynamic-content');
    
    // 【关键】将传入的参数（如 {id: 123}）挂载到全局
    // 这样新页面加载后的脚本就能通过 window.currentPageParams.id 拿到值
    window.currentPageParams = params; 

    container.innerHTML = `
        <div class="flex justify-center items-center h-64 text-indigo-400">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
        </div>
    `;

    try {
        const path = pageRoutes[pageName];
        if (!path) throw new Error("页面不存在");

        const res = await fetch(path);
        if (!res.ok) throw new Error("加载失败");
        const html = await res.text();

        container.innerHTML = html;

        // 执行脚本，脚本里会去读取 window.currentPageParams
        executePageScripts(container);

        // 可选：如果是点击进入新页面，自动滚回顶部
        container.scrollTo(0, 0);

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="p-10 text-center text-red-500">加载失败: ${err.message}</div>`;
    }
}

// executePageScripts 保持不变
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