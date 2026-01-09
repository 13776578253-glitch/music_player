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



if __name__ == "__main__":
    # AVLtest.test_dual_tree_engine()
    # AVLtest.test_list_source()
    # avl_test2()
    pass
