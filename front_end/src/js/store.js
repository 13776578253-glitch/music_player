export default class Store {
    constructor(params) {
        this.events = {};
        this.state = params.state || {};
        this.actions = params.actions || {};
    }

    // 触发 Action (类似 Vuex dispatch)
    async dispatch(actionKey, payload) {
        if(typeof this.actions[actionKey] !== 'function') {
            console.error(`Action "${actionKey}" doesn't exist.`);
            return false;
        }
        
        // 更新状态前
        console.log(`[Store] Action: ${actionKey}`, payload);
        
        // 执行 Action，更新 State
        const newState = await this.actions[actionKey](this.state, payload);
        this.state = Object.assign(this.state, newState);
        
        // 通知订阅者
        this.notify(actionKey, this.state);
        return true;
    }

    // 订阅状态变化
    subscribe(actionKey, callback) {
        if(!this.events[actionKey]) this.events[actionKey] = [];
        this.events[actionKey].push(callback);
    }

    notify(actionKey, state) {
        if(!this.events[actionKey]) return;
        this.events[actionKey].forEach(callback => callback(state));
    }
}