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
    //热门推荐歌曲集合 对应接口 //recommendations/daily/?user_id=${user_id}  //应该传回十首固定的歌曲集合
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

    //  歌曲详情列表   //兼容 热门歌单和标准歌单
    getPlaylistSongs : async (id) => {

        console.log(`[API] 正在请求歌单详情，ID: ${id}`);
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/songslists/${id}`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch (error) {
            //映射完整逻辑，模拟后端
            console.warn(`[API] 后端未响应，正在根据 ID ${id} 匹配本地 mock 集合...`);
            
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

};

// window.API = API   // 测试
window.API = window.API || {};

window.Player = Player; // 关键：手动挂载到全局
window.Player.init();   // 然后再初始化