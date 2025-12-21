const BASE_URL = "http://localhost:5000"; // Python 后端地址

const API = {
    // 模拟：获取首页推荐
    getRecommend: async () => {
        // 真实代码: const res = await fetch(`${BASE_URL}/recommend`); return await res.json();
        
        // 模拟数据
        return [
            { id: 1, title: "Python学习伴侣", artist: "Coding Beats", cover: "https://picsum.photos/200?1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { id: 2, title: "深夜调试", artist: "Bug Hunter", cover: "https://picsum.photos/200?2", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            // { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            // { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            // { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            // { id: 3, title: "提交成功", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
            // { id: 5, title: "wzm", artist: "Git Push", cover: "https://picsum.photos/200?3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
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
                //
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
    },

    /**
     * 获取歌单歌曲列表 (用于排行榜、普通歌单)
     * @param {string|number} id 歌单ID
     */

    async getPlaylistSongs(id) {
        try {
            // 真实环境：const response = await fetch(`${this.BASE_URL}/playlist_songs/${id}`);
            //const response = await fetch(`/playlist_songs/${id}`);
            if (!response.ok) throw new Error('网络请求失败');
            return await response.json();
        } catch (error) {
            console.warn("使用模拟排行榜数据...");
            return this.getMockRankData(id);
        }
    },

    // 测试使用
    getMockRankData(id) {
        return {
            "id": id,
            "count": 20,
            "songs": Array.from({ length: 20 }, (_, i) => ({
                "song_id": `mock_s_${i}`,
                "title": `模拟歌曲 ${i + 1}`,
                "artist": ["歌手A", "歌手B"],
                "album": "测试专辑",
                "duration": "04:20",
                "url": `https://picsum.photos/200?random=${i}`, // 随机图片
                "type": i < 10 ? "normal" : "loved",
                "position": i + 1
            }))
        };
    },

    /**
 * src/js/api.js 补充
 */

    // ... 之前的 getPlaylistSongs ...

    /**
     * 获取单首歌曲的详细播放信息
     * 接口说明：/song_detail/:id GET
     */
    async getSongDetail(songId) {
        try {
            const response = await fetch(`/song_detail/${songId}`);
            if (!response.ok) throw new Error('获取歌曲失败');
            return await response.json(); 
            /* 约定返回格式示例：
            {
                "song_id": "1",
                "title": "歌曲名",
                "artist": ["歌手"],
                "url": "封面地址",
                "filepath": "mp3真实地址",
                "lyrics": "[00:00.00]歌词..."
            }
            */
        } catch (error) {
            console.error("API Error:", error);
            // 模拟返回
            return {
                "song_id": songId,
                "title": "模拟播放歌曲",
                "artist": ["测试歌手"],
                "url": "https://picsum.photos/400",
                "filepath": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                "lyrics": "[00:00.00]第一句歌词\n[00:04.00]第二句歌词"
            };
        }
    }
};
