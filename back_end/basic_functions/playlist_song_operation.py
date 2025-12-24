import json, logging

from db import db_operations

logger = logging.getLogger("basic_functions")

async def get_playlists_information(playlist_id):
    data = await db_operations.PlaylistTable.get_playlist_by_id(playlist_id)
    logger.info(f"歌单{playlist_id}信息已提取[get_playlists_information]")
    return data

async def get_playlist_songs_information(playlist_id: str):
    songs = await db_operations.Analytics.get_playlist_songs(playlist_id)
    songs.sort(key=lambda x: x["position"])
    data = {
        'id': playlist_id,
        'count': len(songs),
        'songs': songs
    }
    logger.info(f"歌单{playlist_id}信息已提取[get_playlist_songs_information]")
    return data

async def get_song_information(song_id):
    song = await db_operations.SongTable.get_song_by_id(song_id)
    data = {
        'songs':[song]
    }
    logger.info(f"歌曲{song_id}信息已提取[get_song_information]")
    return data


