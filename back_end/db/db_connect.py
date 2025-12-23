import aiosqlite
from contextlib import asynccontextmanager
from core.config import DB_FILE

# 获取异步数据库连接，启用字典游标
async def get_db_connection():
    conn = await aiosqlite.connect(DB_FILE)
    conn.row_factory = aiosqlite.Row
    return conn

# 异步上下文管理器，自动处理连接、提交、回滚、关闭
@asynccontextmanager
async def db_context():
    conn = await get_db_connection()
    try:
        yield conn
        await conn.commit()
    except Exception:
        await conn.rollback()
        raise
    finally:
        await conn.close()

