const BASE_URL = "http://localhost:5000"; // Python 后端地址

window.API = {

    // 测试用歌曲集合_  //用于日常推荐/排序/搜索
    _List_SONGS: [
       {
            id: "101",
            song_id: "101",  //兼容字段 //测试
            title: "1",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "",  //时长
            filepath: "./assets/music/daily/test1.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test1.jpg",   // 封面图地址
            lyrics: "歌词第一句\n歌词第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "102",
            song_id: "102", //兼容字段 //测试
            title: "2",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "",  //时长
            filepath: "./assets/music/daily/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test2.jpg",   // 封面图地址
            lyrics: "第一句\n第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },     
    ],

    // 测试用歌单详情歌曲集合_   //用于热门/标准歌单内详情歌曲对接
    // _Play_List_SONGS: [
    //     {
    //         id: id,
    //         title: "man",
    //         artist: ["man"],
    //         album: "man",
    //         lyricist: "",
    //         composer: "",
    //         language: "",
    //         genre: "",
    //         record_company: "",
    //         duration: "",
    //         filepath: "./assets/music/test1.mp3",   // 音乐地址
    //         url: "./assets/cover/test1.jpg",   // 封面图地址
    //         lyrics: "预制歌词第一句\n预制歌词第二句",
    //         is_deleted:"",  // 软删除
    //         created_at:""
    //     },
    //     {
    //         id: id,
    //         title: "man",
    //         artist: ["man"],
    //         album: "man",
    //         lyricist: "",
    //         composer: "",
    //         language: "",
    //         genre: "",
    //         record_company: "",
    //         duration: "",
    //         filepath: "./assets/music/test1.mp3",   // 音乐地址
    //         url: "./assets/cover/test1.jpg",   // 封面图地址
    //         lyrics: "预制歌词第一句\n预制歌词第二句",
    //         is_deleted:"",  // 软删除
    //         created_at:""
    //     },
    //     {
    //         id: id,
    //         title: "man",
    //         artist: ["man"],
    //         album: "man",
    //         lyricist: "",
    //         composer: "",
    //         language: "",
    //         genre: "",
    //         record_company: "",
    //         duration: "",
    //         filepath: "./assets/music/test1.mp3",   // 音乐地址
    //         url: "./assets/cover/test1.jpg",   // 封面图地址
    //         lyrics: "预制歌词第一句\n预制歌词第二句",
    //         is_deleted:"",  // 软删除
    //         created_at:""
    //     },  
    // ],

    //热门推荐歌曲集合 对应接口 //recommendations/daily  //应该传回十首固定的歌曲集合
    getPopularSonglists:async () => {
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/recommendations/daily`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data.playlists || data.songs || this._List_SONGS;  // 逻辑待确定

        } catch (error) {
            console.warn("后端未响应，加载测试歌单...");
            return this.API._List_SONGS;
        }
    },

    // //热门推荐歌单 对应接口 //recommendations/popular  // 应该传回四个独立的热门歌单  //每个歌单会和独立唯一的歌曲列表对应
    // getPopularPlaylists: async () => {
    //     try {
    //         //后端对接
    //         const res = await fetch(`${BASE_URL}/recommendations/popular`);
    //         if (!res.ok) throw new Error();
    //         const data = await res.json();
    //         return data.playlists;

    //     } catch (error) {
    //         console.warn("后端未响应，加载测试歌单...");
    //         const mockResponse = {
    //             id: id,
    //             count: 4, 
    //             //独立歌单集合
    //             playlists: [
    //                 { 
    //                     song_id: 101, 
    //                     title: "大手子致敬", 
    //                     creater_id: 101,
    //                     type: "a",
    //                     url: "./assets/cover/test1.jpg",
    //                     collect_count: 10,
    //                     play_count: 10,
    //                     song_count: 1
    //                 },
    //                 { 
    //                     song_id: 101, 
    //                     title: "致敬大手子", 
    //                     creater_id: 102,
    //                     type: "a",
    //                     url: "./assets/cover/test1.jpg",
    //                     collect_count: 10,
    //                     play_count: 10,
    //                     song_count: 1
    //                 },
    //                 { 
    //                     song_id: 101, 
    //                     title: "大手致敬子", 
    //                     creater_id: 103,
    //                     type: "a",
    //                     url: "./assets/cover/test1.jpg",
    //                     collect_count: 10,
    //                     play_count: 10,
    //                     song_count: 1
    //                 },
    //                 { 
    //                     song_id: 101, 
    //                     title: "大子致敬手", 
    //                     creater_id: 104,
    //                     type: "a",
    //                     url: "./assets/cover/test1.jpg",
    //                     collect_count: 10,
    //                     play_count: 10,
    //                     song_count: 1
    //                 }
    //             ]
    //         };
    //         return mockResponse.playlists;
    //     }
    // },

    // //标准歌单   //每个歌单会和独立唯一的歌曲列表对应
    // getPlaylistSongs: async (id) => {
    //     try {
    //         //后端对接
    //         const res = await fetch(`${BASE_URL}/playlist_songs/${playlists_id}`);
    //         if (!res.ok) throw new Error();
    //         return await res.json();
    //     } catch (error) {
    //         console.warn("后端未响应，加载测试歌单歌曲...");
    //         return {
    //             id: id,
    //             count: 3,
    //             songs: [
    //                 { 
    //                     song_id: 1, 
    //                     title: "wzmA", 
    //                     artist: ["歌手A"], 
    //                     album: "专辑A",
    //                     duration: "04:30", 
    //                     url: "./assets/cover/test1.jpg",
    //                     type: "normal",
    //                     position: 1 
    //                 },   
    //                 { 
    //                     song_id: 2, 
    //                     title: "wznnnB", 
    //                     artist: ["歌手A"], 
    //                     album: "专辑A",
    //                     duration: "04:30", 
    //                     url: "./assets/cover/test1.jpg",
    //                     type: "normal",
    //                     position: 1 
    //                 },
    //                 { 
    //                     song_id: 3, 
    //                     title: "3253c", 
    //                     artist: ["歌手A"], 
    //                     album: "专辑A",
    //                     duration: "04:30", 
    //                     url: "./assets/cover/test1.jpg",
    //                     type: "normal",
    //                     position: 1 
    //                 },   
    //             ]
    //         };
    //     }
    // },

    // //  歌曲详情列表   
    // getSongDetail: async (id) => {
    //     try {
    //         //后端对接
    //         const res = await fetch(`${BASE_URL}/songslists/${id}`);
    //         if (!res.ok) throw new Error();
    //         return await res.json();
    //     } catch (error) {
    //         console.warn("后端未响应，加载预制歌曲详情...");
    //         return {
    //             songs: [
                    
    //             ]
                

    //         };
    //     }
    // },   
};

window.Player = Player; // 关键：手动挂载到全局
window.Player.init();   // 然后再初始化