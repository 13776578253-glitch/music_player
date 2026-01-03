import logging

from db import db_operations

logger = logging.getLogger("basic_functions[pl]")

# 通过歌单id查询歌曲信息
async def get_playlist_songs_information(playlist_id: str | int, user_id: str | int):
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



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(get_playlist_songs_information(1, 1))
