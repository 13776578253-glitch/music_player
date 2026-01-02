    import { 
        _List_SONGS_1, 
        _List_SONGS_2_l,
        _List_SONGS_2_r,
        _List_SONGS_Commen_1,
        _List_SONGS_Commen_2,     //
        // _List_SONGS_Commen_3,     //
        // _List_SONGS_Commen_4,     //            
        list_Playlist_p_1

    } from './mock_data.js';

    const BASE_URL = "http://localhost:5000"; // Python 后端地址
    // 获取当前用户 UID
    const getUID = () => {
        // 优先从内存读取，其次从本地存储读取
        return window.CurrentUID || localStorage.getItem('user_id') || 'guest';
    };

    //管理员 凭证 MURE_ADMIN_TOKEN_2025_GLOBAL

    window.API = {
        //每日推荐歌曲集合 对应接口 //recommendations/daily/?user_id=${user_id}  //应该传回十首固定的歌曲集合
        getPopularSonglists:async (user_id) => {
            const currentId = getUID(); // 拿到当前的 ID

            try {
                //后端对接
                const res = await fetch(`${BASE_URL}/recommendations/daily?user_id=${currentId}`);
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
                const res = await fetch(`${BASE_URL}/recommendations/popular`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                return data.playlists;

            } catch (error) {
                console.warn("后端未响应，加载测试歌单...");
                const mockResponse = list_Playlist_p_1;
                return mockResponse.playlists;
            }
        },

        // //标准歌单   //每个歌单会和独立唯一的歌曲列表对应
        // getPlaylistSongs: async (id) => {
        //     try {
        //         //后端对接
        //         const res = await fetch(`${BASE_URL}/playlist_songs/${playlists_id}`);
        //         if (!res.ok) throw new Error();
        //         return await res.json();
        //     } catch (error) {
        //         console.warn("后端未响应，加载测试歌单歌曲...");
        //         return //
        //             
        // },

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
                return await res.json();
            } catch (e) {
                console.warn("[API] 获取[最近播放]失败，使用 测试数据");
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
        //  注意:  传入了user_id,用于检测用户是否喜欢，待实现逻辑

        //  const userId = localStorage.getItem('user_id') || '123'; // 示例获取方式
        //  API.getPlaylistSongs(9, userId);


        // 保留- 原先逻辑存档
        // getPlaylistSongs : async (id, user_id) => {

        //     console.log(`[API] 正在请求歌单详情，ID: ${id}, 用户ID: ${user_id}`);
        //     try {
        //         //后端对接
        //         const res = await fetch(`${BASE_URL}/songslists/${id}?user_id=${user_id}`);
        //         if (!res.ok) throw new Error("Network response was not ok");
        //         return await res.json();
        //     } catch (error) {
        //         //映射完整逻辑，模拟后端
        //         console.warn(`[API] 后端未响应，正在根据 ID ${id} 匹配测试集合...`);
                
        //         let songsDetail = [];
        //         let title = "未知歌单";

        //         // 将 ID 转为字符串匹配在 home 中定义的 song_id
        //         switch (id.toString()) {
        //             case '50':
        //                 songsDetail = _List_SONGS_Commen_1;
        //                 title = "大手子致敬";
        //                 break;
        //             case '51':
        //                 songsDetail = _List_SONGS_Commen_2;
        //                 title = "致敬大手子";
        //                 break;
        //             // case '52':
        //             //     songsDetail = _List_SONGS_Commen_3;
        //             //     title = "大手致敬子";
        //             //     break;
        //             // case '53':
        //             //     songsDetail = _List_SONGS_Commen_4;
        //             //     title = "大子致敬手";
        //             //     break;
        //             default:
        //                 songsDetail = _List_SONGS_1; // 默认兜底
        //                 title = "测试推荐歌单";
        //         }

        //         //  返回一个完整的歌单对象，playlist.js 拿到后直接渲染并缓存
        //         return {
        //             id: id,
        //             title: title,
        //             songs: songsDetail // 包含 filepath, url, artist 等所有信息
        //         };
        //     }
        // },   

        //测试 
        getPlaylistSongs : async (playlist_id) => {
            let resultData;
            const currentId = getUID(); // 拿到当前的 ID
             console.log(`[API] 正在请求歌单详情，ID: ${playlist_id}, 用户ID: ${currentId}`);

            try {
                //后端对接
                const res = await fetch(`${BASE_URL}/songslists/${playlist_id}?user_id=${currentId}`);
                if (!res.ok) throw new Error("Network response was not ok");
                return await res.json();
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

            // --- 【关键修改点】 ---
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
                const res = await fetch(`${BASE_URL}/rank/?user_id=${currentId}`);
                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();
                return data; 
            } catch (error) {
                console.warn("[API] 获取个人榜单失败，加载测试数据...");
                return { songs: _List_SONGS_1 }; 
            }
        },


        // 状态 api
        //  切换歌曲喜欢状态     // status: true (喜欢) / false (取消喜欢)    //目前逻辑  完全静默，无回滚  //如果与后端同步失败刷新后会无法改变红心状态
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
                return { success: true };
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

        // 注册逻辑：通过 UID 获取唯一凭证 (Cookie)   // 测试逻辑
        registerByUID: async (uid) => {
            try {
                const res = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: uid })
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
                console.warn("[API] 检测到管理员凭证，开启超级权限模式");
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



























    };


    // 全局状态缓存   持久化存储
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

    // window.API = API   // 测试
    window.API = window.API || {};

    window.Player = Player; // 关键：手动挂载到全局
    window.Player.init();   // 初始化