
const home_page = {
    async init(_params) {
        //console.log("[Home] 开始初始化...");
        const container = document.getElementById('home-list');
        const template = document.getElementById('song-card-template');

        if (!this.validate(container, template)) return;

        //核心！
        try {
            const songs = await API.getRecommend(); 
            this.render(container, template, songs);
        } catch (error) {
            this.handleError(container, error);
        }
    },

    validate(container, template) {
        if (!container || !template) {
            console.warn(' — 缺少 DOM 元素 —');
            return false;
        }
        return true;
    },

    // 核心渲染逻辑！
    render(container, template, data) {
        container.innerHTML = ''; 
        
        const fragment = document.createDocumentFragment();  // 使用文档片段减少性能损耗

        data.forEach(song => {
            const clone = template.content.cloneNode(true);
            
            // 数据映射
            clone.querySelector('.pl-cover').src = song.cover;
            clone.querySelector('.pl-title').textContent = song.title;
            
            // 事件绑定
            clone.querySelector('.playlist-item').onclick = () => {
                loadPage('playlist', { id: song.id }); 
            };
            
            fragment.appendChild(clone);
        });

        container.appendChild(fragment);
        console.log("— 渲染完成 —");
    },

    handleError(container, error) {
        console.error('— 加载失败: —', error);
        container.innerHTML = `<div class="text-red-500">内容加载失败，请检查后端服务。</div>`;
    }
};


window.PageHandlers = window.PageHandlers || {};
window.PageHandlers.home = (_params) => home_page.init(_params);