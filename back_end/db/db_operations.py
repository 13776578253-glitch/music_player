import aiosqlite
import json
import logging

from .db_connect import db_context

logger = logging.getLogger("db")

# 歌曲表
class SongTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT DEFAULT '',
        lyricist TEXT DEFAULT '',
        lyrics TEXT DEFAULT '',
        composer TEXT DEFAULT '',
        language TEXT DEFAULT '',
        genre TEXT DEFAULT '',
        record_company TEXT DEFAULT '',
        duration INTEGER DEFAULT 0,
        file_path TEXT NOT NULL UNIQUE,
        url TEXT DEFAULT '',
        is_deleted INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """

    # 创建表
    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[songs]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[songs]创建失败：{e}")
            raise

    # 歌曲id是否存在
    @classmethod
    async def exists(cls, song_id, conn=None):
        sql = "SELECT 1 FROM songs WHERE id = ? LIMIT 1"

        if conn is None:
            async with db_context() as conn:
                cursor = await conn.execute(sql, (song_id,))
                return await cursor.fetchone() is not None
        else:
            cursor = await conn.execute(sql, (song_id,))
            return await cursor.fetchone() is not None

    # 新增数据
    @classmethod
    async def add_song(cls, title, artist, file_path, **kwargs):
        """
        :param title: 歌曲名
        :param artist: 歌手列表
        :param file_path: 歌曲文件路径
        :param kwargs: 其他可选字段（album, lyricist, duration等）
        """
        
        # 将歌手列表转为JSON字符串
        artist_json = json.dumps(artist, ensure_ascii=False)
        
        # 构造字段和值（必选字段+可选字段）
        fields = ["title", "artist", "file_path"]
        values = [title, artist_json, file_path]
        
        # 处理可选字段
        for key, value in kwargs.items():
            fields.append(key)
            values.append(value)
        
        # 构造插入SQL
        placeholders = ", ".join(["?"] * len(fields))
        insert_sql = f"INSERT INTO songs ({', '.join(fields)}) VALUES ({placeholders})"

        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(insert_sql, values)
                song_id = cursor.lastrowid
            logger.info(f"新增歌曲成功，ID：{song_id}")
            await SongStatsTable.init_song_stats(song_id) # 初始化歌曲统计数据
            return song_id
        except aiosqlite.IntegrityError as e:
            logger.error(f"新增歌曲失败：文件路径{file_path}已存在，错误：{e}")
            raise
        except aiosqlite.Error as e:
            logger.error(f"新增歌曲失败：{e}")
            raise

    # 查询数据
    @classmethod
    async def get_song_by_id(cls, song_id, conn=None):
        if not await cls.exists(song_id): 
            logger.error(f"歌曲{song_id}不存在")
            raise ValueError(f"歌曲{song_id}不存在")
        
        select_sql = "SELECT * FROM songs WHERE id = ?"
        try:
            row = None
            if conn is None:
                async with db_context() as conn:
                    cursor = await conn.cursor()
                    await cursor.execute(select_sql, (song_id,))
                    row = await cursor.fetchone()
            else:
                cursor = await conn.execute(select_sql, (song_id,))
                row = await cursor.fetchone()
            song_dict = dict(row) # 转换为字典，并将artist从JSON转回列表
            song_dict["artist"] = json.loads(song_dict["artist"])
            logger.info(f"歌曲{song_id}已查询")
            return song_dict
        except aiosqlite.Error as e:
            logger.error(f"查询歌曲失败：{e}")
            raise

    # 更新数据
    @classmethod
    async def update_song(cls, song_id, new_data, conn):
        # new_data = {'column': ..., 'new_value': ...}
        valid_stats = ["title", "artist", "album", "lyricist", "lyrics", "composer", "language", "genre", "record_company", "duration", "file_path", "url", "is_delete", "created_at"]
        if new_data['column'] not in valid_stats:
            logger.error(f"无效的歌曲移除统计类型：{new_data['column']}，可选类型：{valid_stats}")
            return False
        if not await cls.exists(song_id): 
            logger.error(f"歌曲{song_id}不存在")
            raise ValueError(f"歌曲{song_id}不存在")
        
        update_sql = f"UPDATE songs SET {new_data['column']} = ? WHERE id = ?"
        try:
            if conn is None:
                async with db_context() as conn:
                    cursor = await conn.cursor()
                    await cursor.execute(update_sql, (new_data['new_value'], song_id))
            else:
                await conn.execute(update_sql, (new_data['new_value'], song_id))
            logger.info(f"更新歌曲{song_id}的{new_data['column']}为{new_data['new_value']}")
            return True
        except aiosqlite.Error as e:
            logger.error(f"更新歌曲失败：{e}")
            raise

    # 删除数据
    @classmethod
    async def delete_song(cls, song_id):
        if not await cls.exists(song_id): 
            logger.error(f"歌曲{song_id}不存在")
            raise ValueError(f"歌曲{song_id}不存在")
        
        delete_sql = "DELETE FROM songs WHERE id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(delete_sql, (song_id,))
                # await SongStatsTable.delete_song_stats(song_id, conn)
                # await PlayEventTable.delete_play_events_by_song(song_id, conn)
            logger.info(f"删除歌曲{song_id}成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"删除歌曲失败：{e}")
            raise

# 歌曲聚合统计表
class SongStatsTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS song_stats (
        song_id INTEGER PRIMARY KEY,
        play_count INTEGER DEFAULT 0,
        skip_count INTEGER DEFAULT 0,
        complete_count INTEGER DEFAULT 0,
        last_played TIMESTAMP,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;")
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[song_stats]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[song_stats]创建失败：{e}")
            raise

    # 歌曲id是否存在
    @classmethod
    async def exists(cls, song_id, conn=None):
        sql = "SELECT 1 FROM song_stats WHERE song_id = ? LIMIT 1"

        if conn is None:
            async with db_context() as conn:
                cursor = await conn.execute(sql, (song_id,))
                return await cursor.fetchone() is not None
        else:
            cursor = await conn.execute(sql, (song_id,))
            return await cursor.fetchone() is not None

    # 初始化歌曲统计数据
    @classmethod
    async def init_song_stats(cls, song_id, conn=None):
        sql = "INSERT OR IGNORE INTO song_stats (song_id) VALUES (?)"
        try:
            if conn is None:
                async with db_context() as conn:
                    cursor = await conn.cursor() 
                    await cursor.execute(sql, (song_id,))
            else:
                await conn.execute(sql, (song_id,))
            logger.info(f"初始化歌曲{song_id}的统计数据成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"初始化歌曲统计数据失败：{e}")
            raise

    # 更新歌曲统计数据
    @classmethod
    async def update_song_stats(cls, song_id, count_type, add_count=1):
        valid_stats = ['skip_count', 'complete_count']
        if count_type not in valid_stats:
            logger.error(f"无效的歌曲更新统计类型：{count_type}，可选类型：{valid_stats}")
            return False
        if not await cls.exists(song_id): 
            logger.error(f"歌曲{song_id}不存在")
            raise ValueError(f"歌曲{song_id}不存在")
        
        sql = f"""
        UPDATE song_stats 
        SET play_count = play_count + ?, {count_type} = {count_type} + ?, last_played = CURRENT_TIMESTAMP 
        WHERE song_id = ?
        """
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (add_count, add_count, song_id))
                if cursor.rowcount == 0:
                    # 若统计记录不存在，先初始化再更新
                    await cls.init_song_stats(song_id, conn=conn)
                    await cursor.execute(sql, (add_count, add_count, song_id))
            logger.info(f"歌曲{song_id}的play_count和{count_type}增加{add_count}")
            return True
        except aiosqlite.Error as e:
            logger.error(f"更新歌曲统计数据失败：{e}")
            raise

    # 查询歌曲统计数据
    @classmethod
    async def get_song_stats(cls, song_id):
        sql = "SELECT * FROM song_stats WHERE song_id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (song_id,))
                row = await cursor.fetchone()
                return dict(row) if row else None
        except aiosqlite.Error as e:
            logger.error(f"查询歌曲统计数据失败：{e}")
            raise

    # 删除歌曲统计数据
    @classmethod
    async def delete_song_stats(cls, song_id, conn=None):
        sql = "DELETE FROM song_stats WHERE song_id = ?"
        try:
            if conn is None:
                async with db_context() as conn:
                    cursor = await conn.cursor() 
                    await cursor.execute(sql, (song_id,))
            else:
                await conn.execute(sql, (song_id,))
            logger.info(f"删除歌曲{song_id}的统计数据成功") 
            return True
        except aiosqlite.Error as e:
            logger.error(f"删除歌曲{song_id}的统计数据失败：{e}")
            raise

# 用户表
class UserTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        cookie TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[users]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[users]创建失败：{e}")
            raise

    @classmethod
    async def exists(cls, id, conn=None):
        sql = "SELECT 1 FROM users WHERE id = ? LIMIT 1"

        if conn is None:
            async with db_context() as conn:
                cursor = await conn.execute(sql, (id,))
                return await cursor.fetchone() is not None
        else:
            cursor = await conn.execute(sql, (id,))
            return await cursor.fetchone() is not None

    # 新增用户
    @classmethod
    async def add_user(cls, username, cookie):
        sql = "INSERT INTO users (username, cookie) VALUES (?, ?)"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (username, cookie))
                user_id = cursor.lastrowid
            logger.info(f"新增用户成功，ID：{user_id}")
            await PlaylistTable.add_playlist(user_id, '喜欢', 'loved')
            return user_id
        except aiosqlite.Error as e:
            logger.error(f"新增用户失败：{e}")
            raise

    # 根据ID查询用户
    @classmethod
    async def get_user_by_id(cls, user_id):
        sql = "SELECT * FROM users WHERE id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id,))
                row = await cursor.fetchone()

                logger.info(f"查询用户{user_id}成功")
                return dict(row) if row else None
        except aiosqlite.Error as e:
            logger.error(f"查询用户失败：{e}")
            raise

    # 更新用户Cookie
    @classmethod
    async def update_user_cookie(cls, user_id, new_cookie):
        sql = "UPDATE users SET cookie = ? WHERE id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (new_cookie, user_id))
                if cursor.rowcount == 0:
                    logger.warning(f"用户{user_id}不存在，更新失败")
                    return False
            logger.info(f"更新用户{user_id}的Cookie成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"更新用户Cookie失败：{e}")
            raise

    @classmethod
    async def delete_user(cls, user_id):
        # 删除用户
        sql = "DELETE FROM users WHERE id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id,))
                if cursor.rowcount == 0:
                    logger.warning(f"用户{user_id}不存在，删除失败")
                    return False
            logger.info(f"删除用户{user_id}成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"删除用户失败：{e}")
            raise

# 用户行为日志表
class PlayEventTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS play_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;")
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[play_events]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[play_events]创建失败：{e}")
            raise

    @classmethod
    async def if_update_song_stats(cls, song_id, event_type):
        if event_type == 'skip':
            await SongStatsTable.update_song_stats(song_id, 'skip_count')
        elif event_type == 'complete':
            await SongStatsTable.update_song_stats(song_id, 'complete_count')
        else:
            return

    # 新增播放行为日志
    @classmethod
    async def add_play_event(cls, user_id, song_id, event_type, position, duration):
        valid_stats = ['play', 'pause', 'stop', 'skip', 'complete']
        if event_type not in valid_stats:
            logger.error(f"无效的新增播放日志类型：{event_type}，可选类型：{valid_stats}")
            return False

        sql = "INSERT INTO play_events (user_id, song_id, event_type, position, duration) VALUES (?, ?, ?, ?, ?)"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id, song_id, event_type, position, duration))
                event_id = cursor.lastrowid
            logger.info(f"新增播放日志成功，ID：{event_id}")
            await cls.if_update_song_stats(song_id, event_type)
            return event_id
        except aiosqlite.Error as e:
            logger.error(f"新增播放日志失败：{e}")
            raise

    # 查询用户的播放日志
    @classmethod
    async def get_user_play_events(cls, user_id, event_types=None, limit=100):
        """
        :param user_id: 用户ID
        :param event_types: 可选的事件类型列表
        :param limit: 返回条数
        """
        sql = "SELECT * FROM play_events WHERE user_id = ?"
        params = [user_id]

        # 动态拼接 event_type 条件
        if event_types:
            placeholders = ",".join("?" for _ in event_types)
            sql += f" AND event_type IN ({placeholders})"
            params.extend(event_types)

        sql += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        try:
            async with db_context() as conn:
                cursor = await conn.execute(sql, tuple(params))
                rows = await cursor.fetchall()
                logger.info(f"查询用户 {user_id} 播放日志成功 {'，事件类型=' + ','.join(event_types) if event_types else ''}")
                return [dict(row) for row in rows]

        except aiosqlite.Error as e:
            logger.error(f"查询用户播放日志失败：{e}")
            raise

    # @classmethod
    # async def count_song_events(cls, event_type=None):
    #     # 统计各歌曲的事件次数
    #     if event_type:
            # if event_type not in {'play', 'pause', 'stop', 'skip', 'complete'}:
            #     logger.error(f"统计各歌曲的事件次数失败：event_type不存在")
            #     raise
    #         sql = "SELECT song_id, COUNT(*) as event_count FROM play_events WHERE event_type = ? GROUP BY song_id ORDER BY event_count DESC"
    #         params = (event_type,)
    #     else:
    #         sql = "SELECT song_id, COUNT(*) as event_count FROM play_events GROUP BY song_id ORDER BY event_count DESC"
    #         params = ()
    #     try:
    #         async with db_context() as conn:
    #             cursor = await conn.cursor()
    #             await cursor.execute(sql, params)
    #             rows = await cursor.fetchall()
    #             return [(row['song_id'], row['event_count']) for row in rows]
    #     except aiosqlite.Error as e:
    #         logger.error(f"统计歌曲事件失败：{e}")
    #         raise

    # 删除某首歌曲的所有播放日志
    @classmethod
    async def delete_play_events_by_song(cls, song_id, conn=None):
        sql = "DELETE FROM play_events WHERE song_id = ?"
        try:
            if conn is None:
                async with db_context() as conn:
                    cursor = await conn.cursor() 
                    await cursor.execute(sql, (song_id,))
            else:
                await conn.execute(sql, (song_id,))
            logger.info(f"删除歌曲{song_id}的播放日志共{cursor.rowcount}条")
            return True
            # return cursor.rowcount
        except aiosqlite.Error as e:
            logger.error(f"删除播放日志失败：{e}")
            raise

# 歌单表
class PlaylistTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id INTEGER NOT NULL,
        name TEXT DEFAULT '',
        play_count INTEGER DEFAULT 0,
        song_count INTEGER DEFAULT 0,
        type TEXT DEFAULT 'private',
        url TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (creator_id, name),
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;")
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[playlists]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[playlists]创建失败：{e}")
            raise

    @classmethod
    async def exists(cls, playlist_id, conn=None):
        sql = "SELECT 1 FROM playlists WHERE id = ? LIMIT 1"

        if conn is None:
            async with db_context() as conn:
                cursor = await conn.execute(sql, (playlist_id,))
                return await cursor.fetchone() is not None
        else:
            cursor = await conn.execute(sql, (playlist_id,))
            return await cursor.fetchone() is not None

    # 新增歌单
    @classmethod
    async def add_playlist(cls, creator_id, name, type="private", play_count=0, song_count=0, url=None):
        sql = "INSERT INTO playlists (creator_id, name, type, play_count, song_count, url) VALUES (?, ?, ?, ?, ?, ?)"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (creator_id, name, type, play_count, song_count, url))
                playlist_id = cursor.lastrowid
            logger.info(f"新增歌单成功，ID：{playlist_id}")
            return playlist_id
        except aiosqlite.Error as e:
            logger.error(f"新增歌单失败：{e}")
            raise

    # 根据ID查询歌单
    @classmethod
    async def get_playlist_by_id(cls, playlist_id):
        sql = "SELECT * FROM playlists WHERE id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (playlist_id,))
                row = await cursor.fetchone()

                logger.info(f"查询歌单{playlist_id}成功")
                return dict(row) if row else None
        except aiosqlite.Error as e:
            logger.error(f"查询歌单失败：{e}")
            raise

    # 更新歌单播放量/歌曲数
    @classmethod
    async def update_playlist_count(cls, playlist_id, count_type='play_count', add_count=1, conn=None):
        valid_stats = ['play_count', 'song_count']
        if count_type not in valid_stats:
            logger.error(f"无效的歌单统计类型更新：{count_type}，可选类型：{valid_stats}")
            return False
        
        sql = f"UPDATE playlists SET play_count = {count_type} + ? WHERE id = ?"
        try:
            if conn is None:
                async with db_context() as conn:
                    cursor = await conn.cursor()
                    await cursor.execute(sql, (add_count, playlist_id))
                    if not await cls.exists(playlist_id, conn):
                        logger.error(f"歌单{playlist_id}不存在")
                        raise ValueError(f"歌单{playlist_id}不存在")
            else:
                await conn.execute(sql, (count_type, add_count, playlist_id))
                if not await cls.exists(playlist_id, conn):
                    logger.error(f"歌单{playlist_id}不存在")
                    raise ValueError(f"歌单{playlist_id}不存在")
            logger.info(f"歌单{playlist_id}增加{add_count}")
            return True
        except aiosqlite.Error as e:
            logger.error(f"更新歌单失败：{e}")
            raise

    @classmethod
    async def delete_playlist(cls, playlist_id):
        # 删除歌单
        sql = "DELETE FROM playlists WHERE id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (playlist_id,))
                if cursor.rowcount == 0:
                    logger.warning(f"歌单{playlist_id}不存在，删除失败")
                    return False
            logger.info(f"删除歌单{playlist_id}成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"删除歌单失败：{e}")
            raise

# 用户-歌单关系表
class UserPlaylistTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS user_playlists (
        user_id INTEGER NOT NULL,
        playlist_id INTEGER NOT NULL,
        position INTEGER DEFAULT 0,
        added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, playlist_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;") # 启用SQLite外键约束
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[user_playlists]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[user_playlists]创建失败：{e}")
            raise

    # 获取最大position值
    @classmethod
    async def get_max_position(cls, user_id):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("""SELECT MAX(position) FROM user_playlists WHERE user_id = ?""", (user_id,))
                max_pos = await cursor.fetchone()

                logger.info(f"获取用户{user_id}的歌单最大position成功")
                return max_pos[0] if max_pos[0] is not None else -1
        except aiosqlite.Error as e:
            logger.error(f"获取用户{user_id}的歌单最大position失败：{e}")
            raise

    # 关联用户与歌单
    @classmethod
    async def add_user_playlist(cls, user_id, playlist_id, position=None):
        try:
            if position is None:
                max_pos = await cls.get_max_position(user_id)
                if not max_pos: max_pos = 0
                position = max_pos + 1

            async with db_context() as conn:
                cursor = await conn.cursor()
                sql = "INSERT INTO user_playlists (user_id, playlist_id, position) VALUES (?, ?, ?)"
                await cursor.execute(sql, (user_id, playlist_id, position))

            logger.info(f"用户{user_id}关联歌单{playlist_id}，位置：{position}")
            return True

        except aiosqlite.IntegrityError as e:
            logger.warning(f"用户{user_id}与歌单{playlist_id}已关联，新增失败：{e}")
            return False
        except aiosqlite.Error as e:
            logger.error(f"关联用户歌单失败：{e}")
            raise

    # 查询用户的所有歌单
    @classmethod
    async def get_user_playlists(cls, user_id):
        sql = """
        SELECT p.*, up.position, up.added_at 
        FROM playlists p
        JOIN user_playlists up ON p.id = up.playlist_id
        WHERE up.user_id = ?
        ORDER BY up.position ASC
        """
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id,))
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]
        except aiosqlite.Error as e:
            logger.error(f"查询用户歌单失败：{e}")
            raise

    # @classmethod
    # async def update_playlist_position(cls, user_id, playlist_id, new_position):
    #     # 更新歌单在用户列表中的位置
    #     sql = "UPDATE user_playlists SET position = ? WHERE user_id = ? AND playlist_id = ?"
    #     try:
    #         async with db_context() as conn:
    #             cursor = await conn.cursor()
    #             await cursor.execute(sql, (new_position, user_id, playlist_id))
    #             if cursor.rowcount == 0:
    #                 logger.warning(f"用户{user_id}与歌单{playlist_id}的关联不存在，更新失败")
    #                 return False
    #         logger.info(f"更新用户{user_id}的歌单{playlist_id}位置为{new_position}")
    #         return True
    #     except aiosqlite.Error as e:
    #         logger.error(f"更新歌单位置失败：{e}")
    #         raise

    # 解除用户与歌单的关联
    @classmethod
    async def delete_user_playlist(cls, user_id, playlist_id):
        sql = "DELETE FROM user_playlists WHERE user_id = ? AND playlist_id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id, playlist_id))
                if cursor.rowcount == 0:
                    logger.warning(f"用户{user_id}与歌单{playlist_id}的关联不存在，删除失败")
                    return False
            logger.info(f"解除用户{user_id}与歌单{playlist_id}的关联成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"解除用户歌单关联失败：{e}")
            raise

# 歌单-歌曲关系表
class PlaylistSongTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        position INTEGER DEFAULT 0,
        added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (playlist_id, song_id),
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;")
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[playlist_songs]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[playlist_songs]创建失败：{e}")
            raise

    # 获取最大position值
    @classmethod
    async def get_max_position(cls, playlist_id):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("SELECT MAX(position) FROM playlist_songs WHERE playlist_id = ?", (playlist_id,))
                max_pos = await cursor.fetchone()

                logger.info(f"获取歌单{playlist_id}的最大position成功")
                return max_pos[0] if max_pos[0] is not None else -1 # 无数据时返回-1，这样+1后就是0
        except aiosqlite.Error as e:
            logger.error(f"获取歌单{playlist_id}的最大position失败：{e}")
            raise

    # 添加歌曲到歌单
    @classmethod
    async def add_song_to_playlist(cls, playlist_id, song_id, position=None):
        try:
            if position is None:
                max_pos = await cls.get_max_position(playlist_id)
                position = max_pos + 1

            async with db_context() as conn:
                cursor = await conn.cursor()
                sql = "INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)"
                await cursor.execute(sql, (playlist_id, song_id, position))
                await PlaylistTable.update_playlist_count(playlist_id, add_count=1, conn=conn) # 同步更新歌单歌曲数量

            logger.info(f"歌曲{song_id}添加到歌单{playlist_id}，位置：{position}")
            return True

        except aiosqlite.IntegrityError as e:
            logger.warning(f"歌曲{song_id}已在歌单{playlist_id}中，添加失败：{e}")
            return False
        except aiosqlite.Error as e:
            logger.error(f"添加歌曲到歌单失败：{e}")
            raise

    # 从歌单中移除歌曲
    @classmethod
    async def remove_song_from_playlist(cls, playlist_id, song_id):
        sql = "DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (playlist_id, song_id))
                if cursor.rowcount == 0:
                    logger.warning(f"移除歌单{playlist_id}中的歌曲{song_id}失败")
                    return False
                # 同步更新歌单歌曲数量
                await PlaylistTable.update_playlist_count(playlist_id, add_count=-1, conn=conn)
            logger.info(f"从歌单{playlist_id}移除歌曲{song_id}成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"移除歌单歌曲失败：{e}")
            raise

# 用户决策树表
class UserModelTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS model (
        id INTEGER PRIMARY KEY,
        model_type TEXT DEFAULT 'decision',
        model_data BLOB,
        event_cursor INTEGER DEFAULT 0,
        last_trained_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;")
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[model]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[model]创建失败：{e}")
            raise

    # 保存/更新模型
    classmethod
    async def save_user_model(cls, model_id, model_data, event_cursor):
        sql = """INSERT OR REPLACE INTO model (id, model_data, event_cursor) VALUES (?, ?, ?)"""
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (model_id, model_data, event_cursor))
            logger.info(f"保存模型数据成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"保存模型失败：{e}")
            raise


# 分析类
class Analytics:
    @classmethod
    def tuple_to_list(cls, rows):
        result = []
        for row in rows:
            result.append(row)
        return result

    @classmethod
    def tuple_to_list_s(cls, rows):
        result = []
        for row in rows:
            row_dict = dict(row) # 解析歌手JSON字符串
            if row_dict.get('artist'):
                row_dict['artist'] = json.loads(row_dict['artist'])
            else:
                row_dict["artist"] = []
            result.append(row_dict)
        return result

    # 提取播放次数最多的10个歌曲信息
    @classmethod
    async def get_most_played_song(cls): 
        query = """
        SELECT s.id, s.title, s.artist, s.duration, COUNT(p.song_id) AS play_count
        FROM play_events p
        JOIN songs s ON p.song_id = s.id
        GROUP BY s.id
        ORDER BY play_count DESC
        LIMIT 10;
        """
        try:
            async with db_context() as conn:
                cursor = await conn.execute(query)
                rows = await cursor.fetchall()
                songs = cls.tuple_to_list_s(rows)
                logger.info("get_most_played_song成功提取信息")
                return songs
            
        except aiosqlite.Error as e:
            logger.error(f"get_most_played_song提取信息失败：{e}")
            raise

    # 查询歌单中的所有歌曲
    @classmethod
    async def get_playlist_songs(cls, playlist_id):
        sql = """
        SELECT s.id AS song_id, s.title, s.artist, s.album, s.duration, s.cover_url AS url, p.type AS type, ps.position AS position
        FROM playlist_songs ps
        JOIN songs s      ON ps.song_id = s.id
        JOIN playlists p  ON ps.playlist_id = p.id
        WHERE ps.playlist_id = ?
        ORDER BY ps.position ASC
        """

        try:
            async with db_context() as conn:
                cursor = await conn.execute(sql, (playlist_id,))
                rows = await cursor.fetchall()
                songs = cls.tuple_to_list_s(rows)
                logger.info("get_playlist_songs成功提取信息")
                return songs

        except aiosqlite.Error as e:
            logger.error(f"get_playlist_songs提取信息失败：{e}")
            raise


    # 生成正样本候选与强负的user_song聚合行-训练所有用户的样本行
    @classmethod
    async def get_user_song_aggregation(cls):
        sql = """
        SELECT
            p.user_id,
            p.song_id,
            COUNT(*) AS us_play_count,
            SUM(CASE WHEN p.event_type = 'complete' THEN 1 ELSE 0 END) AS us_complete_count,
            SUM(CASE WHEN p.event_type = 'skip' THEN 1 ELSE 0 END) AS us_skip_count,
            AVG(CAST(p.duration AS FLOAT) / s.duration) AS us_avg_play_ratio,
            MAX(p.created_at) AS last_played,
            s.duration AS song_duration,
            s.genre,
            s.language
        FROM play_events p
        JOIN songs s ON p.song_id = s.id
        WHERE p.created_at >= DATE('now', '-30 days')
        GROUP BY p.user_id, p.song_id;
        """

        try:
            async with db_context() as conn:
                cursor = await conn.execute(sql)
                rows = await cursor.fetchall()
                data = cls.tuple_to_list(rows)
                logger.info("get_user_song_aggregation成功提取信息")
                return data

        except aiosqlite.Error as e:
            logger.error(f"get_user_song_aggregation提取信息失败：{e}")
            raise

    # 获取全局级歌曲状态信息-歌曲整体受欢迎程度
    @classmethod
    async def get_song_level_stats(cls):
        sql = """
        SELECT
            s.id AS song_id,
            s.duration AS song_duration,
            s.genre AS song_genre,
            s.language AS song_language,
            COALESCE(ss.play_count, 0) AS song_play_count,
            CASE WHEN COALESCE(ss.play_count,0) > 0 THEN COALESCE(ss.complete_count,0) * 1.0 / ss.play_count ELSE 0 END AS song_complete_rate
        FROM songs s
        LEFT JOIN song_stats ss ON s.id = ss.song_id;
        """

        try:
            async with db_context() as conn:
                cursor = await conn.execute(sql)
                rows = await cursor.fetchall()
                data = cls.tuple_to_list(rows)
                logger.info("get_song_level_stats成功提取信息")
                return data

        except aiosqlite.Error as e:
            logger.error(f"get_song_level_stats提取信息失败：{e}")
            raise

    # 获取用户级信息-用户之间的差异
    # 正数据为用户完全播放较多
    # 强负数据为用户反复尝试、反复跳过
    @classmethod
    async def get_user_level_stats(cls):
        sql = """
        SELECT
            p.user_id,
            COUNT(*) AS user_total_plays,
            SUM(CASE WHEN p.event_type = 'complete' THEN 1 ELSE 0 END) AS user_total_complete,
            SUM(CASE WHEN p.event_type = 'complete' THEN 1 ELSE 0 END) * 1.0 / COUNT(*) AS user_complete_rate
        FROM play_events p
        WHERE p.created_at >= DATE('now', '-30 days')
        GROUP BY p.user_id;
        """

        try:
            async with db_context() as conn:
                cursor = await conn.execute(sql)
                rows = await cursor.fetchall()
                data = cls.tuple_to_list(rows)
                logger.info("get_user_level_stats成功提取信息")
                return data

        except aiosqlite.Error as e:
            logger.error(f"get_user_level_stats提取信息失败：{e}")
            raise


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(1)
