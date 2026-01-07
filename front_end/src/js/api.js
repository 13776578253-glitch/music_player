    import { 
        _List_SONGS_1, 
        _List_SONGS_2_l,
        _List_SONGS_2_r,
        _List_SONGS_Commen_1,
        _List_SONGS_Commen_2,     //
        // _List_SONGS_Commen_3,     //
        // _List_SONGS_Commen_4,     //            
        list_Playlist_p_1,
        _List_SONGS_Search

    } from './mock_data.js';

    const BASE_URL = "http://localhost:8000"; // Python 后端地址

    // const dataWasher = (data) => {
    //     // 如果是数组，递归处理每一项
    //     if (Array.isArray(data)) {
    //         return data.map(item => dataWasher(item));
    //     }

    //     // 如果是对象，进行字段转换
    //     if (typeof data === 'object' && data !== null) {
    //         return {
    //             ...data,
    //             // 随机图床逻辑：如果没有 url，分配一个漂亮的随机封面
    //             url: (data.url && data.url.trim() !== "") 
    //                 ? data.url 
    //                 : `https://picsum.photos/seed/${data.id || Math.random()}/300/300`,
    //             // 如果内部有嵌套数组（比如歌单里的歌曲列表），递归清洗
    //             songs: data.songs ? dataWasher(data.songs) : data.songs,
    //             playlists: data.playlists ? dataWasher(data.playlists) : data.playlists
    //         };
    //     }
    //     return data;
    // };

    const dataWasher = (data) => {
        if (!data) return data;

        // 处理数组 (例如 songs 列表)
        if (Array.isArray(data)) {
            return data.map(item => dataWasher(item));
        }

        // 处理对象
        if (typeof data === 'object') {
            // 创建副本，避免修改原始引用
            const washed = { ...data };

            // 核心逻辑：检查 url 字段
            // 无论是歌单的 url 还是歌曲的 url，只要字段名是 url 且无效，就赋随机图
            if (washed.hasOwnProperty('url')) {
                if (!washed.url || washed.url.trim() === "" || washed.url === "未知链接") {
                    // 使用 seed 保证同一 ID 拿到同一张随机图，300x300 分辨率
                    washed.url = `https://picsum.photos/seed/${washed.id || Math.random()}/300/300`;
                }
            }

            // 递归清洗子级 (如歌单对象里的 songs 数组)
            if (washed.songs && Array.isArray(washed.songs)) {
                washed.songs = dataWasher(washed.songs);
            }
            if (washed.playlists && Array.isArray(washed.playlists)) {
                washed.playlists = dataWasher(washed.playlists);
            }

            return washed;
        }

        return data;
    };

    // 获取当前用户 UID
    const getUID = () => {
        // 优先从内存读取，其次从本地存储读取
        return window.CurrentUID || localStorage.getItem('user_id') || 'guest';
    };

    // 数据清洗器：统一处理后端不规范的字段

    // const dataWasher = (data) => {
    //     // 如果是数组，递归处理每一项
    //     if (Array.isArray(data)) {
    //         return data.map(item => dataWasher(item));
    //     }

    //     // 如果是对象，进行字段转换
    //     if (typeof data === 'object' && data !== null) {
    //         return {
    //             ...data,
    //             // 随机图床逻辑：如果没有 url，分配一个漂亮的随机封面
    //             url: (data.url && data.url.trim() !== "") 
    //                 ? data.url 
    //                 : `https://picsum.photos/seed/${data.id || Math.random()}/300/300`,
    //             // 如果内部有嵌套数组（比如歌单里的歌曲列表），递归清洗
    //             songs: data.songs ? dataWasher(data.songs) : data.songs,
    //             playlists: data.playlists ? dataWasher(data.playlists) : data.playlists
    //         };
    //     }
    //     return data;
    // };

    
    const dataWasher = (data) => {
        if (!data) return data;

        // 处理数组 (例如 songs 列表)
        if (Array.isArray(data)) {
            return data.map(item => dataWasher(item));
        }

        // 处理对象
        if (typeof data === 'object') {
            // 创建副本，避免修改原始引用
            const washed = { ...data };

            // 核心逻辑：检查 url 字段
            // 无论是歌单的 url 还是歌曲的 url，只要字段名是 url 且无效，就赋随机图
            if (washed.hasOwnProperty('url')) {
                if (!washed.url || washed.url.trim() === "" || washed.url === "未知链接") {
                    // 使用 seed 保证同一 ID 拿到同一张随机图，300x300 分辨率
                    washed.url = `https://picsum.photos/seed/${washed.id || Math.random()}/300/300`;
                }
            }

            // 递归清洗子级 (如歌单对象里的 songs 数组)
            if (washed.songs && Array.isArray(washed.songs)) {
                washed.songs = dataWasher(washed.songs);
            }
            if (washed.playlists && Array.isArray(washed.playlists)) {
                washed.playlists = dataWasher(washed.playlists);
            }

            return washed;
        }

        return data;
    };

    //管理员 凭证 MURE_ADMIN_TOKEN_2025_GLOBAL

    window.API = {
        //每日推荐歌曲集合 对应接口 //recommendation/daily/?user_id=${user_id}  //应该传回十首固定的歌曲集合
        getPopularSonglists:async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID

            try {
                //后端对接
                const res = await fetch(`${BASE_URL}/recommendation/daily?user_id=${currentId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                return data.playlists || data.songs || data ;  // 逻辑待确定

            } catch (error) {
                console.warn("后端未响应，加载测试歌曲集合...");
                return _List_SONGS_1;
            }
        },

        //热门推荐歌单 对应接口 //recommendations/popular  // 应该传回n个独立的热门歌单  //每个歌单会和独立唯一的歌曲列表对应
        getPopularPlaylists: async () => {
            try {
                //后端对接
                const res = await fetch(`${BASE_URL}/recommendation/popular`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                return dataWasher(data);
            } catch (error) {
                console.warn("后端未响应，加载测试歌单...");
                const mockResponse = list_Playlist_p_1;
                return mockResponse.playlists;
            }
        },

        // 搜索
         // @param {string} keyword 搜索关键词
         // @param {AbortSignal} signal 用于取消请求的信号
        searchSongs: async (keyword, signal) => {
            
            // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            if (!keyword || keyword.trim() === '') return [];  
            
            try {
                
                const url = new URL(`${BASE_URL}/search`);
                url.searchParams.append('q', keyword); // 添加 query 参数 ?q=xxx

                console.log(`[API] 正在搜索: ${keyword}`);

                //  发起请求
                const res = await fetch(url, { signal });
                if (!res.ok) {
                    throw new Error(`Search failed: ${res.status}`);
                }

                const data = await res.json();
                return data.songs || [];
                
            } catch (error) {
                if (error.name === 'AbortError'){
                    throw error;
                }
                
                console.error("[API] 搜索请求失败:", error);
                // return[];

                //mock 测试数据
                console.warn("后端不可用，切换至本地模拟搜索...");

                const lowerKw = keyword.toLowerCase();
                return _List_SONGS_Search.filter(s => 
                    s.title.toLowerCase().includes(lowerKw) || 
                    (s.artist && s.artist.some(a => a.toLowerCase().includes(lowerKw)))
                );
                
            }
        },

        //  我的音乐 界面
        //  我喜欢的歌单    对应接口  //my/my_songlists_1_like?user_id=${user_id}   // 返回包含歌单信息的数组
        getMyLikedPlaylist: async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID
            try {
                const res = await fetch(`${BASE_URL}/my/my_songlists_1_like?user_id=${currentId}`);
                if (!res.ok) throw new Error();
                return await res.json();
            } catch (e) {
                console.warn("[API] 获取[我喜欢的音乐]失败，使用 测试数据");
                // 模拟返回结构  // ID 11  
                // 测试
                return { count: 1, playlists: [{ playlist_id: 11, title: "我喜欢的音乐", song_count: 12 }] };
            }
        },

        //  最近播放歌单    对应接口  //my/my_songlists_1_recent?user_id=${user_id}   
        getMyRecentPlaylist: async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID
            try {
                const res = await fetch(`${BASE_URL}/my/my_songlists_1_recent?user_id=${currentId}`);
                if (!res.ok) throw new Error();
                let data = await res.json();

                if (data && data.songs) {
                    data.songs = dataWasher(data.songs); //
                }
                return data;
                
            } catch (e) {
                console.warn("[API] 获取[最近播放]失败，使用测试数据");
                // ID 12 
                // 测试
                return { count: 1, playlists: [{ playlist_id: 12, title: "最近播放", song_count: 5 }] };
            }
        },

        //  我创建的歌单 (标准歌单)   对应接口   //my/my_songlists_1?user_id=${user_id}
        getMyCreatedPlaylists: async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID
            try {
                const res = await fetch(`${BASE_URL}/my/my_songlists_1?user_id=${currentId}`);
                if (!res.ok) throw new Error();
                return await res.json();
            } catch (e) {
                console.warn("[API] 获取[我创建的歌单]失败，使用 测试数据");
                // 测试
                return list_Playlist_p_1; // 复用测试数据
            }
        },

        //  我收藏的歌单 (标准歌单)  对应接口   //my/my_songlists_2?user_id=${user_id}
        getMyCollectedPlaylists: async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID
            try {
                const res = await fetch(`${BASE_URL}/my/my_songlists_2?user_id=${currentId}`);
                if (!res.ok) throw new Error();
                return await res.json();
            } catch (e) {
                console.warn("[API] 获取[我收藏的歌单]失败，使用 测试数据");
                // 测试
                return { count: 0, playlists: [] }; // 模拟空
            }
        },


        //  歌曲详情列表   //兼容 热门歌单和标准歌单  对应接口 //songlist/  // 根据歌曲id返回对应歌曲详情
        //  注意:  传入了user_id,用于检测用户是否喜欢
        //测试 
        getPlaylistSongs : async (playlist_id) => {
            let resultData;
            const currentId = getUID(); // 拿到当前的 ID
            
            // 如果 ID 是 'recent'，直接调用最近播放接口，而不是拼凑 /songslists/recent
            if (playlist_id === 'recent') {
                return await window.API.getMyRecentPlaylist(currentId);
            }
             
            console.log(`[API] 正在请求歌单详情，ID: ${playlist_id}, 用户ID: ${currentId}`);

            try {
                //后端对接
                const res = await fetch(`${BASE_URL}/songslists/${playlist_id}?user_id=${currentId}`);
                if (!res.ok) throw new Error("Network response was not ok");
                // return await res.json();
                const rawData = await res.json();
                resultData = dataWasher(rawData);

            } catch (error) {
                //映射完整逻辑，模拟后端
                console.warn(`[API] 后端未响应，正在根据 ID ${playlist_id} 匹配测试集合...`);
                
                let songsDetail = [];
                let title = "未知歌单";
                let Test = '未知链接';     // 测试

                // 将 ID 转为字符串匹配在 home 中定义的 song_id
                switch (playlist_id.toString()) {
                    case '50':
                        songsDetail = _List_SONGS_Commen_1;
                        title = "大手子致敬";
                        break;
                    case '51':
                        songsDetail = _List_SONGS_Commen_2;
                        title = "致敬大手子";
                        break;
                    // case '52':
                    //     songsDetail = _List_SONGS_Commen_3;
                    //     title = "大手致敬子";
                    //     break;
                    // case '53':
                    //     songsDetail = _List_SONGS_Commen_4;
                    //     title = "大子致敬手";
                    //     break;
                    default:
                        songsDetail = _List_SONGS_1; // 默认兜底
                        title = "测试推荐歌单";
                }

                // //  返回一个完整的歌单对象，playlist.js 拿到后直接渲染并缓存
                // return {
                //     id: playlist_id,
                //     title: title,
                //     url: Test,    // 测试
                //     songs: songsDetail // 包含 filepath, url, artist 等所有信息
                // };

                resultData = {
                    id: playlist_id,
                    title: title,
                    songs: songsDetail
                };
            }

            // 无论数据来源是哪里，只要拿到了歌曲列表，就立刻更新全局账本
            if (resultData && resultData.songs) {
                console.log(`[API] 自动同步 ${resultData.songs.length} 首歌曲的喜欢状态到 AppState`);
                window.AppState.syncLikedStatus(resultData.songs);
            }

            return resultData;
        },   

        // 测试 (保证逻辑链完整)
        getSongDetail: async (songId) => {
            console.log(`[API] 尝试定位单曲详情: ${songId}`);
            // 简单处理：直接返回默认集合。
            // 实际逻辑中，playlist.js 会直接用上面 getPlaylistSongs 拿到的数据传给 Player
            return {
                songs: _List_SONGS_1 
            };
        },

        // 榜单 (全局)/(左侧) 对应接口  // rank/public
        getGlobalRank: async () => {
            try {
                const res = await fetch(`${BASE_URL}/rank/public`);
                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();
                return data; // 返回结构包含 { songs: [] }

            } catch (error) {
                console.warn("[API] 获取全局榜单失败，加载测试数据...");
                // 兜底返回，保持数据结构一致
                return { songs: _List_SONGS_1 }; 
            }
        },

        // 榜单 (个人)/(右侧)
        getPersonalRank: async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID
            try {
                const res = await fetch(`${BASE_URL}/rank/users/?user_id=${currentId}`);
                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();
                return data; 
            } catch (error) {
                console.warn("[API] 获取个人榜单失败，加载测试数据...");
                return { songs: _List_SONGS_1 }; 
            }
        },


        // 状态 api
        // 切换歌曲喜欢状态     // status: true (喜欢) / false (取消喜欢)    //目前逻辑  回滚  //如果与后端同步失败刷新后会无法改变红心状态
        toggleLike: async (songId, status) => {
            console.log(`[API] 提交喜欢状态变更 - ID: ${songId}, Status: ${status}`);
            // const userId = localStorage.getItem('user_id') || '123';
            const userId = getUID(); // 使用统一的获取方法

            // 构造请求体
            const requestBody = { 
                user_id: userId, 
                song_id: String(songId), 
                is_loved: status // 后端需对应接收 Boolean
            };

            try {
                // 后端对接   // POST 请求
                const res = await fetch(`${BASE_URL}/like/toggle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
                const data = await res.json();
                console.log("[API] 后端同步完成:", data);
                return data;
                // return await res.json();
                
            } catch (error) {
                console.error("[API] 后端同步失败，当前处于静默模式", error);
                
                // 返回一个格式统一的模拟成功响应
                return { 
                    success: false, 
                    error: error.message, 
                    isOfflineMode: true,
                    message: "状态已缓存在本地" 
                };    
            }
        },

        // 记录用户听歌历史  // 用于"最近播放"列表
        // recordListeningHistory: async (songId) => {
        //     const currentId = getUID();
        //     console.log(`[History] 歌曲 ${songId} 播放达标(>5s)，加入历史记录`);

        //     try {
        //         // 假设后端接口是 /my/history/add
        //         // 你需要根据你实际的后端路由修改 url
        //         await fetch(`${BASE_URL}/my/history/add`, {
        //             method: 'POST',
        //             headers: { 'Content-Type': 'application/json' },
        //             body: JSON.stringify({
        //                 user_id: currentId,
        //                 song_id: songId,
        //                 // timestamp: Date.now()
        //             })
        //         });
        //     } catch (e) {
        //         console.warn("[History] 历史记录同步失败", e);
        //     }
        // },

        // 收藏/取消收藏歌单    // status: true (收藏）, false （取消）
        toggleCollectPlaylist: async (playlist_id, status) => {
            const currentId = getUID();
            try {
                // 建议后端接口：POST /playlists/collect
                const res = await fetch(`${BASE_URL}/playlists/collect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentId,
                        playlist_id: playlist_id,
                        action: status ? 'collect' : 'uncollect'
                    })
                });
                if (!res.ok) throw new Error("操作失败");
                return await res.json();
            } catch (error) {
                console.error("[API] 收藏歌单失败:", error);
                // 模拟成功以便前端演示
                return { success: true , message: "操作成功" };
            }
        },

        // 检查用户是否已收藏该歌单
        checkPlaylistCollected: async (playlist_id) => {
            const currentId = getUID();
            try {
                const res = await fetch(`${BASE_URL}/playlists/is_collected?user_id=${currentId}&playlist_id=${playlist_id}`);
                const data = await res.json();
                return data.is_collected; // 预期返回 boolean
            } catch (e) {
                return false;
            }
        },

        // 测试功能
        // 批量从歌单删除歌曲
        batchDeleteSongs: async (playlist_id, song_ids) => {
            const currentId = getUID();
            try {
                const res = await fetch(`${BASE_URL}/playlist/songs/batch_delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentId,
                        playlist_id: playlist_id,
                        song_ids: Array.from(song_ids)  // 确保是数组
                    })
                });
                if (!res.ok) throw new Error("批量删除失败");
                return await res.json();
            } catch (error) {
                console.error("[API] batchDeleteSongs Error:", error);
                throw error; 
            }
        },

        // 批量/单独  添加歌曲到目标歌单
        batchAddSongsToPlaylist: async (playlist_id, song_ids) => {
            const currentId = getUID();
            try {
                const res = await fetch(`${BASE_URL}/playlist/songs/batch_add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentId,
                        playlist_id: playlist_id,
                        song_ids: Array.from(song_ids)
                    })
                });
                if (!res.ok) throw new Error("批量添加失败");
                return await res.json();
            } catch (error) {
                console.error("[API] batchAddSongsToPlaylist Error:", error);
                throw error; 
            }
        },

        // 创建歌单
        createPlaylist: async (title, description = "", coverUrl = "", type = "public") => {
            const currentId = getUID();
            console.log(`[API] 创建歌单: ${title}, 封面: ${coverUrl}`);

            try {
                const res = await fetch(`${BASE_URL}/my/create_playlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_id: currentId, 
                        title: title, 
                        url: coverUrl,  // 向后端发送封面链接
                        type: type
                    })
                });
                if (!res.ok) throw new Error("创建失败");
                return await res.json();
            } catch (e) {
                console.warn("[API] 后端未响应，模拟创建成功");
                // 模拟返回新建的歌单对象
                return { 
                    success: true, 
                    playlist: { 
                        playlist_id: 'new_' + Date.now(), 
                        title: title, 
                        song_count: 0,
                        url: coverUrl || 'src/assets/default_cover.jpg',
                        creater_id: currentId,
                        type: type
                    } 
                };
            }
        },

        // 删除我创建的歌单 (静默)
        deleteCreatedPlaylist: async (playlist_id) => {
            const currentId = getUID();
            try {
                fetch(`${BASE_URL}/my/delete_playlist`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: currentId, playlist_id })
                });
                return true;
            } catch (e) {
                console.warn("[API] 删除请求发送失败", e);
                return false;
            }
        },

        //  取消收藏歌单 (静默)
        uncollectPlaylist: async (playlist_id) => {
            // 复用 toggleCollectPlaylist，传入 status=false
            return window.API.toggleCollectPlaylist(playlist_id, false);
        },

        // 注册逻辑：通过 UID 获取唯一凭证 (Cookie)   // 测试逻辑
        registerByUID: async (uid, cookie) => {
            try {
                const res = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        uid: user_id, 
                        cookie: cookie
                    })
                });
                const data = await res.json();
                
                if (!res.ok) {
                    // 处理“用户已存在”或其他后端错误
                    throw new Error(data.message || "该 UID 已存在");
                }
                return data; // 预期返回 { success: true, cookie: "MF_xxxx" }
            } catch (error) {
                console.error("[API] Register Error:", error);
                throw error; 
            }
        },

        //  登录逻辑：通过 Cookie 凭证登录   //  测试逻辑
        loginByCookie: async (cookie) => {
            if (cookie === "MURE_ADMIN_TOKEN_2025_GLOBAL") {
                console.warn("[API] 检测到管理员凭证");
                return { 
                    success: true, 
                    user_id: "System_Admin", 
                    cookie: "MURE_ADMIN_TOKEN_2025_GLOBAL", // 方便存储
                    role: "admin", // 增加角色字段
                    permissions: ["all"] 
                };
            }

            try {
                const res = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cookie: cookie })
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "无效的凭证");
                
                // 登录成功，返回用户信息
                return data; // 预期返回 { success: true, user_id: "123", username: "用户123" }
            } catch (error) {
                console.error("[API] Login Error:", error);
                throw error;
            }
        },

        //用户行为统计    // 监控/日志 api   // 测试逻辑    //复杂_逻辑

        /**
         * 上报用户听歌行为
         * @param {Object} payload 数据包
         * 结构: {
         * user_id: string,
         * song_id: string,
         * duration: number,      // 歌曲总长
         * played_time: number,   // 实际播放时长(秒)
         * end_type: string,    // 'complete'(播完) | 'skip'(切歌) | 'pause'(退出) | 'play'(已播放一首)
         * // timestamp: number,
         * position：number
         * }
         */

        reportUserBehavior: async (payload) => {
            console.log(`[Analytics] 准备上报: [${payload.end_type}] 听了 ${payload.played_time.toFixed(1)}s`);

            // 过滤逻辑 (The Filter)
            // 如果实际播放时间小于 5 秒，且不是由于只有 5 秒就播完（极短歌曲），则视为无效播放
            if (payload.played_time < 5 && payload.end_type !== 'complete') {
                console.log("[Analytics] 播放时间过短，忽略");
                return;
            }

            // 离线/缓冲处理
            // 获取旧队列

            if (payload.end_type === 'play') {
                // 立即发送，不积压
                await window.API._flushAnalyticsQueue([payload]);
            } else {
                let queue = JSON.parse(localStorage.getItem('MUSE_ANALYTICS_QUEUE') || '[]');
                queue.push(payload);

                // 批量发送阈值 (例如积攒了 3 条，或者这是一次 'quit' 事件，就立即发送)
                if (queue.length >= 3 || payload.end_type === 'quit' || payload.end_type === 'complete') {
                    await window.API._flushAnalyticsQueue(queue);
                } else {
                    // 存回本地等待下一次触发
                    localStorage.setItem('MUSE_ANALYTICS_QUEUE', JSON.stringify(queue));
                }
            }
        },

        // 内部方法：清空队列并发送
        _flushAnalyticsQueue: async (queueData) => {
            if (!queueData || queueData.length === 0) return;

            const currentId = getUID();
            
            try {
                // 如果浏览器支持 sendBeacon 且页面正在卸载，使用 beacon (更可靠)
                if (navigator.sendBeacon && document.visibilityState === 'hidden') {
                    const blob = new Blob([JSON.stringify({ logs: queueData, user_id: currentId })], { type: 'application/json' });
                    navigator.sendBeacon(`${BASE_URL}/analytics/batch_report`, blob);
                } else {
                    // 正常 Fetch
                    await fetch(`${BASE_URL}/analytics/batch_report`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            user_id: currentId,
                            logs: queueData 
                        })
                    });
                }
                
                // 发送成功，清空本地存储
                console.log(`[Analytics] 成功上报 ${queueData.length} 条数据`);
                localStorage.removeItem('MUSE_ANALYTICS_QUEUE');

            } catch (e) {
                console.warn("[Analytics] 上报失败，数据保留在本地", e);
                // 失败了不清除 localStorage，下次再试
                localStorage.setItem('MUSE_ANALYTICS_QUEUE', JSON.stringify(queueData));
            }
        },

        // 用户听歌所处歌单行为逻辑 上报
        reportPlaylistPlay: async (playlistId) => {
            if (!playlistId || playlistId === 'unknown') return;

            const currentId = getUID();
            
            try {
                await fetch(`${BASE_URL}/analytics/playlist_play`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        playlist_id: playlistId,
                        user_id: currentId
                        // action: 'play_count_increment', 
                        // timestamp: Date.now()
                    })
                });
                console.log(`[Analytics] 歌单 ${playlistId} 播放量+1`);
            } catch (e) {
                console.error("[Analytics] 歌单上报失败", e);
            }
        },

    };
    
    // 全局状态缓存
    window.AppState = {
        likedSongs: new Set(), // 存储已喜欢的 song_id (String)
        
        // 初始化时，从 localStorage 加载，或在加载歌单后填充
        syncLikedStatus(songs) {
            songs.forEach(s => {
                if (s.is_liked || s.is_loved == 1) {
                    this.likedSongs.add(String(s.song_id || s.id));
                }
            });
        },

        isLiked(songId) {
            return this.likedSongs.has(String(songId));
        },

        toggleLike(songId, status) {
            if (status) this.likedSongs.add(String(songId));
            else this.likedSongs.delete(String(songId));
        },

        // localStorage.setItem('MUSE_LIKED_IDS', JSON.stringify([...this.likedSongs]))
    };

    // 记录页面访问历史
    window.AppNavigation = {
        history: [],
        push(pageId) {
            // 如果新页面和最后一个页面相同，不重复记录
            if (this.history[this.history.length - 1] === pageId) return;
            this.history.push(pageId);
            // 最多保留 10 条记录
            if (this.history.length > 10) this.history.shift();
        },
        getPrevious() {
            if (this.history.length < 2) return 'home'; // 默认回首页
            this.history.pop(); // 弹出当前页
            return this.history.pop(); // 弹出并返回上一页
        }
    };

    // window.API = API   // 测试
    window.API = window.API || {};

    window.Player = Player; // 关键：手动挂载到全局
    window.Player.init();   // 初始化