import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from .discovery_operation import get_popular_discovery_information, get_popular_daily_information

logger = logging.getLogger("discovery_functions")

# /recommendations
router = APIRouter()

@router.get("/daily/{user_id}")
async def get_daily_discovery(user_id: str | int):
    data = await get_popular_daily_information(user_id)
    logger.info(f"每日推荐已发送[get_daily_discovery]")
    return data

@router.get("/popular")
async def get_popular_discovery():
    data = await get_popular_discovery_information()
    logger.info(f"热门推荐已发送[get_popular_discovery]")
    return data




