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

window.API = {
    //每日推荐歌曲集合 对应接口 //recommendations/daily/?user_id=${user_id}  //应该传回十首固定的歌曲集合
    getPopularSonglists:async (user_id) => {
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/recommendations/daily?user_id=${user_id}`);
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
        try {
            const res = await fetch(`${BASE_URL}/my/my_songlists_1_like?user_id=${user_id}`);
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
        try {
            const res = await fetch(`${BASE_URL}/my/my_songlists_1_recent?user_id=${user_id}`);
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
        try {
            const res = await fetch(`${BASE_URL}/my/my_songlists_1?user_id=${user_id}`);
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
        try {
            const res = await fetch(`${BASE_URL}/my/my_songlists_2?user_id=${user_id}`);
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

    getPlaylistSongs : async (id, user_id) => {

        console.log(`[API] 正在请求歌单详情，ID: ${id}, 用户ID: ${user_id}`);
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/songslists/${id}?user_id=${user_id}`);
            if (!res.ok) throw new Error("Network response was not ok");
            return await res.json();
        } catch (error) {
            //映射完整逻辑，模拟后端
            console.warn(`[API] 后端未响应，正在根据 ID ${id} 匹配测试集合...`);
            
            let songsDetail = [];
            let title = "未知歌单";

            // 将 ID 转为字符串匹配在 home 中定义的 song_id
            switch (id.toString()) {
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

            //  返回一个完整的歌单对象，playlist.js 拿到后直接渲染并缓存
            return {
                id: id,
                title: title,
                songs: songsDetail // 包含 filepath, url, artist 等所有信息
            };
        }
    },   

    // 测试 (保证逻辑链完整)
    getSongDetail: async (songId) => {
        console.log(`[API] 尝试定位单曲详情: ${songId}`);
        // 这里简单处理：直接返回默认集合。
        // 在实际逻辑中，playlist.js 会直接用上面 getPlaylistSongs 拿到的数据传给 Player
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
        try {
            const res = await fetch(`${BASE_URL}/rank/?user_id=${user_id}`);
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();
            return data; 
        } catch (error) {
            console.warn("[API] 获取个人榜单失败，加载测试数据...");
            return { songs: _List_SONGS_1 }; 
        }
    },








};

// window.API = API   // 测试
window.API = window.API || {};

window.Player = Player; // 关键：手动挂载到全局
window.Player.init();   // 然后再初始化