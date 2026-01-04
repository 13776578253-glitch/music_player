import logging

from db import db_operations

logger = logging.getLogger("basic_functions[a]")

# 用户注册
async def post_auth_register_information(auth_register):
    uid = auth_register['uid']
    cookie = auth_register['cookie']

    is_exist = await db_operations.UserTable.exists(uid)
    if not is_exist: 
        logger.warning(f"用户{uid}不存在")
        return { "success": False }
    
    result = await db_operations.UserTable.add_user_re(uid, cookie)
    if result: return { "success": True }

# 用户登录
async def post_auth_login_information(auth_login):
    cookie = auth_login['cookie']
    result = await db_operations.UserTable.exists_re(cookie)

    if result is None:
        logger.warning(f"用户不存在")
        return {"success": False, "user_id": None}
    else:
        logger.info("用户数据已提取")
        return {"success": True, "user_id": dict(result)['id']}



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    auth_login= {"cookie": "123456"}
    asyncio.run(post_auth_login_information(auth_login))
