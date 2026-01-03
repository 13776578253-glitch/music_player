import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .playlist_song_operation import get_playlist_songs_information
from .search_operation import get_searh_information

logger = logging.getLogger("basic_functions")

# /
router = APIRouter()

@router.get("/songslists/{playlist_id}/{user_id}")
async def get_playlist_songs(playlist_id: str | int, user_id: str | int):
    data = await get_playlist_songs_information(playlist_id, user_id)
    logger.info(f"歌单-歌曲{playlist_id}信息已发送[get_playlist_songs]")
    return data



