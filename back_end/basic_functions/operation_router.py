import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

from .playlist_operation import get_playlist_songs_information, post_playlist_collect_information, get_playlists_is_collected_information
from .search_operation import get_searh_information
from .auth_operation import post_auth_register_information, post_auth_login_information

logger = logging.getLogger("basic_functions")

class PlaylistsCollect(BaseModel):
    user_id: str
    playlist_id: str
    action: Literal['collect', 'uncollect']

class AuthRegister(BaseModel):
    uid: str

class AuthLogin(BaseModel):
    cookie: str

# /
router = APIRouter()

@router.get("/songslists/{playlist_id}/{user_id}")
async def get_playlist_songs(playlist_id: str | int, user_id: str | int):
    data = await get_playlist_songs_information(playlist_id, user_id)
    logger.info(f"歌单-歌曲{playlist_id}信息已发送[get_playlist_songs]")
    return data

@router.post("/playlists/collect")
async def post_playlists_collect(information: PlaylistsCollect):
    input_information = information.model_dump()
    data = await post_playlist_collect_information(input_information)
    logger.info(f"歌单信息{information['playlist_id']}已发送[post_playlists_collect]")
    return data

@router.get("/playlists/is_collected/{playlist_id}/{user_id}")
async def get_playlists_is_collected(playlist_id: str | int, user_id: str | int):
    data = await get_playlists_is_collected_information(playlist_id, user_id)
    logger.info(f"歌单{playlist_id}信息已发送[get_playlist_is_collected]")
    return data

@router.post("/auth/register")
async def post_auth_register(information: AuthRegister):
    input_information = information.model_dump()
    data = await post_auth_register_information(input_information)
    logger.info(f"用户{input_information['uid']}注册信息已发送[post_auth_register]")

@router.post("/auth/login")
async def post_auth_login(information: AuthLogin):
    input_information = information.model_dump()
    data = await post_auth_login_information(input_information)
    logger.info(f"用户{input_information['uid']}登录信息已发送[post_auth_login]")


