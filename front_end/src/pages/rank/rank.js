/**
 * 渲染排行榜单行
 */
function createRankRow(song, index) {
    return `
        <div class="rank-item group">
            <div class="rank-number">${index + 1}</div>
            <img src="${song.url}" class="w-12 h-12 rounded-lg object-cover shadow-lg" alt="cover">
            <div class="flex-1 ml-4 overflow-hidden">
                <div class="font-bold truncate text-sm">${song.title}</div>
                <div class="text-xs text-slate-500 truncate">${song.artist.join(', ')}</div>
            </div>
            <div class="text-xs font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                ${song.duration}
            </div>
            <button onclick="handlePlay('${song.song_id}')" class="ml-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                <i class="fa-solid fa-play text-[10px]"></i>
            </button>
        </div>
    `;
}

/**
 * 加载排行榜数据
 */
async function loadRankPage(playlistId) {
    try {
        // 假设从接口获取数据
        const response = await fetch(`/playlist_songs/${playlistId}`);
        const data = await response.json();
        
        const container = document.getElementById('global-rank-list');
        const personalContainer = document.getElementById('personal-rank-list');

        // 模拟：前5首放左边，后5首放右边（实际开发中应根据后端字段排序）
        const songs = data.songs;
        
        container.innerHTML = songs.slice(0, 10).map((s, i) => createRankRow(s, i)).join('');
        personalContainer.innerHTML = songs.slice(10, 20).map((s, i) => createRankRow(s, i)).join('');
        
    } catch (error) {
        console.error("加载排行榜失败:", error);
    }
}