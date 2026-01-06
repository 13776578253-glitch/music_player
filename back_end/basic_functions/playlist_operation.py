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

# 收藏/取消收藏歌单
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

# 检查歌单收藏状态
async def get_playlists_is_collected_information(playlist_id, user_id):
    is_collected = await db_operations.UserPlaylistTable.get_playlists_if_collected(playlist_id, user_id)
    logger.info(f"歌单收藏状态信息已提取[get_playlists_is_collected]")
    
    if is_collected: return { "is_collected": True }
    else: return { "is_collected": False }

# 批量/单独添加歌曲到歌单
async def post_ps_batch_add_information(input_data):
    user_id = input_data['user_id']
    playlist_id = input_data['playlist_id']
    song_ids = input_data['song_ids']

    exist = await db_operations.UserPlaylistTable.exists(user_id, playlist_id)
    if not exist:
        logger.warning(f"用户{user_id}与歌单{playlist_id}不存在关系")
        return {"success": False, "message": f"添加 {len(song_ids)} 首歌曲失败", "added_count": len(song_ids)}

    for song_id in song_ids:
        await db_operations.PlaylistSongTable.add_song_to_playlist(playlist_id, song_id)

    logger.info(f"用户{user_id}已将歌曲{song_ids}加入歌单{playlist_id}")
    return {"success": True, "message": f"成功添加 {len(song_ids)} 首歌曲", "added_count": len(song_ids)}

# 批量从歌单删除歌曲
async def post_ps_batch_delate_information(input_data):
    user_id = input_data['user_id']
    playlist_id = input_data['playlist_id']
    song_ids = input_data['song_ids']
    
    exist = await db_operations.UserPlaylistTable.exists(user_id, playlist_id)
    if not exist:
        logger.warning(f"用户{user_id}与歌单{playlist_id}不存在关系")
        return {"success": False, "message": f"删除 {len(song_ids)} 首歌曲失败", "delated_count": len(song_ids)}
    
    for song_id in song_ids:
        await db_operations.PlaylistSongTable.remove_song_from_playlist(playlist_id, song_id)

    logger.info(f"用户{user_id}已将歌曲{song_ids}从歌单{playlist_id}移除")
    return {"success": True, "message": f"成功删除 {len(song_ids)} 首歌曲", "delated_count": len(song_ids)}

# 歌单播放量统计
async def post_analytics_playlist_play_information(input_data):
    user_id = input_data['playlist_id']
    playlist_id = input_data['playlist_id']

    result = await db_operations.PlaylistTable.update_playlist_count(playlist_id)

    logger.info(f"歌单{playlist_id}播放量已增加")
    if result: return {"success": True, "message": "歌单统计更新成功"}
    else: return {"success": False, "message": "歌单统计更新失败"}



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    playlists_collect = {"user_id": "2",
    "playlist_id": "22",
    "action": "collect"} # post_playlist_collect_information(playlists_collect)
    input_data = {
        'user_id': '1',
        'target_playlist_id': '22',
        'song_ids': ['4']
    } # post_ps_batch_add_information(input_data)
    asyncio.run(post_ps_batch_add_information(input_data))
