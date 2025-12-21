
const Player = {
    audio: new Audio(),
    isPlaying: false,
    currentSong: null,
    isFullPlayerOpen: false,

    queue: [],         // 当前播放队列
    currentIndex: -1,  // 当前播放歌曲在队列中的位置

    init() {
        // 1. 核心事件监听
        this.audio.ontimeupdate = () => this.handleTimeUpdate();
        this.audio.onloadedmetadata = () => this.handleMetadata();

        this.audio.onended = () => this.next();

        // 2. 进度条点击跳转逻辑 (封装通用函数)
        this.setupProgressBar('p-progress-container'); // 底部进度条
        this.setupProgressBar('fp-progress-container'); // 全屏进度条

        // 3. 粒子效果初始化
        this.initParticles();

        // 4. 点击底部封面展开全屏
        const miniCover = document.getElementById('p-cover');
        if (miniCover) miniCover.onclick = () => this.toggleFullPlayer();

        console.log("Player 系统初始化完成");
    },

    // 播放入口：接收后端返回的完整对象
    async play(song, list = []) {
        if (!song || !song.url) return;

        // 模拟歌曲点击数增加 (实际应发请求给后端)
        song.playCount = (song.playCount || 0) + 1;
        console.log(`歌曲: ${song.title} 已点播。累计点击: ${song.playCount}`);

        this.currentSong = song;
        this.audio.src = song.url;
        this.audio.play();
        this.isPlaying = true;

        this.syncUI(); // 一键同步所有界面
    },

    toggle() {
        if (!this.audio.src) return;
        this.isPlaying ? this.audio.pause() : this.audio.play();
        this.isPlaying = !this.isPlaying;
        this.updatePlayStateUI();
    },

    // 实时监听播放时长
    handleTimeUpdate() {
        if (!this.audio.duration) return;
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        const currentTimeStr = this.formatTime(this.audio.currentTime);

        // 更新底部进度
        const pBar = document.getElementById('p-progress');
        const pTime = document.getElementById('p-current-time');
        if (pBar) pBar.style.width = `${pct}%`;
        if (pTime) pTime.innerText = currentTimeStr;

        // 更新全屏进度
        const fpBar = document.getElementById('fp-progress');
        const fpTime = document.getElementById('fp-current');
        if (fpBar) fpBar.style.width = `${pct}%`;
        if (fpTime) fpTime.innerText = currentTimeStr;
    },

    handleMetadata() {
        const durationStr = this.formatTime(this.audio.duration);
        if (document.getElementById('p-duration')) document.getElementById('p-duration').innerText = durationStr;
        if (document.getElementById('fp-duration')) document.getElementById('fp-duration').innerText = durationStr;
    },

    // 同步所有 UI 元素
    syncUI() {
        const s = this.currentSong;
        if (!s) return;

        // --- 底部播放栏 ---
        document.getElementById('p-title').innerText = s.title;
        document.getElementById('p-artist').innerText = s.artist;
        document.getElementById('p-cover').src = s.cover;
        document.getElementById('p-cover').classList.remove('hidden');

        // --- 全屏界面 ---
        const fpTitle = document.getElementById('fp-title');
        const fpArtist = document.getElementById('fp-artist');
        if (fpTitle) {
            fpTitle.innerText = s.title;
            // 额外信息显示：专辑和歌单
            fpArtist.innerHTML = `
                <span class="text-indigo-400">${s.artist}</span> 
                <span class="mx-2 text-slate-600">|</span> 
                <span class="text-slate-400">专辑：${s.album}</span>
                <span class="mx-2 text-slate-600">|</span> 
                <span class="text-slate-500 text-sm">来自歌单：${s.playlistName}</span>
            `;
        }
        if (document.getElementById('fp-cover')) document.getElementById('fp-cover').src = s.cover;

        // --- 歌词渲染 ---
        const lyricsBox = document.getElementById('fp-lyrics-content');
        if (lyricsBox) {
            lyricsBox.innerHTML = s.lyrics.split('\n').map(line => `<p class="leading-relaxed">${line}</p>`).join('');
        }

        this.updatePlayStateUI();
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

    // 粒子效果 (Canvas) 保持不变...
    initParticles() { /* 同前 ... */ }
};

Player.init();