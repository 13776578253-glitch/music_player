import json, logging

from db import db_operations

logger = logging.getLogger("my_functions")

# 我喜欢歌单
async def get_playlists_information_loved(user_id):
    playlist_data = await db_operations.PlaylistTable.get_playlist_by_uid(user_id, type='loved')
    logger.info(f"歌单信息已提取[get_playlists_information_loved]")
    
    data = {
        'count': len(playlist_data),
        'playlists': playlist_data
    }
    return data

# 我的历史听歌记录
async def get_history_songs_information(user_id):
    loved_songs = await db_operations.Analytics.user_is_loved(user_id)
    songs = await db_operations.Analytics.get_user_history_play_events(user_id)
    songs_data = db_operations.Analytics.if_is_loved(loved_songs, songs)
    logger.info(f"歌曲信息已提取[get_history_songs_information]")

    data = {
        'count': len(songs_data),
        'songs': songs_data
    }
    return data

# 我创建的歌单
async def get_playlists_information_private(user_id):
    playlist_data = await db_operations.PlaylistTable.get_playlist_by_uid(user_id, type='private')
    
    data = {
        'count': len(playlist_data),
        'playlists': playlist_data
    }
    logger.info(f"歌单信息已提取[get_playlists_information_private]")
    return data

# 我收藏的歌单
async def get_playlists_information_public(user_id):
    playlist_data = await db_operations.Analytics.get_user_playlists(user_id)
    
    data = {
        'count': len(playlist_data),
        'playlists': playlist_data
    }
    logger.info(f"歌单信息已提取[get_playlists_information_public]")
    return data

# 创建歌单
async def post_create_playlist_information(input_data):
    creator = input_data['user_id']
    name = input_data['title']
    url = input_data['url']
    type = input_data['type']

    playlist_id = await db_operations.PlaylistTable.add_playlist(creator, name, type, url=url)

    data = {
        'success': True,
        'playlist': {
            "playlist_id": playlist_id, 
            "title": name, 
            "song_count": 0, 
            "cover": url
        }
    }
    logger.info(f"歌单{playlist_id}已创建post_create_playlist_information]")
    return data

# 删除歌单
async def post_delete_playlist_information(input_data):
    user_id = input_data['user_id']
    playlist_id = input_data['playlist_id']

    await db_operations.PlaylistTable.delete_playlist(playlist_id)

    data = {
        "success": True,
	    "message": "歌单成功删除",
    }
    logger.info(f"歌单{playlist_id}已创建post_create_playlist_information]")
    return data


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    input_data = {
        'user_id': '1',
        'title': '1',
        'url': '1',
        'type': 'private'
    } # post_create_playlist_information(input_data)
    input_data = {
        'user_id': '1',
        'playlist_id': '22'
    }
    asyncio.run(post_delete_playlist_information(input_data))
