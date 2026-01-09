import numpy as np

from decision.decision_tree import Decision_Tree, Tree_node
from decision.avl_tree import AVLTree, TreeNode



def decision_test1():
    X_train = np.array([[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 1], [2, 2]])
    Y_train = np.array([0, 0, 1, 1, 1, 0, 1])
    W_train = np.array([1, 1, 1, 1, 1, 1, 1])
    a = Decision_Tree(MIN_SAMPLES_SPLIT=1, MIN_SAMPLES_LEAF=1)
    a.fit(X_train, Y_train, W_train)
    a.print_tree()

    new_samples = np.array([[1, 1], [0, 1], [2, 0]])
    a.predict(new_samples)

class SearchEngine:
    def __init__(self):
        self.title_root = None
        self.artist_root = None
        self.tree_manager = AVLTree()

    def add_song(self, song_id, title, artist):
        self.title_root = self.tree_manager.insert_recursive(self.title_root, title, song_id)
        
        for name in artist:
            self.artist_root = self.tree_manager.insert_recursive(self.artist_root, name, song_id)

    def suggest(self, query):
        if not query: return []
        
        song_res = []
        artist_res = []
        
        # 分别从两棵树搜前缀
        self.tree_manager.content_search_recursive(self.title_root, query, song_res, limit=5)
        self.tree_manager.content_search_recursive(self.artist_root, query, artist_res, limit=3)
        
        return {
            "songs": song_res,
            "artists": artist_res
        }

class AVLtest:
    @classmethod
    def test_dual_tree_engine(cls):
        engine = SearchEngine()
        
        # --- 构造双树混合数据 (歌手字段现在是 List) ---
        test_data = [
            (1, "晴天", ["周杰伦"]),
            (2, "千里之外", ["周杰伦", "费玉清"]), # 多作者列表
            (3, "周杰伦", ["同名曲作者"]),         # 歌名也叫“周杰伦”
            (4, "一剪梅", ["费玉清"]),
            (5, "周杰", ["新歌手"])               # 用于测试前缀
        ]
        
        for s_id, title, artists in test_data:
            engine.add_song(s_id, title, artists)

        print("--- 开始双树逻辑深度测试 (列表数据源版) ---\n")

        # 1. 测试：双向命中 (输入“周杰伦”)
        # 预期：歌手树命中“周杰伦”，歌名树命中歌曲《周杰伦》
        res = engine.suggest("周杰伦")
        
        has_artist = any(a['key'] == "周杰伦" for a in res['artists'])
        has_song = any(s['key'] == "周杰伦" for s in res['songs'])
        
        assert has_artist, "❌ 错误：歌手树未识别到列表中的'周杰伦'"
        assert has_song, "❌ 错误：歌名树未识别到同名歌曲'周杰伦'"
        print("✅ 测试 1 通过：成功从双树中分别提取出同名歌手与歌曲。")

        # 2. 测试：多作者拆分识别
        # 输入“费玉清”，应该能搜到他独立唱的《一剪梅》和合唱的《千里之外》
        res_fei = engine.suggest("费玉清")
        fei_node = next(a for a in res_fei['artists'] if a['key'] == "费玉清")
        
        assert 2 in fei_node['ids'], "❌ 错误：通过列表第二个作者找不到合唱歌曲 ID:2"
        assert 4 in fei_node['ids'], "❌ 错误：找不到该作者的独立歌曲 ID:4"
        print("✅ 测试 2 通过：列表中的多个作者已分别建立独立索引。")

        # 3. 测试：前缀跨树联想
        # 输入“周”，应该能联想到歌手“周杰伦”和歌曲“周杰伦”
        res_prefix = engine.suggest("周")
        
        artist_keys = [a['key'] for a in res_prefix['artists']]
        song_keys = [s['key'] for s in res_prefix['songs']]
        
        assert "周杰伦" in artist_keys, "❌ 错误：歌手前缀联想失败"
        assert "周杰伦" in song_keys, "❌ 错误：歌名前缀联想失败"
        print("✅ 测试 3 通过：前缀搜索在双树中表现一致。")

        # 4. 测试：独立 Limit 约束
        # 批量插入数据，测试 songs 和 artists 的结果数是否独立受控
        for i in range(100, 120):
            engine.add_song(i, f"测试歌_{i}", ["测试歌手"])
        
        res_limit = engine.suggest("测试")
        # 假设 suggest 内部 limit 设为 songs:10, artists:10 (根据你代码实际设定)
        assert len(res_limit['songs']) <= 10, "❌ 歌名树结果数溢出"
        assert len(res_limit['artists']) <= 10, "❌ 歌手树结果数溢出"
        print("✅ 测试 4 通过：双树结果集独立截断，互不干扰。")

        print("\n[最终结论]: 适配列表数据源的双树架构测试通过，逻辑完美！")

    @classmethod
    def test_list_source(cls):
        engine = SearchEngine()
        
        # --- 测试数据：作者以列表形式提供 ---
        # ID 88 有两个作者，ID 1 有一个作者
        engine.add_song(88, "千里之外", ["周杰伦", "费玉清"])
        engine.add_song(1, "晴天", ["周杰伦"])
        engine.add_song(99, "一剪梅", ["费玉清"])

        print("--- 开始列表数据源测试 ---")

        # 1. 测试从第一个作者搜索
        res_jay = engine.suggest("周杰伦")
        # 找到歌手名为“周杰伦”的节点
        jay_node = next((a for a in res_jay['artists'] if a['key'] == "周杰伦"), None)
        
        assert jay_node is not None, "❌ 错误：未能找到歌手'周杰伦'"
        assert 88 in jay_node['ids'] and 1 in jay_node['ids'], "❌ 错误：周杰伦节点 ID 关联不全"
        print("✅ 测试 1 通过：主作者关联了多首歌曲（含合唱）。")

        # 2. 测试从第二个作者搜索 (关键：验证列表拆分索引)
        res_fei = engine.suggest("费玉清")
        fei_node = next((a for a in res_fei['artists'] if a['key'] == "费玉清"), None)
        
        assert fei_node is not None, "❌ 错误：未能找到歌手'费玉清'"
        assert 88 in fei_node['ids'] and 99 in fei_node['ids'], "❌ 错误：费玉清节点 ID 关联不全"
        print("✅ 测试 2 通过：协作作者（列表第二个元素）索引成功。")

        # 3. 测试前缀联想
        res_prefix = engine.suggest("费")
        assert any(a['key'] == "费玉清" for a in res_prefix['artists']), "❌ 错误：前缀'费'无法联想到'费玉清'"
        print("✅ 测试 3 通过：列表中的所有作者均支持前缀联想。")

        print("\n[结果]: 基于列表数据源的 AVL 多索引逻辑测试全部通过！")


