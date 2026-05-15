// ---------------------- ChatApp 全局封装 ----------------------
const ChatApp = (() => {
    const MY = 'me', CT = 'contact', SYS = 'system';

    // ---------------------- 状态 ----------------------
    const state = {
        myName: '我',
        ctName: 'Norton·Campbell',
        myAv: '我',
        ctAv: '🌿',
        msgs: [],
        nid: 1000,
        quoteMsg: null,
        isTyping: false,
        rDelay: 3000,
        aMin: 10,
        rapidReplyActive: false,
        rapidReplyTimer: null,
        textCards: [],   // 字卡
        emojiCards: []   // 表情包
    };

    // ---------------------- DOM 缓存 ----------------------
    const Q = id => document.getElementById(id);
    const dom = {
        ma: Q('ma'),
        mi: Q('mi'),
        snd: Q('snd'),
        qb: Q('qb'),
        qbt: Q('qbt'),
        sp: Q('sp'),
        ap: Q('ap'),
        at: Q('at'),
        aiv: Q('aiv'),
        rsv: Q('rsv'),
        rs: Q('rs'),
        emojiPanel: Q('emojiPanel')
    };

    // ---------------------- LocalStorage ----------------------
    let saveTimer = null;
    const saveAllData = () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            localStorage.setItem('chatMessages', JSON.stringify({ msgs: state.msgs, nid: state.nid }));
            localStorage.setItem('chatSettings', JSON.stringify({
                myName: state.myName,
                ctName: state.ctName,
                myAv: state.myAv,
                ctAv: state.ctAv,
                rDelay: state.rDelay,
                aMin: state.aMin,
                atChecked: dom.at.checked
            }));
            localStorage.setItem('textCards', JSON.stringify(state.textCards));
            localStorage.setItem('emojiCards', JSON.stringify(state.emojiCards));
        }, 200);
    };

    // ---------------------- 渲染聊天 ----------------------
    const escapeHTML = t => {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    };

    const avHtml = v => v?.startsWith('data:image') ? `<img src="${v}" style="width:100%;height:100%;object-fit:cover">` : v;

    const render = () => {
        if (!state.msgs.length) {
            dom.ma.innerHTML = '';
            return;
        }

        dom.ma.innerHTML = state.msgs.map(m => {
            const me = m.senderId === MY;
            const row = me ? 'mr r' : 'mr l';
            const av = me ? avHtml(state.myAv) : avHtml(state.ctAv);
            const q = m.quoteId ? `<div class="qp" data-qid="${m.quoteId}"><span class="qt">📌 ${(m.quoteText||'').slice(0,30)}</span></div>` : '';
            const d = new Date(m.timestamp);
            const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            const stt = me ? (m.status==='read'?'<span class="rs sdc">✓✓</span>':'<span class="rs sc">✓</span>') : '<span style="opacity:.4">·</span>';
            const bubbleContent = m.msgType==='image' 
                ? `<div class="mb img-bubble"><img src="${m.text}" alt="图片"></div>` 
                : `<div class="mb">${escapeHTML(m.text)}</div>`;
            const act = `<div class="mactions"><button class="ab qa" data-id="${m.id}">↩️</button><button class="ab da" data-id="${m.id}">🗑️</button></div>`;
            const ft = `<div class="bf"><span class="mt">${time}</span>${stt}${act}</div>`;
            return me
                ? `<div class="${row}" data-mid="${m.id}"><div class="bw">${q}${bubbleContent}${ft}</div><div class="av">${av}</div></div>`
                : `<div class="${row}" data-mid="${m.id}"><div class="av">${av}</div><div class="bw">${q}${bubbleContent}${ft}</div></div>`;
        }).join('');
        dom.ma.scrollTop = dom.ma.scrollHeight;
    };

    // ---------------------- 发送消息 ----------------------
    const send = (txt, quote = null, msgType='text') => {
        if (!txt && msgType==='text') return;
        const msg = {
            id: state.nid++,
            senderId: MY,
            text: txt.trim(),
            timestamp: Date.now(),
            status: 'unread',
            quoteId: quote?.id,
            quoteText: quote?.msgType==='image'?'[图片]':quote?.text,
            msgType
        };
        state.msgs.push(msg);
        state.quoteMsg = null;
        dom.mi.value = '';
        render();
        saveAllData();
        simReply();
    };

    dom.snd.onclick = () => send(dom.mi.value, state.quoteMsg);
    dom.mi.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); send(dom.mi.value, state.quoteMsg); } });

    // ---------------------- 模拟回复 ----------------------
    const getRandomText = () => state.textCards?.length
        ? state.textCards[Math.floor(Math.random()*state.textCards.length)].content
        : '';

    const getRandomReplyMessage = () => {
        if (state.imageCards?.length && Math.random()<0.25) {
            const img = state.imageCards[Math.floor(Math.random()*state.imageCards.length)].content;
            return { type:'image', content:img };
        }
        const text = getRandomText();
        return text ? { type:'text', content:text } : null;
    };

    const simReply = () => {
        setTimeout(()=>{
            const msgObj = getRandomReplyMessage();
            if (!msgObj) return;
            const msg = {
                id: state.nid++,
                senderId: CT,
                text: msgObj.content,
                timestamp: Date.now(),
                status: 'read',
                msgType: msgObj.type
            };
            state.msgs.push(msg);
            render();
            saveAllData();
        }, state.rDelay);
    };

    // ---------------------- 字卡管理 ----------------------
    const addWordCards = (inputText) => {
        const lines = inputText.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        lines.forEach(line => state.textCards.push({ content: line }));
        saveAllData();
    };

    // ---------------------- 表情包管理 ----------------------
    const addEmoji = (emojiUrl) => {
        state.emojiCards.push({ url: emojiUrl });
        saveAllData();
        renderEmojiPanel();
    };

    const renderEmojiPanel = () => {
        dom.emojiPanel.innerHTML = state.emojiCards.map(e => `<img src="${e.url}" class="emoji-item">`).join('');
    };

    // ---------------------- 导入聊天记录 ----------------------
    const importChatHistory = (fileContent) => {
        try {
            const data = JSON.parse(fileContent);
            if (!Array.isArray(data)) throw new Error("JSON 必须是数组");
            data.forEach(msg => {
                msg.msgType = msg.msgType || 'text';
                msg.senderId = msg.senderId || 'contact';
                msg.timestamp = msg.timestamp || Date.now();
                state.msgs.push(msg);
            });
            saveAllData();
            render();
            alert("导入成功！");
        } catch (e) {
            console.error(e);
            alert("无效 JSON 文件");
        }
    };

    // ---------------------- 初始化 ----------------------
    const init = () => {
        const stored = JSON.parse(localStorage.getItem('chatMessages') || '{"msgs":[],"nid":1000}');
        state.msgs = stored.msgs || [];
        state.nid = stored.nid || 1000;
        state.textCards = JSON.parse(localStorage.getItem('textCards') || '[]');
        state.emojiCards = JSON.parse(localStorage.getItem('emojiCards') || '[]');
        render();
        renderEmojiPanel();
    };

    init();

    return {
        state,
        send,
        render,
        simReply,
        addWordCards,
        addEmoji,
        importChatHistory
    };
})();