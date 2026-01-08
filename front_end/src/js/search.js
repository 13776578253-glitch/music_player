
// 负责顶部搜索栏的逻辑：防抖、请求取消、渲染结果
const SearchModule = {
    input: document.getElementById('search-input'),
    dropdown: document.getElementById('search-dropdown'),
    resultList: document.getElementById('search-results-list'),
    loadingState: document.getElementById('search-loading'),
    emptyState: document.getElementById('search-empty'),
    
    abortController: null, // 用于取消上一次请求
    debounceTimer: null,

    init() {
        if (!this.input) return;

        // 监听输入
        this.input.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });

        // 监听聚焦（如果框里有字，聚焦时重新显示结果）
        this.input.addEventListener('focus', () => {
            if (this.input.value.trim().length > 0 && this.resultList.children.length > 0) {
                this.showDropdown(true);
            }
        });

        // 点击外部关闭下拉
        document.addEventListener('click', (e) => {
            const wrapper = document.getElementById('search-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                this.showDropdown(false);
            }
        });
    },

    // 防抖处理
    handleInput(keyword) {
        // 1. 清除旧的定时器
        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        // 2. 如果输入为空，隐藏面板并取消正在进行的请求
        if (!keyword.trim()) {
            this.showDropdown(false);
            this.cancelCurrentRequest();
            return;
        }

        // 3. 开启新的定时器 (300ms 防抖)
        this.debounceTimer = setTimeout(() => {
            this.performSearch(keyword);
        }, 300);
    },

    // 取消当前正在进行的 fetch 请求
    cancelCurrentRequest() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    },

    // 执行搜索
    async performSearch(keyword) {
        this.cancelCurrentRequest(); // 发起新请求前，取消旧的
        this.abortController = new AbortController();

        // UI 状态：显示 Loading
        this.showDropdown(true);
        this.toggleState('loading');

        try {
            // 调用 API.js 中的接口
            const songs = await window.API.searchSongs(keyword, this.abortController.signal);
            
            this.renderResults(songs);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('搜索请求已取消');
            } else {
                console.error('搜索失败', error);
                this.toggleState('empty'); // 或显示错误状态
            }
        }
    },

    // 渲染列表
    renderResults(songs) {
        this.resultList.innerHTML = ''; // 清空

        if (!songs || songs.length === 0) {
            this.toggleState('empty');
            return;
        }

        this.toggleState('results');

        songs.forEach(song => {
            const item = document.createElement('div');
            // 样式参考：深色背景，Hover变亮，Flex布局
            item.className = `flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#1e293b] transition-all group border-b border-white/[0.03]`;
            
            // 歌手处理 (数组转字符串)
            const artistName = Array.isArray(song.artist) ? song.artist.join(' / ') : song.artist;

            item.innerHTML = `
                <div class="w-10 h-10 rounded shadow-md flex-shrink-0 relative overflow-hidden bg-slate-800">
                    <img src="${song.url}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <i class="fa-solid fa-play text-white text-xs"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-slate-200 text-sm font-medium truncate">${song.title}</div>
                    <div class="text-slate-500 text-[11px] truncate mt-0.5">${song.artist.join(' / ')}</div>
                </div>
                <div class="text-slate-600 text-[10px] pr-2">${song.duration}</div>
            `;

            // 点击事件：插入播放列表
            item.addEventListener('click', () => {
                this.handleSongClick(song);
            });

            this.resultList.appendChild(item);
        });
    },

    // // 处理点击歌曲
    // handleSongClick(song) {
    //     console.log('选中歌曲:', song.title);
        
    //     if (window.Player) {
    //         // 调用 Player 中新增的方法
    //         window.Player.addSearchResultAndPlay(song);
            
    //         // 关闭搜索框
    //         this.showDropdown(false);
    //         this.input.value = ''; // 可选：清空输入
    //     }
    // },

    // 处理点击歌曲
    handleSongClick(song) {
        console.log('选中歌曲:', song.title);
        
        if (window.Player) {
            // 使用 .call 强制将 player.js 内部的 this 指向 window.Player
            window.Player.addSearchResultAndPlay.call(window.Player, song);
            
            this.showDropdown(false);
            this.input.value = ''; 
        }
    },

    // 切换面板内容的显示状态
    toggleState(state) {
        this.loadingState.classList.add('hidden');
        this.emptyState.classList.add('hidden');
        this.resultList.classList.add('hidden');

        if (state === 'loading') this.loadingState.classList.remove('hidden');
        else if (state === 'empty') this.emptyState.classList.remove('hidden');
        else if (state === 'results') this.resultList.classList.remove('hidden');
    },

    showDropdown(show) {
        if (show) this.dropdown.classList.remove('hidden');
        else this.dropdown.classList.add('hidden');
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    SearchModule.init();
});