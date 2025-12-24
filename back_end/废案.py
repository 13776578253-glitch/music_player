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
#     @classmethod
#     def build_positive_strong_negative_data(cls, df_us, df_song, df_user):
#         rows = []

#         for _, r in df_us.iterrows():
#             us_play = r['us_play_count']
#             us_complete = r['us_complete_count']
#             us_skip = r['us_skip_count']

#             us_complete_ratio = us_complete / us_play if us_play > 0 else 0
#             is_positive = us_complete_ratio >= 0.6
#             is_strong_negative = us_play >= 3 and us_complete_ratio <= 0.2

#             if not (is_positive or is_strong_negative): continue  # 中间态样本可丢弃，减少噪声
#             # print(df_song)
#             # print(r)

#             song = df_song[(df_song['song_id']) == int(r['song_id'])].iloc[0].to_dict()
#             user = df_user[(df_user['user_id']) == int(r['user_id'])].iloc[0].to_dict()
#             print(song, user)

#             rows.append({
#                 'user_id': r['user_id'],
#                 'song_id': r['song_id'],
#                 'us_play_count': us_play,
#                 'us_complete_count': us_complete,
#                 'us_skip_count': us_skip,
#                 'us_complete_ratio': us_complete_ratio,
#                 'us_avg_play_ratio': r['us_avg_play_ratio'],
#                 'song_duration': song['song_duration'],
#                 'song_genre': song['genre'],
#                 'song_language': song['language'],
#                 'song_play_count': song['song_play_count'],
#                 'song_complete_rate': song['song_complete_rate'],
#                 'user_total_plays': user['user_total_plays'],
#                 'user_complete_rate': user['user_complete_rate'],
#                 'is_new_pair': 0,
#                 'y': 1 if is_positive else 0,
#                 'sample_weight': cls.POSITIVE_WEIGHT if is_positive else cls.STRONG_NEG_WEIGHT
#             })

#         return pd.DataFrame(rows)

#     # 生成弱负样本训练数据
#     @classmethod
#     def build_weak_negative_data(cls, df_us, df_song, df_user, sample_k=5):
#         """
#         df_us: user-song聚合-正样本+强负
#         df_song: 歌曲级信息-提供内容特征
#         df_user: 用户级信息-提供偏好特征
#         为每个用户采样若干未听过的歌曲，构造弱负样本
#         """
#         neg_rows = []
#         grouped = df_us.groupby('user_id') # 按照user_id分组
#         all_songs = set(df_song['song_id']) # 负采样为每个user抽取若干未听过的歌曲作为弱负（去重）

#         for user_id, group in grouped:
#             heard = set(group['song_id'])
#             candidates = list(all_songs - heard) # 用户未听过的歌曲

#             if not candidates:  continue

#             k = min(sample_k, len(candidates))
#             sampled = random.sample(candidates, k) # 随机提取k个未歌
#             user = df_user[df_user['user_id'] == user_id] # 对应用户数据
#             user = user.iloc[0].to_dict() if not user.empty else {} # 取第一条记录作为字典，同时处理空数据

#             for song_id in sampled: # 用song-level+user-level填充交互特征为0
#                 song = df_song[df_song['song_id'] == song_id].iloc[0].to_dict() # 对应歌曲数据
#                 neg_rows.append({
#                     'user_id': user_id,
#                     'song_id': song_id,
#                     'us_play_count': 0,
#                     'us_complete_count': 0,
#                     'us_skip_count': 0,
#                     'us_complete_ratio': 0.0,
#                     'us_avg_play_ratio': 0,
#                     'song_duration': song['song_duration'],
#                     'song_genre': song['genre'],
#                     'song_language': song['language'],
#                     'song_play_count': song['song_play_count'],
#                     'song_complete_rate': song['song_complete_rate'],
#                     'user_total_plays': user.get('user_total_plays', 0),
#                     'user_complete_rate': user.get('user_complete_rate', 0),
#                     'is_new_pair': 1,
#                     'y': cls.WEAK_NEG_LABEL,
#                     'sample_weight': cls.WEAK_NEG_WEIGHT
#                 }) # 构造弱负数据

