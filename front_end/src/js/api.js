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
        ];
    }
};