import json, logging, random
import numpy as np
import pandas as pd

from db import db_operations
from decision import decision_tree

logger = logging.getLogger("discovery_functions")

async def get_popular_discovery_information():
    songs = await db_operations.Analytics.get_most_played_song()
    songs.sort(key=lambda x: x["position"])
    data = {
        'count': len(songs),
        'songs': songs
    }
    logger.info(f"热门推荐信息已提取[get_popular_discovery_information]")
    return data

async def get_popular_daily_information():
    data = None
    return data


class TrainData:
    POSITIVE_WEIGHT = 5.0   # 正权重
    STRONG_NEG_WEIGHT = 1.0 # 强负权重
    WEAK_NEG_WEIGHT = 0.5   # 弱负权重
    WEAK_NEG_LABEL = 0.01   # 弱负标签

    # 统一的列顺序
    SAMPLE_COLUMNS = [
        'user_id', 'song_id',
        'us_play_count', 'us_complete_count', 'us_skip_count', 'us_complete_ratio', 'us_avg_play_ratio',
        'song_duration', 'song_genre', 'song_language', 'song_play_count', 'song_complete_rate',
        'user_total_plays', 'user_complete_rate',
        'is_new_pair', 'y', 'sample_weight'
    ]

    # 生成正和强负样本训练数据
    @classmethod
    def build_positive_strong_negative_data(cls, df_us, df_song, df_user):
        rows = []

        for _, r in df_us.iterrows():
            us_play = r['us_play_count']
            us_complete = r['us_complete_count']
            us_skip = r['us_skip_count']

            us_complete_ratio = us_complete / us_play if us_play > 0 else 0
            is_positive = us_complete_ratio >= 0.6
            is_strong_negative = us_play >= 3 and us_complete_ratio <= 0.2

            if not (is_positive or is_strong_negative): continue  # 中间态样本可丢弃，减少噪声

            song = df_song[df_song['song_id'] == r['song_id']].iloc[0].to_dict()
            user = df_user[df_user['user_id'] == r['user_id']].iloc[0].to_dict()

            rows.append({
                'user_id': r['user_id'],
                'song_id': r['song_id'],
                'us_play_count': us_play,
                'us_complete_count': us_complete,
                'us_skip_count': us_skip,
                'us_complete_ratio': us_complete_ratio,
                'us_avg_play_ratio': r['us_avg_play_ratio'],
                'song_duration': song['song_duration'],
                'song_genre': song['genre'],
                'song_language': song['language'],
                'song_play_count': song['song_play_count'],
                'song_complete_rate': song['song_complete_rate'],
                'user_total_plays': user['user_total_plays'],
                'user_complete_rate': user['user_complete_rate'],
                'is_new_pair': 0,
                'y': 1 if is_positive else 0,
                'sample_weight': cls.POSITIVE_WEIGHT if is_positive else cls.STRONG_NEG_WEIGHT
            })

        return pd.DataFrame(rows)

    # 生成弱负样本训练数据
    @classmethod
    def build_weak_negative_data(cls, df_us, df_song, df_user, sample_k=5):
        """
        df_us: user-song聚合-正样本+强负
        df_song: 歌曲级信息-提供内容特征
        df_user: 用户级信息-提供偏好特征
        为每个用户采样若干未听过的歌曲，构造弱负样本
        """
        neg_rows = []
        grouped = df_us.groupby('user_id') # 按照user_id分组
        all_songs = set(df_song['song_id']) # 负采样为每个user抽取若干未听过的歌曲作为弱负（去重）

        for user_id, group in grouped:
            heard = set(group['song_id'])
            candidates = list(all_songs - heard) # 用户未听过的歌曲

            if not candidates:  continue

            k = min(sample_k, len(candidates))
            sampled = random.sample(candidates, k) # 随机提取k个未歌
            user_info = df_user[df_user['user_id'] == user_id] # 对应用户数据
            user_info = user_info.iloc[0].to_dict() if not user_info.empty else {} # 取第一条记录作为字典，同时处理空数据

            for song_id in sampled: # 用song-level+user-level填充交互特征为0
                song_info = df_song[df_song['song_id'] == song_id].iloc[0].to_dict() # 对应歌曲数据
                neg_rows.append({
                    'user_id': user_id,
                    'song_id': song_id,
                    'us_play_count': 0,
                    'us_complete_count': 0,
                    'us_skip_count': 0,
                    'us_complete_ratio': 0.0,
                    'us_avg_play_ratio': 0,
                    'song_duration': song_info['song_duration'],
                    'song_genre': song_info['genre'],
                    'song_language': song_info['language'],
                    'song_play_count': song_info['song_play_count'],
                    'song_complete_rate': song_info['song_complete_rate'],
                    'user_total_plays': user_info.get('user_total_plays', 0),
                    'user_complete_rate': user_info.get('user_complete_rate', 0),
                    'is_new_pair': 1,
                    'y': cls.WEAK_NEG_LABEL,
                    'sample_weight': cls.WEAK_NEG_WEIGHT
                }) # 构造弱负数据

    # 生成训练数据
    @classmethod
    async def build_train_data(cls, sample_k=5):
        """
        sample_k控制采样多少未听过歌曲
        这样训练集会既有已有历史的正/负也有未听过的弱负，模型能学会基于content+user做判断
        """
        df_us = pd.DataFrame(await db_operations.Analytics.get_user_song_aggregation)
        df_song = pd.DataFrame(await db_operations.Analytics.get_song_level_stats)
        df_user = pd.DataFrame(await db_operations.Analytics.get_user_level_stats)
        # df_user['user_complete_rate'] = df_user['user_total_complete'] / df_user['user_total_plays']

        df_pos_neg = cls.build_positive_strong_negative_data(df_us, df_song, df_user)
        df_weak_neg = cls.build_weak_negative_data(df_us, df_song, df_user, sample_k)
        df_all = pd.concat([df_pos_neg, df_weak_neg], ignore_index=True, sort=False) # 将df_pos_neg和df_weak_neg垂直堆叠，ignore_index重置行索引，避免索引重复

        # 确保所有列存在，按 schema 填充默认值
        for col in cls.SAMPLE_COLUMNS:
            if col not in df_all.columns:
                df_all[col] = 0 if 'count' in col or 'duration' in col or 'weight' in col else 0.0

        train_data = df_all[cls.SAMPLE_COLUMNS]



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run()


