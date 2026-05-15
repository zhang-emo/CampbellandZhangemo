// ====================== ChatModule ======================
const ChatModule = (() => {
    const MY = 'me', CT = 'contact';
    let msgs = [], nid = 1000, quoteMsg = null, rDelay = 3000;

    const ma = document.getElementById('ma');
    const mi = document.getElementById('mi');
    const snd = document.getElementById('snd');
    const contactStatusEl = document.getElementById('contactStatus');

    // ================== 工具函数 ==================
    const esc = text => {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    };

    // ================== 消息渲染 ==================
    const renderMessages = () => {
        if (!msgs.length) { ma.innerHTML = ''; return; }
        ma.innerHTML = msgs.map(m => {
            const me = m.senderId === MY;
            const row = me ? 'mr r' : 'mr l';
            const av = me ? '我' : '🌿';
            const bubble = m.msgType === 'image'
                ? `<div class="mb img-bubble"><img src="${m.text}"></div>`
                : `<div class="mb">${esc(m.text)}</div>`;
            const q = m.quoteText ? `<div class="qp"><span class="qt">${m.quoteText}</span></div>` : '';
            return `<div class="${row}" data-mid="${m.id}"><div class="bw">${q}${bubble}</div><div class="av">${av}</div></div>`;
        }).join('');
        ma.scrollTop = ma.scrollHeight;
    };

    // ================== 发送消息 ==================
    const sendMessage = (txt, msgType='text', quote=null) => {
        if (!txt && msgType==='text') return;
        const msg = { id: nid++, senderId: MY, text: txt.trim(), timestamp: Date.now(), msgType, quoteText: quote?.text };
        msgs.push(msg);
        renderMessages();
        saveChatHistory();
        simulateReply();
        mi.value = '';
    };

    const simulateReply = () => {
        contactStatusEl.textContent = '对方正在输入...';
        setTimeout(() => {
            contactStatusEl.textContent = '在线';
            const reply = { id: nid++, senderId: CT, text: '自动回复 😊', timestamp: Date.now(), msgType: 'text' };
            msgs.push(reply);
            renderMessages();
            saveChatHistory();
        }, rDelay);
    };

    // ================== 导入聊天记录 ==================
    const importChatHistory = (file) => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) throw new Error('无效 JSON');
                data.forEach(msg => { if(!msg.msgType) msg.msgType='text'; });
                msgs = data;
                renderMessages();
                saveChatHistory();
                alert('聊天记录导入成功');
            } catch(err) {
                alert('无效 JSON 文件: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    const saveChatHistory = () => localStorage.setItem('chatHistory', JSON.stringify(msgs));
    const loadChatHistory = () => {
        const stored = localStorage.getItem('chatHistory');
        if(stored) { msgs = JSON.parse(stored); renderMessages(); }
    };

    const bindEvents = () => {
        snd.onclick = () => sendMessage(mi.value, 'text', quoteMsg);
        mi.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); sendMessage(mi.value); } });
    };

    const init = () => {
        bindEvents();
        loadChatHistory();
        renderMessages();
    };

    return { init, sendMessage, importChatHistory, msgs };
})();

