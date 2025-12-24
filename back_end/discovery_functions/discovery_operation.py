import json, logging, random, os
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
    POSITIVE_WEIGHT = 2.0 # 正权重
    STRONG_NEG_WEIGHT = 4.0 # 强负权重
    SAMPLE_WEIGH = 0.8 # 默认/模糊权重
    WEAK_NEG_WEIGHT = 0.4 # 弱负权重
    WEAK_NEG_LABEL = 0.1 # 弱负标签

    # 统一的列顺序
    SAMPLE_COLUMNS = [
        'user_id', 'song_id',
        'us_play_count', 'us_complete_count', 'us_skip_count', 'us_complete_ratio', 'us_avg_play_ratio',
        'song_duration', 'song_genre', 'song_language', 'song_play_count', 'song_complete_rate',
        'user_total_plays', 'user_complete_rate',
        'is_new_pair', 'y', 'sample_weight'
    ]


    # 垂直堆叠并随机排序
    @classmethod
    def concat_shuffled_data(cls, df_pos_neg, df_weak_neg):
        df_all = pd.concat([df_pos_neg, df_weak_neg], ignore_index=True, sort=False) # 将df_pos_neg和df_weak_neg垂直堆叠，ignore_index重置行索引
        shuffled_index = np.random.permutation(df_all.index)
        result = df_all.iloc[shuffled_index].reset_index(drop=True)

        # 确保所有列存在，按 schema 填充默认值
        for col in cls.SAMPLE_COLUMNS:
            if col not in result.columns:
                result[col] = 0.0

        return result
    
    @classmethod
    def save_data(cls, data, file_path):
        data.to_csv(file_path, index=False, encoding='utf-8-sig')

    # 将分类特征转化为数字，动态生成字典
    @classmethod
    def transform_and_save_mappings(cls, df_data, columns_to_encode, mapping_file="discovery_functions/feature_mappings.txt"):
        df = df_data.copy() 

        if os.path.exists(mapping_file):
            with open(mapping_file, 'r', encoding='utf-8') as f:
                all_mappings = json.load(f)
            logging.info(f"已读取字典")
        else:
            all_mappings = {}
            logging.info(f"未检测到字典")

        for col in columns_to_encode:
            current_map = all_mappings.get(col, {}) # 获取该列已有的映射
            existing_values = set(current_map.keys()) # 已有映射
            current_values = set(df[col].unique())
            new_values = sorted(list(current_values - existing_values))

            # 如果有新类别，按序分配新ID
            if new_values:
                start_id = max(current_map.values()) + 1 if current_map else 0 # 从当前最大ID之后开始编号
                for i, val in enumerate(new_values):
                    current_map[val] = start_id + i
            
            all_mappings[col] = current_map
            df[col] = df[col].map(current_map).astype(int) # 应用映射

        # 将更新后的字典写回文件
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(all_mappings, f, ensure_ascii=False, indent=4)
        
        logging.info("映射完成")
        return df
    
    # 将DataFrame转换为NumPy训练数组
    @classmethod
    def prepare_training_arrays(cls, train_data, X_columns, Y_column):
        X_train = train_data[X_columns].values # 提取特征矩阵
        Y_train = train_data[Y_column].values # 提取标签向量
        sample_weights = train_data['sample_weight'].values # 提取样本权重
        
        return X_train, Y_train, sample_weights


    # 生成正和强负样本训练数据
    @classmethod
    def build_positive_strong_negative_data(cls, df_us, df_song, df_user):
        # 将df_us与df_song, df_user合并
        df_song_new = df_song.drop(columns=['song_duration', 'song_genre', 'song_language'])
        df = df_us.merge(df_song_new, on='song_id', how='left')
        df = df.merge(df_user, on='user_id', how='left')
        # df.to_csv('df.csv', index=False, encoding='utf-8-sig')

        us_complete_ratio = df['us_complete_count'] / df['us_play_count'] # 向量化计算标签
        df['us_complete_ratio'] = us_complete_ratio.fillna(0) # 填充空值
        
        # 定义正样本和强负样本y条件
        is_positive = df['us_complete_ratio'] >= 0.6
        is_strong_negative = (
            ((df['us_play_count'] >= 3) & (df['us_complete_ratio'] <= 0.3)) | 
            ((df['us_play_count'] <= 2) & (df['us_complete_ratio'] <= 0.05))
        )

        # 计算模糊分y, 标签平滑 
        df['y'] = df['us_complete_ratio'].clip(0, 1) # 基础分
        df.loc[is_positive, 'y'] = 0.7 + (df['us_complete_ratio'] * 0.3) # 0.7~1.0
        df.loc[is_strong_negative, 'y'] = df['us_complete_ratio'] * 0.2 # 0~0.1
        df.loc[~ (is_positive | is_strong_negative), 'y'] = df['us_complete_ratio'] * 0.6
        df['y'] = df['y'] * (1 - 1 / (df['us_avg_play_ratio'] + 0.5))

        # 最终权重处理
        df['sample_weight'] = cls.SAMPLE_WEIGH
        df.loc[is_positive, 'sample_weight'] = cls.POSITIVE_WEIGHT
        df.loc[is_strong_negative, 'sample_weight'] = cls.STRONG_NEG_WEIGHT

        df['is_new_pair'] = 0

        # 重命名列名
        result_df = df.rename(columns={
            'genre': 'song_genre',
            'language': 'song_language'
        })

        return result_df

    
    # 生成弱负样本训练数据
    @classmethod
    def build_weak_negative_data(cls, df_us, df_song, df_user, sample_k):
        neg_rows = []
        # 构建ID到特征的快速映射字典
        user_feature_map = df_user.set_index('user_id').to_dict('index')
        song_feature_map = df_song.set_index('song_id').to_dict('index')
        all_songs = set(df_song['song_id']) # 去重，总结出所有歌曲
        
        user_heard_dict = df_us.groupby('user_id')['song_id'].apply(set).to_dict() # 按用户分组，获取每个用户听过的歌

        # 负采样循环
        for user_id, heard_songs in user_heard_dict.items():
            candidates = list(all_songs - heard_songs) # 用户未听过的歌曲
            if not candidates: continue
            k = min(sample_k, len(candidates))
            sampled_ids = random.sample(candidates, k)

            user_info = user_feature_map.get(user_id, {}) # 获取对应用户数据

            for s_id in sampled_ids:
                song_info = song_feature_map.get(s_id, {}) # 获取对应歌曲统计数据

                song_complete_rate = song_info.get('song_complete_rate', 0.0)
                base_y = cls.WEAK_NEG_LABEL + (song_complete_rate * 0.05)
                
                # 构造弱负样本行
                neg_rows.append({
                    'user_id': user_id,
                    'song_id': s_id,
                    'us_play_count': 0,
                    'us_complete_count': 0,
                    'us_skip_count': 0,
                    'us_complete_ratio': 0.0,
                    'us_avg_play_ratio': 0.0,
                    'song_duration': song_info.get('song_duration', 0),
                    'song_genre': song_info.get('song_genre', 'unknown'),
                    'song_language': song_info.get('song_language', 'unknown'),
                    'song_play_count': song_info.get('song_play_count', 0),
                    'song_complete_rate': song_complete_rate,
                    'user_total_plays': user_info.get('user_total_plays', 0),
                    'user_complete_rate': user_info.get('user_complete_rate', 0.0),
                    'is_new_pair': 1,
                    'y': base_y,
                    'sample_weight': cls.WEAK_NEG_WEIGHT
                })# 构造弱负数据

        return pd.DataFrame(neg_rows)


    # 生成训练数据
    @classmethod
    async def build_train_data(cls, sample_k=3):
        """
        sample_k控制采样多少未听过歌曲
        这样训练集会既有已有历史的正/负也有未听过的弱负，模型能学会基于content+user做判断
        """
        columns_us = ['user_id', 'song_id', 'us_play_count', 'us_complete_count', 'us_skip_count', 'us_avg_play_ratio', 'last_played', 'song_duration', 'genre', 'language']
        df_us = await db_operations.Analytics.get_user_song_aggregation()
        df_us = pd.DataFrame(df_us, columns=columns_us)

        columns_song = ['song_id', 'song_duration', 'song_genre', 'song_language', 'song_play_count', 'song_complete_rate']
        df_song = await db_operations.Analytics.get_song_level_stats()
        df_song = pd.DataFrame(df_song, columns=columns_song)

        columns_user = ['user_id', 'user_total_plays', 'user_total_complete', 'user_complete_rate']
        df_user = await db_operations.Analytics.get_user_level_stats()
        df_user = pd.DataFrame(df_user, columns=columns_user)
        # df_user['user_complete_rate'] = df_user['user_total_complete'] / df_user['user_total_plays']

        df_pos_neg = cls.build_positive_strong_negative_data(df_us, df_song, df_user)
        df_weak_neg = cls.build_weak_negative_data(df_us, df_song, df_user, sample_k)

        df_all = cls.concat_shuffled_data(df_pos_neg, df_weak_neg)

        train_data = df_all[cls.SAMPLE_COLUMNS]
        last_train_data = cls.transform_and_save_mappings(train_data, ['song_genre', 'song_language'])
        cls.save_data(last_train_data, "discovery_functions/train_data.csv")

        X_columns = ['song_genre', 'song_language', 'song_duration', 'song_play_count', 'song_complete_rate', 'user_total_plays', 'user_complete_rate', 'is_new_pair']
        Y_column = 'y'
        X_train, Y_train, W_train = cls.prepare_training_arrays(last_train_data, X_columns, Y_column)
        return X_train, Y_train, W_train


async def test():
    X_train, Y_train, W_train = await TrainData.build_train_data()
    tree = decision_tree.Decision_Tree(MIN_SAMPLES_SPLIT=25, MIN_SAMPLES_LEAF=10)
    tree.fit(X_train, Y_train, W_train)
    tree.print_tree()



if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(test())