#     # 生成训练数据
#     @classmethod
#     async def build_train_data(cls, sample_k=5):
#         """
#         sample_k控制采样多少未听过歌曲
#         这样训练集会既有已有历史的正/负也有未听过的弱负，模型能学会基于content+user做判断
#         """
#         columns_us = ['user_id', 'song_id', 'us_play_count', 'us_complete_count', 'us_skip_count', 'us_avg_play_ratio', 'last_played', 'song_duration', 'genre', 'language']
#         df_us = await db_operations.Analytics.get_user_song_aggregation()
#         df_us = pd.DataFrame(df_us, columns=columns_us)

#         columns_song = ['song_id', 'song_play_count', 'song_complete_rate']
#         df_song = await db_operations.Analytics.get_song_level_stats()
#         df_song = pd.DataFrame(df_song, columns=columns_song)

#         columns_user = ['user_id', 'user_total_plays', 'user_total_complete', 'user_complete_rate']
#         df_user = await db_operations.Analytics.get_user_level_stats()
#         df_user = pd.DataFrame(df_user, columns=columns_user)
#         # df_user['user_complete_rate'] = df_user['user_total_complete'] / df_user['user_total_plays']

#         df_pos_neg = cls.build_positive_strong_negative_data(df_us, df_song, df_user)
#         df_weak_neg = cls.build_weak_negative_data(df_us, df_song, df_user, sample_k)
#         df_all = pd.concat([df_pos_neg, df_weak_neg], ignore_index=True, sort=False) # 将df_pos_neg和df_weak_neg垂直堆叠，ignore_index重置行索引，避免索引重复

#         # 确保所有列存在，按 schema 填充默认值
#         for col in cls.SAMPLE_COLUMNS:
#             if col not in df_all.columns:
#                 df_all[col] = 0 if 'count' in col or 'duration' in col or 'weight' in col else 0.0

#         train_data = df_all[cls.SAMPLE_COLUMNS]
#         print(train_data)




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



# # 生成正和强负样本训练数据
#     @classmethod
#     def build_positive_strong_negative_data(cls, df_us, df_song, df_user):
#         df_song_new = df_song.drop(columns=['song_duration', 'song_genre', 'song_language'])
#         # 将df_us与df_song, df_user合并
#         df = df_us.merge(df_song_new, on='song_id', how='left')
#         df = df.merge(df_user, on='user_id', how='left')
#         # df.to_csv('df.csv', index=False, encoding='utf-8-sig')

#         us_complete_ratio = df['us_complete_count'] / df['us_play_count'] # 向量化计算标签
#         df['us_complete_ratio'] = us_complete_ratio.fillna(0) # 填充空值
        
#         # 定义正样本和强负样本条件
#         is_positive = df['us_complete_ratio'] >= 0.6
#         is_strong_negative = (df['us_play_count'] >= 3) & (df['us_complete_ratio'] <= 0.2)
        
#         df = df[is_positive | is_strong_negative].copy() # 筛选有效样本

#         # 构造输出列
#         df['y'] = is_positive.astype(int)
#         df['sample_weight'] = df['y'].apply(lambda x: cls.POSITIVE_WEIGHT if x == 1 else cls.STRONG_NEG_WEIGHT)
#         df['is_new_pair'] = 0

#         # 重命名列名
#         result_df = df.rename(columns={
#             'genre': 'song_genre',
#             'language': 'song_language'
#         })

#         return result_df

    
#     # 生成弱负样本训练数据
#     @classmethod
#     def build_weak_negative_data(cls, df_us, df_song, df_user, sample_k):
#         neg_rows = []
#         # 构建ID到特征的快速映射字典
#         user_feature_map = df_user.set_index('user_id').to_dict('index')
#         song_feature_map = df_song.set_index('song_id').to_dict('index')
#         all_songs = set(df_song['song_id']) # 去重，总结出所有歌曲
        
