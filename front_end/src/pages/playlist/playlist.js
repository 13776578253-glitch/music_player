
// (function() {
//     const PlaylistView = {
//         async init() {
//             //console.log("[Playlist] 初始化, ID:", params.id);
            
//             const container = document.getElementById('song-list-body');
//             const template = document.getElementById('song-row-template');
            
//             if (!container || !template) return;

//             try {
//                 // 1. 调用 API 获取由 C 库/Python 拼接好的歌单包裹
//                 // 此时 params.id 传给后端，后端在 C 库里走 AVL 树查询
//                 const data = await API.getPlaylistSongs(id); 

//                 // 2. 更新头部信息
//                 document.getElementById('pl-title').textContent = data.title || "未知歌单";
//                 document.getElementById('pl-desc').textContent = `${data.songs.length} 首歌曲 · 由内核引擎处理`;

//                 // 3. 渲染歌曲列表
//                 this.render(container, template, data.songs);
//             } catch (err) {
//                 console.error("加载详情页失败:", err);
//                 container.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-slate-500">获取歌曲列表失败</td></tr>';
//             }
//         },

//         render(container, template, songs) {
//             container.innerHTML = '';
//             const fragment = document.createDocumentFragment();

//             songs.forEach((song, index) => {
//                 const clone = template.content.cloneNode(true);
                
//                 // 填充克隆后的 DOM
//                 clone.querySelector('.index-num').textContent = index + 1;
//                 clone.querySelector('.song-name').textContent = song.title;
//                 clone.querySelector('.song-artist').textContent = song.artist;

//                 // 绑定播放事件：将整个歌曲对象传给全局播放器
//                 const row = clone.querySelector('.song-row');
//                 // row.onclick = () => {
//                 //     Player.play(song); // 这个 song 对象包含后端传来的 url
//                 // };
//                 // playlist.js 渲染逻辑部分
//                     row.onclick = async () => {
//                         try {
//                             // 1. 获取这首歌的完整详情（包含 filepath 和 url）
//                             const fullSongDetail = await API.getSongDetail(song.song_id || song.id);
                            
//                             // 2. 交给播放器播放
//                             // 注意：为了能切歌，建议把当前的 songs 列表也传进去
//                             Player.play(fullSongDetail, songs);
//                         } catch (err) {
//                             console.error("无法获取歌曲详情", err);
//                         }
//                     };

//                 fragment.appendChild(clone);
//             });

//             container.appendChild(fragment);
//             console.log("[Playlist] 列表渲染完成");
//         }
//     };

//     window.PageHandlers.playlist = (params) => PlaylistView.init(params);
// })();

(function() {
    const PlaylistView = {
        async init(params) {
            console.log("[Playlist] 初始化, 参数:", params); // 调试用
            
            const container = document.getElementById('song-list-body');
            const template = document.getElementById('song-row-template');
            
            if (!container || !template) return;

            // 显示加载状态
            container.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-500">加载中...</td></tr>';

            try {
                const playlistId = params ? params.id : 1;
                
                // 获取数据
                const data = await API.getPlaylistSongs(playlistId); 
                console.log("[Playlist] 获取到数据:", data); // 调试用

                // 更新头部信息
                const titleEl = document.getElementById('pl-title');
                // 优先使用数据里的 title，如果没有则显示默认
                if (titleEl) titleEl.textContent = data.title || "未知歌单"; 
                
                const descEl = document.getElementById('pl-desc');
                if (descEl) descEl.textContent = `${data.songs ? data.songs.length : 0} 首歌曲`;

                // 渲染列表
                if (data.songs && data.songs.length > 0) {
                    this.render(container, template, data.songs);
                } else {
                    container.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-500">歌单为空</td></tr>';
                }
                
            } catch (err) {
                console.error("歌单初始化失败:", err);
                container.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-red-400">数据加载失败</td></tr>';
            }
        },

        render(container, template, songs) {
            container.innerHTML = '';
            const fragment = document.createDocumentFragment();

            songs.forEach((song, index) => {
                const clone = template.content.cloneNode(true);
                
                // 1. 填充基本信息
                clone.querySelector('.index-num').textContent = index + 1;
                clone.querySelector('.song-name').textContent = song.title;
                
                const artistName = Array.isArray(song.artist) ? song.artist.join(' / ') : (song.artist || "未知");
                clone.querySelector('.song-artist').textContent = artistName;

                // 2. 绑定点击事件 (核心修复：点击播放当前歌曲，并传入整个列表)
                const row = clone.querySelector('.song-row');
                row.onclick = async () => {
                    console.log(`[点击] 播放: ${song.title}, ID: ${song.song_id || song.id}`);
                    
                    try {
                        // 如果 song 对象里本身就有 filepath (Mock数据通常有)，就不用再请求详情了
                        // 这里做一个兼容判断，减少 API 请求
                        let songToPlay = song;
                        
                        if (!song.filepath) {
                             // 如果列表数据太简单，没有播放地址，才去请求详情
                             songToPlay = await API.getSongDetail(song.song_id || song.id);
                        }

                        if (window.Player) {
                            // 关键：把 songToPlay (当前这首) 和 songs (整个列表) 传进去
                            // 这样 Player.js 里的链表逻辑才能生效
                            Player.play(songToPlay, songs);
                        }
                    } catch (err) {
                        console.error("播放请求失败:", err);
                    }
                };

                fragment.appendChild(clone);
            });

            container.appendChild(fragment);
        }
    };

    // 确保 PageHandlers 存在
    window.PageHandlers = window.PageHandlers || {};
    window.PageHandlers.playlist = (params) => PlaylistView.init(params);
})();