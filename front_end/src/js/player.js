const PlayMode = {
    SEQUENCE: 'sequence', // 顺序播放
    LOOP: 'loop',         // 列表循环
    ONE: 'one',           // 单曲循环
    SHUFFLE: 'shuffle'    // 随机播放
};

const Player = {
    audio: new Audio(),
    playlist: new DoublyCircularLinkedList(),
    mode: PlayMode.LOOP,
    isPlaying: false,
    currentSong: null,
    isFullPlayerOpen: false,

    init() {
        // 核心事件监听
        this.audio.ontimeupdate = () => this.handleTimeUpdate();
        this.audio.onended = () => this.next(true);

        // 进度条初始化
        this.setupProgressBar('p-progress-container'); // 底部
        this.setupProgressBar('fp-progress-container'); // 全屏

        // 点击底部封面展开全屏
        const miniCover = document.getElementById('p-cover');
        if (miniCover) miniCover.onclick = () => this.toggleFullPlayer();

        // 初始化按钮监听 (使用事件委托)
        this.initControlListeners();

        console.log("Player 系统初始化完成");
    },

    // 核心播放入口
    async play(song, list = []) {
        if (!song) return;

        // 1. 构建链表
        this.playlist = new DoublyCircularLinkedList();
        if (list && list.length > 0) {
            list.forEach(s => this.playlist.append(s));
            // 尝试定位当前歌曲
            const found = this.playlist.setCurrentById(song.song_id || song.id);
            if (!found) {
                // 如果列表里找不到这首歌，就把它加进去
                this.playlist.append(song);
                this.playlist.setCurrentById(song.song_id || song.id);
            }
        } else {
            this.playlist.append(song);
            this.playlist.current = this.playlist.head;
        }

        // 2. 获取数据并播放
        const dataToPlay = this.playlist.getCurrentData();
        this.loadSong(dataToPlay);
    },

    loadSong(song) {
        if (!song) return;

        // 更新全局状态
        this.currentSong = song;
        
        // // 兼容音频地址
        // this.audio.src = song.filepath || song.url || "";

        const audioSrc = song.filepath || song.url || "";
        this.audio.src = audioSrc;
        
        // 尝试播放
        this.audio.play().catch(e => console.log("等待用户交互以播放:", e));
        this.isPlaying = true;

        // 立即同步所有 UI
        this.syncUI(song);
    },

    // 下一首
    next(isAuto = false) {
        if (!this.playlist.current) return;

        switch (this.mode) {
            case PlayMode.ONE:
                if (isAuto) {
                    this.audio.currentTime = 0;
                    this.audio.play();
                } else {
                    this.playlist.current = this.playlist.current.next;
                    this.loadSong(this.playlist.getCurrentData());
                }
                break;

            case PlayMode.SHUFFLE:
                const steps = Math.floor(Math.random() * this.playlist.size) || 1;
                for (let i = 0; i < steps; i++) {
                    this.playlist.current = this.playlist.current.next;
                }
                this.loadSong(this.playlist.getCurrentData());
                break;

            case PlayMode.SEQUENCE:
                if (isAuto && this.playlist.current.next === this.playlist.head) {
                    this.isPlaying = false;
                    this.updatePlayStateUI();
                    return;
                }
                this.playlist.current = this.playlist.current.next;
                this.loadSong(this.playlist.getCurrentData());
                break;

            case PlayMode.LOOP:
            default:
                this.playlist.current = this.playlist.current.next;
                this.loadSong(this.playlist.getCurrentData());
                break;
        }
    },

    // 上一首
    prev() {
        if (!this.playlist.current) return;

        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            this.playlist.current = this.playlist.current.prev;
            this.loadSong(this.playlist.getCurrentData());
        }
    },

    // 切换模式
    toggleMode() {
        const modes = [PlayMode.LOOP, PlayMode.ONE, PlayMode.SHUFFLE, PlayMode.SEQUENCE];
        const idx = modes.indexOf(this.mode);
        this.mode = modes[(idx + 1) % modes.length];

        this.updateModeUI();
    },

    // 红心收藏
    toggleLike() {
        const s = this.currentSong;
        if (!s) return;

        // 切换状态
        s.type = (s.type === 'loved' ? 'normal' : 'loved');
        console.log("红心状态切换:", s.type);

        this.updateLikeUI(s);
        // API.likeSong(s.song_id, s.type); 
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

    // --- UI 同步核心 ---
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

        // 3. 歌词
        const lyricsBox = document.getElementById('fp-lyrics-content');
        if (lyricsBox) {
            if (s.lyrics) {
                lyricsBox.innerHTML = s.lyrics.split('\n').map(line => `<p class="leading-relaxed">${line}</p>`).join('');
            } else {
                lyricsBox.innerHTML = "<p class='text-slate-500'>暂无歌词</p>";
            }
        }

        // 4. 状态按钮
        this.updateLikeUI(s);
        this.updateModeUI();
        this.updatePlayStateUI();
    },

    updateLikeUI(song) {
        if (!song) return;
        const isLiked = (song.type === 'loved');
        const btns = document.querySelectorAll('.btn-like');
        
        btns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                if (isLiked) {
                    icon.className = 'fa-solid fa-heart text-red-500';
                } else {
                    icon.className = 'fa-regular fa-heart text-slate-400';
                }
            }
        });
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
            if(icon) icon.className = `fa-solid ${iconMap[this.mode]}`;
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

    // --- 事件委托 (关键修复：解决动态渲染点击无效) ---
    initControlListeners() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            if (btn.classList.contains('btn-next')) this.next();
            if (btn.classList.contains('btn-prev')) this.prev();
            if (btn.classList.contains('btn-mode')) this.toggleMode();
            if (btn.classList.contains('btn-like')) this.toggleLike();
            if (btn.classList.contains('btn-toggle')) this.toggle();
        });
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

// 启动
Player.init();