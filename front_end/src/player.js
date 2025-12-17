/**
 * Player Logic
 * 音乐播放核心控制
 */
const AudioPlayer = {
    audio: new Audio(),
    isPlaying: false,
    currentSong: null,

    init() {
        this.audio.addEventListener('timeupdate', () => {
            // 触发自定义事件，通知UI更新
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.dispatchEvent(new CustomEvent('player:progress', { detail: { progress, current: this.audio.currentTime } }));
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            document.dispatchEvent(new Event('player:state-change'));
        });
    },

    async play(song) {
        if (this.currentSong?.id !== song.id) {
            this.currentSong = song;
            // 调用 API 获取真实链接
            const url = await API.getSongUrl(song.id);
            this.audio.src = url;
        }
        
        this.audio.play();
        this.isPlaying = true;
        
        // 触发 UI 更新事件
        document.dispatchEvent(new CustomEvent('player:play-start', { detail: song }));
        document.dispatchEvent(new Event('player:state-change'));
    },

    toggle() {
        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
        } else {
            this.audio.pause();
            this.isPlaying = false;
        }
        document.dispatchEvent(new Event('player:state-change'));
    }
};

AudioPlayer.init();