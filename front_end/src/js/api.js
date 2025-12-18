const API_BASE = "http://localhost:5000"; // Python 后端地址

const API = {
    // 模拟：获取首页推荐
    getRecommend: async () => {
        // 真实代码: const res = await fetch(`${API_BASE}/recommend`); return await res.json();
        
        // 模拟数据
        return [
            { id: 1, title: "Python学习伴侣", artist: "Coding Beats", cover: "https://picsum.photos/200?1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { id: 2, title: "深夜调试", artist: "Bug Hunter", cover: "https://picsum.photos/200?2", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
        ];
    },

    getSongDetail: async (songId) => {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 200));

        // 预制数据用于测试
        const mockSongs = {
            "1": {
                id: "1",
                title: "AVL Tree Rotation",
                artist: "C-Master",
                album: "The Algorithm",
                playlistName: "算法进阶指南",
                cover: "https://picsum.photos/400/400?1",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                lyrics: "正在通过 AVL 树检索数据...\n左旋处理中...\n右旋处理中...\n平衡因子已恢复正常。\n数据结构大作业万岁！",
                playCount: 999
            },
            "2": {
                id: "2",
                title: "Link List Blues",
                artist: "Pointer Hunter",
                album: "Memory Leak",
                playlistName: "深夜调试BGM",
                cover: "https://picsum.photos/400/400?2",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                lyrics: "寻找头结点...\n遍历每一个元素...\n不要丢失你的 next 指针。\n小心野指针的陷阱。",
                playCount: 450
            }
        };
        return mockSongs[songId] || mockSongs["1"];
    }
};

// async function handlePlay(songId) {
//     // 1. 从 API 获取数据（这就是你 api.js 里的 mockSongs 数据）
//     const songData = await API.getSongDetail(songId);
    
//     if (songData) {
//         // 2. 调用 Player 的播放入口
//         // 这一步执行后，Player.js 里的 syncUI() 就会被触发
//         // 从而把 songData 里的 title, artist, lyrics 等填充到 HTML 中
//         Player.play(songData); 
//     }
// }