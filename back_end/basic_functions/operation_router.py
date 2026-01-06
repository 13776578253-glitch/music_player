import logging
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Literal, List, Union

from .playlist_operation import get_playlist_songs_information, post_playlist_collect_information, get_playlists_is_collected_information, post_ps_batch_add_information, post_ps_batch_delate_information, post_analytics_playlist_play_information
from .song_operation import post_like_toggle_information, post_analytics_batch_report_information
from .search_operation import get_searh_information
from .auth_operation import post_auth_register_information, post_auth_login_information

logger = logging.getLogger("basic_functions")

class PlaylistsCollect(BaseModel):
    user_id: Union[str, int]
    playlist_id: Union[str, int]
    action: Literal['collect', 'uncollect']

class PSBatch(BaseModel):
    user_id: Union[str, int]
    playlist_id: Union[str, int]
    song_ids: List[Union[str, int]]

class LikeToggle(BaseModel):
    user_id: Union[str, int]
    
class PlayLogItem(BaseModel):
    song_id: str
    duration: int
    played_time: float
    end_type: Literal["complete", "skip", "pause", "error"]
    position: float
    timestamp: int
class AnalyticsBatchReport(BaseModel):
    user_id: str
    logs: List[PlayLogItem]

class AnalyticsPlaylistPlay(BaseModel):
    user_id: Union[str, int]
    playlist_id: Union[str, int]

class AuthRegister(BaseModel):
    uid: Union[str, int]

class AuthLogin(BaseModel):
    cookie: Union[str, int]

# /
router = APIRouter()

@router.get("/songslists/{playlist_id}")
async def get_playlist_songs(playlist_id: Union[str, int], user_id: Union[str, int]=Query(...)):
    data = await get_playlist_songs_information(playlist_id, user_id)
    logger.info(f"歌单-歌曲{playlist_id}信息已发送[get_playlist_songs]")
    return data

@router.post("/playlists/collect")
async def post_playlists_collect(information: PlaylistsCollect):
    input_information = information.model_dump()
    data = await post_playlist_collect_information(input_information)
    logger.info(f"歌单{information['playlist_id']}信息已发送[post_playlists_collect]")
    return data

@router.get("/playlists/is_collected")
async def get_playlists_is_collected(playlist_id: Union[str, int]=Query(...), user_id: Union[str, int]=Query(...)):
    data = await get_playlists_is_collected_information(playlist_id, user_id)
    logger.info(f"歌单{playlist_id}信息已发送[get_playlist_is_collected]")
    return data

@router.post("/playlist/songs/batch_add")
async def post_ps_batch_add(information: PSBatch):
    input_information = information.model_dump()
    data = await post_ps_batch_add_information(input_information)
    logger.info(f"歌单已添加[post_ps_batch_add]")
    return data

@router.post("/playlist/songs/batch_delate")
async def post_ps_batch_delate(information: PSBatch):
    input_information = information.model_dump()
    data = await post_ps_batch_delate_information(input_information)
    logger.info(f"歌单已删除[post_ps_batch_delate]")
    return data

@router.post('/like/toggle')
async def post_like_toggle(information: LikeToggle):
    input_information = information.model_dump()
    data = await post_like_toggle_information(input_information)
    logger.info(f"歌曲已喜欢[post_like_toggle]")
    return data

@router.post('/analytics/batch_report')
async def post_analytics_batch_report(information: AnalyticsBatchReport):
    input_information = information.model_dump()
    data = await post_analytics_batch_report_information(input_information)
    logger.info(f"播放行为已上传[post_analytics_batch_report]")
    return data

@router.post('/analytics/playlist_play')
async def post_analytics_playlist_play(information: AnalyticsPlaylistPlay):
    input_information = information.model_dump()
    data = await post_analytics_playlist_play_information(input_information)
    logger.info(f"播放行为已上传[post_analytics_playlist_play]")
    return data

@router.get('/search')
async def get_search(q: str=Query(...)):
    data = await get_searh_information(q)
    logger.info(f"已搜索[get_search]")
    return data

@router.post("/auth/register")
async def post_auth_register(information: AuthRegister):
    input_information = information.model_dump()
    data = await post_auth_register_information(input_information)
    logger.info(f"用户{input_information['uid']}注册信息已发送[post_auth_register]")
    return data

@router.post("/auth/login")
async def post_auth_login(information: AuthLogin):
    input_information = information.model_dump()
    data = await post_auth_login_information(input_information)
    logger.info(f"用户{input_information['uid']}登录信息已发送[post_auth_login]")
    return data


