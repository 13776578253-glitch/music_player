const PlayMode = {
    SEQUENCE: 'sequence', // 顺序播放
    LOOP: 'loop',         // 列表循环
    ONE: 'one',           // 单曲循环
    SHUFFLE: 'shuffle'    // 随机播放
};

const Player = {
    audio: new Audio(),
    playlist: null, // 链表实例
    playlist: new DoublyCircularLinkedList(),
    
    mode: PlayMode.LOOP,
    isPlaying: false,
    currentSong: null,
    isFullPlayerOpen: false,
    isQueueOpen: false, // 侧边栏状态
    lastVolume: 1,  // 音量状态

    init() {
        try {
            // 核心事件监听
            // 注入 BehaviorTracker

            // 进度更新
            // this.audio.ontimeupdate = () => {
            //     this.handleTimeUpdate();
            //     // 驱动统计：告诉统计器现在正在播放，可以计秒
            //     if (typeof BehaviorTracker !== 'undefined') {
            //         BehaviorTracker.tick();
            //     }
            // };

            this.audio.addEventListener('timeupdate', () => {
                this.handleTimeUpdate();
                if (typeof BehaviorTracker !== 'undefined') {
                    BehaviorTracker.tick();
                }
            });

            // 播放结束
            this.audio.onended = () => {
                // 结算当前歌曲：标记为播放完成 (complete)
                if (typeof BehaviorTracker !== 'undefined') {
                    BehaviorTracker.end('complete');
                }
                this.next(true); 
            };

            // 监听拖动：开始拖动进度条时停表
            this.audio.onseeking = () => {
                if (typeof BehaviorTracker !== 'undefined') BehaviorTracker.setSeeking(true);
            };

            // 监听拖动结束：松开进度条后恢复计秒
            this.audio.onseeked = () => {
                if (typeof BehaviorTracker !== 'undefined') BehaviorTracker.setSeeking(false);
            };

            // 监听暂停：停止物理时间累加
            this.audio.onpause = () => {
                if (typeof BehaviorTracker !== 'undefined') BehaviorTracker.pause();
            };

            // 网页关闭监听：防止用户直接关掉网页导致最后一段播放没统计
            window.addEventListener('beforeunload', () => {
                if (typeof BehaviorTracker !== 'undefined') BehaviorTracker.end('quit');
            });

            this.audio.ontimeupdate = () => this.handleTimeUpdate();
            this.audio.onended = () => this.next(true);

            this.audio.onloadedmetadata = () => {
                console.log("[Player] 总时长:", this.audio.duration);
                this.updateDurationUI();
            };

            // 进度条初始化
            this.setupProgressBar('p-progress-container'); // 底部
            this.setupProgressBar('fp-progress-container'); // 全屏

            // 点击底部封面展开全屏
            const miniCover = document.getElementById('p-cover');
            if (miniCover) miniCover.onclick = () => this.toggleFullPlayer();

            this.initVolumeControl();   // 音量 初始化
            this.setVolume(this.audio.volume || 0.8);   // 音量 同步

            // this.syncVolumeUI(this.audio.volume);
    

            // 测试
            // 特殊——初始化
            if (typeof DoublyCircularLinkedList !== 'undefined') {
                this.playlist = new DoublyCircularLinkedList();
            }

            // 初始化按钮监听 (使用事件委托)
            this.initControlListeners();

            

            // this.audio.playbackRate = 1.0;

            console.log("Player 系统初始化完成");
        } catch (e) {
            console.error(" Player 初始化过程崩溃:", e);
        }
    
    },

    async play(song, list = []) {
        console.log("[Player] 收到播放请求:", song?.title);
        
        try {
            // 1. 验证必要参数
            if (!song) throw new Error("播放失败：未传入有效的歌曲对象");

            // 2. 链表构建逻辑
            if (list && list.length > 0) {
                if (typeof DoublyCircularLinkedList === 'undefined') {
                    throw new Error("LinkedList.js 未加载，无法构建循环播放链表");
                }
                this.playlist = new DoublyCircularLinkedList();
                list.forEach(item => {
                    const sid = String(item.song_id || item.id);
                    item.is_liked = window.AppState.isLiked(sid); 
                    this.playlist.append(item);
                });
                console.log(`[Kernel] 链表构建成功，节点数: ${this.playlist.size}`);
            }

            if (!this.playlist || this.playlist.size === 0) {
                throw new Error("播放队列为空，请检查数据源");
            }

            // 3. 定位指针 (强制类型转换以兼容 API 字段)
            const targetId = String(song.song_id || song.id);
            const foundNode = this.playlist.setCurrentById(targetId);

            if (!foundNode) {
                console.warn(`[Kernel] 定位失败(ID:${targetId})，将回退至队列首位`);
                this.playlist.current = this.playlist.head;
            }

            //  核心赋值：这一步解决了 home.js 读不到 title 的问题
            this.currentSong = this.playlist.current.data;
            
            //  加载并播放
            await this.loadSong(this.currentSong);

            //  UI 更新
            this.renderQueue();

        } catch (err) {
            console.error(" [Player.play] 核心链路崩溃:", err.message);
            throw err; 
        }
    },

    renderQueue() {
        const container = document.getElementById('queue-list-container');
        const countEl = document.getElementById('queue-count');
        if (!container || !this.playlist.head) return;

        container.innerHTML = ''; // 清空旧列表
        
        // 遍历链表 (因为是双向循环，需要技巧)
        let current = this.playlist.head;
        let count = 0;
        
        do {
            const songData = current.data;
            const nodeRef = current; // 保存当前节点的引用，闭包用

            // 创建 DOM 元素
            const div = document.createElement('div');
            // 如果是正在播放的歌，加上 active 样式
            const isActive = (this.playlist.current === nodeRef);
            div.className = `queue-item p-3 rounded-lg flex items-center gap-3 hover:bg-white/5 cursor-pointer group mb-1 transition-colors ${isActive ? 'bg-white/10 active' : ''}`;
            
            div.innerHTML = `
                <div class="w-10 h-10 rounded bg-slate-800 bg-cover bg-center shrink-0" style="background-image: url('${songData.url || songData.cover || ''}')"></div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white truncate ${isActive ? 'text-indigo-400' : ''}">${songData.title}</div>
                    <div class="text-xs text-slate-500 truncate">${Array.isArray(songData.artist) ? songData.artist.join('/') : songData.artist}</div>
                </div>
                <i class="fa-solid fa-chart-simple text-indigo-500 text-xs ${isActive ? 'block' : 'hidden'}"></i>
            `;

            // 【关键交互】点击队列里的歌，切歌
            div.onclick = () => {
                this.playlist.current = nodeRef; // 更新指针
                this.loadAndPlayCurrent();       // 播放
                // 重新渲染一下高亮状态 (性能优化版只改样式，这里为了简单直接重绘)
                this.renderQueue(); 
            };

            container.appendChild(div);

            current = current.next;
            count++;
        } while (current !== this.playlist.head); // 循环直到回到头部

        // 更新总数
        if (countEl) countEl.innerText = `${count} 首歌曲`;
    },

    async loadAndPlayCurrent() {
        if (!this.playlist || !this.playlist.current) return;
        const song = this.playlist.current.data;

        await this.loadSong(song);
        // this.audio.src = song.filepath; 
        
        // try {
        //     await this.audio.play();
        //     this.isPlaying = true;
        //     this.updateUI(song);
        //     this.updatePlayBtnState(true);
            
        //     // 每次切歌，都要更新队列的高亮状态
        //     // 这样你打开列表时，就能看到当前播放的是哪首
        //     this.renderQueue(); 

        // } catch (err) {
        //     console.error("播放失败:", err);
        // }
    },
    
    toggleQueue() {
        const drawer = document.getElementById('queue-drawer');
        const overlay = document.getElementById('queue-overlay');
        
        this.isQueueOpen = !this.isQueueOpen;

        if (this.isQueueOpen) {
            drawer.classList.remove('translate-x-full');
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            // 打开时刷新一下高亮，防止状态不同步
            this.renderQueue();
        } else {
            drawer.classList.add('translate-x-full');
            overlay.classList.add('opacity-0', 'pointer-events-none');
        }
    },

    async loadSong(song) {
        if (!song) return;

        // 开启新歌审计
        // 如果之前有正在播的歌，BehaviorTracker 内部会自动触发上一首的 end('skip')
        if (typeof BehaviorTracker !== 'undefined') {
            BehaviorTracker.start(song);
        }

        this.currentSong = song;

        this.audio.pause();

        const audioSrc = song.file_path || "";
        if (!audioSrc) {
            console.Error(`歌曲《${song.title}》缺少音频路径`);
            return;
        }
        try {
            this.audio.src = audioSrc;
            // this.audio.load(); 
            this.currentSong = song;

            // 显式调用 load() 
            this.audio.load();

            // 4. 同步 UI (封面、标题等)
            this.syncUI(song);
            this.renderQueue();

            try {
                await this.audio.play();
                this.isPlaying = true;
                this.updatePlayStateUI();
            } catch (e) {
                // console.warn("[Player] 自动播放受限:", e.name);
                // this.isPlaying = false;
                if (e.name === 'AbortError') {
                // 这是一个常见的“假报错”，通常是因为用户切歌太快，新的请求打断了旧的
                    console.log("[Player] 快速切歌中断了上一次加载");
                } else if (e.name === 'NotAllowedError') {
                    console.warn("[Player] 浏览器阻止自动播放，等待交互");
                    this.isPlaying = false;
                    this.updatePlayStateUI();
                } else {
                    console.error("[Player] 播放出错:", e);
                    this.isPlaying = false;
                }
            }
            
            // 处理浏览器自动播放策略
            // const playPromise = this.audio.play();
            // if (playPromise !== undefined) {
            //     playPromise.then(() => {
            //         this.isPlaying = true;
            //         this.updatePlayStateUI();
            //     }).catch(e => {
            //         console.warn("[Player] 浏览器拦截了自动播放，等待用户点击交互", e.name);
            //         this.isPlaying = false;
            //         this.updatePlayStateUI();
            //     });
            // }

            // // 同步所有 UI 组件
            // this.syncUI(song);
            // this.renderQueue();   // 测试
            
        } catch (e) {
            console.error(" [Player.loadSong] 致命错误:", e.message);
        }
    },

    // 下一首
    next(isAuto = false) {
        if (!this.playlist || !this.playlist.current) return;
        if (this.isSwitching) return;

        this.isSwitching = true;
        setTimeout(() => { this.isSwitching = false; }, 300);

        switch (this.mode) {
            case PlayMode.ONE:
                if (isAuto) {
                    this.audio.currentTime = 0;
                    this.audio.play();
                    return;
                } else {
                    this.playlist.current = this.playlist.current.next;
                    // this.loadSong(this.playlist.getCurrentData());
                }
                break;

            case PlayMode.SHUFFLE:
                const steps = Math.floor(Math.random() * (this.playlist.size || 10));    // 测试
                
                const finalSteps = steps === 0 ? 1 : steps;
                
                for (let i = 0; i < finalSteps; i++) {
                    if (this.playlist.current.next) {
                        this.playlist.current = this.playlist.current.next;
                    }
                    // this.playlist.current = this.playlist.current.next;
                }
                // this.loadSong(this.playlist.getCurrentData());
                break;

            case PlayMode.SEQUENCE:

                if (isAuto && this.playlist.current.next === this.playlist.head) {
                    this.isPlaying = false;
                    this.updatePlayStateUI();
                    return;
                }
                this.playlist.current = this.playlist.current.next;
                // this.loadSong(this.playlist.getCurrentData());
                break;

            case PlayMode.LOOP:
            default:
                this.playlist.current = this.playlist.current.next;
                // this.loadSong(this.playlist.getCurrentData());
                break;
        }
        this.loadSong(this.playlist.getCurrentData());
    },

    // 上一首
    prev() {
        if (!this.playlist || !this.playlist.current) return;
        if (this.isSwitching) return;

        this.isSwitching = true;
        setTimeout(() => { this.isSwitching = false; }, 300);

        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            // this.playlist.current = this.playlist.current.prev;
            // this.loadSong(this.playlist.getCurrentData());
            if (this.playlist.current.prev) {
                this.playlist.current = this.playlist.current.prev;
            } else {
            // 如果是单向链表，找 prev 会很麻烦，这里假设你是双向
            // 如果没有 prev，可能需要遍历到 tail (不常见)
                console.warn("链表没有 prev 指针？");
            }
            this.loadSong(this.playlist.getCurrentData());
        }
    },

    // 切换模式
    toggleMode() {
        // const modes = [PlayMode.LOOP, PlayMode.ONE, PlayMode.SHUFFLE, PlayMode.SEQUENCE];
        // const idx = modes.indexOf(this.mode);
        // this.mode = modes[(idx + 1) % modes.length];

        // this.updateModeUI();
        const modes = [
            PlayMode.LOOP,     // 列表循环
            PlayMode.ONE,      // 单曲循环
            PlayMode.SHUFFLE,  // 随机播放
            PlayMode.SEQUENCE  // 顺序播放
        ];
    
        // 找到当前模式在数组中的位置
        const currentIndex = modes.indexOf(this.mode);
        // 计算下一个索引，到末尾后自动回到 0
        const nextIndex = (currentIndex + 1) % modes.length;
        
        this.mode = modes[nextIndex];

        // 更新 UI（你已经写好了 updateModeUI，它会自动更新图标）
        this.updateModeUI();
        
        const modeNames = {
            [PlayMode.LOOP]: '列表循环',
            [PlayMode.ONE]: '单曲循环',
            [PlayMode.SHUFFLE]: '随机播放',
            [PlayMode.SEQUENCE]: '顺序播放'
        };
        console.log("[Player] 模式切换:", modeNames[this.mode]);
    },

    // 红心收藏
    async toggleLike(targetId = null) {
        // 1. 确定我们要操作哪首歌的 ID
        // 如果传了 ID (来自列表点击)，就用传的；否则用当前播放歌曲的 ID
        const sid = targetId ? String(targetId) : (this.currentSong ? String(this.currentSong.song_id || this.currentSong.id) : null);
        
        if (!sid) return;

        // 2. 【核心】只从 AppState 获取当前状态 
        const currentStatus = window.AppState.isLiked(sid);
        const newStatus = !currentStatus; // 纯逻辑取反，保证灰色点击一定变 true

        console.log(`[Player] 状态切换: ${sid} | ${currentStatus} -> ${newStatus}`);

        // 3. 更新全局数据状态
        window.AppState.toggleLike(sid, newStatus);

        // 4. 【关键】同步内存对象 (如果操作的恰好是当前播放的歌)
        if (this.currentSong && String(this.currentSong.song_id || this.currentSong.id) === sid) {
            this.currentSong.is_liked = newStatus;
            this.currentSong.is_loved = newStatus ? 1 : 0;
        }

        // 5. 【UI 更新】不传 DOM 对象，直接传 ID，让 UI 函数去全页面搜索
        this.updateLikeUI(sid, newStatus);

        // 6. 静默同步后端
        try {
            await window.API.toggleLike(sid, newStatus);
        } catch (err) {
            console.warn("[Player] API 同步失败，本地状态已保留");
        }
    },

    // 播放/暂停
    toggle() {
        if (!this.audio.src) return;
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayStateUI();
    },

    // UI 同步核心
    syncUI(song) {
        const s = song || this.playlist.getCurrentData() || this.currentSong;
        if (!s) return;

        const artistDisplay = Array.isArray(s.artist) ? s.artist.join(' / ') : (s.artist || "未知歌手");
        const coverURL = s.url || "";

        const pTitle = document.getElementById('p-title');
        const pArtist = document.getElementById('p-artist');
        const pCover = document.getElementById('p-cover');

        if (pTitle) pTitle.innerText = s.title || "未知歌名";
        if (pArtist) pArtist.innerText = artistDisplay;
        if (pCover) {
            pCover.src = coverURL;
            pCover.classList.remove('hidden');
        }

        // 2. 全屏播放器
        const fpTitle = document.getElementById('fp-title');
        const fpArtist = document.getElementById('fp-artist');
        const fpCover = document.getElementById('fp-cover');

        if (fpTitle) fpTitle.innerText = s.title || "未知歌名";
        if (fpArtist) {
            fpArtist.innerHTML = `
                <span class="text-indigo-400">${s.artist || "未知"}</span> 
                <span class="mx-2 text-slate-600">|</span> 
                <span class="text-slate-400">专辑：${s.album || "未知"}</span>
            `;
        }
        if (fpCover) fpCover.src = coverURL;

        // 歌词
        const lyricsBox = document.getElementById('fp-lyrics-content');
        if (lyricsBox) {
            if (s.lyrics) {
                lyricsBox.innerHTML = s.lyrics.split('\n').map(line => `<p class="leading-relaxed">${line}</p>`).join('');
            } else {
                lyricsBox.innerHTML = "<p class='text-slate-500'>暂无歌词</p>";
            }
        }

        //  is_like状态
        const sid = String(s.song_id || s.id);
        const isLiked = window.AppState.isLiked(sid);
        this.updateLikeUI(sid, isLiked);
        

        this.updateModeUI();
        this.updatePlayStateUI();
    },

     /**
     * 核心：同步全页面所有相关红心图标的状态
     * @param {string|number} sid 歌曲ID
     * @param {boolean} isLiked 是否喜欢
     */

    updateLikeUI(sid, isLiked) {
        if (!sid) return;
        const targetId = String(sid);

        // 1. 定义样式应用逻辑
        const applyHeartStyle = (iconElement) => {
            if (!iconElement) return;
            if (isLiked) {
                // 变成实心红心
                iconElement.className = 'fa-solid fa-heart text-rose-500';
            } else {
                // 变成空心灰心
                iconElement.className = 'fa-regular fa-heart text-slate-500';
            }
        };

        // 2. 更新播放器底栏和全屏按钮 (只有当操作的ID是当前播放歌曲时)
        const currentPlayingId = this.currentSong ? String(this.currentSong.id || this.currentSong.song_id) : null;
        if (targetId === currentPlayingId) {
            const barIcon = document.querySelector('#p-btn-like-bar i');
            const fullIcon = document.querySelector('#p-btn-like-full i');
            applyHeartStyle(barIcon);
            applyHeartStyle(fullIcon);
        }

        // 3. 更新所有动态列表中的红心 (通过 data-id 匹配)
        // 覆盖 playlist.js 渲染出来的所有具有相同 data-id 的按钮
        const listIcons = document.querySelectorAll(`.btn-like[data-id="${targetId}"] i`);
        listIcons.forEach(icon => applyHeartStyle(icon));
    },

    updateModeUI() {
        const iconMap = {
            [PlayMode.LOOP]: 'fa-repeat',
            [PlayMode.ONE]: 'fa-1', 
            [PlayMode.SHUFFLE]: 'fa-shuffle',
            [PlayMode.SEQUENCE]: 'fa-arrow-right-long'
        };

        const btns = document.querySelectorAll('.btn-mode');
        btns.forEach(btn => {
            const icon = btn.querySelector('i');
            if(icon) {
                // icon.className = `fa-solid ${iconMap[this.mode]}`;
                icon.className = `fa-solid ${iconMap[this.mode]} ${this.mode !== PlayMode.SEQUENCE ? '' : 'text-xs'}`;
            }
                
            // if (this.mode === PlayMode.SEQUENCE) {
            //     btn.classList.replace('text-indigo-400', 'text-slate-500');
            // } else {
            //     btn.classList.replace('text-slate-500', 'text-indigo-400');
            // }

        });
    },

    updatePlayStateUI() {
        const iconClass = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        
        // 底部按钮
        const pBtn = document.getElementById('p-btn-icon');
        if (pBtn) pBtn.className = iconClass + (this.isPlaying ? "" : " ml-0.5");
        
        // 全屏按钮
        const fpBtn = document.getElementById('fp-play-icon');
        if (fpBtn) fpBtn.className = iconClass;
        
        // 封面旋转动画
        const cover = document.getElementById('fp-cover');
        if (cover) cover.style.animationPlayState = this.isPlaying ? 'running' : 'paused';
    },


    //  核心！
    //  事件委托 (关键修复：解决动态渲染点击无效) ---
    initControlListeners() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            // 2. 阻止事件继续向上传递，防止重复触发
            // e.stopPropagation(); // 如果还有别的全局监听，可以加上这一句

            if (btn.classList.contains('btn-next')) this.next();
            if (btn.classList.contains('btn-prev')) this.prev();
            if (btn.classList.contains('btn-toggle')) this.toggle(); // 对应 p-btn-icon 和 fp-play-icon
            if (btn.classList.contains('btn-mode')) this.toggleMode();
            if (btn.classList.contains('btn-like')) {
                if (btn.disabled) return;

                const songId = btn.dataset.id || (this.currentSong ? (this.currentSong.song_id || this.currentSong.id) : null); 
                
                if (!songId) {
                    console.warn("[Player] 未找到有效的歌曲 ID，无法切换红心状态");
                    return;
                }
                
                console.log("[Player] 检测到喜欢按钮点击,ID:",songId);

                // this.toggleLike();

                // 阻止冒泡，防止触发歌单行的点击播放
                e.stopPropagation();

                // 调用 handleToggleLike 并传入 ID
                this.handleToggleLike(songId);

                btn.disabled = true;
                setTimeout(() => btn.disabled = false, 300);
            }
        });
    },

    //测试  //状态更新与ui同步
    async handleToggleLike() {
        if (!this.currentSong) return;
        const sid = String(this.currentSong.id || this.currentSong.song_id); // 强制转为字符串，确保 ID 匹配
        
        // 更新状态
        const isCurrentlyLiked = window.AppState.isLiked(sid);
        const nextStatus = !isCurrentlyLiked; 

        console.log(`[Player] 检测到喜欢按钮点击, ID: ${sid} | ${isCurrentlyLiked} -> ${nextStatus}`);

        // 2. 更新全局状态：记录在 AppState 中 (解决切换页面后状态消失)
        window.AppState.toggleLike(sid, nextStatus);

        // 4. 同步当前歌曲的内存对象
        if (this.currentSong && String(this.currentSong.song_id || this.currentSong.id) === sid) {
            this.currentSong.is_liked = nextStatus;
            // 如果你的后端字段叫 is_loved，也一并更新
            this.currentSong.is_loved = nextStatus ? 1 : 0;
        }



        this.updateLikeUI(sid, nextStatus);

        // // 6. 异步同步后端 (乐观更新：不使用 await 阻塞，让它在后台跑)
        // window.API.toggleLike(sid, nextStatus).catch(err => {
        //     console.error("[API] 喜欢操作后端同步失败:", err);
        //     // 如果追求极致严谨，可以在这里添加回滚逻辑
        //     // 但通常对于“喜欢”操作，本地状态优先即可
        // });

        // // // 5. 静默同步后端 (不管连接是否拒绝，本地 UI 已经改完了)
        // // try {
        // //     await window.API.toggleLike(sid, nextStatus);
        // // } catch (err) {
        // //     console.error("[API] 同步失败，但本地已保持状态");
        // // }

        // 2. 发送给后端
        try {
            const result = await window.API.toggleLike(sid, nextStatus);
            
            // 如果后端返回了具体的错误结果（比如登录过期）
            if (result && result.success === false) {
                throw new Error(result.message || "后端操作失败");
            }
        } catch (err) {
            console.error("[回滚] 后端同步失败，执行 UI 撤销:", err);
            
            // 3. 【关键】回滚逻辑：如果失败了，把状态改回去
            window.AppState.toggleLike(sid, isCurrentlyLiked); // 改回原状态
            this.updateLikeUI(sid, isCurrentlyLiked);        // 刷新 UI 为原样
            
            // 提示用户
            // alert("同步失败，请检查网络"); 
        }
    },

    toggle() {
        if (!this.audio.src) return;
        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
        } else {
            this.audio.pause();
            this.isPlaying = false;
        }
        this.updatePlayStateUI();
    },   

    // --- 进度条逻辑 ---
    setupProgressBar(id) {
        const container = document.getElementById(id);
        if (!container) return;
        container.onclick = (e) => {
            if (!this.audio.duration) return;
            const rect = container.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pct * this.audio.duration;
        };
    },

    initVolumeControl() {
        const configs = [
            { container: 'volume-container', bar: 'volume-progress' },
            { container: 'fp-volume-container', bar: 'fp-volume-progress' }
        ];

        configs.forEach(cfg => {
            const container = document.getElementById(cfg.container);
            const bar = document.getElementById(cfg.bar);
            if (!container || !bar) return;

            container.onclick = (e) => {
                const rect = container.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                this.setVolume(pct);
            };
        });

        // // 初始 UI 同步
        // this.setVolume(this.audio.volume);
    },

    setVolume(val) {
        const volume = Math.max(0, Math.min(1, val));
        this.audio.volume = volume;
        
        // 如果音量不为0，记录为最后有效音量
        if (volume > 0) this.lastVolume = volume;

        // 同步两个进度条宽度
        const bars = ['volume-progress', 'fp-volume-progress'];
        bars.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.width = `${volume * 100}%`;
        });

        this.updateVolumeIcon(volume);
    },

    //待测试 一键静音/智能音量
    toggleMute() {
        if (this.audio.volume > 0) {
            this.lastVolume = this.audio.volume; // 保存当前音量
            this.setVolume(0);
        } else {
            this.setVolume(this.lastVolume || 0.8); // 恢复音量，默认0.8
        }
    },

    updateVolumeIcon(volume) {
        const icons = ['p-volume-icon', 'fp-volume-icon'];
        // let iconClass = 'fa-volume-xmark'; // 默认静音
        let iconClass = 'fa-volume-low';

        // if (volume > 0.5) {
        //     iconClass = 'fa-volume-high';
        // } else if (volume > 0) {
        //     iconClass = 'fa-volume-low';
        // }

        if (volume === 0) {
            iconClass = 'fa-volume-xmark';
        } else if (volume > 0.6) {
            iconClass = 'fa-volume-high';
        }

        // icons.forEach(id => {
        //     const el = document.getElementById(id);
        //     if (el) {
        //         // 替换掉旧的图标类
        //         el.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-xmark');
        //         el.classList.add(iconClass);
        //     }
        // });

        icons.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // 必须保留 fa-solid，只替换变化的那个类
                el.className = `fa-solid ${iconClass} transition-all`;
                // 根据音量调整颜色反馈
                if (volume === 0) {
                    el.classList.add('text-red-500');
                    el.classList.remove('text-slate-500');
                } else {
                    el.classList.remove('text-red-500');
                    el.classList.add('text-slate-500');
                }
            }
        });

    },

    // 时长
    updateDurationUI() {
        const durationStr = this.formatTime(this.audio.duration);
        
        // 底部栏总时长 ID: p-total-time
        const pTotal = document.getElementById('p-total-time');
        // 全屏模式总时长 ID: fp-duration
        const fpTotal = document.getElementById('fp-duration');

        if (pTotal) pTotal.innerText = durationStr;
        if (fpTotal) fpTotal.innerText = durationStr;
    },

    handleTimeUpdate() {
        if (!this.audio.duration) return;
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        const currentTimeStr = this.formatTime(this.audio.currentTime);

        const updateBar = (barId, timeId) => {
            const bar = document.getElementById(barId);
            const time = document.getElementById(timeId);
            if (bar) bar.style.width = `${pct}%`;
            if (time) time.innerText = currentTimeStr;
        };

        updateBar('p-progress', 'p-current-time');
        updateBar('fp-progress', 'fp-current');
    },

    formatTime(sec) {
        if (isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    //新增逻辑   单曲收藏
    handleCollect() {
        if (!this.currentSong) return;
        
        const sid = String(this.currentSong.id || this.currentSong.song_id);
        // 直接调用全局，不要在 player 里写 UI 逻辑
        window.GlobalCollect.open(sid);
        
    },

    // // 处理搜索结果点击
    // addSearchResultAndPlay(songData) {
    //     if (!this.playlist) {
    //         console.warn('[Player] 播放列表未初始化，正在自动创建...');
            
    //         if (typeof DoublyCircularLinkedList !== 'undefined') {
    //             this.playlist = new DoublyCircularLinkedList();
    //         } else {
    //             console.error('找不到 LinkedList 构造函数');
    //             return;
    //         }
    //     }

    //     // 去重逻辑
    //     const newSongId = songData.id || songData.song_id;
    //     const existingNode = this.playlist.find(newSongId);

    //     if (existingNode) {
    //         console.log('[Player] 歌曲已在播放列表中，直接跳转播放:', songData.title);
    //         // 如果歌曲已存在，不需要重新插入，直接加载并播放
    //         this.loadSong(existingNode.data || existingNode); 
    //         this.play();
            
    //         // 更新 UI 
    //         if (this.renderQueue) this.renderQueue();
    //         return; 
    //     }

    //     console.log('[Player] 插入搜索歌曲:', songData.title);
        
    //     // 如果当前列表为空，直接初始化列表
    //     if (this.playlist.isEmpty() || !this.currentSong) {
    //         console.log('[Player] 当前无播放歌曲，直接开始播放新歌');   

    //         this.playlist.append(songData);
    //         this.loadSong(songData);
    //         this.play();
    //     } else {  // 正在播放，插在当前歌曲之后并切歌
    //         console.log('[Player] 插入到当前播放歌曲之后');
            
    //         const currentId = this.currentSong.id || this.currentSong.song_id;
    //         const currentNode = this.playlist.find(currentId);
            
    //         if (currentNode) {
    //             this.playlist.insertAfter(currentId, songData);
                
    //             // 确保 this 指向正确
    //             if (typeof this.playNext === 'function') {
    //                 this.playNext();
    //             } else {
    //                 console.warn('[Player] 找不到 playNext 函数，尝试手动加载');
    //                 this.loadSong(songData);
    //                 this.play();
    //             }
    //         } else {
    //             // 备选：如果找不到当前节点，直接插到末尾
    //             this.playlist.append(songData);
    //             this.loadSong(songData);
    //             this.play();
    //         }
    //     }

    //     if (this.renderQueue) {
    //         this.renderQueue();
    //     }
    // },

    // 处理搜索结果点击
    addSearchResultAndPlay(songData) {
        if (!this.playlist) {
            console.warn('[Player] 播放列表未初始化，正在自动创建...');
            
            if (typeof DoublyCircularLinkedList !== 'undefined') {
                this.playlist = new DoublyCircularLinkedList();
            } else {
                console.error('找不到 LinkedList 构造函数');
                return;
            }
        }

        // 去重逻辑
        const newSongId = songData.id || songData.song_id;
        const existingNode = this.playlist.find(newSongId);

        if (existingNode) {
            console.log('[Player] 歌曲已在播放列表中，直接跳转播放:', songData.title);
            // 如果歌曲已存在，不需要重新插入，直接加载并播放
            this.loadSong(existingNode.data || existingNode); 
            this.play(songData);
            
            // 更新 UI 
            if (this.renderQueue) this.renderQueue();
            return; 
        }

        console.log('[Player] 插入搜索歌曲:', songData.title);
        
        // 如果当前列表为空，直接初始化列表
        if (this.playlist.isEmpty() || !this.currentSong) {
            console.log('[Player] 当前无播放歌曲，直接开始播放新歌');   

            this.playlist.append(songData);
            this.loadSong(songData);
            this.play(songData);
        } else {  // 正在播放，插在当前歌曲之后并切歌
            console.log('[Player] 插入到当前播放歌曲之后');
            
            const currentId = this.currentSong.id || this.currentSong.song_id;
            const currentNode = this.playlist.find(currentId);
            
            if (currentNode) {
                this.playlist.insertAfter(currentId, songData);
                
                // 确保 this 指向正确
                if (typeof this.next === 'function') {
                    this.next();
                } else {
                    console.warn('[Player] 找不到 Next 函数，尝试手动加载');
                    this.loadSong(songData);
                    this.play(songData);
                }
            } else {
                // 备选：如果找不到当前节点，直接插到末尾
                this.playlist.append(songData);
                this.loadSong(songData);
                this.play(songData);
            }
        }

        if (this.renderQueue) {
            this.renderQueue();
        }
    },

    // --- 全屏切换 (关键修复：防止透明层遮挡) ---
    toggleFullPlayer() {
        const fp = document.getElementById('full-player');
        this.isFullPlayerOpen = !this.isFullPlayerOpen;
        
        if (this.isFullPlayerOpen) {
            // 展开：移除隐藏，允许点击
            fp.classList.remove('translate-y-full', 'pointer-events-none');
            fp.classList.add('translate-y-0', 'pointer-events-auto');
            this.syncUI();
        } else {
            // 收起：移出屏幕，禁止点击（防止遮挡底部）
            fp.classList.remove('translate-y-0', 'pointer-events-auto');
            fp.classList.add('translate-y-full', 'pointer-events-none');
        }
    }
};


window.Player = Player;

// 启动
Player.init();