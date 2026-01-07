
// const home_page = {
//     async init(_params) {
//         //console.log("[Home] 开始初始化...");
//         const container = document.getElementById('home-list');
//         const template = document.getElementById('song-card-template');

//         this.handleBannerClick();   //

//         if (!this.validate(container, template)) return;

//         //核心！
//         try {
//             //const songs = await API.getRecommend();
//             // const Playlists = await API.getPopularPlaylists();
//             const Playlists = await API.getPopularSonglists();
//             this.render(container, template, Playlists);
//         } catch (error) {
//             this.handleError(container, error);
//         }
//     },

//     // 点击后 立即播放 事件
//     handleBannerClick() {
//         const playBtn = document.getElementById('banner-play-btn');
//         if (!playBtn) return;

//         // 解绑旧事件（防止 SPA 切换导致重复绑定）
//         playBtn.onclick = null;

//         playBtn.onclick = async () => {
//             console.log("[Home] 点击了 Banner 立即播放");
            
//             // 给个加载反馈（可选）
//             const originalText = playBtn.innerHTML;
//             playBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...`;

//             try {
//                 if (!window.API) {
//                     throw new Error("全局 API 对象尚未加载完毕");
//                 }

//                 // 调用你指定的接口获取歌曲列表
//                 const songs = await window.API.getPopularSonglists();

//                 // 检查数据有效性
//                 if (songs && songs.length > 0) {
//                     console.log(`[Home] 获取到 ${songs.length} 首歌曲，准备播放...`);
                    
//                     // 【核心】调用 Player
//                     // 参数1: 列表里的第一首歌 (作为当前播放)
//                     // 参数2: 整个列表 (用于构建链表)
//                     if (window.Player) {
//                         await Player.play(songs[0], songs);
//                     }
//                 } else {
//                     console.warn("接口返回了空列表");
//                 }
//             } catch (err) {
//                 console.error("播放失败:", err);
//             } finally {
//                 // 恢复按钮文字
//                 playBtn.innerHTML = originalText;
//             }
//         };
//     },

//     validate(container, template, data) {

//         if (!container || !template) {
//             console.warn(' — 缺少 DOM 元素 —');
//             return false;
//         }
//         return true;
//     },

//     // 核心渲染逻辑！
//     render(container, template, data) {
//         container.innerHTML = ''; 
        
//         const fragment = document.createDocumentFragment();  // 使用文档片段减少性能损耗

//         data.forEach(song => {
//             const clone = template.content.cloneNode(true);
            
//             // 数据映射
//             clone.querySelector('.pl-cover').src = song.url;
//             clone.querySelector('.pl-title').textContent = song.title;
            
//             // 事件绑定
//             clone.querySelector('.playlist-item').onclick = () => {
//                 loadPage('playlist', { id: song.id }); 
//             };
            
//             fragment.appendChild(clone);
//         });

//         container.appendChild(fragment);
//         console.log("— 渲染完成 —");
//     },

//     handleError(container, error) {
//         console.error('— 加载失败: —', error);
//         container.innerHTML = `<div class="text-red-500">内容加载失败，请检查后端服务。</div>`;
//     }
// };


// window.PageHandlers = window.PageHandlers || {};
// window.PageHandlers.home = (_params) => home_page.init(_params);

window.home_page = {
    async init(_params) {

        if (!window.API || !window.API.getPopularPlaylists) {
            setTimeout(() => this.init(_params), 50);
            return;
        }   

        this.handleBannerClick();

        console.log("[Home] 正在初始化首页歌单...");

        const container = document.getElementById('home-list');
        const template = document.getElementById('song-card-template');

        // 核心：绑定 Banner 立即播放事件
        this.handleBannerClick();

        if (!container || !template) {
            console.warn("[Home] 未找到歌单容器板");
            return;
        }

        try {
            // 获取热门歌单数据
            const data = await window.API.getPopularPlaylists();    // getPopularPlaylists
            this.render(container, template, data);
        } catch (error) {
            console.error("[Home] 渲染歌单失败:", error);
        }

    },

    handleBannerClick() {
        const playBtn = document.getElementById('banner-play-btn');
        if (!playBtn) return;

        playBtn.onclick = null;
        playBtn.onclick = async () => {
            console.log("[Home] 点击了 Banner，准备加载 10 首测试歌曲到链表...");

            if (!window.API) {
                console.error("API 尚未加载完成，请稍候...");
            return;
    }
            
            try {
                // 直接从 API 获取那 10 首存放在 _List_SONGS 里的歌曲
                const songs = await window.API.getPopularSonglists();

                if (songs && songs.length > 0) {
                    console.log(`[Kernel] 成功提取数据，正在构建双向循环链表...`);
                    
                    if (!window.Player) {
                        console.error(" 致命错误：Player 对象未定义！请检查 player.js 是否成功挂载到 window");
                        return;
                    }

                    if (window.Player) {
                        console.log(`...`);
                        // 【关键】这里将 10 首歌传入 Player.js
                        // Player 会在内部执行：this.playlist = new DoublyCircularLinkedList()
                        await window.Player.play(songs[0], songs);
                        
                        // 验证代码
                        console.log("[Check] 播放器当前歌曲:", window.Player.currentSong.title);
                        console.log("[Check] 链表长度:", window.Player.playlist.size);
                    }
                }
            } catch (err) {
                console.error("链表注入失败:", err);
            }
        };
    },

    render(container, template, data) {
        // 渲染前清空容器（除了模板本身）
        container.innerHTML = '';

        console.log("[Home] 准备渲染的数据:", data);

        data.forEach(item => {
            const clone = template.content.cloneNode(true);

            // 绑定数据 - 对应你 API 里的字段
            const img = clone.querySelector('.pl-cover');    //封面图
            const title = clone.querySelector('.pl-title');   //歌单标题

            // const playCount = clone.querySelector('.fa-play')?.parentElement;

            // 测试 ？
            const playCountSpan = clone.querySelector('.absolute.bottom-3.left-3 span');
            if (playCountSpan) {
                // 将 API 里的 play_count 填进去，覆盖掉 HTML 模板里的死数字 10
                playCountSpan.innerHTML = `<i class="fa-solid fa-play text-[10px] mr-1"></i>${item.play_count}`;
            }

            if (img) img.src = item.url;
            if (title) title.innerText = item.title;

            // // 格式化播放量显示
            // if (playCount) {
            //     const count = item.play_count >= 10000 
            //         ? (item.play_count / 10000).toFixed(1) + '万' 
            //         : item.play_count;
            //     playCount.innerHTML = `<i class="fa-solid fa-play text-[10px] mr-1"></i>${count}`;
            // }

            // 给歌单卡片添加点击事件 (后续可扩展进入歌单详情)
            const card = clone.querySelector('.group');
            if (card) {
                card.onclick = () => {
                    console.log(`[Home] 点击了歌单: ${item.title} (ID: ${item.playlist_id})`);
                    // console.log("歌单完整信息：", data);
                    loadPage('playlist', { id: item.playlist_id });
                };
            }

            container.appendChild(clone);
        });
        console.log(`[Home] 成功渲染 ${data.length} 个歌单`);
    },

};

window.PageHandlers = window.PageHandlers || {};
// window.PageHandlers.home = (_params) => home_page.init(_params);
window.PageHandlers.home = (_params) => window.home_page.init(_params);