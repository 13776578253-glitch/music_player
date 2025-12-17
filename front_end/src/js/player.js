const Player = {
    audio: new Audio(),
    isPlaying: false,

    // 播放入口
    play(song) {
        console.log("播放:", song.title);
        
        this.audio.src = song.url;
        this.audio.play();
        this.isPlaying = true;

        // 更新界面
        this.updateUI(song);
        this.updateIcon();
    },

    toggle() {
        if (!this.audio.src) return;
        this.isPlaying ? this.audio.pause() : this.audio.play();
        this.isPlaying = !this.isPlaying;
        this.updateIcon();
    },

    updateUI(song) {
        document.getElementById('p-title').innerText = song.title;
        document.getElementById('p-artist').innerText = song.artist;
        const cover = document.getElementById('p-cover');
        cover.src = song.cover;
        cover.classList.remove('hidden');
    },

    updateIcon() {
        const icon = document.getElementById('p-btn-icon');
        icon.className = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play ml-0.5';
    },

    init() {
        // 进度条自动走
        this.audio.ontimeupdate = () => {
            const pct = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('p-progress').style.width = `${pct}%`;
        }
    }
};

Player.init();