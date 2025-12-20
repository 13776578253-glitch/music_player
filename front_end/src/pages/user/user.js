/**
 * 渲染单个歌单卡片 HTML
 */
function createPlaylistCard(playlist) {
    return `
        <div onclick="openPlaylist('${playlist.id}')" class="playlist-card group cursor-pointer animate-card">
            <div class="relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02]">
                <img src="${playlist.url || 'default-cover.jpg'}" class="w-full h-full object-cover" alt="cover">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center">
                         <i class="fa-solid fa-play text-xs"></i>
                    </button>
                </div>
            </div>
            <div class="mt-3">
                <p class="text-sm font-medium truncate">${playlist.title}</p>
                <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">${playlist.count || 0} Tracks</p>
            </div>
        </div>
    `;
}

/**
 * 核心：加载用户歌单界面
 * @param {Array} playlists - 后端传来的完整歌单数组
 */
function renderUserLibrary(playlists) {
    const createdContainer = document.getElementById('created-playlists-grid');
    const collectedContainer = document.getElementById('collected-playlists-grid');
    
    // 假设后端数据包含 isCreated 字段区分
    const created = playlists.filter(p => p.isCreated === true);
    const collected = playlists.filter(p => p.isCreated === false);

    // 渲染动态部分（注意不覆盖固定项）
    created.forEach(p => {
        createdContainer.insertAdjacentHTML('beforeend', createPlaylistCard(p));
    });
    
    collectedContainer.innerHTML = collected.map(p => createPlaylistCard(p)).join('');
}