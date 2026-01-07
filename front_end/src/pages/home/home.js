const home_page = {
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
            const playlists = await window.API.getPopularPlaylists();    // getPopularPlaylists
            this.render(container, template, playlists);
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
                    loadPage('playlist', { id: item.playlist_id });
                };
            }

            container.appendChild(clone);
        });
        console.log(`[Home] 成功渲染 ${data.length} 个歌单`);
    },

};

window.PageHandlers = window.PageHandlers || {};
window.PageHandlers.home = (_params) => home_page.init(_params);