// ====================== StickerModule ======================
const StickerModule = (() => {
    let stickers = JSON.parse(localStorage.getItem('stickers') || '[]');

    const stickerBtn = document.getElementById('stickerBtn');
    const stickerPanel = document.getElementById('stickerPanel');
    const stickerGrid = document.getElementById('stickerGrid');
    const stickerFileInput = document.getElementById('stickerFileInput');

    const saveStickers = () => localStorage.setItem('stickers', JSON.stringify(stickers));

    const render = () => {
        stickerGrid.innerHTML = '';
        stickers.forEach((stk, idx) => {
            const div = document.createElement('div');
            div.className = 'sticker-item';
            div.innerHTML = `<img src="${stk}"><button class="sticker-del" data-index="${idx}">✕</button>`;
            div.querySelector('img').onclick = () => { ChatModule.sendMessage(stk, 'image'); stickerPanel.classList.remove('show'); };
            div.querySelector('.sticker-del').onclick = e => { e.stopPropagation(); stickers.splice(idx,1); render(); saveStickers(); };
            stickerGrid.appendChild(div);
        });
    };

    const bindEvents = () => {
        stickerBtn.onclick = () => { stickerPanel.classList.toggle('show'); render(); };
        stickerFileInput.onchange = e => {
            Array.from(e.target.files).forEach(f => {
                const reader = new FileReader();
                reader.onload = ev => { stickers.push(ev.target.result); render(); saveStickers(); };
                reader.readAsDataURL(f);
            });
            stickerFileInput.value = '';
        };
    };

    const init = () => { bindEvents(); render(); };

    return { init, stickers };
})();

// ====================== MailboxModule ======================
const MailboxModule = (() => {
    let letters = [];
    const letterContent = document.getElementById('letterContent');
    const sendLetterBtn = document.getElementById('sendLetterBtn');
    const letterList = document.getElementById('letterList');

    const sendLetter = () => {
        const content = letterContent.value.trim();
        if(!content) return;
        letters.push({ id: Date.now(), content, timestamp: Date.now() });
        letterContent.value = '';
        render();
    };

    const render = () => {
        letterList.innerHTML = letters.map(l => `<div class="letter-item">${l.content}</div>`).join('') || '<div class="eh">暂无信件</div>';
    };

    const init = () => { sendLetterBtn.onclick = sendLetter; render(); };

    return { init, sendLetter };
})();

// ====================== ThemeModule ======================
const ThemeModule = (() => {
    const nightToggle = document.getElementById('nightModeToggle');
    let night = localStorage.getItem('nightMode')==='true';

    const applyTheme = () => {
        document.body.style.background = night ? '#2E2A27' : '#6B6058';
        localStorage.setItem('nightMode', night);
    };

    const init = () => {
        nightToggle.onclick = () => { night = !night; applyTheme(); };
        applyTheme();
    };

    return { init };
})();

// ====================== CallModule ======================
const CallModule = (() => {
    let inCall = false, callStart = null, timerId = null;
    const callBtn = document.getElementById('callBtn');
    const callWindow = document.getElementById('callWindow');
    const callTimer = document.getElementById('callTimer');

    const formatTime = sec => {
        const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    const updateTimer = () => { if(!inCall) return; callTimer.textContent = formatTime(Math.floor((Date.now()-callStart)/1000)); };
    const startCall = () => { if(inCall) return; inCall=true; callStart=Date.now(); callWindow.style.display='flex'; timerId=setInterval(updateTimer,1000); ChatModule.sendMessage('📞 通话开始','system'); };
    const endCall = () => { if(!inCall) return; clearInterval(timerId); inCall=false; callWindow.style.display='none'; ChatModule.sendMessage('📞 通话结束','system'); };

    const init = () => { callBtn.onclick=startCall; document.getElementById('callHangup').onclick=endCall; };

    return { init, startCall, endCall };
})();

// ====================== CardModule ======================
const CardModule = (() => {
    let textCards = JSON.parse(localStorage.getItem('textCards') || '[]');
    const cardList = document.getElementById('cardList');

    const render = () => {
        cardList.innerHTML = textCards.map(c => `<div class="card-item">${c.content}</div>`).join('');
    };

    const addTextCards = (txt) => {
        if(!txt) return;
        const lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(l=>l);
        lines.forEach(line=>textCards.push({ content: line }));
        localStorage.setItem('textCards', JSON.stringify(textCards));
        render();
    };

    const init = () => { render(); };

    return { init, addTextCards, textCards };
})();

// ====================== 页面初始化 ======================
document.addEventListener('DOMContentLoaded', () => {
    ChatModule.init();
    StickerModule.init();
    MailboxModule.init();
    ThemeModule.init();
    CallModule.init();
    CardModule.init();
});