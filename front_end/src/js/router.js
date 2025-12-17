// 路由配置表
const pageRoutes = {
    home: 'src/pages/home/home.html',
    rank: 'src/pages/rank/rank.html',
    my:   'src/pages/my/my.html'
};

async function loadPage(pageName) {
    const container = document.getElementById('dynamic-content');
    
    // 1. 加载中状态
    container.innerHTML = `
        <div class="flex justify-center items-center h-64 text-indigo-400">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
        </div>
    `;

    try {
        const path = pageRoutes[pageName];
        if (!path) throw new Error("页面不存在");

        // 2. Fetch HTML
        const res = await fetch(path);
        if (!res.ok) throw new Error("加载失败");
        const html = await res.text();

        // 3. 塞入内容
        container.innerHTML = html;

        // 4. 执行脚本 (你的核心逻辑)
        executePageScripts(container);

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="p-10 text-center text-red-500">加载失败: ${err.message}</div>`;
    }
}

// 你的脚本重载逻辑 (保持原样)
function executePageScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        // 复制属性 (src, type等)
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        // 复制内容
        newScript.textContent = oldScript.textContent;
        // 替换
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// 暴露给全局，否则HTML里的onclick找不到它
window.loadPage = loadPage;