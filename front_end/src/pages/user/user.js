
(function() {
    window.UserView = {
        // 测试
        // userId: "12345678", // 实际应从 localStorage 获取

        // 缓存当前的数据，用于管理弹窗显示
        dataCache: {
            created: [],
            collected: []
        },

        async init() {
            console.log("[User] 初始化我的音乐界面...");
            this.userId = window.API ? window.API.getUID && window.API.getUID() : "123";
            
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

            console.log('[User] initSpecialCards - likedCard exists:', !!likedCard, 'recentCard exists:', !!recentCard);

            // 使用更简单的策略：先设置鼠标样式并清空可能存在的 onclick，
            // 在拿到 API 数据后通过直接赋值 `element.onclick = ...` 替换处理器。
            if (likedCard) {
                likedCard.style.cursor = 'pointer';
                likedCard.onclick = null;
            }
            if (recentCard) {
                recentCard.style.cursor = 'pointer';
                recentCard.onclick = null;
            }

            // 加载 [我喜欢的音乐] ---
            // try {
            //     const likedData = await API.getMyLikedPlaylist(this.userId);
            //     if (likedData && likedData.playlists && likedData.playlists.length > 0) {
            //         const pl = likedData.playlists[0];
            //         // 更新 UI
            //         if (likedCount) likedCount.textContent = `${pl.song_count || 0} 首歌曲`;
            //         // 绑定点击：跳转到 playlist 页，传递 ID (通常是 11)
            //         if (likedCard) {
            //             likedCard.onclick = () => loadPage('playlist', { id: pl.playlist_id });
            //         }
            //     }
            // } catch (e) { console.error("加载我喜欢的音乐列表失败", e); }

            // 加载 [我喜欢的音乐] ---
            try {
                const likedData = await API.getMyLikedPlaylist(this.userId);
                // console.log('[User] likedData:', likedData);
                if (likedData && likedData.playlists) {
                    const pl = likedData.playlists;
                    // 更新 UI
                    if (likedCount) likedCount.textContent = `${pl.song_count || 0} 首歌曲`;
                    // 缓存并绑定简单的 onclick（覆盖任何旧处理器）
                    this.dataCache.liked = pl;
                    if (likedCard) {
                        likedCard.onclick = () => {
                            console.log('[User] 点击 我喜欢的：跳转到歌单 id=', pl.playlist_id);
                            loadPage('playlist', { id: pl.playlist_id });
                        };
                    }
                } else {
                    // 清空缓存并绑定提示
                    this.dataCache.liked = null;
                    if (likedCard) {
                        likedCard.onclick = () => {
                            console.warn('[User] 点击 我喜欢的音乐，但未找到歌单数据');
                            alert('暂无我喜欢的歌单');
                        };
                    }
                }
            } catch (e) { console.error("加载我喜欢的音乐列表失败", e); }

            // 加载 [最近播放] ---
            try {
                const recentData = await API.getMyRecentPlaylist(this.userId);
                // console.log('[User] recentData:', recentData);

                if (recentData && recentData.songs) {
                    // 更新 UI 上的歌曲数量
                    if (recentCount) {
                        recentCount.textContent = `${recentData.count || recentData.songs.length} 首歌曲`;
                    }

                    // 缓存数据
                    this.dataCache.recent = recentData;

                    // 设置点击事件
                    if (recentCard) {
                        recentCard.onclick = () => {
                            console.log('[User] 点击最近播放卡片');
                            
                            // 或者传固定 ID 'recent'，让 getPlaylistSongs 去处理
                            loadPage('playlist', { id: 'recent'}); 
                        };
                    }

                    // 同步歌曲的喜欢状态到全局 AppState
                    window.AppState.syncLikedStatus(recentData.songs); //
                    
                }
            } catch (e) { console.error("加载最近播放列表失败", e); }
        },

        // 加载 [我创建的歌单]
        async loadCreatedPlaylists() {
            const container = document.getElementById('created-playlists-grid');
            if (!container) return;

            try {
                const data = await API.getMyCreatedPlaylists(this.userId);
                this.dataCache.created = data.playlists || [];
                
                // --- 关键：清理旧的动态卡片，不影响硬编码的 card-liked 和 card-recent ---
                const existingDynamic = container.querySelectorAll('.js-dynamic-card');
                existingDynamic.forEach(el => el.remove());

                const html = this.dataCache.created.map(pl => {
                    // 确保调用时传入了 'created' 参数
                    let cardHtml = this.createPlaylistCard(pl, 'created');
                    // 动态给这个字符串添加一个类名 js-dynamic-card
                    return cardHtml.replace('playlist-card', 'playlist-card js-dynamic-card');
                }).join('');

                // --- 关键：追加到容器末尾 ---
                container.insertAdjacentHTML('beforeend', html);
                

            } catch (e) {
                console.error("加载我创建歌单失败", e);
            }
        },

        // 加载 [我收藏的歌单]
        async loadCollectedPlaylists() {
            const container = document.getElementById('collected-playlists-grid');
            if (!container) return;

            // 每次进入界面都会重新 fetch 接口 //my/my_songlists_2?user_id=...
            // const data = await API.getMyCollectedPlaylists(this.userId);

            try {
                const data = await API.getMyCollectedPlaylists(this.userId);
                // ataCache.collected = data.playlists || []; // 缓存数据
                this.dataCache.collected = data.playlists || [];
                // const list = data.playlists || [];

                // if (list.length === 0) {
                //     container.innerHTML = `<div class="text-slate-600 text-xs col-span-full">暂无收藏歌单</div>`;
                // } else {
                //     container.innerHTML = list.map(pl => this.createPlaylistCard(pl)).join('');
                // }

                if (this.dataCache.collected.length === 0) {
                    container.innerHTML = `<div class="text-slate-600 text-xs col-span-full py-4">暂无收藏歌单</div>`;
                } else {
                    container.innerHTML = this.dataCache.collected.map(pl => this.createPlaylistCard(pl, 'collected')).join('');
                }
            } catch (e) {
                console.error("加载我收藏歌单失败", e);
            }
        },

        // 渲染单个歌单卡片 HTML
        createPlaylistCard(playlist, type) {
            const cardType = type || 'created';
            const pid = playlist.playlist_id || playlist.id;  
            const imgUrl = playlist.url || 'src/assets/default_cover.jpg'; 
            const domId = `card-${type}-${pid}`; // 生成唯一 DOM ID 

            // return `
            //     <div onclick="loadPage('playlist', { id: '${pid}' })" class="playlist-card group cursor-pointer animate-card">
            //         <div class="relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-indigo-500/20 bg-slate-800">
                        
            //             <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${playlist.title}">
                        
            //             <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            
            //                 <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            //                     <i class="fa-solid fa-play text-white ml-1"></i>
            //                 </div>
                            
            //             </div>
            //         </div>

            //         <div class="mt-3">
            //             <p class="text-sm font-medium truncate text-slate-200 group-hover:text-indigo-400 transition-colors">${playlist.title}</p>
            //             <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">${playlist.song_count || 0} Tracks</p>
            //         </div>
            //     </div>
            // `;

            return `
                <div id="${domId}" onclick="loadPage('playlist', { id: '${pid}' })" class="playlist-card group cursor-pointer animate-card relative">
                    <div class="relative aspect-square rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-[1.02] bg-slate-800">
                        <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${playlist.title}">
                        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                                <i class="fa-solid fa-play text-white ml-1 text-sm"></i>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <p class="text-sm font-medium truncate text-slate-200 group-hover:text-indigo-400 transition-colors">${playlist.title}</p>
                        <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">${playlist.song_count || 0} Tracks</p>
                    </div>
                </div>
            `;
        },

        // 打开管理模态框
        openManageModal() {
            const modal = document.getElementById('playlist-manage-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                this.renderManageLists(); // 渲染列表
            }
        },

        // 关闭管理模态框
        closeManageModal() {
            const modal = document.getElementById('playlist-manage-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        },

        // 渲染管理列表 (在弹窗内)
        renderManageLists() {
            const createdList = document.getElementById('manage-list-created');
            const collectedList = document.getElementById('manage-list-collected');

            // 渲染我创建的
            if (createdList) {
                createdList.innerHTML = this.dataCache.created.map(pl => `
                    <div id="manage-item-created-${pl.playlist_id || pl.id}" class="flex justify-between items-center bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors group">
                        <span class="text-sm text-slate-300 truncate w-2/3">${pl.title}</span>
                        <button onclick="UserView.handleDelete('${pl.playlist_id || pl.id}', 'created')" class="text-xs text-slate-500 hover:text-red-500 px-2 py-1 transition-colors">
                            <i class="fa-solid fa-trash-can"></i> 删除
                        </button>
                    </div>
                `).join('');
            }

            // 渲染我收藏的
            if (collectedList) {
                collectedList.innerHTML = this.dataCache.collected.map(pl => `
                    <div id="manage-item-collected-${pl.playlist_id || pl.id}" class="flex justify-between items-center bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                        <span class="text-sm text-slate-300 truncate w-2/3">${pl.title}</span>
                        <button onclick="UserView.handleDelete('${pl.playlist_id || pl.id}', 'collected')" class="text-xs text-slate-500 hover:text-red-500 px-2 py-1 transition-colors">
                            <i class="fa-solid fa-heart-crack"></i> 取消
                        </button>
                    </div>
                `).join('');
            }
        },

        // 切换公开/私人状态的 UI
        setType(type) {
            const typeInput = document.getElementById('manage-input-type');
            const btnPublic = document.getElementById('type-public');
            const btnPrivate = document.getElementById('type-private');
            
            typeInput.value = type;
            
            if (type === 'public') {
                btnPublic.className = "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-500/20";
                btnPrivate.className = "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all text-slate-400 hover:bg-white/5";
            } else {
                btnPublic.className = "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all text-slate-400 hover:bg-white/5";
                btnPrivate.className = "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-500/20";
            }
        },

        // 处理新建歌单
        async handleCreate() {
            // const input = document.getElementById('manage-input-title');
            const titleInput = document.getElementById('manage-input-title');
            const coverInput = document.getElementById('manage-input-cover'); // 新增封面输入框
            const typeInput = document.getElementById('manage-input-type');

            const title = titleInput.value.trim();
            const coverUrl = coverInput.value.trim(); // 获取封面链接
            const type = typeInput.value; // 获取类型

            if (!title) return alert("请输入歌单名称");

            // 1. 调用 API
            // const res = await API.createPlaylist(title);
            const res = await API.createPlaylist(title, "", coverUrl, type);  // 调用 API，传入 title 和 coverUrl
            
            if (res && res.success) {
                //  更新本地缓存
                this.dataCache.created.push(res.playlist);
                this.renderManageLists();

                const grid = document.getElementById('created-playlists-grid');
                if (grid) {
                    const html = this.createPlaylistCard(res.playlist, 'created');
                    // 保持与 loadCreatedPlaylists 一致的类名处理
                    const dynamicHtml = html.replace('playlist-card', 'playlist-card js-dynamic-card');
                    grid.insertAdjacentHTML('beforeend', dynamicHtml);
                }

                // 4. 更新管理列表 (刷新当前弹窗列表)
                this.renderManageLists();

                // 5. 清空输入
                titleInput.value = '';
                coverInput.value = '';
                this.setType('public'); // 重置为公开
                alert("歌单创建成功");
            }
        },

        // 处理删除/取消收藏 (静默模式：UI 立即反应)
        handleDelete(id, type) {
            if (!confirm(type === 'created' ? "确定要永久删除这个歌单吗？" : "确定要取消收藏吗？")) return;

            // 1. UI 立即移除 (管理列表项)
            const manageItem = document.getElementById(`manage-item-${type}-${id}`);
            if (manageItem) manageItem.remove();

            // 2. UI 立即移除 (主界面卡片)
            const mainCard = document.getElementById(`card-${type}-${id}`);
            if (mainCard) {
                mainCard.style.opacity = '0';
                mainCard.style.transform = 'scale(0.9)';
                setTimeout(() => mainCard.remove(), 300); // 动画后移除
            }

            // 3. 更新本地缓存 (防止关掉弹窗后再打开又出现了)
            if (type === 'created') {
                this.dataCache.created = this.dataCache.created.filter(p => (p.playlist_id || p.id) != id);
                // 4. 发送后端请求 (静默)
                API.deleteCreatedPlaylist(id);
            } else {
                this.dataCache.collected = this.dataCache.collected.filter(p => (p.playlist_id || p.id) != id);
                // 4. 发送后端请求 (静默)
                API.uncollectPlaylist(id);
            }
        },



    };

    
    // 挂载到全局
    window.PageHandlers = window.PageHandlers || {};
    window.PageHandlers.user = () => UserView.init();
    // 不在模块脚本中立即调用 init，交由路由器在加载页面后触发，
    // 否则会导致页面脚本被初始化两次，出现重复事件监听/双重提示问题。

})();