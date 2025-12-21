// src/js/linked-list.js (或者直接放在 player.js 顶部)

class Node {
    constructor(data) {
        this.data = data; // 存放歌曲对象
        this.prev = null;
        this.next = null;
    }
}

class DoublyCircularLinkedList {
    constructor() {
        this.head = null;
        this.current = null; // 指向当前播放的节点
        this.size = 0;
    }

    // 添加歌曲到链表尾部
    append(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            this.head.next = this.head; // 循环指向自己
            this.head.prev = this.head;
        } else {
            const tail = this.head.prev;
            tail.next = newNode;
            newNode.prev = tail;
            newNode.next = this.head;
            this.head.prev = newNode;
        }
        this.size++;
    }

    // 根据 song_id 找到节点并设为当前
    setCurrentById(id) {
        if (!this.head) 
            return null;
        let node = this.head;
        do {
            if (node.data.song_id === id || node.data.id === id) { // 兼容字段
                this.current = node;
                return node;
            }
            node = node.next;
        } while (node !== this.head);
        return null;
    }

    // 获取当前歌曲数据
    getCurrentData() {
        if (!this.current) 
            return null;
        return this.current.data;
    }
}
