
function createRankRow(song, index) {
    // 处理歌手数组，转为字符串展示
    const artistDisplay = Array.isArray(song.artist) ? song.artist.join(', ') : song.artist;

    return `
        <div class="rank-item group flex items-center p-3 hover:bg-white/5 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer">
            <div class="rank-number w-8 text-center font-mono text-lg font-bold italic text-slate-500 group-hover:text-indigo-500 transition-colors">
                ${String(index + 1).padStart(2, '0')}
            </div>
            
            <div class="relative ml-4 shrink-0">
                <img src="${song.url}" class="w-12 h-12 rounded-lg object-cover shadow-md" alt="cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <button onclick="handlePlay('${song.song_id}')" class="text-white text-sm">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </div>
            </div>

            <div class="flex-1 ml-4 overflow-hidden">
                <div class="font-bold truncate text-sm text-white dark:text-white">${song.title}</div>
                <div class="text-xs text-slate-500 truncate mt-1">${artistDisplay}</div>
            </div>

            <div class="flex items-center gap-4">
                <div class="text-[10px] font-mono text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity">
                    ${song.duration}
                </div>
                <button class="text-slate-600 hover:text-white transition-colors">
                    <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
                </button>
            </div>
        </div>
    `;
}


//  playlistId 根据业务逻辑，如 '1' 是热度榜，'2' 是偏好榜

async function initRankPage() {
    try {
        // 同时发起两个请求（假设热度榜ID为1，偏好榜ID为2）
        const [globalData, personalData] = await Promise.all([
            API.getPlaylistSongs(1),
            API.getPlaylistSongs(2)
        ]);

        const globalContainer = document.getElementById('global-rank-list');
        const personalContainer = document.getElementById('personal-rank-list');

        if (globalContainer && globalData.songs) {
            globalContainer.innerHTML = globalData.songs
                .slice(0, 10) // 取前10名
                .map((s, i) => createRankRow(s, i))
                .join('');
        }

        if (personalContainer && personalData.songs) {
            personalContainer.innerHTML = personalData.songs
                .slice(0, 10)
                .map((s, i) => createRankRow(s, i))
                .join('');
        }

    } catch (error) {
        console.error("加载排行榜失败:", error);
    }
}

initRankPage();