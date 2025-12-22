
const PlayMode = {
    SEQUENCE: 'sequence', // 顺序播放 (播完列表停止)
    LOOP: 'loop',         // 列表循环 (默认链表行为)
    ONE: 'one',           // 单曲循环
    SHUFFLE: 'shuffle'    // 随机播放
};

const Player = {
    audio: new Audio(),
    playlist: new DoublyCircularLinkedList(), // 使用链表实例
    mode: PlayMode.LOOP,
    isPlaying: false,
    //currentSong: null,
    //isFullPlayerOpen: false,

    // queue: [],         // 当前播放队列
    // currentIndex: -1,  // 当前播放歌曲在队列中的位置

    init() {
        //  核心事件监听
        this.audio.ontimeupdate = () => this.handleTimeUpdate();
        //this.audio.onloadedmetadata = () => this.handleMetadata();
        this.audio.onended = () => this.next(true);

        this.setupProgressBar('p-progress-container'); // 底部进度条
        this.setupProgressBar('fp-progress-container'); // 全屏进度条
 
        // this.initParticles();

        //  点击底部封面展开全屏
        const miniCover = document.getElementById('p-cover');
        if (miniCover) miniCover.onclick = () => this.toggleFullPlayer();

        // 红心和模式按钮点击事件
        this.initControlListeners();

        console.log("Player 系统初始化完成");
    },

    // 核心播放入口
    async play(song, list = []) {
        if (!song || !song.url) return;

        //   构建双向循环链表
        this.playlist = new DoublyCircularLinkedList();
        if (list && list.length > 0) {
            list.forEach(s => this.playlist.append(s));
            // 定位到当前这首歌
            this.playlist.setCurrentById(song.song_id || song.id);
        } else {
            this.playlist.append(song);
            this.playlist.current = this.playlist.head;
        }

        // 加载并播放
        this.loadSong(this.playlist.getCurrentData());

        // 模拟歌曲点击数增加 (实际应发请求给后端)
        // song.playCount = (song.playCount || 0) + 1;
        // console.log(`歌曲: ${song.title} 已点播。累计点击: ${song.playCount}`);

        this.currentSong = song;
        this.audio.src = song.url;
        this.audio.play();
        this.isPlaying = true;

        this.syncUI(); // 一键同步所有界面
    },

    loadSong(song) {
        if (!song) return;
        
        this.audio.src = song.filepath || song.url; 
        this.audio.play().catch(e => console.log("等待交互"));
        this.isPlaying = true;

        this.syncUI(song); 
    },

    // 下一首逻辑
    // isAuto 是否是播放结束后自动触发
    next(isAuto = false) {
        if (!this.playlist.current) return;

        switch (this.mode) {
            case PlayMode.ONE:
                // 如果是手动点下一首，切歌；如果是自动结束，则重播
                if (isAuto) {
                    this.audio.currentTime = 0;
                    this.audio.play();
                } else {
                    this.playlist.current = this.playlist.current.next;
                    this.loadSong(this.playlist.getCurrentData());
                }
                break;

            case PlayMode.SHUFFLE:
                // 简单随机：在链表中随机跳 N 次
                const steps = Math.floor(Math.random() * this.playlist.size);
                for(let i=0; i<steps; i++) {
                    this.playlist.current = this.playlist.current.next;
                }
                this.loadSong(this.playlist.getCurrentData());
                break;

            case PlayMode.SEQUENCE:
                // 如果是链表尾部（next是head），且是自动播放，则停止
                if (isAuto && this.playlist.current.next === this.playlist.head) {
                    this.isPlaying = false;
                    this.updatePlayStateUI();
                    return;
                }
                // 否则同 Loop，next
                this.playlist.current = this.playlist.current.next;
                this.loadSong(this.playlist.getCurrentData());
                break;

            case PlayMode.LOOP:
            default:
                // 链表天然循环，next
                this.playlist.current = this.playlist.current.next;
                this.loadSong(this.playlist.getCurrentData());
                break;
        }
    },

    
    // 上一首逻辑
    prev() {
        if (!this.playlist.current) return;
        
        if (this.audio.currentTime > 3) {
            // 如果播放超过3秒，点击上一首回开头重播
            this.audio.currentTime = 0;
        } else {
            // prev
            this.playlist.current = this.playlist.current.prev;
            this.loadSong(this.playlist.getCurrentData());
        }
    },

    // 切换播放模式
    toggleMode() {
        const modes = [PlayMode.LOOP, PlayMode.ONE, PlayMode.SHUFFLE, PlayMode.SEQUENCE];
        const idx = modes.indexOf(this.mode);
        this.mode = modes[(idx + 1) % modes.length];
        
        this.updateModeUI();
        //console.log("当前模式:", this.mode);
    },

    // 红心收藏逻辑
    toggleLike() {
        const song = this.playlist.getCurrentData();
        if(!song) return;

        // 切换状态
        if (song.type === 'loved') {
            song.type = 'normal';
        } else {
            song.type = 'loved';
        }
        
        this.updateLikeUI(song);
        // API.likeSong(song.id, song.type); // 预留后端接口
    },


    // toggle() {
    //     if (!this.audio.src) return;
    //     this.isPlaying ? this.audio.pause() : this.audio.play();
    //     this.isPlaying = !this.isPlaying;
    //     this.updatePlayStateUI();
    // },

    // //实时监听播放时长
    // handleTimeUpdate() {
    //     if (!this.audio.duration) return;
    //     const pct = (this.audio.currentTime / this.audio.duration) * 100;
    //     const currentTimeStr = this.formatTime(this.audio.currentTime);

    //     // 更新底部进度
    //     const pBar = document.getElementById('p-progress');
    //     const pTime = document.getElementById('p-current-time');
    //     if (pBar) pBar.style.width = `${pct}%`;
    //     if (pTime) pTime.innerText = currentTimeStr;

    //     // 更新全屏进度
    //     const fpBar = document.getElementById('fp-progress');
    //     const fpTime = document.getElementById('fp-current');
    //     if (fpBar) fpBar.style.width = `${pct}%`;
    //     if (fpTime) fpTime.innerText = currentTimeStr;
    // },

    // handleMetadata() {
    //     const durationStr = this.formatTime(this.audio.duration);
    //     if (document.getElementById('p-duration')) document.getElementById('p-duration').innerText = durationStr;
    //     if (document.getElementById('fp-duration')) document.getElementById('fp-duration').innerText = durationStr;
    // },

    // 同步 UI 元素
    syncUI(song) {
        const s = this.currentSong;
        if (!s) return;

        document.getElementById('p-title').innerText = s.title;
        document.getElementById('p-artist').innerText = s.artist;
        document.getElementById('p-cover').src = s.cover;
        document.getElementById('p-cover').classList.remove('hidden');

        const fpTitle = document.getElementById('fp-title');
        const fpArtist = document.getElementById('fp-artist');
        if (fpTitle) {
            fpTitle.innerText = s.title;
            // ui待修改
            fpArtist.innerHTML = `
                <span class="text-indigo-400">${s.artist}</span> 
                <span class="mx-2 text-slate-600">|</span> 
                <span class="text-slate-400">专辑：${s.album}</span>
                <span class="mx-2 text-slate-600">|</span> 
                <span class="text-slate-500 text-sm">来自歌单：${s.playlistName}</span>
            `;
        }
        if (document.getElementById('fp-cover')) document.getElementById('fp-cover').src = s.cover;

        // 歌词渲染
        const lyricsBox = document.getElementById('fp-lyrics-content');
        if (lyricsBox) {
            lyricsBox.innerHTML = s.lyrics.split('\n').map(line => `<p class="leading-relaxed">${line}</p>`).join('');
        }

        this.updateLikeUI(song);
        this.updateModeUI();
        this.updatePlayStateUI();
    },

    updateLikeUI(song) {
        const isLiked = (song.type === 'loved');
        // 针对全屏和底栏的红心按钮
        const btns = document.querySelectorAll('.btn-like'); // 请给红心按钮加上这个类
        btns.forEach(btn => {
            const icon = btn.querySelector('i');
            if (isLiked) {
                icon.className = 'fa-solid fa-heart text-red-500'; // 实心红
            } else {
                icon.className = 'fa-regular fa-heart text-slate-400'; // 空心灰
            }
        });
    },

    updateModeUI() {
        const iconMap = {
            [PlayMode.LOOP]: 'fa-repeat',
            [PlayMode.ONE]: 'fa-1', // FontAwesome 这里的图标可能叫 fa-repeat-1 或者 fa-1
            [PlayMode.SHUFFLE]: 'fa-shuffle',
            [PlayMode.SEQUENCE]: 'fa-arrow-right-long'
        };
        
        const btns = document.querySelectorAll('.btn-mode'); // 给模式按钮加这个类
        btns.forEach(btn => {
            const icon = btn.querySelector('i');
            // 清除旧图标，加上新图标
            icon.className = `fa-solid ${iconMap[this.mode]}`;
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
        // 封面旋转状态
        const cover = document.getElementById('fp-cover');
        if (cover) cover.style.animationPlayState = this.isPlaying ? 'running' : 'paused';
    },

    // 进度条点击跳转逻辑
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

    toggleFullPlayer() {
        const fp = document.getElementById('full-player');
        this.isFullPlayerOpen = !this.isFullPlayerOpen;
        if (this.isFullPlayerOpen) {
            fp.classList.remove('translate-y-full');
            this.syncUI();
        } else {
            fp.classList.add('translate-y-full');
        }
    },

    formatTime(sec) {
        if (isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

};

Player.init();