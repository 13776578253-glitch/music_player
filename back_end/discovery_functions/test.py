import logging, time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn import tree

from decision import decision_tree
from .discovery_operation import TrainData

logger = logging.getLogger("discovery_functions_test")

def all_accuracy(tree, X, Y):
        num_classes = 10
        total_loss = 0
        eps = 1e-15  # 防止 log(0) 导致溢出
        
        for i in range(len(Y)):
            y_pred_val = int(tree.predict([X[i]])[0])
            y_true_val = int(Y[i])
            
            prob = 0.99 if y_pred_val == y_true_val else (0.01 / (num_classes - 1)) # 构造一个简单的概率分布
            total_loss += -np.log(prob + eps) # 交叉熵公式：-sum(y_true * log(y_pred))
            
        return total_loss / len(Y)

def test_complexity_and_accuracy(tree_model, X_train, y_train, w_train):
    # 1. 测试训练时间随样本量 N 的变化 (体现 O(N))
    n_sizes = [100, 500, 1000, 2000]
    train_times = []
    
    print(f"{'Samples (N)':<12} | {'Train Time (s)':<15} | {'Accuracy':<10}")
    print("-" * 45)
    
    for n in n_sizes:
        subset_X = X_train[:n]
        subset_y = y_train[:n]
        subset_W = w_train[:n]
        
        start = time.time()
        tree_model.fit(subset_X, subset_y, subset_W)
        end = time.time()
        
        train_times.append(end - start)
        acc = tree_model.accuracy(subset_X, subset_y)
        print(f"{n:<12} | {end-start:<15.4f} | {acc:<10.2%}")

    # 2. 绘制耗时曲线图
    plt.figure(figsize=(10, 5))
    plt.plot(n_sizes, train_times, 'o-', color='blue', label='Training complexity')
    plt.title("Empirical Time Complexity: Training Time vs Sample Size")
    plt.xlabel("Number of Samples (N)")
    plt.ylabel("Time (seconds)")
    plt.grid(True)
    plt.show()

def complexity_test():
    # 模拟 MNIST 数据: D=784, 10类标签
    D = 784
    n_samples_list = [500, 1000, 2000, 4000] # 不同的样本量 N
    train_times = []
    predict_times = []

    print(f"{'Samples (N)':<15} | {'Train Time (s)':<15} | {'Predict Time (s)':<15}")
    print("-" * 50)

    for N in n_samples_list:
        # 生成随机二值化模拟数据
        X_fake = np.random.randint(0, 2, (N, D))
        y_fake = np.random.randint(0, 10, N)
        w_fake = [1] * N
        
        dt = decision_tree.Decision_Tree(max_depth=4)
        
        # 测试训练耗时
        start_train = time.time()
        dt.fit(X_fake, y_fake, w_fake)
        end_train = time.time()
        train_times.append(end_train - start_train)
        
        # 测试预测耗时 (测试 100 个样本)
        X_test = np.random.randint(0, 2, (100, D))
        start_pred = time.time()
        dt.predict(X_test)
        end_pred = time.time()
        predict_times.append(end_pred - start_pred)
        
        print(f"{N:<15} | {train_times[-1]:<15.4f} | {predict_times[-1]:<15.4f}")

    # 绘制复杂度曲线
    plt.figure(figsize=(10, 5))
    plt.plot(n_samples_list, train_times, marker='o', label='Training Time')
    plt.title("Empirical Time Complexity (Fixed D=784, d=4)")
    plt.xlabel("Number of Samples (N)")
    plt.ylabel("Time (seconds)")
    plt.grid(True)
    plt.legend()
    plt.show()


