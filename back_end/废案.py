import aiosqlite, logging
from db.db_connect import db_context
logger = logging.getLogger("db")

# 用户决策树表
class UserModelTable:
    CREATE_QUERY = """
    CREATE TABLE IF NOT EXISTS user_model (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        model_type TEXT DEFAULT 'decision',
        model_data BLOB,
        event_cursor INTEGER DEFAULT 0,
        last_trained_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id)
    );
    """

    @classmethod
    async def create_table(cls):
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute("PRAGMA foreign_keys = ON;")
                await cursor.execute(cls.CREATE_QUERY)
            logger.info("table[user_model]创建成功/已存在")
        except aiosqlite.Error as e:
            logger.error(f"table[user_model]创建失败：{e}")
            raise

    # 保存/更新用户模型
    classmethod
    async def save_user_model(cls, user_id, model_data, event_cursor):
        sql = """INSERT OR REPLACE INTO user_model (user_id, model_data, event_cursor) VALUES (?, ?, ?)"""
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id, model_data, event_cursor))
            logger.info(f"保存用户{user_id}的模型数据成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"保存用户模型失败：{e}")
            raise

    # 查询用户模型数据
    @classmethod
    async def get_user_model(cls, user_id):
        sql = "SELECT * FROM user_model WHERE user_id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id,))
                row = await cursor.fetchone()

                logger.info(f"查询用户{user_id}模型失成功")
                return dict(row) if row else None
        except aiosqlite.Error as e:
            logger.error(f"查询用户模型失败：{e}")
            raise

    # 删除用户模型
    @classmethod
    async def delete_user_model(cls, user_id):
        sql = "DELETE FROM user_model WHERE user_id = ?"
        try:
            async with db_context() as conn:
                cursor = await conn.cursor()
                await cursor.execute(sql, (user_id,))
                if cursor.rowcount == 0:
                    logger.warning(f"用户{user_id}的模型不存在，删除失败")
                    return False
            logger.info(f"删除用户{user_id}的模型成功")
            return True
        except aiosqlite.Error as e:
            logger.error(f"删除用户模型失败：{e}")
            raise


# def if_play_events_data(data):
#     result = True
#     length = len(data)
#     if length < 30:
#         logger.warning(f"play_events_data数据量{length}<30")
#         result = False
#     return result

# play_events_data = await db_operations.PlayEventTable.get_user_play_events(user_id, event_types=["skip", "complete"], limit=100)
    # if not if_play_events_data(play_events_data):
    #     return None


# def sample_negative_pairs(df_us, df_song, df_user, sample_k=5):
#     """
#     df_us已有user-song聚合-正样本 + 强负
#     df_song歌曲表-提供内容特征
#     df_user用户表-提供偏好特征
#     为每个用户采样若干未听过的歌曲，构造弱负样本
#     """
#     all_songs = set(df_song['song_id']) # 负采样为每个user抽取若干未听过的歌曲作为弱负
#     neg_rows = []

#     grouped = df_us.groupby('user_id')

#     for user_id, group in grouped:
#         heard = set(group['song_id'])
#         candidates = list(all_songs - heard)
#         if not candidates:  continue
#         k = min(sample_k, len(candidates))
#         sampled = random.sample(candidates, k)
#         user_info = df_user[df_user['user_id'] == user_id]
#         user_info = user_info.iloc[0].to_dict() if not user_info.empty else {}

#         for song_id in sampled: # 用song-level+user-level填充交互特征为0
#             song_info = df_song[df_song['song_id'] == song_id].iloc[0].to_dict()
#             neg_rows.append({
#                 'user_id': user_id,
#                 'song_id': song_id,
#                 'us_play_count': 0,
#                 'us_complete_count': 0,
#                 'us_skip_count': 0,
#                 'us_avg_play_ratio': 0,
#                 'song_duration': song_info['song_duration'],
#                 'genre': song_info['genre'],
#                 'language': song_info['language'],
#                 'song_play_count': song_info['song_play_count'],
#                 'song_complete_rate': song_info['song_complete_rate'],
#                 'user_total_plays': user_info.get('user_total_plays', 0),
#                 'user_complete_rate': user_info.get('user_complete_rate', 0),
#                 'is_new_pair': 1,
#                 'y': 0  # 弱负
#             })

#     return pd.DataFrame(neg_rows)



# # 合并user-song与song/user
#     df = df_us.merge(df_song, how='left', on='song_id').merge(df_user, how='left', on='user_id')
#     df.fillna({'user_total_plays':0, 'user_total_complete':0, 'user_complete_rate':0, 'song_play_count':0, 'song_complete_rate':0, 'us_avg_play_ratio':0}, inplace=True)

#     # 构造label_y聚合规则
#     df['us_complete_ratio'] = df['us_complete_count'] / df['us_play_count']
#     df['y'] = (df['us_complete_ratio'] >= 0.6).astype(int)

#     all_songs = set(df_song['song_id'].tolist()) # 负采样为每个user抽取若干未听过的歌曲作为弱负
#     grouped = df.groupby('user_id')
#     neg_rows = []
#     for user, group in grouped:
#         heard_songs = set(group['song_id'].tolist())
#         candidate = list(all_songs - heard_songs)
#         if not candidate:  continue
#         k = min(sample_negatives_per_user, len(candidate))
#         sampled = random.sample(candidate, k)
#         for s in sampled:
#             # 用song-level+user-level填充交互特征为0
#             song_info = df_song[df_song['song_id']==s].iloc[0].to_dict()
#             user_info = df_user[df_user['user_id']==user].iloc[0].to_dict() if user in set(df_user['user_id']) else {'user_total_plays':0,'user_total_complete':0,'user_complete_rate':0}
#             neg_rows.append({
#                 'user_id': user,
#                 'song_id': s,
#                 'us_play_count': 0,
#                 'us_complete_count': 0,
#                 'us_skip_count': 0,
#                 'us_avg_play_ratio': 0,
#                 'song_duration': song_info['song_duration'],
#                 'genre': song_info['genre'],
#                 'language': song_info['language'],
#                 'song_play_count': song_info['song_play_count'],
#                 'song_complete_rate': song_info['song_complete_rate'],
#                 'user_total_plays': user_info.get('user_total_plays',0),
#                 'user_complete_rate': user_info.get('user_complete_rate',0),
#                 'y': 0   # 负样本
#             })
#     df_neg = pd.DataFrame(neg_rows)
#     df_all = pd.concat([df, df_neg], ignore_index=True)


# # 生成正和强负样本训练数据
# def build_positive_strong_negative_data(df_us, df_song, df_user, positive_threshold=0.6, strong_negative_play_min=3, strong_negative_ratio_max=0.2):
#     """
#     从已有user-song聚合构造正样本与强负样本，并且输出统一schema。
#     """
#     rows = []
#     # 按行遍历已有聚合
#     for _, r in df_us.iterrows():
#         user_id = r['user_id']
#         song_id = r['song_id']
#         us_play = int(r.get('us_play_count', 0))
#         us_complete = int(r.get('us_complete_count', 0))
#         us_skip = int(r.get('us_skip_count', 0))
#         us_avg_play_ratio = float(r.get('us_avg_play_ratio', 0.0))
#         us_complete_ratio = (us_complete / us_play) if us_play > 0 else 0.0
        
#         is_positive = us_play > 0 and (us_complete_ratio >= positive_threshold) # 判定正/强负
#         is_strong_negative = (us_play >= strong_negative_play_min) and (us_complete_ratio <= strong_negative_ratio_max)
        
#         if not (is_positive or is_strong_negative): continue # 只保留正样本和强负样本（减少噪声）

#         # 获取song/user信息，同时处理空数据
#         song_row = df_song[df_song['song_id'] == song_id]
#         song_info = song_row.iloc[0].to_dict() if not song_row.empty else {}
#         user_row = df_user[df_user['user_id'] == user_id]
#         user_info = user_row.iloc[0].to_dict() if not user_row.empty else {}

#         row = {
#             'user_id': user_id,
#             'song_id': song_id,
#             'us_play_count': us_play,
#             'us_complete_count': us_complete,
#             'us_skip_count': us_skip,
#             'us_complete_ratio': us_complete_ratio,
#             'us_avg_play_ratio': us_avg_play_ratio,
#             'song_duration': song_info.get('song_duration', 0),
#             'song_genre': song_info.get('genre', None),
#             'song_language': song_info.get('language', None),
#             'song_play_count': song_info.get('song_play_count', 0),
#             'song_complete_rate': song_info.get('song_complete_rate', 0.0),
#             'user_total_plays': user_info.get('user_total_plays', 0),
#             'user_complete_rate': user_info.get('user_complete_rate', 0.0),
#             'is_new_pair': 0,  # 有历史
#             'y': 1 if is_positive else 0,
#             'sample_weight': POSITIVE_WEIGHT if is_positive else STRONG_NEG_WEIGHT
#         }
#         rows.append(row)

#     df_posneg = pd.DataFrame(rows, columns=SAMPLE_COLUMNS)
#     if df_posneg.empty: df_posneg = pd.DataFrame(columns=SAMPLE_COLUMNS) # 保证列存在（如果 dataframe 为空也创建列）
#     return df_posneg

# # 生成弱负样本训练数据
# def build_weak_negative_samples(df_us, df_song, df_user, sample_k=SAMPLE_NEG_PER_USER):
#     """
#     为每个用户从未听过的歌曲中随机采样若干弱负样本。
#     这些弱负标为软标签WEAK_NEG_LABEL，权重较低。
#     """
#     rows = []
#     all_songs = set(df_song['song_id'].tolist())
#     users = df_us['user_id'].unique().tolist()

#     # 为那些在df_us中没有记录的用户，只对有记录的用户采样
#     for user_id in users:
#         heard = set(df_us[df_us['user_id'] == user_id]['song_id'].tolist())
#         candidates = list(all_songs - heard)
#         if not candidates:
#             continue
#         k = min(sample_k, len(candidates))
#         sampled = random.sample(candidates, k)

#         user_row = df_user[df_user['user_id'] == user_id]
#         user_info = user_row.iloc[0].to_dict() if not user_row.empty else {}

#         for song_id in sampled:
#             song_row = df_song[df_song['song_id'] == song_id]
#             song_info = song_row.iloc[0].to_dict() if not song_row.empty else {}

#             row = {
#                 'user_id': user_id,
#                 'song_id': song_id,
#                 'us_play_count': 0,
#                 'us_complete_count': 0,
#                 'us_skip_count': 0,
#                 'us_complete_ratio': 0.0,
#                 'us_avg_play_ratio': 0.0,
#                 'song_duration': song_info.get('song_duration', 0),
#                 'song_genre': song_info.get('genre', None),
#                 'song_language': song_info.get('language', None),
#                 'song_play_count': song_info.get('song_play_count', 0),
#                 'song_complete_rate': song_info.get('song_complete_rate', 0.0),
#                 'user_total_plays': user_info.get('user_total_plays', 0),
#                 'user_complete_rate': user_info.get('user_complete_rate', 0.0),
#                 'is_new_pair': 1,
#                 'y': WEAK_NEG_LABEL,
#                 'sample_weight': WEAK_NEG_WEIGHT
#             }
#             rows.append(row)

#     df_weakneg = pd.DataFrame(rows, columns=SAMPLE_COLUMNS)
#     if df_weakneg.empty:
#         df_weakneg = pd.DataFrame(columns=SAMPLE_COLUMNS)
#     return df_weakneg


# # 生成训练数据
# async def build_train_dataset(sample_k=5):
#     """
#     sample_k控制采样多少未听过歌曲
#     这样训练集会既有“已有历史的正/负”也有“未听过的弱负”，模型能学会基于 content+user 做判断
#     """
#     df_us = pd.DataFrame(await db_operations.Analytics.get_user_song_aggregation)
#     df_song = pd.DataFrame(await db_operations.Analytics.get_song_level_stats)
#     df_user = pd.DataFrame(await db_operations.Analytics.get_user_level_stats)
#     # df_user['user_complete_rate'] = df_user['user_total_complete'] / df_user['user_total_plays']

#     df_pos_neg = build_positive_strong_negative_data(df_us, df_song, df_user)
#     df_weak_neg = build_weak_negative_data(df_us, df_song, df_user, sample_k)
#     df_all = pd.concat([df_pos_neg, df_weak_neg], ignore_index=True) # 将df_pos_neg和df_weak_neg垂直堆叠，ignore_index重置行索引，避免索引重复

#     return df_all



# 强制类型及缺失值填充（示例）
    # df_all['us_play_count'] = df_all['us_play_count'].fillna(0).astype(int)
    # df_all['us_complete_count'] = df_all['us_complete_count'].fillna(0).astype(int)
    # df_all['us_skip_count'] = df_all['us_skip_count'].fillna(0).astype(int)
    # df_all['us_complete_ratio'] = df_all['us_complete_ratio'].fillna(0.0).astype(float)
    # df_all['us_avg_play_ratio'] = df_all['us_avg_play_ratio'].fillna(0.0).astype(float)
    # df_all['song_duration'] = df_all['song_duration'].fillna(0).astype(int)
    # df_all['song_play_count'] = df_all['song_play_count'].fillna(0).astype(int)
    # df_all['song_complete_rate'] = df_all['song_complete_rate'].fillna(0.0).astype(float)
    # df_all['user_total_plays'] = df_all['user_total_plays'].fillna(0).astype(int)
    # df_all['user_complete_rate'] = df_all['user_complete_rate'].fillna(0.0).astype(float)
    # df_all['is_new_pair'] = df_all['is_new_pair'].fillna(0).astype(int)
    # df_all['y'] = df_all['y'].fillna(0.0).astype(float)
    # df_all['sample_weight'] = df_all['sample_weight'].fillna(1.0).astype(float)


