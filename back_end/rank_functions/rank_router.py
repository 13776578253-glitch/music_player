import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .rank_operation import get_rank_information_public, get_rank_information_users
logger = logging.getLogger("rank_functions")

# /rank
router = APIRouter()

@router.get("/public/{user_id}")
async def get_rank_public(user_id: str | int):
    data = await get_rank_information_public(user_id)
    logger.info(f"全局歌曲排行信息已发送[get_rank_public]")
    return data

@router.get("/users/{user_id}")
async def get_rank_users(user_id: str | int):
    data = await get_rank_information_users(user_id)
    logger.info(f"个人歌曲排行信息已发送[get_rank_users]")
    return data