import time
import random
import string

# 假设你的代码保存在 avl_module.py 中，或者直接贴在上面
# from avl_module import AVLTree

def generate_random_string(length=5):
    """生成随机字符串作为 key"""
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def run_performance_test():
    sizes = [100, 1000, 5000, 10000, 20000] # 测试的数据规模
    print(f"{'数据量':<10} | {'插入总耗时(s)':<15} | {'单次插入耗时(ms)':<15} | {'平均树高':<10} | {'查询耗时(ms)':<10}")
    print("-" * 80)

    for n in sizes:
        tree = AVLTree()
        keys = [generate_random_string() for _ in range(n)]
        
        # 1. 测试插入性能
        start_time = time.perf_counter()
        for i in range(n):
            tree.insert(keys[i], i)
        end_time = time.perf_counter()
        
        total_insert_time = end_time - start_time
        avg_insert_time = (total_insert_time / n) * 1000 # 换算成毫秒
        
        # 2. 获取树的高度
        tree_height = tree.get_height(tree.root)
        
        # 3. 测试查询性能 (随机查询 1000 次)
        search_keys = [random.choice(keys) for _ in range(1000)]
        start_time = time.perf_counter()
        for k in search_keys:
            tree.content_search(k[:2], limit=5) # 模拟前缀搜索
        end_time = time.perf_counter()
        
        avg_search_time = ((end_time - start_time) / 1000) * 1000
        
        print(f"{n:<10} | {total_insert_time:<15.4f} | {avg_insert_time:<15.6f} | {tree_height:<10} | {avg_search_time:<10.6f}")

# def verify_avl_property(node):
#     """递归检查每一棵子树是否符合 AVL 平衡性质"""
#     if not node:
#         return True
    
#     balance = abs(tree.get_balance(node))
#     if balance > 1:
#         return False
    
#     return verify_avl_property(node.left) and verify_avl_property(node.right)

def avl_test2():
    # 执行性能测试
    print("=== AVL 树性能测试报告 ===")
    run_performance_test()
    
    # 验证正确性测试
    print("\n=== 平衡性验证 ===")
    test_tree = AVLTree()
    for i in range(1000):
        test_tree.insert(generate_random_string(), i)
    
    # 这里需要微调：在类外部调用逻辑
    def get_bal(node):
        if not node: return 0
        def get_h(n): return n.height if n else 0
        return get_h(node.left) - get_h(node.right)

    def is_balanced(node):
        if not node: return True
        if abs(get_bal(node)) > 1: return False
        return is_balanced(node.left) and is_balanced(node.right)

    print(f"随机插入1000个节点后，树是否平衡: {is_balanced(test_tree.root)}")



if __name__ == "__main__":
    print('------------------------------------------------------------------')
    decision_test1()
    print('------------------------------------------------------------------')
    AVLtest.test_dual_tree_engine()
    AVLtest.test_list_source()
    avl_test2()