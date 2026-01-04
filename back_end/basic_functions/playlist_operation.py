import logging

from db import db_operations

logger = logging.getLogger("basic_functions[p]")

# 通过歌单id查询歌曲信息
async def get_playlist_songs_information(playlist_id, user_id):
    playlist_data = await db_operations.PlaylistTable.get_playlist_by_id(playlist_id)
    songs = await db_operations.Analytics.get_playlist_songs(playlist_id)
    loved_songs = await db_operations.Analytics.user_is_loved(user_id)
    songs_data = db_operations.Analytics.if_is_loved(loved_songs, songs)

    data = {
        'id': playlist_id,
        'title': playlist_data['name'],
        'url': playlist_data['url'],
        'songs': songs_data
    }

    logger.info(f"歌单-歌曲信息已提取[get_playlist_songs_information]")
    return data

async def post_playlist_collect_information(playlists_collect):
    user_id = playlists_collect['user_id']
    playlist_id = playlists_collect['playlist_id']
    action = playlists_collect['action']
    result = False

    if action == 'collect': result = await db_operations.UserPlaylistTable.add_user_playlist(user_id, playlist_id)
    else: result = await db_operations.UserPlaylistTable.delete_user_playlist(user_id, playlist_id)

    if result: 
        logger.info(f"用户{user_id}已收藏/取消收藏歌单{playlist_id}[get_playlist_collect_information]")
        return { "success": True, "message": "操作成功" }
    else: 
        logger.warning(f"用户{user_id}对歌单{playlist_id}操作失败[get_playlist_collect_information]")
        return { "success": False, "message": "操作失败" }
    
async def get_playlists_is_collected_information(playlist_id, user_id):
    is_collected = await db_operations.UserPlaylistTable.get_playlists_if_collected(playlist_id, user_id)
    logger.info(f"歌单收藏状态信息已提取[get_playlists_is_collected]")
    
    if is_collected: return { "is_collected": True }
    else: return { "is_collected": False }



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    playlists_collect = {"user_id": "12",
    "playlist_id": "50",
    "action": "uncollect"}
    asyncio.run(post_playlist_collect_information(playlists_collect))
