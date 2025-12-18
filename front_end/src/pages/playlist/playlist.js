
(function() {
    const PlaylistView = {
        async init(params) {
            //console.log("[Playlist] 初始化, ID:", params.id);
            const container = document.getElementById('song-list-body');
            const template = document.getElementById('song-row-template');
            
            if (!container || !template) return;

            try {
                // 1. 调用 API 获取由 C 库/Python 拼接好的歌单包裹
                // 此时 params.id 传给后端，后端在 C 库里走 AVL 树查询
                const data = await API.getPlaylistDetail(params.id); 

                // 2. 更新头部信息
                document.getElementById('pl-title').textContent = data.title || "未知歌单";
                document.getElementById('pl-desc').textContent = `${data.songs.length} 首歌曲 · 由内核引擎处理`;

                // 3. 渲染歌曲列表
                this.render(container, template, data.songs);
            } catch (err) {
                console.error("加载详情页失败:", err);
                container.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-slate-500">获取歌曲列表失败</td></tr>';
            }
        },

        render(container, template, songs) {
            container.innerHTML = '';
            const fragment = document.createDocumentFragment();

            songs.forEach((song, index) => {
                const clone = template.content.cloneNode(true);
                
                // 填充克隆后的 DOM
                clone.querySelector('.index-num').textContent = index + 1;
                clone.querySelector('.song-name').textContent = song.title;
                clone.querySelector('.song-artist').textContent = song.artist;

                // 绑定播放事件：将整个歌曲对象传给全局播放器
                const row = clone.querySelector('.song-row');
                row.onclick = () => {
                    Player.play(song); // 这个 song 对象包含后端传来的 url
                };

                fragment.appendChild(clone);
            });

            container.appendChild(fragment);
            console.log("[Playlist] 列表渲染完成");
        }
    };

    window.PageHandlers.playlist = (params) => PlaylistView.init(params);
})();