
(function() {
    const PlaylistView = {
        currentId: null,
        _localCurrentSongs: [],         // 存储当前界面的歌曲数据
        isBatchMode: false,             // 是否处于批量操作模式
        selectedSongIds: new Set(),     // 存储选中的歌曲 ID
        isCollected: false,             // 记录当前歌单收藏状态

        async init(params) {
            this.currentId = params?.id || 'default';

            const container = document.getElementById('song-list-body');
            const template = document.getElementById('song-row-template');

            if (!container || !template) return;

            // 重置状态
            this.exitBatchMode();
            this.selectedSongIds.clear();

            //  等待 API 准备就绪
            if (!window.API || !window.API.getPlaylistSongs) {
                setTimeout(() => this.init(params), 50);
                return;
            }

            try {
                // const playlistId = params.id || "103";   //  获取歌单数据  //如 ID 为 103
                // const data = await API.getPlaylistSongs(playlistId); 

                // 获取数据
                const data = await API.getPlaylistSongs(this.currentId);
                this._localCurrentSongs = data.songs || [];   //  关键 把这一批歌存到局部变量里，不影响首页推荐

                this.updateHeader(data);  // 更新头部信息 (标题/封面)

                // 测试
                // document.getElementById('pl-title').textContent = data.title || "歌单详情";    //  更新 UI
                
                // 渲染列表
                this.render(container, template, this._localCurrentSongs);

                // 初始化收藏按钮状态
                this.initCollectStatus();
            } catch (err) {
                console.error("[Playlist] 加载失败:", err);
                container.innerHTML = '<tr><td colspan="7" class="p-10 text-center text-slate-500">获取歌曲列表失败</td></tr>';
            }
        },

        updateHeader(data) {
            const titleEl = document.getElementById('pl-title');
            const descEl = document.getElementById('pl-desc');
            const coverEl = document.getElementById('pl-cover');
            
            if(titleEl) titleEl.textContent = data.title || "未知歌单";
            if(descEl) descEl.textContent = `${this._localCurrentSongs.length} 首歌曲`;
            
            // 如果歌单有封面字段则使用，否则尝试用第一首歌的封面
            //测试逻辑
            let coverUrl = data.cover;
            if (!data.cover && this._localCurrentSongs.length > 0) {
                // coverUrl = this._localCurrentSongs[0].url;
                coverUrl = this._localCurrentSongs[0].url || coverUrl;
            }
            // if(coverEl) coverEl.src = coverUrl || 'src/assets/default_cover.jpg';
            if(coverEl) coverEl.src = coverUrl;

        },

        render(container, template, songs) {
            container.innerHTML = '';

            // 空状态处理
            const emptyState = document.getElementById('empty-state');

            if (songs.length === 0) {
                if(emptyState) {
                    emptyState.classList.remove('hidden');
                    emptyState.classList.add('flex');
                }
                return;
            } else {
                if(emptyState) {
                    emptyState.classList.add('hidden');
                    emptyState.classList.remove('flex');
                }
            }

            // if (songs.length === 0) {
            //     document.getElementById('empty-state').classList.remove('hidden');
            //     document.getElementById('empty-state').classList.add('flex');
            //     return;
            // } else {
            //     document.getElementById('empty-state').classList.add('hidden');
            //     document.getElementById('empty-state').classList.remove('flex');
            // }

            const fragment = document.createDocumentFragment();

            songs.forEach((song, index) => {
                const clone = template.content.cloneNode(true);
                const songId = String(song.id || song.song_id);
                const tr = clone.querySelector('tr');     // 测试
                
                // 填充数据
                //  Checkbox (批量操作)
                const checkbox = clone.querySelector('.song-checkbox');
                checkbox.dataset.id = song.id || index; // 绑定 ID
                checkbox.checked = this.selectedSongIds.has(String(song.id || index));
                // 绑定 checkbox 变化事件
                checkbox.onchange = (e) => this.handleSelectionChange(e, song.id || index);

                //  序号
                clone.querySelector('.index-num').textContent = index + 1;

                //  封面 & 标题 & 歌手
                const img = clone.querySelector('.song-cover');
                img.src = song.url || 'src/assets/default_cover.jpg'; // 使用 song.url 作为封面，或者 filepath 是音频？根据接口文档 url 是封面
                img.onerror = () => { img.src = 'src/assets/default_cover.jpg'; };

                clone.querySelector('.song-name').textContent = song.title || "未知标题";
                
                const artistText = Array.isArray(song.artist) ? song.artist.join(' / ') : (song.artist || "未知歌手");
                clone.querySelector('.song-artist').textContent = artistText;

                //  专辑
                clone.querySelector('.song-album').textContent = song.album || "未知专辑";

                //  时长 
                clone.querySelector('.song-duration').textContent = song.duration || "0:00";

                //  喜欢 按钮    //与后端通信   //重点逻辑！
                // const likeBtn = clone.querySelector('.btn-like i');
                const likeBtn = clone.querySelector('.btn-like');
                const likeIcon = likeBtn.querySelector('i');


                // 测试
                likeBtn.dataset.id = String(song.id || song.song_id);

                // 初始化 UI 状态
                // 后端传回的数据 // is_liked 字段 (boolean)  如数据里没有 is_liked，默认为 false  // 我服了
                // const is_liked = song.is_liked === true || song.is_liked === "true" || song.is_liked == 1 || song.is_loved === true || song.is_loved === "true" || song.is_loved == 1 || song.is_loved == "1";

                // 从全局状态池获取最新的喜欢状态
                const is_liked = window.AppState.isLiked(songId);

                // 渲染 HTML 时使用 isLiked 决定 class
                const heartClass = is_liked ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart';

                // 初始化图标样式
                if (is_liked) {
                    likeIcon.className = 'fa-solid fa-heart text-rose-500'; // 实心红
                } else {
                    likeIcon.className = 'fa-regular fa-heart text-slate-600'; // 空心灰
                }
                
                // if (is_liked) {
                //     likeIcon.classList.remove('fa-regular', 'text-slate-600');
                //     likeIcon.classList.add('fa-solid', 'text-rose-500');
                // } else {
                //     likeIcon.classList.remove('fa-solid', 'text-rose-500');
                //     likeIcon.classList.add('fa-regular', 'text-slate-600');
                // }

                // if (song.is_loved) {
                //     likeBtn.classList.remove('fa-regular');
                //     likeBtn.classList.add('fa-solid', 'text-rose-500');
                // }

                //  绑定喜欢按钮点击事件
                likeBtn.onclick = async (e) => {
                    
                    // 阻止冒泡：防止点击爱心时触发整行的“播放”事件
                    e.stopPropagation(); 

                    const songId = String(song.id || song.song_id);

                    // 3. 【核心修改】直接调用 Player 封装好的逻辑
                    // Player.toggleLike 内部已经处理了：更新 AppState + 刷新全页面 UI + 同步后端
                    if (window.Player && typeof window.Player.toggleLike === 'function') {
                        await window.Player.toggleLike(songId);
                    } else {
                        // 兜底逻辑：如果 Player 没加载好（虽然概率很低）
                        const nextStatus = !window.AppState.isLiked(songId);
                        window.AppState.toggleLike(songId, nextStatus);
                        if (window.API) API.toggleLike(songId, nextStatus);
                    }
                    
                    // 4. (可选) 同步当前列表内的数据对象，确保数据一致
                    song.is_liked = window.AppState.isLiked(songId);
                    song.is_loved = song.is_liked ? 1 : 0;

                    // const currentStatus = (song.is_liked === true || song.is_liked == 1 || song.is_loved == 1 || song.is_loved === true);
                    // // const newStatus = !song.is_liked;
                    // const newStatus = !currentStatus;

                    // // 1. 同步数据对象（重要：Player和当前页共享此对象）
                    // song.is_liked = newStatus;
                    // song.is_loved = newStatus ? 1 : 0;

                    // // 2. 更新当前行 UI
                    // likeIcon.className = newStatus ? 'fa-solid fa-heart text-rose-500 animate-bounce' : 'fa-regular fa-heart text-slate-600';
                    
                    // // 3. 通知后端
                    // if (window.API && API.toggleLike) API.toggleLike(songId, newStatus);

                    // // 4. 同步底部播放器 UI
                    // this.syncBottomPlayerLike(songId, newStatus);

                    // // // 乐观更新 UI (不等后端返回，先变色)
                    // // if (newStatus) {
                    // //     likeIcon.classList.remove('fa-regular', 'text-slate-600');
                    // //     likeIcon.classList.add('fa-solid', 'text-rose-500');
                    // //     // 简单的动画效果
                    // //     likeIcon.classList.add('animate-bounce'); 
                    // //     setTimeout(() => likeIcon.classList.remove('animate-bounce'), 500);
                    // // } else {
                    // //     likeIcon.classList.remove('fa-solid', 'text-rose-500');
                    // //     likeIcon.classList.add('fa-regular', 'text-slate-600');
                    // // }

                    // // // 更新本地数据模型 (状态持久存储)
                    // // song.is_liked = newStatus;

                    // // // 调用后端 API
                    // // if (window.API) {
                    // //     API.toggleLike(song.id || song.song_id, newStatus);
                    // // }

                    // // // 同步 Player  //  如果当前播放的正是这首歌，也要更新播放器上的爱心状态  // 待测试逻辑
                    // // if (window.Player && Player.currentSong) {
                    // //     const playingId = String(Player.currentSong.id || Player.currentSong.song_id);
                    // //     const currentId = String(song.id || song.song_id);
                        
                    // //     if (playingId === currentId) {
                    // //         // 如果 Player 内部有 updateLikeUI 方法，调用它
                    // //         // 如果没有，可以直接修改 Player.currentSong.is_liked
                    // //         Player.currentSong.is_liked = newStatus;
                            
                    // //         // 假设 Player 底部也有个爱心按钮 id="p-btn-like"
                    // //         const playerLikeBtn = document.getElementById('p-btn-like');
                    // //         const playerLikeIcon = playerLikeBtn?.querySelector('i');
                    // //         if (playerLikeIcon) {
                    // //             if (newStatus) {
                    // //                 playerLikeIcon.classList.remove('fa-regular');
                    // //                 playerLikeIcon.classList.add('fa-solid', 'text-rose-500');
                    // //             } else {
                    // //                 playerLikeIcon.classList.remove('fa-solid', 'text-rose-500');
                    // //                 playerLikeIcon.classList.add('fa-regular');
                    // //             }
                    // //         }
                    // //     }
                    // // }

                };

                // const row = clone.querySelector('.song-row');
                
                // // 点击逻辑，只使用 this._localCurrentSongs ---
                // row.onclick = () => {
                //     console.log(`[Playlist] 播放当前歌单中的: ${song.title}`);
                //     if (window.Player) {
                //         // 传入当前点击的歌，以及此歌单的完整列表
                //         // 播放器就会载入这个歌单
                //         Player.play(song, this._localCurrentSongs);
                //     }
                // };

                // 测试逻辑 待修改
                const clickArea = clone.querySelector('.title-click-area');
                clickArea.onclick = () => {
                    // 如果处于批量模式，点击行 = 选中 checkbox
                    if (this.isBatchMode) {
                        checkbox.checked = !checkbox.checked;
                        this.handleSelectionChange({ target: checkbox }, song.id || index);
                        return;
                    }
                    
                    // 正常模式：播放
                    console.log(`[Playlist] 播放: ${song.title}`);

                    if (this.isBatchMode) return;

                    // if (window.Player) {
                    //     Player.play(song, this._localCurrentSongs);
                    // }

                    if (window.Player) {
                        // 检查这首歌在不在 Player.playlist 链表
                        const songId = String(song.song_id || song.id);
                        // const songId = song.song_id || song.id;
                        // 测试
                        // const exists = Player.playlist ? Player.playlist.setCurrentById(songId) : false;

                        // if (exists) {
                        //     // 如果存在，setCurrentById 内部已经把指针指向它了，直接 play() 
                        //     // 调用 player.js 里定义的切换逻辑
                        //     Player.currentSong = song;
                        //     Player.audio.src = song.filepath;
                        //     Player.audio.play();
                        //     Player.updateUI();
                        // } else {
                        //     // 如果不存在，则添加并播放
                        //     Player.play(song); // 确保 Player.play 内部是 append 逻辑
                        // }

                        // 逻辑：如果播放器里已经有这首歌了，直接切过去播；如果没有，把它加进去播
                        if (Player.playlist && Player.playlist.setCurrentById(songId)) {
                            // 已经在队列里了，我们直接调用一个内部加载方法，或者简化版的 play
                            Player.currentSong = Player.playlist.current.data;
                            Player.loadSong(Player.currentSong);
                            Player.renderQueue(); 
                        } else {
                            // 不在队列里，调用原有的 play 方法，传入当前歌单作为 context
                            // 这样 Player 会重建链表并开始播放
                            Player.play(song, this._localCurrentSongs);
                        }
                    }
                };

                // 双击整行也可以播放 
                // tr.ondblclick = () => {
                //     if (!this.isBatchMode && window.Player) Player.play(song, this._localCurrentSongs);
                // };

                fragment.appendChild(clone);
            });

            container.appendChild(fragment);

            // 渲染后，根据当前模式显示/隐藏 checkbox 列
            this.updateBatchUIState();
        },

        // 新增辅助方法：专门处理底部同步     // 测试
        syncBottomPlayerLike(songId, status) {
            if (window.Player && Player.currentSong) {
                const playingId = String(Player.currentSong.id || Player.currentSong.song_id);
                if (playingId === String(songId)) {
                    Player.currentSong.is_liked = status;
                    Player.currentSong.is_loved = status ? 1 : 0;
                    // 寻找底部 ID 为 p-btn-like 的按钮（确保你在 index.html 底部播放栏里给爱心按钮加了 id="p-btn-like"）
                    const pIcon = document.querySelector('#p-btn-like i');
                    if (pIcon) {
                        pIcon.className = status ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart';
                    }
                }
            }
        },

        // 测试
        // refreshLikeStatus(songId, isLiked) {
        //     // // 1. 同步本地缓存的数据
        //     // const song = this._localCurrentSongs.find(s => String(s.id || s.song_id) === String(songId));
        //     // if (song) {
        //     //     song.is_liked = status;
        //     //     song.is_loved = status ? 1 : 0;
        //     // }

        //     // // 2. 找到页面上对应的那一行图标，直接修改 DOM（不需要全量刷新 render，性能更好）
        //     // // 我们可以在 render 时给每个红心按钮加一个 data-song-id 属性
        //     // const icon = document.querySelector(`.btn-like[data-id="${songId}"] i`);
        //     // if (icon) {
        //     //     icon.className = status ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart text-slate-600';
        //     // }
        //     // 在 DOM 中找到那一行。dataset.id 必须在 render 时绑定好
        //     const btn = document.querySelector(`.btn-like[data-id="${songId}"]`);
        //     if (btn) {
        //         const icon = btn.querySelector('i');
        //         icon.className = isLiked ? 'fa-solid fa-heart text-rose-500' : 'fa-regular fa-heart text-slate-600';
        //     }

        // },

        //收藏到歌单_逻辑
        async initCollectStatus() {
            const collectBtn = document.getElementById('btn-collect-playlist');
            if (!collectBtn) return;

            //  从后端获取当前歌单是否已被收藏
            this.isCollected = await API.checkPlaylistCollected(this.currentId);
            this.updateCollectUI();

            //  绑定点击事件
            collectBtn.onclick = async () => {
                const nextStatus = !this.isCollected;
                
                // 乐观更新 UI
                this.isCollected = nextStatus;
                this.updateCollectUI();

                // 同步后端
                const result = await API.toggleCollectPlaylist(this.currentId, nextStatus);
                if (!result.success) {
                    // 如果失败则回滚
                    this.isCollected = !nextStatus;
                    this.updateCollectUI();
                    alert("操作失败，请重试");
                }
            };
        },

        updateCollectUI() {
            const btn = document.getElementById('btn-collect-playlist');
            if (!btn) return;
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');

            if (this.isCollected) {
                icon.className = 'fa-solid fa-bookmark text-indigo-400';
                text.textContent = '已收藏';
                btn.classList.add('bg-white/5');
            } else {
                icon.className = 'fa-regular fa-bookmark';
                text.textContent = '收藏歌单';
                btn.classList.remove('bg-white/5');
            }
        },
    
        // 批量操作_逻辑

        // 切换模式开关
        toggleBatchMode() {
            this.isBatchMode = !this.isBatchMode;
            const btn = document.getElementById('btn-batch-toggle');
            
            if (this.isBatchMode) {
                btn.classList.add('text-indigo-400', 'bg-white/10');
            } else {
                btn.classList.remove('text-indigo-400', 'bg-white/10');
                this.selectedSongIds.clear(); // 退出时清空选择
                this.updateSelectionCount();
            }

            this.updateBatchUIState();
        },

        // 更新 UI 显示 (Checkbox 列和底部 Bar)
        // updateBatchUIState() {
        //     const checkboxes = document.querySelectorAll('.batch-col');
        //     const bottomBar = document.getElementById('batch-action-bar');
        //     const mainContainer = document.querySelector('.p-8'); // 主容器，需要 padding-bottom 防止挡住   //!!

        //     if (this.isBatchMode) {
        //         checkboxes.forEach(el => el.classList.remove('hidden'));
        //         bottomBar.classList.remove('translate-y-32'); // 升起
        //     } else {
        //         checkboxes.forEach(el => el.classList.add('hidden'));
        //         bottomBar.classList.add('translate-y-32'); // 降下
        //     }
        // },

        updateBatchUIState() {
            const checkboxes = document.querySelectorAll('.batch-col');
            const bottomBar = document.getElementById('batch-action-bar');
            
            if (this.isBatchMode) {
                checkboxes.forEach(el => el.classList.remove('hidden'));
                // 向上滑入显示
                bottomBar.classList.remove('translate-y-48');
                bottomBar.classList.add('translate-y-0');
            } else {
                // 向下滑出隐藏
                bottomBar.classList.remove('translate-y-0');
                bottomBar.classList.add('translate-y-48');
                // 延迟隐藏列，等动画做完
                setTimeout(() => {
                    if(!this.isBatchMode) checkboxes.forEach(el => el.classList.add('hidden'));
                }, 300);
            }
        },

        // 处理单个选中
        handleSelectionChange(e, id) {
            const sid = String(id);
            if (e.target.checked) {
                this.selectedSongIds.add(sid);
            } else {
                this.selectedSongIds.delete(sid);
            }
            this.updateSelectionCount();
        },

        // 全选
        toggleSelectAll(sourceCheckbox) {
            const checkboxes = document.querySelectorAll('.song-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = sourceCheckbox.checked;
                const id = cb.dataset.id;
                if (sourceCheckbox.checked) {
                    this.selectedSongIds.add(String(id));
                } else {
                    this.selectedSongIds.clear();
                }
            });
            this.updateSelectionCount();
        },

        // 更新选中数量显示
        updateSelectionCount() {
            const el = document.getElementById('selected-count');
            if(el) el.textContent = this.selectedSongIds.size;
        },

        // 功能操作 

        // 播放全部
        playAll() {
            console.log("点击播放全部");

            if (!this._localCurrentSongs || this._localCurrentSongs.length === 0) {
                alert("当前歌单为空");
                return;
            }

            if (window.Player) {
                // 传入第一首歌，和整个列表
                // player.js 重建链表
                Player.play(this._localCurrentSongs[0], this._localCurrentSongs);
            }
        },

        // 添加到播放列表 (不播放)         //测试逻辑  需要验证  // 重点！
        addAllToQueue() {
            console.log("点击添加到队列");

            if (!window.Player) return;
            if (!this._localCurrentSongs || this._localCurrentSongs.length === 0) return;

            // 确保 Player 链表实例存在
            if (!Player.playlist) {
                Player.playlist = new DoublyCircularLinkedList(); //  LinkedList 全局加载
            }

            //  重新实例化链表（清空）
            //  注：DoublyCircularLinkedList 必须挂全局
            // Player.playlist = new DoublyCircularLinkedList();

            //  遍历链表获取当前播放列表中已有的所有歌曲 ID
            const existingIds = new Set();
            if (Player.playlist.head) {
                let curr = Player.playlist.head;
                for (let i = 0; i < Player.playlist.size; i++) {
                    // 兼容多种 ID 字段名
                    const id = curr.data.song_id || curr.data.id;
                    existingIds.add(String(id));
                    curr = curr.next;
                }
            }

            // this._localCurrentSongs.forEach(song => {
            //     Player.playlist.append(song);
            // });

            // 切断当前正在听的歌
            // Player.currentSong = this._localCurrentSongs[0];
            // Player.playlist.setCurrentById(Player.currentSong.id);
            
            let addedCount = 0;
            // 遍历歌单，添加不存在的歌曲
            this._localCurrentSongs.forEach(song => {
            const songId = String(song.song_id || song.id);
        
            if (!existingIds.has(songId)) {
                Player.playlist.append(song);
                addedCount++;
                // 同步把新加的 ID 也放进 set  
                existingIds.add(songId); 
            }
            });

            // if (typeof Player.renderQueue === 'function') {
            //     Player.renderQueue(); 
            // }

            // 如果有新添加歌曲，手动触发 Player 更新播放队列 UI
            if (addedCount > 0) {
                if (typeof Player.renderQueue === 'function') {
                    Player.renderQueue(); 
                }
                console.log(`成功添加 ${addedCount} 首新歌曲到列表`);
            } else {
                console.log("所选歌曲已全部在列表中，无需重复添加");
            }

            console.log(`播放列表已更新`);
        },

        // 批量删除    //测试逻辑  需要验证  // 重点！
        batchDelete() {
            if (this.selectedSongIds.size === 0) return alert("请先选择歌曲");

            if (!confirm(`确定要从歌单中删除选中的 ${this.selectedSongIds.size} 首歌曲吗？`)) return;

            // // 前端过滤模拟删除
            // const oldLength = this._localCurrentSongs.length;
            // this._localCurrentSongs = this._localCurrentSongs.filter(song => {
            //     return !this.selectedSongIds.has(String(song.id)); // 或者是 song_id，视数据而定
            // });

            // // 重新渲染
            // const container = document.getElementById('song-list-body');
            // const template = document.getElementById('song-row-template');
            // this.render(container, template, this._localCurrentSongs);
            
            // // 更新头部计数
            // document.getElementById('pl-desc').textContent = `${this._localCurrentSongs.length} 首歌曲`;
            
            // // 退出批量模式或清空选择
            // this.selectedSongIds.clear();
            // this.updateSelectionCount();
            
            // 调用后端 API 真正删除
            // await API.deleteSongsFromPlaylist(this.currentId, Array.from(this.selectedSongIds));
        },

        //  收藏到其他歌单    //测试逻辑  需要验证  // 重点！
        
        openAddToPlaylistModal() {
            if (this.selectedSongIds.size === 0) return alert("请先选择歌曲");
            
            const modal = document.getElementById('add-to-playlist-modal');
            modal.classList.remove('hidden');
            // 动画 transition 小延时
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('#modal-content').classList.remove('scale-95');
                modal.querySelector('#modal-content').classList.add('scale-100');
            }, 10);
            
            // 加载我的歌单列表 (模拟)
            this.loadMyPlaylistsToModal();
        },

        closeModal() {
            const modal = document.getElementById('add-to-playlist-modal');
            modal.classList.add('opacity-0');
            modal.querySelector('#modal-content').classList.add('scale-95');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 200);
        },

        async loadMyPlaylistsToModal() {
            const listContainer = document.getElementById('modal-playlist-list');
            // 保留第一个“新建歌单”选项，清除后面部分
            const firstItem = listContainer.firstElementChild; 
            listContainer.innerHTML = '';
            listContainer.appendChild(firstItem);

            try {
                // 获取我创建的歌单
                const data = await API.getMyCreatedPlaylists("12345678"); // 这里的 ID 应从 User 获取
                const playlists = data.playlists || [];

                playlists.forEach(pl => {
                    const div = document.createElement('div');
                    div.className = "flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition";
                    div.innerHTML = `
                        <img src="${pl.url || 'src/assets/default_cover.jpg'}" class="w-12 h-12 rounded-lg object-cover">
                        <div>
                            <p class="text-sm font-medium text-white">${pl.title}</p>
                            <p class="text-xs text-slate-500">${pl.song_count || 0} 首</p>
                        </div>
                    `;
                    div.onclick = () => this.confirmAddToPlaylist(pl.id);
                    listContainer.appendChild(div);
                });
            } catch (e) {
                console.error("加载模态窗歌单失败", e);
            }
        },

        confirmAddToPlaylist(targetPlaylistId) {
            // 执行 API 调用
            console.log(`将 ${this.selectedSongIds.size} 首歌添加到歌单 ${targetPlaylistId}`);
            
            // 模拟成功
            this.closeModal();
            this.exitBatchMode();
            alert("已成功添加歌曲到目标歌单！");
        },

        exitBatchMode() {
            this.isBatchMode = false;
            const btn = document.getElementById('btn-batch-toggle');
            if(btn) btn.classList.remove('text-indigo-400', 'bg-white/10');
            this.selectedSongIds.clear();
            this.updateBatchUIState();
        }
    };

    window.CurrentPlaylist = PlaylistView;
    // window.PageHandlers.playlist = PlaylistView;

    window.PageHandlers = window.PageHandlers || {};
    window.PageHandlers.playlist = (params) => PlaylistView.init(params);
    
})();