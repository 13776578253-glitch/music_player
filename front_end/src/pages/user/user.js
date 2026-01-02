
(function() {
    const UserView = {
        // 测试
        userId: "12345678", // 实际应从 localStorage 获取

        async init() {
            console.log("[User] 初始化我的音乐界面...");
            
            //  初始化顶部固定卡片 (喜欢 & 最近)
            this.initSpecialCards();

            //  加载并渲染网格列表
            this.loadCreatedPlaylists();
            this.loadCollectedPlaylists();
        },

        // 处理 “我喜欢的”和“最近播放”
        async initSpecialCards() {
            // 获取 DOM
            const likedCard = document.getElementById('card-liked');
            const recentCard = document.getElementById('card-recent');
            const likedCount = document.getElementById('info-liked-count');
            const recentCount = document.getElementById('info-recent-count');

            // 加载 [我喜欢的音乐] ---
            try {
                const likedData = await API.getMyLikedPlaylist(this.userId);
                if (likedData && likedData.playlists && likedData.playlists.length > 0) {
                    const pl = likedData.playlists[0];
                    // 更新 UI
                    if (likedCount) likedCount.textContent = `${pl.song_count || 0} 首歌曲`;
                    // 绑定点击：跳转到 playlist 页，传递 ID (通常是 11)
                    if (likedCard) {
                        likedCard.onclick = () => loadPage('playlist', { id: pl.playlist_id });
                    }
                }
            } catch (e) { console.error("加载我喜欢的音乐列表失败", e); }

            // 加载 [最近播放] ---
            try {
                const recentData = await API.getMyRecentPlaylist(this.userId);
                if (recentData && recentData.playlists && recentData.playlists.length > 0) {
                    const pl = recentData.playlists[0];
                    if (recentCount) recentCount.textContent = `${pl.song_count || 0} 首歌曲`;
                    // 绑定点击：跳转到 playlist 页，传递 ID (通常是 12)
                    // 测试
                    if (recentCard) {
                        recentCard.onclick = () => loadPage('playlist', { id: pl.playlist_id });
                    }
                }
            } catch (e) { console.error("加载最近播放列表失败", e); }
        },

        // 加载 [我创建的歌单]
        async loadCreatedPlaylists() {
            const container = document.getElementById('created-playlists-grid');
            if (!container) return;

            try {
                const data = await API.getMyCreatedPlaylists(this.userId);
                const list = data.playlists || [];

                // 测试
                const html = list.map(pl => this.createPlaylistCard(pl)).join('');     // 生成 HTML 字符串
                
                // 渲染前清空 (保留 grid 结构)
                // container.innerHTML = list.map(pl => this.createPlaylistCard(pl)).join('');

                container.insertAdjacentHTML('beforeend', html);

            } catch (e) {
                console.error("加载我创建歌单失败", e);
            }
        },

        // 加载 [我收藏的歌单]
        async loadCollectedPlaylists() {
            const container = document.getElementById('collected-playlists-grid');
            if (!container) return;

            try {
                const data = await API.getMyCollectedPlaylists(this.userId);
                const list = data.playlists || [];

                if (list.length === 0) {
                    container.innerHTML = `<div class="text-slate-600 text-xs col-span-full">暂无收藏歌单</div>`;
                } else {
                    container.innerHTML = list.map(pl => this.createPlaylistCard(pl)).join('');
                }
            } catch (e) {
                console.error("加载我收藏歌单失败", e);
            }
        },

        // 渲染单个歌单卡片 HTML
        
        // createPlaylistCard(playlist) {
        //     const pid = playlist.playlist_id || playlist.id;  // 兼容接口返回字段 playlist_id / id，
        //     const imgUrl = playlist.url;  

        //     return `
        //         <div onclick="loadPage('playlist', { id: '${pid}' })" class="playlist-card group cursor-pointer animate-card">
        //             <div class="relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02] bg-slate-800">
        //                 <img src="${imgUrl}" class="w-full h-full object-cover" alt="${playlist.title}">
        //                 <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        //                     <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center">
        //                          <i class="fa-solid fa-play text-xs"></i>
        //                     </button>
        //                 </div>
        //             </div>
        //             <div class="mt-3">
        //                 <p class="text-sm font-medium truncate text-slate-200">${playlist.title}</p>
        //                 <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">${playlist.song_count || 0} Tracks</p>
        //             </div>
        //         </div>
        //     `;
        // }

        createPlaylistCard(playlist) {
            const pid = playlist.playlist_id || playlist.id;  
            const imgUrl = playlist.url || 'src/assets/default_cover.jpg';  

            return `
                <div onclick="loadPage('playlist', { id: '${pid}' })" class="playlist-card group cursor-pointer animate-card">
                    <div class="relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-indigo-500/20 bg-slate-800">
                        
                        <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${playlist.title}">
                        
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            
                            <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <i class="fa-solid fa-play text-white ml-1"></i>
                            </div>
                            
                        </div>
                    </div>

                    <div class="mt-3">
                        <p class="text-sm font-medium truncate text-slate-200 group-hover:text-indigo-400 transition-colors">${playlist.title}</p>
                        <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">${playlist.song_count || 0} Tracks</p>
                    </div>
                </div>
            `;
        }
    };

    // 挂载到全局
    window.PageHandlers = window.PageHandlers || {};
    window.PageHandlers.user = () => UserView.init();

})();