#         user_heard_dict = df_us.groupby('user_id')['song_id'].apply(set).to_dict() # 按用户分组，获取每个用户听过的歌

#         # 负采样循环
#         for user_id, heard_songs in user_heard_dict.items():
#             candidates = list(all_songs - heard_songs) # 用户未听过的歌曲
#             if not candidates: continue
#             k = min(sample_k, len(candidates))
#             sampled_ids = random.sample(candidates, k)

#             user_info = user_feature_map.get(user_id, {}) # 获取对应用户数据

#             for s_id in sampled_ids:
#                 song_info = song_feature_map.get(s_id, {}) # 获取对应歌曲统计数据
                
#                 # 构造弱负样本行
#                 neg_rows.append({
#                     'user_id': user_id,
#                     'song_id': s_id,
#                     'us_play_count': 0,
#                     'us_complete_count': 0,
#                     'us_skip_count': 0,
#                     'us_complete_ratio': 0.0,
#                     'us_avg_play_ratio': 0.0,
#                     'song_duration': song_info.get('song_duration', 0),
#                     'song_genre': song_info.get('song_genre', 'unknown'),
#                     'song_language': song_info.get('song_language', 'unknown'),
#                     'song_play_count': song_info.get('song_play_count', 0),
#                     'song_complete_rate': song_info.get('song_complete_rate', 0.0),
#                     'user_total_plays': user_info.get('user_total_plays', 0),
#                     'user_complete_rate': user_info.get('user_complete_rate', 0.0),
#                     'is_new_pair': 1,
#                     'y': cls.WEAK_NEG_LABEL,
#                     'sample_weight': cls.WEAK_NEG_WEIGHT
#                 })# 构造弱负数据

#         return pd.DataFrame(neg_rows)
    


# # 生成正和强负样本训练数据
#     @classmethod
#     def build_positive_strong_negative_data(cls, df_us, df_song, df_user):
#         df_song_new = df_song.drop(columns=['song_duration', 'song_genre', 'song_language'])
#         # 将df_us与df_song, df_user合并
#         df = df_us.merge(df_song_new, on='song_id', how='left')
#         df = df.merge(df_user, on='user_id', how='left')
#         # df.to_csv('df.csv', index=False, encoding='utf-8-sig')

#         us_complete_ratio = df['us_complete_count'] / df['us_play_count'] # 向量化计算标签
#         df['us_complete_ratio'] = us_complete_ratio.fillna(0) # 填充空值
        
#         # 定义正样本和强负样本y条件
#         is_positive = df['us_complete_ratio'] >= 0.6 # 完播率>=60%
#         is_strong_negative = (df['us_play_count'] >= 3) & (df['us_complete_ratio'] <= 0.3)
#         df = df[is_positive | is_strong_negative].copy() # 筛选有效样本

#         # 标签平滑
#         df['y'] = df['us_complete_ratio'].clip(0, 1) # 限制在 0-1 之间
#         df.loc[is_positive, 'y'] = 0.8 + (df['us_complete_ratio'] * 0.2) # 分数区间在0.8~1
#         df.loc[is_strong_negative, 'y'] = df['us_complete_ratio'] * 0.5 # 分数区间在0~0.1
#         df['y'] = df['y'] * (1 - 1 / (df['us_avg_play_ratio'] + 1)) # 通过播放次数修正

#         df['sample_weight'] = df['y'].apply(lambda x: cls.POSITIVE_WEIGHT if x >= 0.6 else cls.STRONG_NEG_WEIGHT)
#         df['is_new_pair'] = 0

#         # 重命名列名
#         result_df = df.rename(columns={
#             'genre': 'song_genre',
#             'language': 'song_language'
#         })

#         return result_df





