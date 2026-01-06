import logging
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Literal, List, Union

from .my_operation import get_playlists_information_loved, get_history_songs_information, get_playlists_information_private, get_playlists_information_public, post_create_playlist_information, post_delete_playlist_information

logger = logging.getLogger("basic_functions")

class CreatePlaylist(BaseModel):
    user_id: Union[str, int]
    title: str
    url: str
    type: Literal['private', 'public']

class DeletePlaylist(BaseModel):
    user_id: Union[str, int]
    playlist_id: Union[str, int]

# /my
router = APIRouter()

@router.get("/my_songlists_1_like")
async def get_playlists_1(user_id: Union[str, int]=Query(...)):
    data = await get_playlists_information_loved(user_id)
    logger.info(f"我喜欢-歌单信息已发送[get_playlists_1]")
    return data

@router.get("/my_songlists_2_like")
async def get_playlists_2(user_id: Union[str, int]=Query(...)):
    data = await get_history_songs_information(user_id)
    logger.info(f"我查看-歌曲信息已发送[get_playlists_2]")
    return data

@router.get("/my_songlists_1")
async def get_playlists_3(user_id: Union[str, int]=Query(...)):
    data = await get_playlists_information_private(user_id)
    logger.info(f"我创建-歌单信息已发送[get_playlists_3]")
    return data

@router.get("/my_songlists_2")
async def get_playlists_4(user_id: Union[str, int]=Query(...)):
    data = await get_playlists_information_public(user_id)
    logger.info(f"我收藏-歌单信息已发送[get_playlists_4]")
    return data

@router.post("/create_playlist")
async def post_create_playlist(information: CreatePlaylist):
    input_information = information.model_dump()
    data = await post_create_playlist_information(input_information)
    logger.info(f"已创建歌单[post_create_playlist]")
    return data

@router.post("/delete_playlist")
async def post_delete_playlist(information: DeletePlaylist):
    input_information = information.model_dump()
    data = await post_delete_playlist_information(input_information)
    logger.info(f"已删除歌单[post_delete_playlist]")
    return data




