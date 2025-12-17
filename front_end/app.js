/**
 * Main Application Entry
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 初始化加载推荐歌单
    const playlists = await API.getFeaturedPlaylists();
    renderPlaylists(playlists);

    console.log("App Initialized");
});