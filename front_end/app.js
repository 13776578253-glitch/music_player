
document.addEventListener('DOMContentLoaded', async () => {
    const playlists = await API.getFeaturedPlaylists();
    renderPlaylists(playlists);

    console.log("App Initialized");
});