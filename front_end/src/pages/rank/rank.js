
window.rankData = {
    global: [],
    personal: []
};



function createRankRow(song, index, type) {
    const artistDisplay = Array.isArray(song.artist) ? song.artist.join(', ') : song.artist;
    // 专辑名：如果 song 对象里没有 album 字段，默认显示“未知专辑”
    const albumDisplay = song.album || "未知专辑";
    // 兼容 id 字段
    const songId = song.song_id || song.id; 

    return `
        <div class="rank-item group flex items-center p-3 hover:bg-white/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer">
            <div class="rank-number w-8 text-center font-mono text-lg font-bold italic text-slate-500 group-hover:text-indigo-500 transition-colors">
                ${String(index + 1).padStart(2, '0')}
            </div>
            
            <div class="relative ml-4 shrink-0">
                <img src="${song.url}" class="w-12 h-12 rounded-lg object-cover shadow-md" alt="cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <button onclick="window.handleRankPlay('${songId}', '${type}')" class="text-white text-sm hover:scale-110 transition-transform">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </div>
            </div>

            <div class="ml-4 flex-1 flex items-center min-w-0 gap-4">
                <div class="flex flex-col flex-1 min-w-0">
                    <div class="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                        ${song.title}
                    </div>
                    <div class="text-xs text-slate-500 truncate mt-0.5">
                        ${artistDisplay}
                    </div>
                </div>

                <div class="hidden md:block flex-1 text-xs text-slate-500 truncate italic">
                    ${albumDisplay}
                </div>
            </div>
            
            <div class="flex items-center gap-4 ml-2">
                <div class="text-[11px] font-mono text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity">
                    ${song.duration}
                </div>
                <button class="text-slate-600 hover:text-white transition-colors">
                    <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
                </button>
            </div>
        </div>
    `;
}

// 核心播放处理函数 (挂载到 window 以便 HTML onclick 调用)
window.handleRankPlay = function(id, type) {
    console.log(`[Rank] 请求播放 类型:${type} ID:${id}`);
    
    //  根据类型获取对应的完整列表
    const list = window.rankData[type];
    if (!list || list.length === 0) return;

    //  在列表中找到目标歌曲对象
    const targetSong = list.find(s => (String(s.song_id) === String(id)) || (String(s.id) === String(id)));

    if (targetSong) {
        //  调用全局 Player，传入歌曲 + 完整列表 (构建双向链表)
        if (window.Player) {
            window.Player.play(targetSong, list);
        }
    } else {
        console.error("未在对应榜单中找到该歌曲");
    }
};

async function initRankPage() {
    try {
        console.log("[Rank] 开始加载排行榜数据...");

        // 并行请求两个新接口
        const [globalRes, personalRes] = await Promise.all([
            API.getGlobalRank(),   // 对应 /rank/public
            API.getPersonalRank()  // 对应 /rank/users
        ]);

        // 更新本地缓存
        window.rankData.global = globalRes.songs || [];
        window.rankData.personal = personalRes.songs || [];

        // 渲染 DOM
        const globalContainer = document.getElementById('global-rank-list');
        const personalContainer = document.getElementById('personal-rank-list');

        if (globalContainer) {
            globalContainer.innerHTML = window.rankData.global
                .slice(0, 20) // 限制显示数量20
                .map((s, i) => createRankRow(s, i, 'global'))
                .join('');
        }

        if (personalContainer) {
            personalContainer.innerHTML = window.rankData.personal
                .slice(0, 20)
                .map((s, i) => createRankRow(s, i, 'personal'))
                .join('');
        }

    } catch (error) {
        console.error("[Rank] 加载排行榜失败:", error);
    }
}

// 初始化
initRankPage();