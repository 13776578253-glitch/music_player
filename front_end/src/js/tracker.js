// 行为采集器 (单例模式)
// 负责精确统计“实际播放时长”，排除拖动进度条的时间

const BehaviorTracker = {
    currentSession: null,    // 存储 当前播放歌曲 统计状态
    
    start(song) {
        // 如有未结束的会话（比如切歌了），强制结算 切歌
        if (this.currentSession) {
            this.end('skip'); 
        }

        if (!song) return;

        //初始化会话对象
        this.currentSession = {
            song_id: String(song.song_id || song.id),
            from_playlist_id: song.from_playlist_id || 'unknown',    //关键逻辑  歌曲从哪首歌传入歌曲   //反向定位到歌单id  //用于歌单行为记录
            duration: song.duration || 0,   // 如果后端没给 duration，会在 loadedmetadata 更新
            startTime: Date.now(),          // 开始时间
            accumulatedTime: 0,             // 真实 累计播放秒数 
            lastTickTime: null,             // 上一次 计时点 的时间戳
            isDragging: false,              // 标记用户行为   //是否正在拖动进度条
            // hasRecordedHistory: false,   // 锁：标记这首歌是否已经上报过“历史记录”
            hasRecordedPlayEvent: false,    // 锁：标记是否已发送过 'play' 事件上报
            hasRecordedPlayListEvent: false,//锁：标记是否已经向歌单上传过歌单播放量记录

        };
        console.log("[Tracker] 开始统计:", this.currentSession.song_id);
    },

    // 计时 (由 timeupdate 驱动)
    tick() {
        if (!this.currentSession || this.currentSession.isDragging) return;
        // console.log("Tick正在运行...");    // 测试

        const now = Date.now();
        
        // 如果是 第一秒/刚暂停恢复  重置 lastTick
        if (!this.currentSession.lastTickTime) {
            this.currentSession.lastTickTime = now;
            return;
        }

        // 计算两次 tick 之间的物理时间差 ( 0.2~0.3s )
        const delta = (now - this.currentSession.lastTickTime) / 1000;
        // console.log("时间增量 delta:", delta);   // 测试

        // 异常过滤：两次 tick 间隔超过 2s (浏览器卡顿/休眠)  不计入时长
        if (delta > 0 && delta < 2.0) {
            this.currentSession.accumulatedTime += delta;
            // console.log("当前累计时长:", this.currentSession.accumulatedTime); // 测试

            // 核心监听代码：实时检测是否达标   // 还没上报过历史 (Lock is false) / 累计时长 >= 5秒
            if (!this.currentSession.hasRecordedPlayEvent &&  this.currentSession.accumulatedTime >= 5) {

                //  立刻上锁，防止下一次 tick 重复触发
                this.currentSession.hasRecordedPlayEvent = true;
                
                

                

                this.reportInstantEvent('play');

                //  调用 API
                // if (window.API && window.API.recordListeningHistory) {
                //     window.API.recordListeningHistory(this.currentSession.song_id);
                // }

                //  关键  歌单播放量 上报
                if (this.currentSession.from_playlist_id !== 'unknown' && !this.currentSession.hasRecordedPlayListEvent) {
                    window.API.reportPlaylistPlay(this.currentSession.from_playlist_id);
                    this.currentSession.hasRecordedPlayListEvent = true;

                }
                console.log("[Tracker] 播放满 5s，完成事件与歌单计数上报");
            }
        }

        this.currentSession.lastTickTime = now;  //  更新锚点，等待下一次 tick
    },

    // 用户暂停/拖动时，暂停计时
    pause() {
        if (this.currentSession) {
            this.currentSession.lastTickTime = null;  // 清空锚点
        }
    },

    // 处理进度条拖动 (Seeking)
    setSeeking(isSeeking) {
        // console.log("当前拖拽状态:", isSeeking);   // 测试
        if (!this.currentSession) return;
        this.currentSession.isDragging = isSeeking;

        if (isSeeking) {
            this.currentSession.lastTickTime = null; // 拖动开始，暂停计时
        } else {
            this.currentSession.lastTickTime = Date.now(); // 拖动结束，重置锚点计时
        }
    },

    // 专门处理即时触发的上报（不结束会话）
    reportInstantEvent(type) {
        if (!this.currentSession) return;
        
        const s = this.currentSession;
        const payload = {
            //user_id: window.CurrentUID || localStorage.getItem('user_id'),
            song_id: s.song_id,
            //playlist_id: s.from_playlist_id,
            duration: window.Player.audio.duration || 0,
            played_time: s.accumulatedTime,
            end_type: type, // 这里会传入 'play'
            position: Math.floor(window.Player.audio.currentTime || 0),
            // timestamp: Date.now()
        };

        if (window.API && window.API.reportUserBehavior) {
            window.API.reportUserBehavior(payload);
        }
    },

    // 结算并上报
    end(reason) {
        if (!this.currentSession) return;

        let f_Reason = reason || 'pause';

        if (f_Reason === 'quit') {
            f_Reason = 'pause';
        }

        const s = this.currentSession;
        const totalPlayed = s.accumulatedTime;

        // 构造 payload  // 发送给服务器的json 数据
        const payload = {
            // user_id: window.CurrentUID || localStorage.getItem('user_id'),  // 需要确保能拿到 UID
            song_id: s.song_id,
            // playlist_id: s.from_playlist_id,                                // 关键   上报 歌单 id
            duration: window.Player.audio.duration || 0,                    // 从 Audio 对象实时获取
            played_time: totalPlayed,                                       // 获取真实时长
            end_type: f_Reason,                                               // 'skip', 'complete', 'pause'
            position: Math.floor(window.Player.audio.currentTime || 0)           // 歌曲进度：听到哪
            // timestamp: Date.now(),                                       // 现实时间：何时听 (何异味）
        };

        // 发送给 API 层
        window.API.reportUserBehavior(payload);

        // 清理当前会话，等待下一首歌
        this.currentSession = null;
    }
};

// 当用户刷新页面或关闭浏览器时，触发 tracker.end('quit')
window.addEventListener('beforeunload', () => {
    if (BehaviorTracker.currentSession) {
        // 这里传入 'quit'，会被上面的 end 方法自动转为 'pause'
        BehaviorTracker.end('quit');
    }
});
