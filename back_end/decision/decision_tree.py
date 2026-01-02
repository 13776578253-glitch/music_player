import numpy as np
from collections import Counter
import matplotlib.pyplot as plt
import networkx as nx
from networkx.drawing.nx_agraph import graphviz_layout

# 树节点
class Tree_node():
    def __init__(self, index=None, value=None, parent=None):
        self.index = index
        self.value = [value]
        self.parent = parent
        self.children = []

    def get_level(self):
        level = 0
        p = self.parent
        while p :
            p = p.parent
            level += 1
        return level 
        
    def print_tree(self):
        if self.index is None:
            the_type = 'leaf'
        else:
            the_type = 'split'
            
        print('   ' * self.get_level() + '|--', end = '')
        print(f'{the_type}: {[float(num) for num in self.value]}')
        if self.children:
            for i in self.children:
                i.print_tree()

# 决策树
class Decision_Tree():
    def __init__(self, max_depth=4, min_entropy=float('inf'), MIN_SAMPLES_SPLIT=50, MIN_SAMPLES_LEAF=20):
        self.max_depth = max_depth
        self.min_entropy = min_entropy
        self.MIN_SAMPLES_SPLIT = MIN_SAMPLES_SPLIT
        self.MIN_SAMPLES_LEAF = MIN_SAMPLES_LEAF
        self.root = None

    # 计算出现概率(p)
    def probabilities(self, labels):
        result = []
        total_count = len(labels)
        for label_count in Counter(labels).values():
            result.append(label_count / total_count) 
        return result
    
    # 计算加权出现概率(p)
    def weighted_probabilities(self, labels, weights):
        total_w = np.sum(weights)
        if total_w == 0: return [0]

        result = []
        for label in np.unique(labels):
            # 该类别的权重占比 = (该类别所有样本的权重和) / (总权重和)
            label_w_sum = np.sum(weights[labels == label])
            result.append(label_w_sum / total_w)
        return result

    # 计算熵(H)
    def entropy(self, class_probabilities):
        summation = 0
        for p in class_probabilities:
            if p > 0:
                summation += -p * np.log2(p)    
        return summation

    # 计算某特征值对应的熵(H(p))
    def data_entropy(self, labels, weights):
        return self.entropy(self.weighted_probabilities(labels, weights))

    # 计算加权平均熵
    def partition_entropy(self, subsets, subsets_w):
        total_weight = sum([np.sum(w) for w in subsets_w])
        if total_weight == 0: return 0

        # 加权平均熵 = sum( 子集熵 * (子集权重和 / 总权重和) )
        weighted_entropy = 0
        for subset_y, subset_w in zip(subsets, subsets_w):
            if len(subset_y) == 0: continue
            w_ratio = np.sum(subset_w) / total_weight # 计算子集的权重占比
            weighted_entropy += self.data_entropy(subset_y, subset_w) * w_ratio # 计算子集内部的加权熵
           
        return weighted_entropy

    # 划分data数组
    def spilt_data(self, data, feature_index, feature_value):
        mask = data[:, feature_index] < feature_value
        group1 = data[mask]
        group2 = data[~mask]
        return group1, group2

    # 寻找最优分割点
    def find_best_split(self, data):
        best_split = None
        min_part_entropy = self.min_entropy
        feature_indexs = list(range(data.shape[1]-2))

        for feature_index in feature_indexs:
            feature_values = np.percentile(data[:, feature_index], q=np.arange(25, 100, 20))  # 取多个百分位数
            if len(feature_values) <= 1: continue # 如果这一列全是一样的值，直接跳过
            for feature_value in feature_values:
                group1, group2 = self.spilt_data(data, feature_index, feature_value)
                if len(group1) < self.MIN_SAMPLES_LEAF or len(group2) < self.MIN_SAMPLES_LEAF: continue # 控制叶子最小样本数
                entropy =  self.partition_entropy([group1[:, -1], group2[:, -1]], [group1[:, -2], group2[:, -2]])
                # print(entropy)
                if entropy < min_part_entropy:
                    min_part_entropy = entropy
                    best_split = (group1, group2, feature_index, feature_value)

        return best_split
    
    # 节点继承
    def node_change(self, node):
        if node.parent is None:
            return

        if node.index == node.parent.index:
            node.parent.value.extend(node.value)
            node.parent.children.remove(node)
            node.parent.children.extend(node.children)
            
            for i in node.children:
                i.parent = node.parent
            node.parent = None

    # 构建决策树
    def build_tree(self, data, depth=0, parent=None):
        y = set(data[:, -1])
        # 样本数太少，不允许再分裂
        if len(data) < self.MIN_SAMPLES_SPLIT:
            common_y = np.sum(data[:, -1] * data[:, -2]) / np.sum(data[:, -2])
            return Tree_node(value=common_y, parent=parent)

        # 所有样本属于同一类别
        if len(y) == 1:
            return Tree_node(value=list(y)[0], parent=parent)

        # 到达最大深度
        if depth > self.max_depth:
            common_y = np.sum(data[:, -1] * data[:, -2]) / np.sum(data[:, -2])
            return Tree_node(value=common_y, parent=parent)
           
        best_split = self.find_best_split(data)

        # 未找到特征
        if best_split is None:
            common_y = np.sum(data[:, -1] * data[:, -2]) / np.sum(data[:, -2])
            return Tree_node(value=common_y, parent=parent)
        
        group1, group2, feature_index, feature_value = best_split
        
        node = Tree_node(index=feature_index, value=feature_value)
        node.parent = parent
        node.children.append(self.build_tree(group1, depth+1, node))
        node.children.append(self.build_tree(group2, depth+1, node))
        
        for i in node.children:
            if i.index is not None:
                self.node_change(i)

        return node
           
    # 训练数据
    def fit(self, X, Y, W):
        data = np.column_stack((X, W, Y))
        self.root = self.build_tree(data)

    # 判断是否创建决策树
    def is_none(self):
        if self.root is None:
            print('未创建决策树！')
            return 1

    # 查找最大深度
    def find_max_depth(self, node=None):
        if self.is_none(): return
        if node is None: node = self.root
        max_depth = 0
        
        if node.index is None:
            return node.get_level()

        for i in node.children:
            depth = self.find_max_depth(i)
            if depth > max_depth:
                max_depth = depth

        return max_depth

    # 简单打印决策树
    def print_tree(self):
        if self.is_none(): return
        self.root.print_tree()
        
    # 预测一个例子
    def predict_one_sample(self, x):
        p = self.root
        if p.index == None:
            return p.value
            
        while p:
            index = np.searchsorted(p.value, x[p.index], side='right')  # 分箱，side='right' 保证当 x == breaks[i] 时算到右侧区间
            if p.children[index].index is not None:
                p = p.children[index]
            else:
                break
                
        return p.children[index].value

    # 预测
    def predict(self, X):
        if self.is_none(): return
        result = []
        
        for x in X:
            result.append(float(self.predict_one_sample(x)[0]))
            
        return result

    # 计算正确率
    def accuracy(self, X, Y):
        if self.is_none(): return
        num = len(Y)
        percent = 0
        for i in range(num):
            percent += abs(self.predict([X[i]]) - Y[i]) / Y[i]
        return 1 - (percent / num)


def test1():
    X_train = np.array([[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 1], [2, 2]])
    Y_train = np.array([0, 0, 1, 1, 1, 0, 1])
    W_train = np.array([1, 1, 1, 1, 1, 1, 1])
    a = Decision_Tree(MIN_SAMPLES_SPLIT=1, MIN_SAMPLES_LEAF=1)
    a.fit(X_train, Y_train, W_train)
    a.print_tree()

    new_samples = np.array([[1, 1], [0, 1], [2, 0]])
    a.predict(new_samples)

if __name__ == "__main__":
    test1()