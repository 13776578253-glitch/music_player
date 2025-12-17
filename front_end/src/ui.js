/**
 * UI Logic
 * 处理点击事件、DOM渲染、全屏切换
 */

// 渲染歌单卡片
function renderPlaylists(playlists) {
    const container = document.getElementById('playlist-container');
    container.innerHTML = playlists.map(item => `
        <div class="group cursor-pointer p-4 rounded-xl hover:bg-white/5 transition duration-300" onclick="playDemoSong('${item.title}', '${item.artist}', '${item.cover}')">
            <div class="relative overflow-hidden rounded-lg shadow-lg mb-3">
                <img src="${item.cover}" class="w-full aspect-square object-cover group-hover:scale-105 transition duration-500">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 group-hover:scale-100 transition duration-300 delay-100">
                        <i class="fa-solid fa-play ml-1 text-sm"></i>
                    </div>
                </div>
            </div>
            <h4 class="font-bold text-sm truncate">${item.title}</h4>
            <p class="text-xs text-slate-400 truncate mt-1">${item.artist}</p>
        </div>
    `).join('');
}

// 界面事件监听
document.addEventListener('DOMContentLoaded', () => {
    const miniPlayer = document.getElementById('mini-player');
    const fullPlayer = document.getElementById('full-player');
    const collapseBtn = document.getElementById('collapse-btn');
    const playBtn = document.getElementById('play-pause-btn');
    const fullPlayBtn = document.getElementById('full-play-btn');

    // 1. 点击底部播放条 -> 展开全屏
    miniPlayer.addEventListener('click', () => {
        fullPlayer.classList.remove('translate-y-full');
    });

    // 2. 点击收起按钮 -> 收起全屏
    collapseBtn.addEventListener('click', () => {
        fullPlayer.classList.add('translate-y-full');
    });

    // 3. 播放暂停按钮逻辑
    const togglePlay = (e) => {
        e.stopPropagation(); // 防止冒泡触发全屏展开
        AudioPlayer.toggle();
    };

    playBtn.addEventListener('click', togglePlay);
    fullPlayBtn.addEventListener('click', togglePlay);
});

// 监听播放器核心发出的事件来更新UI
document.addEventListener('player:state-change', () => {
    const isPlaying = AudioPlayer.isPlaying;
    const iconClass = isPlaying ? 'fa-pause' : 'fa-play';
    
    // 更新所有播放按钮的图标
    document.querySelectorAll('#play-pause-btn i, #full-play-btn i').forEach(icon => {
        icon.className = `fa-solid ${iconClass}`;
    });
});

document.addEventListener('player:play-start', (e) => {
    const song = e.detail;
    // 更新 Mini Player 信息
    document.getElementById('mini-title').innerText = song.title;
    document.getElementById('mini-artist').innerText = song.artist;
    document.getElementById('mini-cover').src = song.cover;

    // 更新 Full Player 信息
    document.getElementById('full-title').innerText = song.title;
    document.getElementById('full-artist').innerText = song.artist;
    document.getElementById('full-cover').src = song.cover;
});

document.addEventListener('player:progress', (e) => {
    const pct = e.detail.progress;
    document.getElementById('progress-bar').style.width = `${pct}%`;
    document.getElementById('full-progress-bar').style.width = `${pct}%`;
});

// 临时辅助函数：点击卡片播放（模拟）
function playDemoSong(title, artist, cover) {
    AudioPlayer.play({
        id: Math.floor(Math.random() * 100), // 随机ID
        title,
        artist,
        cover
    });
}