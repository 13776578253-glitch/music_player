import logging

from db import db_operations

logger = logging.getLogger("basic_functions[so]")

# 歌曲点赞/取消点赞
async def post_like_toggle_information(input_data):
    user_id = input_data['user_id']
    song_id = input_data['song_id']
    is_loved = input_data['is_loved']

    exist = await db_operations.SongTable.exists(song_id)
    if not exist:
        logger.warning(f"歌曲{song_id}不存在")
        return {"success": False, "message": "操作失败"}

    playlist_data = await db_operations.PlaylistTable.get_playlist_by_uid(user_id, type='loved')
    playlist_id = playlist_data['playlist_id']

    if is_loved:
        await db_operations.PlaylistSongTable.add_song_to_playlist(playlist_id, song_id)
        logger.info(f"{user_id}歌曲{song_id}已喜欢")
        return {"success": True, "message": "操作成功"}
    else:
        await db_operations.PlaylistSongTable.remove_song_from_playlist(playlist_id, song_id)
        logger.info(f"{user_id}歌曲{song_id}取消喜欢")
        return {"success": False, "message": "操作失败"}

# 批量上报用户播放行为
async def post_analytics_batch_report_information(input_data):
    user_id = input_data['user_id']
    logs = input_data['logs']
    results = []

    for log in logs:
        song_id = log['song_id']
        duration = log['played_time']
        event_type = log['end_type']
        position = log['position']
        song_duration = log['duration']

        result = await db_operations.PlayEventTable.add_play_event(user_id, song_id, event_type, position, duration, if_play_count=False)
        result.append(result)

    fall_value = [idx for idx, elem in enumerate(results) if elem is False or elem is None]
    if fall_value != []:
        logger.warning(f"第{fall_value}个播放行为保存失败，共{len(fall_value)}个")
    if len(fall_value) == len(logs):
        logger.error("用户播放行为上报失败")
        return {"success": False, "message": "成功处理0条日志数据"}

    logger.info(f"用户播放行为已上报")
    return {"success": True, "message": f"成功处理{len(logs) - len(fall_value)}条日志数据"}



