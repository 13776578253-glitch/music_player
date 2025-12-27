
const pageRoutes = {
    home: 'src/pages/home/home.html',
    rank: 'src/pages/rank/rank.html',
    user:   'src/pages/user/user.html',
    playlist: 'src/pages/playlist/playlist.html'
};

window.PageHandlers = {};

async function loadPage(pageName, params = {}) {
    const container = document.getElementById('dynamic-content');
    window.currentPageParams = params;

    container.innerHTML = `<div class="flex justify-center items-center h-64 text-indigo-400">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
    </div>`;

    try {
        const path = pageRoutes[pageName];
        if (!path) throw new Error("页面不存在");

        const res = await fetch(path);
        const html = await res.text();

        container.innerHTML = html;
        executePageScripts(container);

        let retryCount = 0;
        const checkHandler = setInterval(() => {
            if (window.PageHandlers[pageName]) {
                console.log(`[Router] 激活页面脚本: ${pageName}`);
                window.PageHandlers[pageName](params);
                clearInterval(checkHandler);
            } else if (retryCount > 50) { 
                console.warn(`[Router] 页面脚本 ${pageName} 注册超时`);
                clearInterval(checkHandler);
            }
            retryCount++;
        }, 100); 

    } catch (err) {
        console.error("加载失败:", err);
        container.innerHTML = `<div class="p-10 text-center text-red-500">页面加载失败: ${err.message}</div>`;
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

// 测试逻辑

// async function handlePlay(songId) {
//     console.log("准备播放歌曲 ID:", songId);
    
//     const songData = await API.getSongDetail(songId);
    
//     if (songData) {
//         Player.play(songData);
//     } else {
//         console.error("未找到歌曲数据");
//     }
// }


// async function handlePlay(songId) {
//     console.log("准备播放歌曲集合，定位 ID:", songId);
    
//     try {
//         // 1. 获取集合数据 (此时返回的是 { songs: [...] })
//         const responseData = await API.getSongDetail(songId);
        
//         if (responseData && responseData.songs && responseData.songs.length > 0) {
//             const list = responseData.songs;
            
//             // 2. 在集合中找到匹配的那首歌对象
//             const target = list.find(s => (s.id == songId || s.song_id == songId)) || list[0];
            
//             // 3. 调用 Player 播放，并把整个集合传进去构建链表
//             if (window.Player) {
//                 Player.play(target, list); 
//             }
//         } else {
//             console.error("未找到有效的歌曲集合数据");
//         }
//     } catch (err) {
//         console.error("handlePlay 执行失败:", err);
//     }
// }