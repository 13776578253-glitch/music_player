/**
 * API.js
 * 专门处理与 Python 后端的通信
 * 暂时使用 Mock 数据
 */

const API = {
    // 模拟从后端获取推荐歌单
    async getFeaturedPlaylists() {
        console.log("[API] Fetching playlists from Python backend...");
        // 模拟网络延迟
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 1, title: "深夜编程", artist: "Lo-Fi Beats", cover: "https://picsum.photos/300/300?random=1" },
                    { id: 2, title: "能量爆棚", artist: "Rock & Roll", cover: "https://picsum.photos/300/300?random=2" },
                    { id: 3, title: "赛博朋克", artist: "Synthwave", cover: "https://picsum.photos/300/300?random=3" },
                    { id: 4, title: "安静阅读", artist: "Piano Solo", cover: "https://picsum.photos/300/300?random=4" },
                    { id: 5, title: "爵士心情", artist: "Jazz Trio", cover: "https://picsum.photos/300/300?random=5" },
                ]);
            }, 500);
        });
    },

    // 模拟获取歌曲流媒体链接
    async getSongUrl(songId) {
        // 将来这里 fetch('/api/song/url?id=' + songId)
        console.log(`[API] Getting URL for song ${songId}`);
        // 返回一个示例 MP3 链接
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
    }
};