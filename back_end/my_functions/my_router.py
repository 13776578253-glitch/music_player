import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .my_operation import get_playlists_information_loved, get_history_songs_information, get_playlists_information_private, get_playlists_information_public
logger = logging.getLogger("basic_functions")

# /my
router = APIRouter()

@router.get("/my_songlists_1/{user_id}")
async def get_playlists_1(user_id: str | int):
    data = await get_playlists_information_loved(user_id)
    logger.info(f"我喜欢-歌单信息已发送[get_playlists_1]")
    return data

@router.get("/my_songlists_2/{user_id}")
async def get_playlists_2(user_id: str | int):
    data = await get_history_songs_information(user_id)
    logger.info(f"我攻击-歌曲信息已发送[get_playlists_2]")
    return data

@router.get("/my_songlists_3/{user_id}")
async def get_playlists_3(user_id: str | int):
    data = await get_playlists_information_private(user_id)
    logger.info(f"我创建-歌单信息已发送[get_playlists_3]")
    return data

@router.get("/my_songlists_4/{user_id}")
async def get_playlists_4(user_id: str | int):
    data = await get_playlists_information_public(user_id)
    logger.info(f"我收藏-歌单信息已发送[get_playlists_4]")
    return data



