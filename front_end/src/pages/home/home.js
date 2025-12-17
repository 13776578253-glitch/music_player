
async function initHome() { 
    const container = document.getElementById('home-list');
    const template = document.getElementById('song-card-template');
 
    if (!container || !template) {
        console.warn('首页推荐列表容器/模板未找到（SPA挂载中？）');
        return;
    }

    try {
        const songs = await API.getRecommend();
        container.innerHTML = '';

        songs.forEach(song => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.song-cover').src = song.cover;
            clone.querySelector('.song-title').textContent = song.title;
            clone.querySelector('.song-artist').textContent = song.artist;
            
            clone.querySelector('.song-item').onclick = () => {
                loadPage('playlist', { id: song.id });
            };
            
            container.appendChild(clone);
        });
    } catch (error) {
        
        console.error('首页推荐数据加载失败：', error);
        
        container.innerHTML = '<div class="text-red-500 p-3">加载推荐歌曲失败，请刷新重试</div>';
    }
}

window.initHome = initHome;

if (document.readyState === 'complete' && document.getElementById('home-list')) {
    initHome();
}
