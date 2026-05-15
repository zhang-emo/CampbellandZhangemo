(function() {
    // ========== 状态 & 常量 ==========
    const App = {
        MY: 'me', CT: 'contact', SYS: 'system',
        myName: '我', ctName: 'Norton·Campbell', myAv: '我', ctAv: '🌿',
        msgs: [], nid: 1000, quoteMsg: null,
        rTimer: null, aTimer: null, rDelay: 3000, aMin: 10, statusTimer: null,
        isTyping: false,
        textCards: [], emojiCards: [], imageCards: [], statusCards: [],
        groups: [{ id: 'default', name: '未分组', color: '#90943f' }],
        chatStickers: [],
        currentTab: 'text', currentGroupFilter: 'default',
        groupBarCollapsed: false,
        previousStatusText: '在线',
        isSending: false, ignoreNextClick: false,
        rapidReplyActive: false, rapidReplyTimer: null,
        inCall: false, callStartTime: null, callTimerId: null, callMinimized: false,
        incomingWaiting: false, isDialing: false, dialTimer: null,
        incomingCallTimer: null,
        letters: [], mailboxTab: 'sent',
        isNight: localStorage.getItem('nightMode') === 'true'
    };
    const Q = id => document.getElementById(id);
    // DOM 缓存（后续按需在模块中获取，为避免重复查询，直接在各模块函数内Q）

    // ========== 工具函数 ==========
    function showTyping() { if (!App.isTyping) { App.previousStatusText = Q('contactStatus').textContent; App.isTyping = true; } Q('contactStatus').textContent = '对方正在输入...'; }
    function hideTyping() { Q('contactStatus').textContent = App.previousStatusText; App.isTyping = false; }

    function saveAllData() {
        try {
            localStorage.setItem('chatSettings', JSON.stringify({ myName: App.myName, ctName: App.ctName, myAv: App.myAv, ctAv: App.ctAv, rDelay: App.rDelay, aMin: App.aMin, atChecked: Q('at').checked, etChecked: Q('et').checked }));
            localStorage.setItem('wordCards', JSON.stringify({ textCards: App.textCards, emojiCards: App.emojiCards, imageCards: App.imageCards, statusCards: App.statusCards, groups: App.groups }));
            localStorage.setItem('chatMessages', JSON.stringify({ msgs: App.msgs, nid: App.nid }));
            localStorage.setItem('chatStickers', JSON.stringify(App.chatStickers));
            localStorage.setItem('letters', JSON.stringify(App.letters));
        } catch (e) {
            alert('存储空间不足，请清理部分数据后重试！');
        }
    }
    window.addEventListener('beforeunload', saveAllData);
    setInterval(saveAllData, 5000);

    function loadAllData() {
        try {
            const chatSettings = JSON.parse(localStorage.getItem('chatSettings'));
            if (chatSettings) {
                App.myName = chatSettings.myName || '我'; App.ctName = chatSettings.ctName || 'Norton·Campbell';
                App.myAv = chatSettings.myAv || '我'; App.ctAv = chatSettings.ctAv || '🌿';
                App.rDelay = chatSettings.rDelay || 3000; App.aMin = chatSettings.aMin || 10;
                Q('at').checked = chatSettings.atChecked || false; Q('et').checked = chatSettings.etChecked !== undefined ? chatSettings.etChecked : true;
                Q('mn').value = App.myName; Q('ctn').value = App.ctName;
                Q('rs').value = App.rDelay / 100; Q('ai').value = App.aMin;
                Q('air').style.opacity = Q('at').checked ? '1' : '.5';
                Q('ai').disabled = !Q('at').checked;
                updSlider();
            }
            const wordCards = JSON.parse(localStorage.getItem('wordCards'));
            if (wordCards) {
                App.textCards = wordCards.textCards || []; App.emojiCards = wordCards.emojiCards || [];
                App.imageCards = wordCards.imageCards || []; App.statusCards = wordCards.statusCards || [];
                App.groups = wordCards.groups || [{ id: 'default', name: '未分组', color: '#90943f' }];
                const defaultGroup = App.groups.find(g => g.id === 'default');
                if (defaultGroup && defaultGroup.name === 'name') defaultGroup.name = '未分组';
                if (!App.groups.some(g => g.id === 'default')) App.groups.unshift({ id: 'default', name: '未分组', color: '#90943f' });
            }
            const chatMessages = JSON.parse(localStorage.getItem('chatMessages'));
            if (chatMessages) { App.msgs = chatMessages.msgs || []; App.nid = chatMessages.nid || 1000; }
            const savedStickers = JSON.parse(localStorage.getItem('chatStickers'));
            if (savedStickers) App.chatStickers = savedStickers;
            const savedLetters = JSON.parse(localStorage.getItem('letters'));
            if (savedLetters) App.letters = savedLetters;
        } catch(e) {}
    }

    function updateContactStatus() {
        if (App.statusCards.length > 0) {
            const newStatus = App.statusCards[Math.floor(Math.random()*App.statusCards.length)].content;
            if (App.isTyping) { App.previousStatusText = newStatus; }
            else { Q('contactStatus').textContent = newStatus; }
        } else {
            if (!App.isTyping) { Q('contactStatus').textContent = '在线'; }
            else { App.previousStatusText = '在线'; }
        }
        clearTimeout(App.statusTimer);
        App.statusTimer = setTimeout(updateContactStatus, Math.floor(Math.random() * 8 * 3600000) + 3600000);
    }

    function getRandomReply() {
        let baseText = App.textCards.length ? App.textCards[Math.floor(Math.random()*App.textCards.length)].content : '';
        if (Q('et').checked && App.emojiCards.length) baseText += ' ' + App.emojiCards[Math.floor(Math.random()*App.emojiCards.length)].content;
        return baseText.trim();
    }

    function getRandomReplyMessage() {
        if (App.imageCards.length > 0 && Math.random() < 0.25) {
            const randomImage = App.imageCards[Math.floor(Math.random() * App.imageCards.length)].content;
            return { type: 'image', content: randomImage };
        } else {
            const text = getRandomReply();
            return text ? { type: 'text', content: text } : null;
        }
    }

    // ========== 聊天消息模块 ==========
    const Chat = {
        render() {
            const ma = Q('ma');
            if (!App.msgs.length) { ma.innerHTML = ''; return }
            let h = '';
            App.msgs.forEach(m => {
                if (m.senderId === App.SYS) { h += `<div class="mr msg-system"><span>${m.text}</span></div>`; return; }
                let me = m.senderId === App.MY, row = me ? 'mr r' : 'mr l', av = me ? (App.myAv && App.myAv.startsWith('data:image') ? `<img src="${App.myAv}" style="width:100%;height:100%;object-fit:cover">` : App.myAv) : (App.ctAv && App.ctAv.startsWith('data:image') ? `<img src="${App.ctAv}" style="width:100%;height:100%;object-fit:cover">` : App.ctAv);
                let q = m.quoteId ? `<div class="qp" data-qid="${m.quoteId}"><span class="qt">📌 ${(m.quoteText||'').length>30?m.quoteText.slice(0,30)+'…':m.quoteText||''}</span></div>` : '';
                let d = new Date(m.timestamp), time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
                let stt = me ? (m.status === 'read' ? '<span class="rs sdc">✓✓</span>' : '<span class="rs sc">✓</span>') : '<span style="opacity:.4">·</span>';
                let act = `<div class="mactions"><button class="ab qa" data-id="${m.id}">↩️</button><button class="ab da" data-id="${m.id}">🗑️</button></div>`;
                let ft = `<div class="bf"><span class="mt">${time}</span>${stt}${act}</div>`;
                let bubbleContent = m.msgType === 'image' ? `<div class="mb img-bubble"><img src="${m.text}" alt="图片"></div>` : `<div class="mb">${this.esc(m.text)}</div>`;
                if (me) h += `<div class="${row}" data-mid="${m.id}"><div class="bw">${q}${bubbleContent}${ft}</div><div class="av">${av}</div></div>`;
                else h += `<div class="${row}" data-mid="${m.id}"><div class="av">${av}</div><div class="bw">${q}${bubbleContent}${ft}</div></div>`;
            });
            ma.innerHTML = h; ma.scrollTop = ma.scrollHeight;
        },
        esc(t) { let d = document.createElement('div'); d.textContent = t; return d.innerHTML },
        send(txt, q = null, msgType = 'text') {
            if (msgType === 'image' && !txt) return;
            if (App.isSending) return;
            App.isSending = true;
            let msg = { id: App.nid++, senderId: App.MY, text: txt.trim(), timestamp: Date.now(), status: 'unread', quoteId: q?.id, quoteText: q?.msgType==='image'?'[图片]':q?.text, msgType };
            App.msgs.push(msg);
            setTimeout(() => { let un = App.msgs.filter(m => m.senderId===App.MY && m.status==='unread'); if (un.length) { un[un.length-1].status = 'read'; Chat.render(); saveAllData(); } }, 1800);
            App.quoteMsg = null;
            Q('mi').value = ''; Q('mi').focus();
            setTimeout(() => { Q('mi').value = ''; App.isSending = false; }, 50);
            Chat.updateQuoteBar(); Chat.render(); Chat.simReply(); saveAllData();
        },
        del(id) {
            let i = App.msgs.findIndex(m => m.id === id); if (i===-1) return;
            App.msgs.forEach(m => { if (m.quoteId===id) { m.quoteId=null; m.quoteText=null } });
            App.msgs.splice(i,1);
            if (App.quoteMsg && App.quoteMsg.id===id) App.quoteMsg = null;
            Chat.render(); Chat.updateQuoteBar(); saveAllData();
        },
        updateQuoteBar() {
            const qb = Q('qb'), qbt = Q('qbt');
            if (App.quoteMsg) { qb.style.display = 'flex'; qbt.textContent = `${App.quoteMsg.senderId===App.MY?App.myName:App.ctName}: ${(App.quoteMsg.msgType==='image'?'[图片]':App.quoteMsg.text).slice(0,40)}` }
            else qb.style.display = 'none';
        },
        simReply() {
            if (App.rTimer) clearTimeout(App.rTimer);
            showTyping();
            App.rTimer = setTimeout(() => {
                hideTyping();
                const msgObj = getRandomReplyMessage();
                if (!msgObj) return;
                const msg = { id: App.nid++, senderId: App.CT, text: msgObj.content, timestamp: Date.now(), status:'read' };
                if (msgObj.type === 'image') msg.msgType = 'image';
                App.msgs.push(msg); Chat.render(); saveAllData();
            }, App.rDelay);
        },
        rapidReply() {
            if (App.rapidReplyActive) { clearTimeout(App.rapidReplyTimer); App.rapidReplyActive = false; }
            App.rapidReplyActive = true;
            const total = Math.floor(Math.random()*3)+1; let count = 0;
            function sendNext() {
                if (count >= total || !App.rapidReplyActive) { App.rapidReplyActive = false; return; }
                showTyping();
                App.rapidReplyTimer = setTimeout(() => {
                    hideTyping();
                    const msgObj = getRandomReplyMessage();
                    if (msgObj) {
                        const msg = { id: App.nid++, senderId: App.CT, text: msgObj.content, timestamp: Date.now(), status:'read' };
                        if (msgObj.type === 'image') msg.msgType = 'image';
                        App.msgs.push(msg); Chat.render(); saveAllData();
                    }
                    count++;
                    if (count < total) sendNext();
                    else App.rapidReplyActive = false;
                }, App.rDelay);
            }
            sendNext();
        }
    };

    // ========== 字卡库模块 ==========
    const WordBank = {
        importLock: false,
        handleImportConfirm(e) {
            e.preventDefault();
            if (WordBank.importLock) return;
            WordBank.importLock = true;
            const gid = App.currentTab === 'text' && App.currentGroupFilter !== 'all' ? App.currentGroupFilter : 'default';
            const text = Q('importTextArea').value;
            Q('importTextArea').value = '';
            Q('importArea').style.display = 'none';
            WordBank.importText(text, App.currentTab, gid);
            setTimeout(() => WordBank.importLock = false, 500);
        },
        importText(text, type, groupId='default') {
            let lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l), added = 0;
            lines.forEach(l => { if (WordBank.addCard(l, type, groupId)) added++; });
            if (added > 0) { saveAllData(); alert(`导入了 ${added} 条`); }
        },
        addCard(content, type, groupId = 'default') {
            let arr = App[`${type}Cards`]; if (!arr) return false;
            if (arr.some(c => c.content === content)) { alert('内容重复'); return false }
            arr.push({ id: Date.now()+Math.random(), content, groupId: (type==='text'||type==='status')?groupId:undefined });
            WordBank.render(); saveAllData(); return true;
        },
        deleteCard(id, type) {
            let arr = App[`${type}Cards`]; let idx = arr.findIndex(c => c.id == id);
            if (idx !== -1) arr.splice(idx,1);
            WordBank.render(); saveAllData();
        },
        // ... 其他方法 renderGroupBar, renderWB 等保持一致 ...
    };
    // (此处省略 WordBank 其余方法的完整实现，与前文相同，未做改动)

    // ========== 主题模块 ==========
    const Theme = { /* ... 完整主题逻辑 ... */ };

    // ========== 通话模块 ==========
    const Call = { /* ... 完整通话逻辑 ... */ };

    // ========== 表情包模块 ==========
    const Stickers = {
        render() {
            const grid = Q('stickerGrid');
            grid.innerHTML = '';
            App.chatStickers.forEach((stk, idx) => {
                let item = document.createElement('div'); item.className = 'sticker-item';
                item.innerHTML = `<img src="${stk}"><button class="sticker-del" data-index="${idx}">✕</button>`;
                item.querySelector('img').onclick = () => { Chat.send(stk, null, 'image'); Q('stickerPanel').classList.remove('show'); };
                const delBtn = item.querySelector('.sticker-del');
                const delHandler = (e) => {
                    e.stopPropagation(); e.preventDefault();
                    const i = parseInt(e.target.dataset.index);
                    if (!isNaN(i) && App.chatStickers[i]) { App.chatStickers.splice(i,1); saveAllData(); Stickers.render(); }
                };
                delBtn.addEventListener('click', delHandler);
                delBtn.addEventListener('touchend', delHandler);
                grid.appendChild(item);
            });
        },
        add(files) {
            Array.from(files).forEach(f => {
                let r = new FileReader();
                r.onload = ev => { App.chatStickers.push(ev.target.result); saveAllData(); Stickers.render(); };
                r.readAsDataURL(f);
            });
        }
    };

    // ========== 初始化 & 事件绑定 ==========
    function init() {
        loadAllData();
        updateContactStatus();
        Chat.render();
        WordBank.render();
        Stickers.render();
        // 绑定各类事件...
        Q('snd').onclick = () => Chat.send(Q('mi').value, App.quoteMsg);
        Q('mi').addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); Chat.send(Q('mi').value, App.quoteMsg); } });
        Q('rapidReplyBtn').addEventListener('click', e => { e.preventDefault(); Chat.rapidReply(); });
        Q('rapidReplyBtn').addEventListener('touchend', e => { e.preventDefault(); Chat.rapidReply(); });
        // 导入导出...
        Q('confirmImport').addEventListener('click', WordBank.handleImportConfirm);
        Q('confirmImport').addEventListener('touchend', WordBank.handleImportConfirm);
        // 聊天记录导入增强
        Q('historyJSONInput').onchange = e => {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const raw = ev.target.result;
                    const data = JSON.parse(raw);
                    const arr = Array.isArray(data) ? data : (data.msgs ? data.msgs : null);
                    if (arr) {
                        if (confirm('导入将替换当前聊天记录，确定继续吗？')) {
                            App.msgs = arr;
                            App.nid = Math.max(...arr.map(m => m.id), 0) + 1;
                            Chat.render();
                            WordBank.render();
                            saveAllData();
                        }
                    } else {
                        alert('无效的聊天记录文件（请确认JSON中包含消息数组或msgs字段）');
                    }
                } catch(ex) {
                    alert('无效的JSON文件');
                }
            };
            reader.readAsText(file);
            Q('historyJSONInput').value = '';
        };
        // 表情包上传
        Q('stickerFileInput').onchange = e => { Stickers.add(e.target.files); Q('stickerFileInput').value = ''; };
        // ... 其余绑定 ...
    }
    init();
})();