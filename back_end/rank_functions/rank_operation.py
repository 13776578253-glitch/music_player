import json, logging

from db import db_operations

logger = logging.getLogger("rank_functions")

# 全局歌曲排行
async def get_rank_information_public(user_id: str | int):
    songs = await db_operations.Analytics.get_most_played_song()
    loved_songs = await db_operations.Analytics.user_is_loved(user_id)
    songs_data = db_operations.Analytics.if_is_loved(loved_songs, songs)

    data = {
        'songs': songs_data
    }
    logger.info(f"歌曲排行信息已提取[get_playlist_songs_information]")
    return data

# 个人歌曲排行
async def get_rank_information_users(user_id: str | int):
    songs = await db_operations.Analytics.get_user_rank(user_id)
    loved_songs = await db_operations.Analytics.user_is_loved(user_id)
    songs_data = db_operations.Analytics.if_is_loved(loved_songs, songs)

    data = {
        'songs': songs_data
    }
    logger.info(f"歌曲排行信息已提取[get_rank_information_users]")
    return data


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(get_rank_information_users(5))
