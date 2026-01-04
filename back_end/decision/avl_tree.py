from difflib import SequenceMatcher

class TreeNode:
    def __init__(self, key, song_id):
        self.key = key
        self.height = 1
        self.left = None
        self.right = None
        self.data_list = [song_id]

class AVLTree:
    def __init__(self):
        self.root = None

    def get_height(self, node):
        return node.height if node else 0

    def get_balance(self, node):
        return self.get_height(node.left) - self.get_height(node.right) if node else 0

    def rotate_right(self, y):
        x = y.left
        T2 = x.right
        x.right = y
        y.left = T2
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        x.height = 1 + max(self.get_height(x.left), self.get_height(x.right))
        return x

    def rotate_left(self, x):
        y = x.right
        T2 = y.left
        y.left = x
        x.right = T2
        x.height = 1 + max(self.get_height(x.left), self.get_height(x.right))
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        return y

    def insert_recursive(self, root, key, song_id):
        if not root: return TreeNode(key, song_id)
        
        if key == root.key:
            root.data_list.append(song_id) # Key相同就直接加到列表
            return root
        elif key < root.key:
            root.left = self.insert_recursive(root.left, key, song_id)
        else:
            root.right = self.insert_recursive(root.right, key, song_id)
        
        root.height = 1 + max(self.get_height(root.left), self.get_height(root.right)) # 更新高度
        balance = self.get_balance(root) # 获取平衡因子并旋转

        # 左旋
        if balance > 1 and key < root.left.key:
            return self.rotate_right(root)
        # 右旋
        if balance < -1 and key > root.right.key:
            return self.rotate_left(root)
        # 左右
        if balance > 1 and key > root.left.key:
            root.left = self.rotate_left(root.left)
            return self.rotate_right(root)
        # 右左
        if balance < -1 and key < root.right.key:
            root.right = self.rotate_right(root.right)
            return self.rotate_left(root)

        return root
    
    def insert(self, key, song_id):
        self.root = self.insert_recursive(self.root, key, song_id)
    
    def starts_with(self, root, content):
        return root.lower().startswith(content.lower())
    
    def content_search_recursive(self, root, content, results, limit):
        if not root or len(results) >= limit: return

        if root.key >= content:
            self.content_search_recursive(root.left, content, results, limit)

        if self.starts_with(root.key, content): # 检查字符串是否以指定的前缀开头
            if len(results) < limit:
                results.append({"key": root.key, "ids": root.data_list})
        
        if root.key < content or self.starts_with(root.key, content):
            self.content_search_recursive(root.right, content, results, limit)

    def content_search(self, content, limit=10):
        results = []
        self.content_search_recursive(self.root, content, results, limit)
        return results

    def display_recursive(self, node, level):
        if node is not None:
            self.display_recursive(node.right, level + 1) # 递归打印右子树
            
            indent = "    " * level 
            balance = self.get_balance(node)
            print(f"{indent}|-- {node.key} [H:{node.height}, B:{balance}]") # (H:高度, B:平衡因子)
            
            self.display_recursive(node.left, level + 1) # 递归打印左子树

    def display(self):
        if not self.root:
            print("空！")
        else:
            self.display_recursive(self.root, 0)



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

class test:
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


if __name__ == "__main__":
    test.test_dual_tree_engine()
    test.test_list_source()