async def test():
    X_test = [
    # 全部是新组合 (is_new_pair=1)
    # 样本1: 用户1 + 没听过的Japanese rock (符合用户1偏好)
    [1, 5, 3, 268, 3, 1, 20, 0.60, 1],
    # 样本2: 用户2 + 没听过的Korean hip-hop (符合用户2偏好)
    [2, 4, 0, 277, 8, 0.375, 20, 0.5, 1],
    # 样本3: 用户3 + 没听过的Chinese ballad (符合用户3偏好)
    [3, 0, 3, 253, 3, 0.666666667, 20, 0.55, 1],
    # 样本4: 用户4 + 没听过的Japanese electronic (部分符合)
    [4, 1, 3, 247, 1, 0, 20, 0.45, 1],
    # 样本5: 用户5 + 没听过的Instrumental electronic (不符合偏好)
    [5, 4, 1, 233, 11, 0.181818182, 20, 0.6, 1],
    # 样本6: 用户6 + 没听过的Chinese pop (符合偏好)
    [6, 1, 3, 197, 2, 1, 20, 0.55, 1]
    ]

    # 基于用户偏好的期望完成概率（对于新歌曲的预测）
    Y_expected = [
        0.85,  # 用户1: 喜欢Japanese rock，预测高完成率
        0.80,  # 用户2: 喜欢Korean hip-hop
        0.90,  # 用户3: 喜欢Chinese ballad
        0.50,  # 用户4: 部分匹配Japanese electronic
        0.20,  # 用户5: 不喜欢Instrumental electronic
        0.88  # 用户6: 喜欢Chinese pop
    ]
    
    new_samples = np.array(X_test)
    X_train, Y_train, W_train = await TrainData.build_train_data()
    tree = decision_tree.Decision_Tree(max_depth=7, MIN_SAMPLES_SPLIT=10, MIN_SAMPLES_LEAF=5)
    tree.fit(X_train, Y_train, W_train)
    result = tree.predict(new_samples)
    # tree.print_tree()
    print(result)

    from sklearn.ensemble import RandomForestRegressor
    ensemble_reg = RandomForestRegressor(
        n_estimators=100,  # 决策树数量
        random_state=42,
        max_depth=5        # 控制单棵决策树复杂度
    )
    # 步骤2：fit()方法中直接传入sample_weight=W_train（核心：启用权重模式）
    ensemble_reg.fit(X_train, Y_train, sample_weight=W_train)
    result = ensemble_reg.predict(new_samples)
    print(list(result))
    print(Y_expected)


async def tree_test():
    new_samples = np.array([[0, 1, 20, 18, 181, 2, 2009], [2, 0, 15, 20, 150, 0, 2004]])
    print(f'预测数据：{new_samples}')
    print('-----------------------------')

    fn = 'discovery_functions/penguins.csv'
    data = pd.read_csv(fn)
    # print(data.info())
    # print()
    # print(data.shape[0], data.shape[1])
    data = data.dropna()
    for i in ['species', 'island', 'sex']:
        data[i] = pd.factorize(data[i])[0]
    # print(data.info())
    rol = ['species', 'island', 'bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g', 'sex', 'year']
    X = data[rol[:5]+rol[6:8]].values
    Y = data[rol[5]].values
    X_train1 = X[:290]
    W_train1 = np.array([1]*290)
    Y_train1 =Y[:290]
    X_predict = X[290:]
    Y_predict = Y[290:]

    de_tree = decision_tree.Decision_Tree(max_depth=10, min_entropy=6)
    # test_complexity_and_accuracy(de_tree, X_train1, Y_train1, W_train1)
    time1 = time.time()
    de_tree.fit(X_train1, Y_train1, W_train1)
    time2 = time.time()
    print(f'训练用时：{time2 - time1}')
    # de_tree.print_tree()
    print(f'预测为：{de_tree.predict(new_samples)}') # , de_tree.find_max_depth()
    
    time1 = time.time()
    # a1 = de_tree.accuracy(X_predict, Y_predict)
    a1 = all_accuracy(de_tree, X_predict, Y_predict)
    time2 = time.time()
    print(f'正确率：{a1}, 用时：{time2 - time1}')

    print('-----------------------------')
    
    clf = tree.DecisionTreeClassifier()
    time1 = time.time()
    clf = clf.fit(X_train1, Y_train1)
    time2 = time.time()
    print(f'训练用时：{time2 - time1}')
    print(f'预测为：{clf.predict(new_samples)}')

    time1 = time.time()
    a2 = all_accuracy(clf, X_predict, Y_predict)
    time2 = time.time()
    print(f'正确率：{a2}, 用时：{time2 - time1}')

    complexity_test()

if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(tree_test())