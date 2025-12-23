const BASE_URL = "http://localhost:5000"; // Python 后端地址

const API = {
    // getRecommend: async () => {
    //     try {
    //         const res = await fetch(`${BASE_URL}/recommendations/daily`);
    //         if (!res.ok) throw new Error();
    //         const data = await res.json();
    //         return data.songs; 
    //     } catch (error) {
    //         console.warn("后端未响应，加载测试歌曲...");
    //         return [
    //             { 
    //                 id: 1, 
    //                 title: "test1", 
    //                 artist: ["Coding Beats"], 
    //                 album: "码农节拍",
    //                 url: "./assets/cover/test1.jpg", // 封面图
    //                 //cover: "./assets/cover/test.jpg", //测试
    //                 filepath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // MP3地址
    //                 duration: "04:12"
    //             },
    //             { 
    //                 id: 2, 
    //                 title: "test2", 
    //                 artist: ["Bug Hunter"], 
    //                 album: "Memory Leak",
    //                 url: "./assets/cover/test1.jpg", 
    //                 filepath: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    //                 duration: "03:45"
    //             }
    //         ];
    //     }
    // },

    //  热门推荐歌单 对应接口 /recommendations/popular
    getPopularPlaylists: async () => {
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/recommendations/popular`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            return data.playlists;

        } catch (error) {
            console.warn("后端未响应，加载测试歌单...");
            const mockResponse = {
                count: 4, 
                playlists: [
                    { 
                        id: 101, 
                        title: "大手子致敬", 
                        creater_id: 101,
                        type: "a",
                        url: "./assets/cover/test1.jpg",
                        collect_count: 10,
                        play_count: 10,
                        song_count: 1
                    },
                    { 
                        id: 101, 
                        title: "大手子致敬", 
                        creater_id: 101,
                        type: "a",
                        url: "./assets/cover/test1.jpg",
                        collect_count: 10,
                        play_count: 10,
                        song_count: 1
                    },
                    { 
                        id: 101, 
                        title: "大手子致敬", 
                        creater_id: 101,
                        type: "a",
                        url: "./assets/cover/test1.jpg",
                        collect_count: 10,
                        play_count: 10,
                        song_count: 1
                    }
                   
                ]
            };
            return mockResponse.playlists;
        }
    },

    //  热门推荐歌单中的歌曲列表
    getPlaylistSongs: async (id) => {
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/playlist_songs/${id}`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch (error) {
            console.warn("后端未响应，加载测试歌单歌曲...");
            return {
                id: id,
                count: 1,
                songs: [
                    { 
                        song_id: 1, 
                        title: "模拟歌曲A", 
                        artist: ["歌手A"], 
                        album: "专辑A",
                        duration: "04:30", 
                        url: "./assets/cover/test1.jpg",
                        type: "normal",
                        position: 1 
                    },    
                ]
            };
        }
    },

    //  单首歌曲详情
    getSongDetail: async (id) => {
        try {
            //后端对接
            const res = await fetch(`${BASE_URL}/songs/${id}`);
            if (!res.ok) throw new Error();
            return await res.json();
        } catch (error) {
            console.warn("后端未响应，加载预制歌曲详情...");
            return {
                id: id,
                title: "man",
                artist: ["man"],
                album: "man",
                lyricist: "",
                composer: "",
                language: "",
                genre: "",
                record_company: "",
                duration: "",
                filepath: "./assets/music/test1.mp3",   // 音乐地址
                url: "./assets/cover/test1.jpg",   // 封面图地址
                lyrics: "预制歌词第一句\n预制歌词第二句",
                is_deleted:"",  // 软删除
                created_at:""

            };
        }
    },   
};
