import logging, pickle
from difflib import SequenceMatcher
from fastapi import HTTPException

from decision import avl_tree
from db import db_operations

logger = logging.getLogger("basic_functions[se]")

def merge_two_lists(list_a, list_b):
    """
    合并两个可能为 None 的列表，生成最多10个元素的新列表
    规则：优先各取5个，不足则用另一个列表的元素填充
    """
    # 步骤1：容错预处理，将 None 转为空列表，确保后续操作安全
    valid_a = list_a if (isinstance(list_a, list) and list_a is not None) else []
    valid_b = list_b if (isinstance(list_b, list) and list_b is not None) else []
    
    # 步骤2：分别截取两个列表的前5个元素（不足5个则取全部）
    take_a = valid_a[:5]  # 从列表a取前5个
    take_b = valid_b[:5]  # 从列表b取前5个
    
    # 步骤3：合并前5个元素，得到初步结果（长度最多10，可能不足）
    merged_preliminary = take_a + take_b
    
    # 步骤4：若初步合并结果不足10个，用剩余元素补全（优先补全较长的列表剩余部分）
    if len(merged_preliminary) < 10:
        # 提取两个列表超出前5的剩余元素
        remaining_a = valid_a[5:]  # a列表第6个及以后的元素
        remaining_b = valid_b[5:]  # b列表第6个及以后的元素
        
        # 合并剩余元素，用于补全
        remaining_all = remaining_a + remaining_b
        
        # 补全至10个元素（取需要的数量，避免超出）
        need = 10 - len(merged_preliminary)
        merged_preliminary.extend(remaining_all[:need])
    
    # 步骤5：最终截取前10个元素，确保不超过10个（防止极端情况溢出）
    final_result = merged_preliminary[:10]
    
    return final_result

# 模糊搜索
async def get_searh_information(content, user_id):
    result = TreeOperation.search_avl_tree(content)
    if not result: return False

    for i in result['artists']:
        i['title'] = i['title'] + '-' + i['artist']

    data = {
        'songs': merge_two_lists(result['songs'], result['artists'])
    }

    logger.info(f"搜索信息已提取[get_searh_information]")
    return data



class TreeOperation:
    # 序列化决策树
    @classmethod
    def to_blob(cls, tree):
        model_blob = pickle.dumps(tree)
        return model_blob
    
    # 训练avl树并存储
    @classmethod
    async def train_avl_tree(cls):
        song_tree_id, artist_tree_id = 2, 3
        songs = await db_operations.SongTable.get_songs_column()

        song_tree = avl_tree.AVLTree()
        artist_tree = avl_tree.AVLTree()

        for song_id, title, artist in songs:
            song_tree.insert(title, song_id)
            for name in artist:
                artist_tree.insert(name, song_id)

        blob_song_tree = cls.to_blob(song_tree)
        blob_artist_tree = cls.to_blob(artist_tree)

        await db_operations.ModelTable.save_model(song_tree_id, 'avl_tree_song', blob_song_tree)
        logger.info("已训练歌曲avl树并存储")
        await db_operations.ModelTable.save_model(artist_tree_id, 'avl_tree_artist', blob_artist_tree)
        logger.info("已训练歌手avl树并存储")

    # 反序列化决策树
    @classmethod
    def blob_return(cls, data):
        tree = pickle.loads(data)
        return tree
    
    # 判断相似度并排序
    @classmethod
    def similarity_sort(cls, content, data):
        if not data: return None, None

        for d in data:
            d['ratio'] = SequenceMatcher(None, content, d['key']).ratio() # 判断相似度

        sorted_data = sorted(data, key=lambda x: x['ratio'], reverse=True)
        max_ratio = sorted_data[0]['ratio'] # 最大相似度
        id_list = [d['ids'] for d in sorted_data]
        # unique_list = list(dict.fromkeys(id_list)) # 一维化并去重
        
        # 遍历每个子列表，筛选无重复元素
        seen_elems = set()
        unique_list = []
        for sub_lst in id_list:
            unique_sub_lst = [elem for elem in sub_lst if elem not in seen_elems] # 筛选当前子列表中未出现过的元素
            unique_list.append(unique_sub_lst)
            seen_elems.update(unique_sub_lst)

        return unique_list, max_ratio
    
    # 判断热度并排序
    @classmethod
    async def popularity_sort(cls, data_list):
        if not data_list: return None

        result = []
        for data in data_list:
            song_data = await db_operations.Analytics.order_song_by_count(data)
            result.extend(song_data)

        return result[:10]
    
    # 搜索数据
    @classmethod
    async def search_avl_tree(cls, content):
        song_tree_data = await db_operations.ModelTable.get_model_by_id(2) 
        artist_tree_data = await db_operations.ModelTable.get_model_by_id(3)
        song_tree_model = cls.blob_return(song_tree_data['model_data'])
        artist_tree_model = cls.blob_return(artist_tree_data['model_data'])

        if song_tree_model is None or artist_tree_model is None:
            logger.error("未找到avl树数据")
            raise HTTPException(status_code=400, detail='未找到数据')
        
        songs = song_tree_model.content_search(content, limit=7)
        artists = artist_tree_model.content_search(content, limit=3)

        if songs == [] and artists == []:
            logger.warning("未找到搜索数据")
            return False
        
        sorted_songs_list, max_ratio1 = cls.similarity_sort(content, songs)
        sorted_artists_list, max_ratio2 = cls.similarity_sort(content, artists)

        popular_songs_list = await cls.popularity_sort(sorted_songs_list)
        popular_artists_list = await cls.popularity_sort(sorted_artists_list)

        result = {
            'songs': popular_songs_list,
            'artists': popular_artists_list
        }
        # print(result)
        return result # 1.songs显示歌名+歌手 2.点开artists:此功能未开放 3.匹配主要是歌曲/歌手(startswith) 4.artists歌手+歌名 5.按热度排序
    


if __name__ == "__main__":
    import tracemalloc
    tracemalloc.start()
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(TreeOperation.search_avl_tree('理'))
