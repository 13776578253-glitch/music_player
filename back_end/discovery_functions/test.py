import logging
import numpy as np
import pandas as pd

from decision import decision_tree
from .discovery_operation import TrainData

logger = logging.getLogger("discovery_functions_test")

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
    import time
    from sklearn import tree

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
    b = decision_tree.Decision_Tree(max_depth=10, min_entropy=6)
    time1 = time.time()
    b.fit(X_train1, Y_train1, W_train1)
    time2 = time.time()
    print(f'训练用时：{time2 - time1}')
    b.print_tree()
    new_samples = np.array([[0, 1, 20, 18, 181, 2, 2009], [2, 0, 15, 20, 150, 0, 2004]])
    print(b.predict(new_samples), b.find_max_depth())
    
    time1 = time.time()
    a1 = b.accuracy(X_predict, Y_predict)
    time2 = time.time()
    print(f'正确率：{a1}, 用时：{time2 - time1}')
    
    clf = tree.DecisionTreeClassifier()
    time1 = time.time()
    clf = clf.fit(X_train1, Y_train1)
    time2 = time.time()
    print(f'训练用时：{time2 - time1}')
    print(clf.predict(new_samples))
    def duima(num):
        percent = 0
        for i in range(num):
            percent += abs(clf.predict([X_predict[i]]) - Y_predict[i]) / Y_predict[i]
        return (percent / num)
    time1 = time.time()
    a2 = duima(40)
    time2 = time.time()
    print(f'正确率：{1 - a2}, 用时：{time2 - time1}')

if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(test())