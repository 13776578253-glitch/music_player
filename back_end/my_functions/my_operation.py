import json, logging

from db import db_operations

logger = logging.getLogger("my_functions")

# 我喜欢歌单
async def get_playlists_information_loved(user_id: str | int):
    playlist_data = await db_operations.PlaylistTable.get_playlist_by_uid(user_id, type='loved')
    
    data = {
        'count': len(playlist_data),
        'playlists': playlist_data
    }
    logger.info(f"歌单信息已提取[get_playlists_information_loved]")
    return data

# 我的历史听歌记录
async def get_history_songs_information(user_id: str | int):
    loved_songs = await db_operations.Analytics.user_is_loved(user_id)
    songs = await db_operations.Analytics.get_user_history_play_events(user_id)
    songs_data = db_operations.Analytics.if_is_loved(loved_songs, songs)

    data = {
        'count': len(songs_data),
        'songs': songs_data
    }
    logger.info(f"歌曲信息已提取[get_history_songs_information]")
    return data

# 我创建的歌单
async def get_playlists_information_private(user_id: str | int):
    playlist_data = await db_operations.PlaylistTable.get_playlist_by_uid(user_id, type='private')
    
    data = {
        'count': len(playlist_data),
        'playlists': playlist_data
    }
    logger.info(f"歌单信息已提取[get_playlists_information_private]")
    return data

# 我收藏的歌单
async def get_playlists_information_public(user_id: str | int):
    playlist_data = await db_operations.Analytics.get_user_playlists(user_id)
    
    data = {
        'count': len(playlist_data),
        'playlists': playlist_data
    }
    logger.info(f"歌单信息已提取[get_playlists_information_public]")
    return data


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(get_history_songs_information(5))
