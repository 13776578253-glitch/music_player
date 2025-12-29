
// 完整测试集

// 测试用歌曲集合_  //用于日常推荐
export const _List_SONGS_1 = [
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
            duration: "3:43",  //时长
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
            duration: "3:38",  //时长
            filepath: "./assets/music/daily/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test2.jpg",   // 封面图地址
            lyrics: "第一句\n第二句",  //歌词
            is_deleted:"",  
            created_at:""
        }, 
];

// 测试用歌曲集合_  //用于排序(rank)(全局(public))
export const _List_SONGS_2_l = [
        {
            id: "107",
            song_id: "107",  //兼容字段 //测试
            title: "1",
            artist: ["wzm"],
            album: "wzm",  //专辑
            lyricist: "wzm",  //作词
            composer: "wzm",  //作曲
            language: "wzm",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "4:00",  //时长
            filepath: "./assets/music/rank/public/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test3.jpg",   // 封面图地址
            lyrics: "第一句动次打次\n歌词第二句动词",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "108",
            song_id: "108", //兼容字段 //测试
            title: "2",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "2:03",  //时长
            filepath: "./assets/music/rank/public/test3.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test4.jpg",   // 封面图地址
            lyrics: "第一句大词动词\n第二句大词",  //歌词
            is_deleted:"",  
            created_at:""
        }
    
];

// 测试用歌曲集合_  //用于排序(rank)(用户(users))
export const _List_SONGS_2_r = [
        {
            id: "109",
            song_id: "109",  //兼容字段 //测试
            title: "1",
            artist: ["woman"],
            album: "women",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "4:00",  //时长
            filepath: "./assets/music/rank/users/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test5.jpg",   // 封面图地址
            lyrics: "歌\n词",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "110",
            song_id: "110", //兼容字段 //测试
            title: "2",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "2:03",  //时长
            filepath: "./assets/music/rank/users/test3.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test1.jpg",   // 封面图地址
            lyrics: "manba\nout",  //歌词
            is_deleted:"",  
            created_at:""
        },

];

// 测试用歌曲集合_  //用于热门歌单推荐
export const _List_SONGS_Commen_1 = [
       {
            id: "111",
            song_id: "111",  //兼容字段 //测试
            title: "wzm",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:43",  //时长
            filepath: "./assets/music/popular/test1.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test1.jpg",   // 封面图地址
            lyrics: "歌词第一句\n歌词第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "112",
            song_id: "112", //兼容字段 //测试
            title: "wzm！！",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:38",  //时长
            filepath: "./assets/music/popular/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test2.jpg",   // 封面图地址
            lyrics: "第一句\n第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },     
];

// 测试用歌曲集合_  //用于热门歌单
export const _List_SONGS_Commen_2 = [
       {
            id: "201",
            song_id: "201",  //兼容字段 //测试
            title: "wys",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:43",  //时长
            filepath: "./assets/music/daily/test1.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test1.jpg",   // 封面图地址
            lyrics: "歌词第一句\n歌词第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "202",
            song_id: "202", //兼容字段 //测试
            title: "wys！！",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:38",  //时长
            filepath: "./assets/music/daily/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test2.jpg",   // 封面图地址
            lyrics: "第一句\n第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },     
];

// 测试用歌曲集合_  //用于标准歌单
export const _List_SONGS_Commen_5 = [
       {
            id: "201",
            song_id: "201",  //兼容字段 //测试
            title: "wys",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:43",  //时长
            filepath: "./assets/music/daily/test1.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test1.jpg",   // 封面图地址
            lyrics: "歌词第一句\n歌词第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "202",
            song_id: "202", //兼容字段 //测试
            title: "wys！！",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:38",  //时长
            filepath: "./assets/music/daily/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test2.jpg",   // 封面图地址
            lyrics: "第一句\n第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },     
];

// 测试用歌曲集合_  //用于标准歌单
export const _List_SONGS_Commen_6 = [
       {
            id: "201",
            song_id: "201",  //兼容字段 //测试
            title: "wys",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:43",  //时长
            filepath: "./assets/music/daily/test1.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test1.jpg",   // 封面图地址
            lyrics: "歌词第一句\n歌词第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },
        {
            id: "202",
            song_id: "202", //兼容字段 //测试
            title: "wys！！",
            artist: ["man"],
            album: "man",  //专辑
            lyricist: "",  //作词
            composer: "",  //作曲
            language: "",  //语言
            genre: "",  //流派
            record_company: "",  //唱片公司
            duration: "3:38",  //时长
            filepath: "./assets/music/daily/test2.mp3",   // 音乐地址
            url: "./assets/cover/cover_song/test2.jpg",   // 封面图地址
            lyrics: "第一句\n第二句",  //歌词
            is_deleted:"",  
            created_at:""
        },     
];


// 热门推荐歌单  //独立歌单集合
export const list_Playlist_p_1 = {
        id: 1,
        count: 4, 
        playlists: [
        { 
            song_id: 50, 
            title: "大手子致敬", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test1.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        },
        { 
            song_id: 51, 
            title: "致敬大手子", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test2.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        },
        { 
            song_id: 52, 
            title: "大手致敬子", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test3.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        },
        { 
            song_id: 53, 
            title: "大子致敬手", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test4.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        }
    ]

};

// 标准歌单  //独立歌单集合
export const list_Playlist_c_1 = {
        id: 1,
        count: 4, 
        playlists: [
        { 
            song_id: 50, 
            title: "大手子致敬", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test1.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        },
        { 
            song_id: 51, 
            title: "致敬大手子", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test2.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        },
        { 
            song_id: 52, 
            title: "大手致敬子", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test3.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        },
        { 
            song_id: 53, 
            title: "大子致敬手", 
            creater_id: 10,
            type: "a",
            url: "./assets/cover/cover_playlist/test4.jpg",
            collect_count: 10,
            play_count: 10,
            song_count: 1
        }
    ]

};