import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .playlist_song_operation import get_playlists_information, get_playlist_songs_information, get_song_information

logger = logging.getLogger("basic_functions")

# /
router = APIRouter()

@router.get("/playlists/{playlist_id}")
async def get_playlists(playlist_id: str):
    data = await get_playlists_information(playlist_id)
    logger.info(f"歌单{playlist_id}信息已发送[get_playlists]")
    return data

@router.get("/playlist_songs/{playlist_id}")
async def get_playlist_songs(playlist_id: str):
    data = await get_playlist_songs_information(playlist_id)
    logger.info(f"歌单{playlist_id}信息已发送[get_playlist_songs]")
    return data

@router.get("/songs/{song_id}")
async def get_song(song_id: str):
    data = await get_song_information(song_id)
    logger.info(f"歌曲{song_id}信息已发送[get_song]")
    return data


