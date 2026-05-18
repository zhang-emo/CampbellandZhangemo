(function() {
    const MY = 'me', CT = 'contact', SYS = 'system';
    let myName = '我', ctName = 'Norton·Campbell', myAv = '我', ctAv = '🌿', msgs = [], nid = 1000, quoteMsg = null;
    const Q = id => document.getElementById(id);
    const ma = Q('ma'), mi = Q('mi'), snd = Q('snd'), qb = Q('qb'), qbt = Q('qbt'), qbx = Q('qbx'), st = Q('st'), sm = Q('sm'), sp = Q('sp'), bk = Q('bk'), cn = Q('cn'), mn = Q('mn'), ctn = Q('ctn'), rs = Q('rs'), rsv = Q('rsv'), at = Q('at'), ai = Q('ai'), aiv = Q('aiv'), air = Q('air'), et = Q('et'), ap = Q('ap'), mu = Q('mu'), ctu = Q('ctu');
    let rTimer = null, aTimer = null, rDelay = 3000, aMin = 10, statusTimer = null;
    let isTyping = false;
    let textCards = [], emojiCards = [], imageCards = [], statusCards = [], groups = [{ id: 'default', name: '未分组', color: '#90943f' }], chatStickers = [];
    textCards = [];
    let currentTab = 'text', currentGroupFilter = 'default';
    let groupBarCollapsed = false;
    const contactStatusEl = Q('contactStatus');
    let previousStatusText = '在线';
    let isSending = false;
    let ignoreNextClick = false;
    const wp = Q('wp'), wbBack = Q('wbBack'), wbSearch = Q('wbSearch'), tabs = document.querySelectorAll('.tab'), cardList = Q('cardList'), groupBar = Q('groupBar'), wbImportText = Q('wbImportText'), wbUploadImg = Q('wbUploadImg'), wbExport = Q('wbExport'), wbImportJSON = Q('wbImportJSON'), importArea = Q('importArea'), importTextArea = Q('importTextArea'), confirmImport = Q('confirmImport'), cancelImport = Q('cancelImport'), imgUploadInput = Q('imgUploadInput'), jsonUploadInput = Q('jsonUploadInput');
    const tp = Q('tp'), themeBack = Q('themeBack'), bodyBgColor = Q('bodyBgColor'), mainBgColor = Q('mainBgColor'), headerBgColor = Q('headerBgColor'), btnBgColor = Q('btnBgColor'), inputBgColor = Q('inputBgColor'), myBubbleBgColor = Q('myBubbleBgColor'), contactBubbleBgColor = Q('contactBubbleBgColor'), accentColor = Q('accentColor'), fontSizeSlider = Q('fontSizeSlider'), fontSizeValue = Q('fontSizeValue'), applyThemeBtn = Q('applyThemeBtn'), resetThemeBtn = Q('resetThemeBtn');
    const hp = Q('hp'), hpBack = Q('hpBack'), historySearch = Q('historySearch'), historyDate = Q('historyDate'), jumpDateBtn = Q('jumpDateBtn'), clearDateFilter = Q('clearDateFilter'), exportHistoryBtn = Q('exportHistoryBtn'), importHistoryBtn = Q('importHistoryBtn'), historyJSONInput = Q('historyJSONInput'), historyList = Q('historyList');
    const clearAllHistoryBtn = Q('clearAllHistoryBtn');
    const kp = Q('kp'), kpBack = Q('kpBack'), keepAliveToggle = Q('keepAliveToggle'), nightModeToggle = Q('nightModeToggle');
    const defTheme = { bodyBg: '#6B6058', mainBg: '#EFE9E3', headerBg: '#9B8E82', btnBg: '#C4B9AC', inputBg: '#BEB2A5', myBubble: '#E4D9CD', contactBubble: '#F7F2EC', accent: '#887B6E', fontSize: 16 };
    const nightTheme = { bodyBg: '#2E2A27', mainBg: '#3E3935', headerBg: '#504842', btnBg: '#5E544C', inputBg: '#554D46', myBubble: '#585049', contactBubble: '#4D4640', accent: '#7D7165', fontSize: 16 };
    let isNight = localStorage.getItem('nightMode') === 'true';
    const imgBtn = Q('imgBtn'), chatImageInput = Q('chatImageInput');
    const stickerBtn = Q('stickerBtn'), stickerPanel = Q('stickerPanel'), stickerGrid = Q('stickerGrid'), addStickerBtn = Q('addStickerBtn'), stickerFileInput = Q('stickerFileInput');
    const rapidReplyBtn = Q('rapidReplyBtn');
    const mailboxBtn = Q('mailboxBtn'), mp = Q('mp'), mbBack = Q('mbBack');
    const sentTab = document.querySelector('.mailbox-tab[data-mtab="sent"]'), inboxTab = document.querySelector('.mailbox-tab[data-mtab="inbox"]');
    const writeLetterBtn = Q('writeLetterBtn'), letterEditArea = Q('letterEditArea'), letterContent = Q('letterContent'), sendLetterBtn = Q('sendLetterBtn'), cancelLetterBtn = Q('cancelLetterBtn'), letterList = Q('letterList');
    let letters = [], mailboxTab = 'sent';

    let rapidReplyActive = false, rapidReplyTimer = null;

    function showTyping() { if (!isTyping) { previousStatusText = contactStatusEl.textContent; isTyping = true; } contactStatusEl.textContent = '对方正在输入...'; }
    function hideTyping() { contactStatusEl.textContent = previousStatusText; isTyping = false; }
    function updateNightUI() { nightModeToggle.textContent = isNight ? '☀️' : '🌙' }
    updateNightUI(); if (isNight) applyNight();

    function compressImage(file, callback, maxWidth=300, quality=0.7) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                callback(compressedData);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function safeStorageSet(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch(e) {
            alert('存储空间已满，请清理一些表情包或聊天记录后再试。');
            console.warn('localStorage 存储失败', e);
        }
    }

    function saveAllData() {
        safeStorageSet('chatSettings', { myName, ctName, myAv, ctAv, rDelay, aMin, atChecked: at.checked, etChecked: et.checked });
        safeStorageSet('wordCards', { textCards, emojiCards, imageCards, statusCards, groups });
        safeStorageSet('chatMessages', { msgs, nid });
        safeStorageSet('chatStickers', chatStickers);
        safeStorageSet('letters', letters);
    }
    window.addEventListener('beforeunload', saveAllData);
    setInterval(saveAllData, 5000);

    function loadAllData() {
        try {
            const chatSettings = JSON.parse(localStorage.getItem('chatSettings'));
            if (chatSettings) {
                myName = chatSettings.myName || '我'; ctName = chatSettings.ctName || 'Norton·Campbell'; myAv = chatSettings.myAv || '我'; ctAv = chatSettings.ctAv || '🌿';
                rDelay = chatSettings.rDelay || 3000; aMin = chatSettings.aMin || 10;
                at.checked = chatSettings.atChecked || false; et.checked = chatSettings.etChecked !== undefined ? chatSettings.etChecked : true;
                mn.value = myName; ctn.value = ctName; rs.value = rDelay / 100; ai.value = aMin;
                air.style.opacity = at.checked ? '1' : '.5'; ai.disabled = !at.checked; updSlider();
            }
            const wordCards = JSON.parse(localStorage.getItem('wordCards'));
            if (wordCards) {
                textCards = wordCards.textCards || []; emojiCards = wordCards.emojiCards || []; imageCards = wordCards.imageCards || []; statusCards = wordCards.statusCards || [];
                groups = wordCards.groups || [{ id: 'default', name: '未分组', color: '#90943f' }];
                const defaultGroup = groups.find(g => g.id === 'default');
                if (defaultGroup && defaultGroup.name === 'name') defaultGroup.name = '未分组';
                if (!groups.some(g => g.id === 'default')) groups.unshift({ id: 'default', name: '未分组', color: '#90943f' });
            }
            const chatMessages = JSON.parse(localStorage.getItem('chatMessages'));
            if (chatMessages) { msgs = chatMessages.msgs || []; nid = chatMessages.nid || 1000; }
            const savedStickers = JSON.parse(localStorage.getItem('chatStickers'));
            if (savedStickers) chatStickers = savedStickers;
            const savedLetters = JSON.parse(localStorage.getItem('letters'));
            if (savedLetters) letters = savedLetters;
        } catch(e) {}
    }
    loadAllData();
    updateContactStatus();
    checkScheduledReplies();

    function updateContactStatus() {
        if (statusCards.length > 0) {
            const newStatus = statusCards[Math.floor(Math.random()*statusCards.length)].content;
            if (isTyping) { previousStatusText = newStatus; }
            else { contactStatusEl.textContent = newStatus; }
        } else {
            if (!isTyping) { contactStatusEl.textContent = '在线'; }
            else { previousStatusText = '在线'; }
        }
        clearTimeout(statusTimer);
        const nextDelay = Math.floor(Math.random() * 8 * 3600000) + 3600000;
        statusTimer = setTimeout(updateContactStatus, nextDelay);
    }

    function getRandomReply() {
        let baseText = textCards.length ? textCards[Math.floor(Math.random()*textCards.length)].content : '';
        if (et.checked && emojiCards.length) baseText += ' ' + emojiCards[Math.floor(Math.random()*emojiCards.length)].content;
        return baseText.trim();
    }

    function getRandomReplyMessage() {
        if (imageCards.length > 0 && Math.random() < 0.25) {
            const randomImage = imageCards[Math.floor(Math.random() * imageCards.length)].content;
            return { type: 'image', content: randomImage };
        } else {
            const text = getRandomReply();
            if (text) return { type: 'text', content: text };
            return null;
        }
    }

    function stopTimers() { if (rTimer) clearTimeout(rTimer); if (aTimer) clearInterval(aTimer); rTimer = aTimer = null }
    function startAuto() { if (aTimer) clearInterval(aTimer); aTimer = setInterval(() => { if (!at.checked) return; sendRapidReplies(); }, aMin * 60000); }

    function sendRapidReplies() {
        if (rapidReplyActive) { clearTimeout(rapidReplyTimer); rapidReplyActive = false; }
        rapidReplyActive = true;
        const total = Math.floor(Math.random()*3)+1;
        let count = 0;
        function sendNext() {
            if (count >= total || !rapidReplyActive) { rapidReplyActive = false; return; }
            showTyping();
            rapidReplyTimer = setTimeout(() => {
                hideTyping();
                const msgObj = getRandomReplyMessage();
                if (msgObj) {
                    const msg = { id: nid++, senderId: CT, text: msgObj.content, timestamp: Date.now(), status: 'read' };
                    if (msgObj.type === 'image') msg.msgType = 'image';
                    msgs.push(msg); render(); saveAllData();
                }
                count++;
                if (count < total) sendNext();
                else rapidReplyActive = false;
            }, rDelay);
        }
        sendNext();
    }

    function handleRapidReply(e) { e.preventDefault(); sendRapidReplies(); }
    rapidReplyBtn.addEventListener('click', handleRapidReply);
    rapidReplyBtn.addEventListener('touchend', handleRapidReply);

    function simReply() {
        if (rTimer) clearTimeout(rTimer);
        showTyping();
        rTimer = setTimeout(() => {
            hideTyping();
            const msgObj = getRandomReplyMessage();
            if (!msgObj) return;
            const msg = { id: nid++, senderId: CT, text: msgObj.content, timestamp: Date.now(), status:'read' };
            if (msgObj.type === 'image') msg.msgType = 'image';
            msgs.push(msg); render(); saveAllData();
        }, rDelay);
    }
    function updSlider() { let v = parseInt(rs.value); rsv.textContent = Math.floor(v/10)+'秒'; rDelay = v*100; let m = parseInt(ai.value); aiv.textContent = m+'分钟'; aMin = m }
    rs.oninput = updSlider; ai.oninput = updSlider; at.onchange = () => { ai.disabled = !at.checked; air.style.opacity = at.checked ? '1' : '.5' }
    function applySet() {
        myName = mn.value||'我'; ctName = ctn.value||'Norton·Campbell'; cn.textContent = ctName;
        stopTimers(); if (at.checked) startAuto();
        render(); sp.classList.remove('show'); saveAllData();
    }
    ap.onclick = applySet;

    function handleUpload(file, type) { if (!file) return; let r = new FileReader(); r.onload = e => { if (type === 'my') myAv = e.target.result; else ctAv = e.target.result; saveAllData(); }; r.readAsDataURL(file) }
    document.querySelectorAll('.au').forEach(b => b.onclick = () => { let t = b.dataset.avatar, up = t==='my'?mu:ctu; up.click(); up.onchange = e => { if (e.target.files[0]) handleUpload(e.target.files[0], t); up.value = '' } });

    function init() { if (msgs.length === 0) { msgs = []; } }
    init();
    function find(id) { return msgs.find(m => m.id === id) }
    function esc(t) { let d = document.createElement('div'); d.textContent = t; return d.innerHTML }
    function highlight(id) { let r = document.querySelector(`.mr[data-mid="${id}"]`); if (!r) return; document.querySelectorAll('.mr.hl').forEach(e => e.classList.remove('hl')); r.classList.add('hl'); r.scrollIntoView({ behavior:'smooth', block:'center' }); setTimeout(() => r.classList.remove('hl'), 2000) }
    function avHtml(v) { return v && v.startsWith('data:image') ? `<img src="${v}" style="width:100%;height:100%;object-fit:cover">` : v }
    function render() {
        if (!msgs.length) { ma.innerHTML = ''; return }
        let h = '';
        msgs.forEach(m => {
            if (m.senderId === SYS) { h += `<div class="mr msg-system"><span>${m.text}</span></div>`; return; }
            let me = m.senderId === MY, row = me ? 'mr r' : 'mr l', av = me ? avHtml(myAv) : avHtml(ctAv);
            let q = m.quoteId ? `<div class="qp" data-qid="${m.quoteId}"><span class="qt">📌 ${(m.quoteText||'').length>30?m.quoteText.slice(0,30)+'…':m.quoteText||''}</span></div>` : '';
            let d = new Date(m.timestamp), time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            let stt = me ? (m.status === 'read' ? '<span class="rs sdc">✓✓</span>' : '<span class="rs sc">✓</span>') : '<span style="opacity:.4">·</span>';
            let act = `<div class="mactions"><button class="ab qa" data-id="${m.id}">↩️</button><button class="ab da" data-id="${m.id}">🗑️</button></div>`;
            let ft = `<div class="bf"><span class="mt">${time}</span>${stt}${act}</div>`;
            let bubbleContent;
            if (m.msgType === 'image') { bubbleContent = `<div class="mb img-bubble"><img src="${m.text}" alt="图片"></div>`; }
            else { bubbleContent = `<div class="mb">${esc(m.text)}</div>`; }
            if (me) { h += `<div class="${row}" data-mid="${m.id}"><div class="bw">${q}${bubbleContent}${ft}</div><div class="av">${av}</div></div>`; }
            else { h += `<div class="${row}" data-mid="${m.id}"><div class="av">${av}</div><div class="bw">${q}${bubbleContent}${ft}</div></div>`; }
        });
        ma.innerHTML = h; ma.scrollTop = ma.scrollHeight;
    }
    function updQBar() { if (quoteMsg) { qb.style.display = 'flex'; qbt.textContent = `${quoteMsg.senderId===MY?myName:ctName}: ${(quoteMsg.msgType==='image'?'[图片]':quoteMsg.text).slice(0,40)}` } else qb.style.display = 'none' }
    function send(txt, q = null, msgType = 'text') {
        if (msgType === 'image' && !txt) return;
        if (isSending) return;
        isSending = true;
        let msg = { id:nid++, senderId:MY, text:txt.trim(), timestamp:Date.now(), status:'unread', quoteId:q?.id, quoteText:q?.msgType==='image'?'[图片]':q?.text, msgType };
        msgs.push(msg);
        setTimeout(() => { let un = msgs.filter(m => m.senderId===MY && m.status==='unread'); if (un.length) { un[un.length-1].status = 'read'; render(); saveAllData(); } }, 1800);
        quoteMsg = null;
        mi.value = ''; mi.focus();
        setTimeout(() => { mi.value = ''; isSending = false; }, 50);
        updQBar(); render(); simReply(); saveAllData();
    }
    function del(id) {
        let i = msgs.findIndex(m => m.id === id);
        if (i === -1) return;
        msgs.forEach(m => { if (m.quoteId === id) { m.quoteId = null; m.quoteText = null } });
        msgs.splice(i, 1);
        if (quoteMsg && quoteMsg.id === id) quoteMsg = null;
        render(); updQBar(); saveAllData();
    }
    snd.onclick = () => { send(mi.value, quoteMsg); };
    mi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(mi.value, quoteMsg); } });

    function handleMessageClick(e) {
        if (e.type === 'click' && ignoreNextClick) { ignoreNextClick = false; return; }
        if (e.type === 'touchend') { ignoreNextClick = true; }
        let prv = e.target.closest('.qp'); if (prv) { let qid = prv.dataset.qid; if (qid) find(parseInt(qid)) ? highlight(parseInt(qid)) : alert('原消息已被删除'); return }
        let bub = e.target.closest('.mb'); if (bub) { let row = bub.closest('.mr'), t = row.querySelector('.mactions'); document.querySelectorAll('.mactions').forEach(a => a.style.display = 'none'); if (t) t.style.display = 'flex' }
        else document.querySelectorAll('.mactions').forEach(a => a.style.display = 'none');
        let btn = e.target.closest('.ab'); if (btn) { let mid = parseInt(btn.dataset.id); if (btn.classList.contains('qa')) { let m = find(mid); if (m) { quoteMsg = m; updQBar(); mi.focus() } } else if (btn.classList.contains('da')) { if (confirm('确定删除？')) del(mid) } document.querySelectorAll('.mactions').forEach(a => a.style.display = 'none') }
    }
    ma.addEventListener('click', handleMessageClick);
    ma.addEventListener('touchend', handleMessageClick);

    qbx.onclick = () => { quoteMsg = null; updQBar() };
    document.addEventListener('click', e => { if (!e.target.closest('.mb') && !e.target.closest('.ab')) document.querySelectorAll('.mactions').forEach(a => a.style.display = 'none') });
    st.onclick = e => { e.stopPropagation(); sm.classList.toggle('show') };
    sm.addEventListener('click', e => { let it = e.target.closest('.si'); if (it) { let act = it.dataset.action; if (act === 'cs') { sm.classList.remove('show'); sp.classList.add('show') } else if (act === 'wb') { sm.classList.remove('show'); wp.classList.add('show'); renderWB() } else if (act === 'theme') { sm.classList.remove('show'); tp.classList.add('show') } else if (act === 'history') { sm.classList.remove('show'); hp.classList.add('show'); renderHist() } else if (act === 'keepalive') { sm.classList.remove('show'); kp.classList.add('show') } } e.stopPropagation() });
    bk.onclick = () => sp.classList.remove('show');
    themeBack.onclick = () => tp.classList.remove('show');
    hpBack.onclick = () => hp.classList.remove('show');
    kpBack.onclick = () => kp.classList.remove('show');
    document.addEventListener('click', e => { if (!sm.contains(e.target) && e.target !== st) sm.classList.remove('show') });

    imgBtn.onclick = () => { chatImageInput.click(); };
    chatImageInput.onchange = e => {
        let files = e.target.files;
        if (!files.length) return;
        Array.from(files).forEach(f => {
            compressImage(f, (compressed) => { send(compressed, null, 'image'); });
        });
        chatImageInput.value = '';
    };

    function renderStickerPanel() {
        stickerGrid.innerHTML = '';
        chatStickers.forEach((stk, idx) => {
            let item = document.createElement('div'); item.className = 'sticker-item';
            item.innerHTML = `<img src="${stk}"><button class="sticker-del" data-index="${idx}">✕</button>`;
            item.querySelector('img').addEventListener('click', () => { send(stk, null, 'image'); stickerPanel.classList.remove('show'); });
            const delBtn = item.querySelector('.sticker-del');
            const delHandler = (e) => {
                e.stopPropagation(); e.preventDefault();
                const currentIdx = parseInt(e.target.dataset.index);
                if (!isNaN(currentIdx) && chatStickers[currentIdx]) {
                    chatStickers.splice(currentIdx,1);
                    saveAllData();
                    renderStickerPanel();
                }
            };
            delBtn.addEventListener('click', delHandler);
            delBtn.addEventListener('touchend', delHandler);
            stickerGrid.appendChild(item);
        });
    }
    stickerBtn.onclick = (e) => { e.stopPropagation(); stickerPanel.classList.toggle('show'); if (stickerPanel.classList.contains('show')) renderStickerPanel(); };
    addStickerBtn.onclick = () => { stickerFileInput.click(); };
    stickerFileInput.onchange = e => {
        let files = e.target.files;
        if (!files.length) return;
        Array.from(files).forEach(f => {
            compressImage(f, (compressed) => { chatStickers.push(compressed); saveAllData(); renderStickerPanel(); });
        });
        stickerFileInput.value = '';
    };
    document.addEventListener('click', (e) => { if (!e.target.closest('.sticker-panel') && !e.target.closest('.sticker-btn')) { stickerPanel.classList.remove('show'); } });

    function deleteLetter(idx) { if (confirm('确定删除这封信吗？')) { letters.splice(idx,1); saveAllData(); renderMailbox(); } }
    function formatDate(ts) { const d = new Date(ts); return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`; }
    function renderMailbox() {
        const filtered = letters.filter(l=> mailboxTab==='sent' ? l.type==='sent' : l.type==='received');
        let html = '';
        filtered.forEach((l,idx) => { const realIdx = letters.indexOf(l); const dateStr = formatDate(l.timestamp); const preview = l.content.split('\n')[0]?.substring(0,40) + '...'; let extra = ''; if (l.type==='sent' && !l.replied) { extra = `<div style="font-size:12px;color:#5A4E3E;">预计回信：${formatDate(l.replyDue)}</div>`; } else if (l.type==='received') { extra = `<div style="font-size:12px;color:#5A4E3E;">已收到回信</div>`; }
            html += `<div class="letter-preview" data-idx="${realIdx}"><div class="letter-info"><div class="meta"><span>${l.type==='sent'?'寄给 '+ctName:'来自 '+ctName}</span><span>${dateStr}</span></div><div class="preview">${preview}</div>${extra}</div><button class="letter-del-btn" data-delidx="${realIdx}">✕</button></div>`; });
        letterList.innerHTML = html || '<div class="eh">✨ 暂无信件</div>';
        letterList.querySelectorAll('.letter-preview').forEach(el => { el.querySelector('.letter-info').onclick = () => { const idx = parseInt(el.dataset.idx); alert(letters[idx].content); }; el.querySelector('.letter-del-btn').onclick = (e) => { e.stopPropagation(); const idx = parseInt(el.dataset.idx); deleteLetter(idx); }; });
    }
    function sendLetter() {
        const content = letterContent.value.trim();
        if (!content) return;
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;
        const fullContent = `To Norton·Campbell\n\n${content}\n\n${dateStr}  Collins·Turner`;
        const replyDelay = Math.floor(Math.random()*15)+10;
        const letter = { id: Date.now(), type: 'sent', content: fullContent, timestamp: now.getTime(), replyDue: now.getTime() + replyDelay * 3600000 };
        letters.push(letter);
        saveAllData();
        letterContent.value = ''; setTimeout(() => { letterContent.value = ''; }, 50);
        letterEditArea.style.display = 'none';
        mailboxTab = 'sent'; sentTab.classList.add('active'); inboxTab.classList.remove('active');
        renderMailbox();
    }
    function checkScheduledReplies() {
        const now = Date.now();
        let changed = false;
        letters.forEach(l => {
            if (l.type === 'sent' && !l.replied && l.replyDue <= now) {
                const numSentences = Math.floor(Math.random()*5)+8;
                const sentences = [];
                for (let i=0;i<numSentences;i++) { sentences.push(textCards[Math.floor(Math.random()*textCards.length)].content); }
                const replyDate = new Date();
                const replyDateStr = `${replyDate.getFullYear()}-${(replyDate.getMonth()+1).toString().padStart(2,'0')}-${replyDate.getDate().toString().padStart(2,'0')}`;
                const replyContent = `To Collins·Turner\n\n${sentences.join('\n')}\n\n${replyDateStr}  Norton·Campbell`;
                letters.push({ id: Date.now()+Math.random(), type: 'received', content: replyContent, timestamp: replyDate.getTime(), replyTo: l.id });
                l.replied = true; changed = true;
            }
        });
        if (changed) saveAllData();
    }
    writeLetterBtn.onclick = () => { letterEditArea.style.display = 'block'; };
    cancelLetterBtn.onclick = () => { letterEditArea.style.display = 'none'; };
    sendLetterBtn.onclick = sendLetter;
    sentTab.onclick = () => { mailboxTab = 'sent'; sentTab.classList.add('active'); inboxTab.classList.remove('active'); renderMailbox(); };
    inboxTab.onclick = () => { mailboxTab = 'inbox'; inboxTab.classList.add('active'); sentTab.classList.remove('active'); renderMailbox(); };
    mailboxBtn.onclick = e => { e.stopPropagation(); mp.classList.toggle('show'); if (mp.classList.contains('show')) { checkScheduledReplies(); renderMailbox(); } };
    mbBack.onclick = () => mp.classList.remove('show');
    setInterval(checkScheduledReplies, 60000);

    let keepAliveId = null;
    function startKeepAlive() { if (keepAliveId) return; keepAliveId = setInterval(() => { fetch(window.location.href, { method: 'HEAD' }).catch(() => {}) }, 30000); }
    function stopKeepAlive() { if (keepAliveId) { clearInterval(keepAliveId); keepAliveId = null; } }
    const savedKeep = localStorage.getItem('keepAlive') === 'true';
    keepAliveToggle.checked = savedKeep; if (savedKeep) startKeepAlive();
    keepAliveToggle.onchange = () => { if (keepAliveToggle.checked) { localStorage.setItem('keepAlive', 'true'); startKeepAlive(); } else { localStorage.setItem('keepAlive', 'false'); stopKeepAlive(); } };

    function applyNight() { setThemeInputs(nightTheme); applyTheme(); }
    nightModeToggle.onclick = () => { isNight = !isNight; localStorage.setItem('nightMode', isNight); updateNightUI(); if (isNight) applyNight(); else loadTheme(); };
    function syncHex(target) { const hexInput = document.querySelector(`.hex-input[data-target="${target.id}"]`); if (hexInput) hexInput.value = target.value }
    document.querySelectorAll('.hex-input').forEach(inp => { inp.addEventListener('input', function() { const target = document.getElementById(this.dataset.target); const val = this.value.trim(); if (/^#[0-9a-fA-F]{6}$/.test(val)) { target.value = val } }); inp.addEventListener('change', function() { const target = document.getElementById(this.dataset.target); if (!/^#[0-9a-fA-F]{6}$/.test(this.value.trim())) { this.value = target.value } }) });
    document.querySelectorAll('input[type="color"]').forEach(inp => { inp.addEventListener('input', function() { syncHex(this) }) });
    function setThemeInputs(theme) { bodyBgColor.value = theme.bodyBg; mainBgColor.value = theme.mainBg; headerBgColor.value = theme.headerBg; btnBgColor.value = theme.btnBg; inputBgColor.value = theme.inputBg; myBubbleBgColor.value = theme.myBubble; contactBubbleBgColor.value = theme.contactBubble; accentColor.value = theme.accent; fontSizeSlider.value = theme.fontSize; fontSizeValue.textContent = theme.fontSize + 'px'; document.querySelectorAll('.hex-input').forEach(inp => { const target = document.getElementById(inp.dataset.target); if (target) inp.value = target.value }); }
    function loadTheme() { if (isNight) { setThemeInputs(nightTheme); applyTheme(); return; } const saved = JSON.parse(localStorage.getItem('chatTheme') || '{}'); const theme = { bodyBg: saved.bodyBg || defTheme.bodyBg, mainBg: saved.mainBg || defTheme.mainBg, headerBg: saved.headerBg || defTheme.headerBg, btnBg: saved.btnBg || defTheme.btnBg, inputBg: saved.inputBg || defTheme.inputBg, myBubble: saved.myBubble || defTheme.myBubble, contactBubble: saved.contactBubble || defTheme.contactBubble, accent: saved.accent || defTheme.accent, fontSize: saved.fontSize || defTheme.fontSize }; setThemeInputs(theme); applyTheme(); }
    function applyTheme() {
        let bodyBg = bodyBgColor.value, mainBg = mainBgColor.value, headerBg = headerBgColor.value, btnBg = btnBgColor.value, inputBg = inputBgColor.value, myBubble = myBubbleBgColor.value, contactBubble = contactBubbleBgColor.value, accent = accentColor.value, fontSize = parseInt(fontSizeSlider.value);
        if (isNight) { bodyBg = nightTheme.bodyBg; mainBg = nightTheme.mainBg; headerBg = nightTheme.headerBg; btnBg = nightTheme.btnBg; inputBg = nightTheme.inputBg; myBubble = nightTheme.myBubble; contactBubble = nightTheme.contactBubble; accent = nightTheme.accent; }
        fontSizeValue.textContent = fontSize + 'px';
        if (!isNight) localStorage.setItem('chatTheme', JSON.stringify({ bodyBg, mainBg, headerBg, btnBg, inputBg, myBubble, contactBubble, accent, fontSize }));
        let style = document.getElementById('dynamicTheme'); if (!style) { style = document.createElement('style'); style.id = 'dynamicTheme'; document.head.appendChild(style) }
        let txt = isNight ? '#E8E0D8' : '';
        let nightExtra = isNight ? `.sg,.sm,.search-box,.import-area,.card-item,.history-msg,.mi,.si:hover,.ab:hover{background:${nightTheme.contactBubble}!important}.sp,.wp,.tp,.hp,.kp,.mp{background:${mainBg}!important}.ir input[type=text],textarea,.hex-input,.date-row input[type=date]{background:#3E3935!important;border-color:${accent}!important;color:${txt}!important}.group-tag{background:${btnBg}70!important;color:${txt}cc!important}.tab{background:${btnBg}90!important;color:${txt}cc!important}.circle-btn,.btn,.call-btn,.img-btn,.sticker-btn,.rapid-reply-btn,.letter-del-btn,.group-export-btn,.group-toggle-btn{color:${txt}!important}.bb,.group-edit-btn{color:${txt}cc!important}.mr.hl{background:rgba(200,190,180,.15)!important}input[type=range]::-webkit-slider-track,input[type=range]::-moz-range-track{background:#555!important}.si,.sg,.card-item,.card-item.img-card{border-color:${accent}!important}.date-row input[type=date]{background:${nightTheme.contactBubble}!important}` : '';
        let txtFull = `${txt?`.c,.cn,.st,.si,.pt,.sl,.ir label,.mb,.mi,.tab,.btn,.group-tag,.card-content,.ab,.new-group-btn,.circle-btn,.call-btn,.img-btn,.sticker-btn,.rapid-reply-btn,.bb,.qbt,.message-time,.setting-label,.search-box,.color-row span,.history-msg .meta,.history-msg .preview,.bf,.tr label,.sr span,.font-slider span,.kp .sg div,.import-area div,.eh,.kp .sg div span,.sticker-panel .add-sticker-btn,.msg-system,.mailbox-tab,.group-export-btn,.group-toggle-btn{color:${txt}!important}.mi::placeholder,.search-box::placeholder,textarea::placeholder{color:${txt}99}.qp,.qt{color:${txt}cc!important}.eh{color:${txt}88!important}`:''}`;
        let avatarExtra = `.av{background:${mainBg}!important}.call-avatar{background:${mainBg}!important}`;
        let callExtra = `.call-header{background:${headerBg}!important}.call-window{background:${mainBg}!important}.call-minimized-bar{background:${headerBg}!important}`;
        style.textContent = `body{background:${bodyBg}!important}.c,.ma,.sp,.wp,.tp,.hp,.kp,.mp{background:${mainBg}!important}.h{background:${headerBg}!important}.ia{background:${inputBg}!important}.btn,.circle-btn,.au,.new-group-btn,.snd,.call-btn,.img-btn,.sticker-btn,.rapid-reply-btn,.ap,#applyThemeBtn,.group-export-btn,.group-toggle-btn{background:${btnBg}!important}.btn:hover,.circle-btn:hover,.au:hover,.new-group-btn:hover,.snd:hover,.call-btn:hover,.img-btn:hover,.sticker-btn:hover,.rapid-reply-btn:hover,.ap:hover,#applyThemeBtn:hover,.group-export-btn:hover,.group-toggle-btn:hover{filter:brightness(0.85)!important}.tab,.mailbox-tab{background:${btnBg}90}.tab.active,.mailbox-tab.active{background:${accent}!important}.group-tag{background:${btnBg}70}.mb{background:${contactBubble}!important}.r .mb{background:${myBubble}!important}${txtFull}${nightExtra}${avatarExtra}${callExtra}.c .cn,.c .st,.c .si,.c .pt,.c .sl,.c .ir label,.c .mb,.c .mi,.c .tab,.c .btn,.c .group-tag,.c .card-content,.c .ab,.c .new-group-btn,.c .circle-btn,.c .call-btn,.c .img-btn,.c .sticker-btn,.c .rapid-reply-btn,.c .bb,.c .qbt,.c .message-time,.c .setting-label,.c .search-box,.c .mailbox-tab,.c .group-export-btn,.c .group-toggle-btn{font-size:${fontSize}px!important}`
    }
    fontSizeSlider.oninput = () => { fontSizeValue.textContent = fontSizeSlider.value + 'px' };
    applyThemeBtn.onclick = () => { if (isNight) { isNight = false; localStorage.setItem('nightMode', 'false'); updateNightUI(); } applyTheme(); tp.classList.remove('show') };
    resetThemeBtn.onclick = () => { setThemeInputs(defTheme); applyTheme() };
    loadTheme();

    /* 通话功能 */
    let inCall = false, callStartTime = null, callTimerId = null, callMinimized = false, incomingWaiting = false, isDialing = false, dialTimer = null;
    const callBtn = Q('callBtn'), callWindow = Q('callWindow'), callHeader = Q('callHeader'), callMin = Q('callMin'), callAvatar = Q('callAvatar'), callTimer = Q('callTimer'), callTitle = Q('callTitle'), callBody = Q('callBody'), callHangup = Q('callHangup'), incActions = Q('incActions'), incAccept = Q('incAccept'), incHangup = Q('incHangup'), cmiBar = Q('cmiBar'), cmiTime = Q('cmiTime'), callRestore = Q('callRestore');

    function formatTime(sec) {
        let h = Math.floor(sec / 3600);
        let m = Math.floor((sec % 3600) / 60);
        let s = sec % 60;
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }
    function updateCallUI() { if (!inCall) return; let elapsed = Math.floor((Date.now()-callStartTime)/1000); let timeStr = formatTime(elapsed); callTimer.textContent = timeStr; cmiTime.textContent = timeStr; }
    function resetCallBody() { callBody.querySelector('.call-avatar').style.display = ''; callTimer.style.display = ''; callHangup.style.display = ''; incActions.style.display = 'none'; callTitle.textContent = '通话中'; }
    function clearDialTimer() { if (dialTimer) { clearTimeout(dialTimer); dialTimer = null; } }
    function startCall(fromSystem = false) {
        if (inCall) return;
        inCall = true; callStartTime = Date.now(); callMinimized = false; incomingWaiting = false; isDialing = false;
        clearDialTimer();
        callWindow.style.display = 'flex'; callWindow.style.width = '220px'; callWindow.style.height = 'auto'; callWindow.style.borderRadius = '24px';
        callHeader.style.display = 'flex'; callBody.style.display = 'flex'; cmiBar.style.display = 'none';
        resetCallBody();
        callAvatar.innerHTML = ctAv && ctAv.startsWith('data:image') ? `<img src="${ctAv}" style="width:100%;height:100%;object-fit:cover">` : ctAv;
        callWindow.style.left = '50%'; callWindow.style.top = '50%'; callWindow.style.transform = 'translate(-50%,-50%)';
        callTimer.textContent = '00:00:00'; cmiTime.textContent = '00:00:00'; callMin.textContent = '—';
        callTimerId = setInterval(updateCallUI, 1000);
        if (!fromSystem) { msgs.push({ id:nid++, senderId:SYS, text:'📞 通话开始', timestamp:Date.now() }); render(); saveAllData(); }
        render();
    }
    function endCall() {
        if (!inCall && !incomingWaiting && !isDialing) return;
        clearInterval(callTimerId); callTimerId = null;
        clearDialTimer();
        if (inCall) {
            let elapsed = Math.floor((Date.now()-callStartTime)/1000);
            msgs.push({ id:nid++, senderId:SYS, text:`📞 通话结束，时长 ${formatTime(elapsed)}`, timestamp:Date.now() });
            saveAllData(); render();
        } else if (incomingWaiting) {
            msgs.push({ id:nid++, senderId:SYS, text:'📞 未接来电', timestamp:Date.now() });
            saveAllData();
        } else if (isDialing) {
            msgs.push({ id:nid++, senderId:SYS, text:'📞 对方未接听', timestamp:Date.now() });
            saveAllData();
        }
        callWindow.style.display = 'none'; inCall = false; callMinimized = false; incomingWaiting = false; isDialing = false;
        render();
    }
    function incomingCall() {
        if (inCall || incomingWaiting || isDialing) return;
        incomingWaiting = true;
        callWindow.style.display = 'flex'; callWindow.style.width = '220px'; callWindow.style.height = 'auto'; callWindow.style.borderRadius = '24px';
        callHeader.style.display = 'flex'; callBody.style.display = 'flex'; cmiBar.style.display = 'none';
        callTitle.textContent = '来电';
        callAvatar.innerHTML = ctAv && ctAv.startsWith('data:image') ? `<img src="${ctAv}" style="width:100%;height:100%;object-fit:cover">` : ctAv;
        callTimer.style.display = 'none'; callHangup.style.display = 'none'; incActions.style.display = 'flex';
        callWindow.style.left = '50%'; callWindow.style.top = '50%'; callWindow.style.transform = 'translate(-50%,-50%)';
    }
    function startDialing() {
        if (inCall || incomingWaiting || isDialing) return;
        isDialing = true;
        callWindow.style.display = 'flex'; callWindow.style.width = '220px'; callWindow.style.height = 'auto'; callWindow.style.borderRadius = '24px';
        callHeader.style.display = 'flex'; callBody.style.display = 'flex'; cmiBar.style.display = 'none';
        callTitle.textContent = '正在呼叫...';
        callAvatar.innerHTML = ctAv && ctAv.startsWith('data:image') ? `<img src="${ctAv}" style="width:100%;height:100%;object-fit:cover">` : ctAv;
        callTimer.style.display = 'none'; callHangup.style.display = 'none'; incActions.style.display = 'none';
        callWindow.style.left = '50%'; callWindow.style.top = '50%'; callWindow.style.transform = 'translate(-50%,-50%)';
        const delay = Math.floor(Math.random() * 2000) + 1000;
        dialTimer = setTimeout(() => {
            if (Math.random() < 0.6) { isDialing = false; startCall(true); }
            else { endCall(); }
        }, delay);
    }
    incAccept.onclick = () => { incomingWaiting = false; startCall(true); };
    incHangup.onclick = () => { endCall(); };
    callBtn.onclick = () => { if (inCall) { endCall(); } else if (incomingWaiting) { endCall(); } else if (isDialing) { endCall(); } else { startDialing(); } };
    callHangup.onclick = endCall;
    callMin.onclick = (e) => {
        e.stopPropagation();
        if (incomingWaiting || isDialing) return;
        if (!callMinimized) {
            callWindow.style.width = '160px'; callWindow.style.height = '40px'; callWindow.style.borderRadius = '20px';
            callHeader.style.display = 'none'; callBody.style.display = 'none'; cmiBar.style.display = 'flex'; callMinimized = true;
        } else {
            callWindow.style.width = '220px'; callWindow.style.height = 'auto'; callWindow.style.borderRadius = '24px';
            callHeader.style.display = 'flex'; callBody.style.display = 'flex'; cmiBar.style.display = 'none'; callMinimized = false;
        }
    };
    callRestore.onclick = () => { callMin.click(); };
    callMin.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    callMin.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: false});
    callRestore.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    callRestore.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: false});
    let dragInfo = null;
    function startDrag(e) {
        if (incomingWaiting || isDialing) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragInfo = { x: clientX - callWindow.offsetLeft, y: clientY - callWindow.offsetTop };
        if (e.touches) e.preventDefault();
    }
    function onDrag(e) {
        if (!dragInfo) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        callWindow.style.left = (clientX - dragInfo.x) + 'px';
        callWindow.style.top = (clientY - dragInfo.y) + 'px';
        callWindow.style.transform = 'none';
        if (e.touches) e.preventDefault();
    }
    function endDrag() { dragInfo = null; }
    callHeader.addEventListener('mousedown', startDrag);
    callHeader.addEventListener('touchstart', startDrag, { passive: false });
    cmiBar.addEventListener('mousedown', startDrag);
    cmiBar.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    let incomingCallTimer = null;
    function scheduleIncomingCall() {
        clearTimeout(incomingCallTimer);
        const minDelay = 10 * 60 * 1000;
        const maxDelay = 120 * 60 * 1000;
        const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
        incomingCallTimer = setTimeout(() => {
            if (!inCall && !incomingWaiting && !isDialing) {
                incomingCall();
            }
            scheduleIncomingCall();
        }, delay);
    }
    scheduleIncomingCall();

    function renderHist() {
        let filtered = msgs.slice();
        const searchTerm = historySearch.value.trim().toLowerCase();
        if (searchTerm) filtered = filtered.filter(m => m.text.toLowerCase().includes(searchTerm));
        const dateVal = historyDate.value;
        if (dateVal) { const selectedDate = new Date(dateVal+'T00:00:00'); filtered = filtered.filter(m => { const d = new Date(m.timestamp); return d.getFullYear()===selectedDate.getFullYear()&&d.getMonth()===selectedDate.getMonth()&&d.getDate()===selectedDate.getDate() }); }
        filtered.sort((a,b) => a.timestamp - b.timestamp);
        let html = '';
        filtered.forEach(m => { const d = new Date(m.timestamp), time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`, date = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`, sender = m.senderId===MY ? (myName||'我') : m.senderId===CT ? (ctName||'对方') : '系统'; let preview = m.msgType==='image'?'[图片]':esc(m.text).substring(0,50);
            html += `<div class="history-msg" data-mid="${m.id}"><div class="meta"><span>${sender}</span><span>${date} ${time}</span></div><div class="preview">${preview}</div></div>`; });
        historyList.innerHTML = html || '<div class="eh">✨ 暂无匹配记录</div>';
        historyList.querySelectorAll('.history-msg').forEach(el => { el.onclick = () => { const mid = parseInt(el.dataset.mid); hp.classList.remove('show'); highlight(mid); }; });
    }
    historySearch.oninput = renderHist;
    jumpDateBtn.onclick = () => { if (historyDate.value) renderHist(); };
    clearDateFilter.onclick = () => { historyDate.value = ''; renderHist(); };
    exportHistoryBtn.onclick = () => { const dataStr = JSON.stringify(msgs, null, 2); const blob = new Blob([dataStr], { type:'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chat_history.json'; a.click(); };
    importHistoryBtn.onclick = () => historyJSONInput.click();
    historyJSONInput.onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                let data = JSON.parse(ev.target.result);
                if (Array.isArray(data)) {
                    if (confirm('导入将替换当前聊天记录，确定继续吗？')) {
                        msgs = data;
                        nid = Math.max(...msgs.map(m => m.id),0)+1;
                        render(); renderHist(); saveAllData();
                        alert('聊天记录导入成功');
                    }
                } else if (data && Array.isArray(data.msgs)) {
                    if (confirm('导入将替换当前聊天记录，确定继续吗？')) {
                        msgs = data.msgs;
                        nid = Math.max(...msgs.map(m => m.id),0)+1;
                        render(); renderHist(); saveAllData();
                        alert('聊天记录导入成功');
                    }
                } else {
                    alert('无效的聊天记录文件（期望数组格式）');
                }
            } catch(ex) {
                alert('无效的JSON文件');
            }
        };
        reader.readAsText(file);
        historyJSONInput.value = '';
    };

    // 一键清除所有聊天记录
    clearAllHistoryBtn.onclick = () => {
        if (confirm('⚠️ 确定要永久清除所有聊天记录吗？此操作不可恢复。')) {
            msgs = [];
            nid = 1000;
            render();
            saveAllData();
            alert('聊天记录已清除');
        }
    };

    function renderGroupBar() {
        if (currentTab !== 'text') { groupBar.style.display = 'none'; return }
        groupBar.style.display = 'flex';
        if (groupBarCollapsed) { groupBar.innerHTML = `<button class="group-toggle-btn" id="expandGroupBtn">▶ 展开分组</button>`; document.getElementById('expandGroupBtn').addEventListener('click', () => { groupBarCollapsed = false; renderWB(); }); return; }
        let h = groups.map(g => {
            let isActive = currentGroupFilter === g.id;
            return `<div class="group-tag ${isActive?'active':''}" data-group-id="${g.id}" style="border-color:${g.color}"><span class="group-color" style="background:${g.color}"></span>${g.name}<button class="group-edit-btn" data-edit-group="${g.id}">✎</button>${g.id!=='default'?`<button class="group-edit-btn" data-del-group="${g.id}">✕</button>`:''}</div>`;
        }).join('');
        h += `<button class="new-group-btn" id="newGroupBtn">+ 新建</button>`;
        if (currentGroupFilter !== 'all') h += `<button class="group-export-btn" id="exportGroupBtn">📤 导出"${groups.find(g=>g.id===currentGroupFilter)?.name||'当前分组'}"</button>`;
        h += `<button class="group-toggle-btn" id="collapseGroupBtn" style="margin-left:4px">▲ 收起</button>`;
        groupBar.innerHTML = h;
        document.querySelectorAll('.group-tag').forEach(el => { el.addEventListener('click', e => { if (!e.target.closest('button')) { currentGroupFilter = el.dataset.groupId; renderWB() } }) });
        document.querySelectorAll('[data-edit-group]').forEach(b => b.onclick = e => { e.stopPropagation(); let gid = b.dataset.editGroup, g = groups.find(g => g.id === gid); if (g) { let nn = prompt('分组名称', g.name); if (nn !== null) { let nc = prompt('颜色代码 (如 #A9BD70)', g.color); g.name = nn.trim()||g.name; g.color = nc||g.color; renderWB(); saveAllData(); } } });
        document.querySelectorAll('[data-del-group]').forEach(b => b.onclick = e => { e.stopPropagation(); let gid = b.dataset.delGroup; if (confirm('删除分组？卡片将移至默认分组')) { groups = groups.filter(g => g.id !== gid); textCards.forEach(c => { if (c.groupId === gid) c.groupId = 'default' }); if (currentGroupFilter === gid) currentGroupFilter = 'all'; renderWB(); saveAllData(); } });
        document.getElementById('newGroupBtn')?.addEventListener('click', () => { let name = prompt('分组名称','新分组'); if (name) { let color = prompt('颜色代码','#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')); groups.push({ id: Date.now()+'-'+Math.random(), name, color: color||'#90943f' }); renderWB(); saveAllData(); } });
        document.getElementById('exportGroupBtn')?.addEventListener('click', () => { exportGroupJSON(currentGroupFilter); });
        document.getElementById('collapseGroupBtn')?.addEventListener('click', () => { groupBarCollapsed = true; renderWB(); });
    }
    function exportGroupJSON(groupId) {
        let group = groups.find(g => g.id === groupId);
        if (!group) return;
        let filteredTextCards = textCards.filter(c => c.groupId === groupId);
        let data = { text: filteredTextCards, emoji: emojiCards, image: imageCards, status: statusCards, groups, exportGroupId: groupId, exportGroupName: group.name };
        let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        let a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wordbank_' + group.name + '.json'; a.click();
    }
    function getCardListArray() { if (currentTab === 'text') return textCards; if (currentTab === 'emoji') return emojiCards; if (currentTab === 'image') return imageCards; if (currentTab === 'status') return statusCards; return []; }
    function renderWB() {
        renderGroupBar();
        let s = wbSearch.value.toLowerCase(), list = getCardListArray();
        if (currentTab === 'text' && currentGroupFilter !== 'all') list = list.filter(c => c.groupId === currentGroupFilter);
        let filtered = list.filter(c => c.content.toLowerCase().includes(s));
        cardList.classList.toggle('grid', currentTab === 'image');
        let h = '';
        filtered.forEach(c => { let gc = '#ccc'; if (currentTab === 'text' && c.groupId) { let g = groups.find(g => g.id === c.groupId); if (g) gc = g.color } if (currentTab === 'image') { h += `<div class="card-item img-card" style="border-left-color:${gc}"><img class="card-img" src="${c.content}"><button class="img-del-btn" data-del="${c.id}">✕</button></div>` } else { h += `<div class="card-item" style="border-left-color:${gc}"><div class="card-content">${esc(c.content)}</div><div class="card-actions"><button class="ab" data-edit="${c.id}">✏️</button><button class="card-del" data-del="${c.id}">🗑️</button></div></div>` } });
        cardList.innerHTML = h || '<div class="eh">✨ 暂无字卡</div>'
    }
    function addCard(content, type, groupId = 'default') {
        let arr = getCardArrByType(type);
        if (arr.some(c => c.content === content)) { alert('内容重复'); return false }
        arr.push({ id: Date.now()+Math.random(), content, groupId: (type==='text'||type==='status')?groupId:undefined });
        renderWB(); saveAllData(); return true;
    }
    function getCardArrByType(type) { if (type==='text') return textCards; if (type==='emoji') return emojiCards; if (type==='image') return imageCards; if (type==='status') return statusCards; return []; }
    function deleteCard(id, type) { let arr = getCardArrByType(type); let idx = arr.findIndex(c => c.id == id); if (idx !== -1) arr.splice(idx,1); renderWB(); saveAllData() }
    function importText(text, type, groupId='default') {
        let lines = text.split('\n').map(l => l.trim()).filter(l => l);
        let arr = getCardArrByType(type);
        let added = 0;
        lines.forEach(l => {
            if (!arr.some(c => c.content === l)) {
                arr.push({ id: Date.now()+Math.random(), content: l, groupId: (type==='text'||type==='status')?groupId:undefined });
                added++;
            }
        });
        if (added > 0) { renderWB(); saveAllData(); }
        alert(`导入了 ${added} 条`);
    }
    wbImportText.onclick = () => { if (currentTab === 'image') { imgUploadInput.click() } else { importArea.style.display = 'block'; importTextArea.value = ''; importTextArea.placeholder = currentTab==='text'?'每行一条主字卡':currentTab==='emoji'?'每行一条Emoji':currentTab==='status'?'每行一条状态':'每行一条' } };
    wbUploadImg.onclick = () => imgUploadInput.click();

    function handleImportConfirm(e) {
        e.preventDefault();
        let gid = 'default';
        if (currentTab === 'text') gid = currentGroupFilter !== 'all' ? currentGroupFilter : 'default';
        importText(importTextArea.value, currentTab, gid);
        importTextArea.value = '';
        importArea.style.display = 'none';
    }
    function handleImportCancel(e) { e.preventDefault(); importArea.style.display = 'none'; }
    confirmImport.addEventListener('click', handleImportConfirm);
    confirmImport.addEventListener('touchend', handleImportConfirm);
    cancelImport.addEventListener('click', handleImportCancel);
    cancelImport.addEventListener('touchend', handleImportCancel);

    imgUploadInput.onchange = e => {
        let files = e.target.files;
        if (!files.length) return;
        Array.from(files).forEach(f => {
            compressImage(f, (compressed) => { addCard(compressed, 'image'); });
        });
        renderWB(); imgUploadInput.value = '';
    };
    wbExport.onclick = () => {
        const choiceList = '0: 全部字卡\n' + groups.map((g, idx) => `${idx+1}: ${g.name}`).join('\n');
        const choice = prompt(`请选择导出方式 (输入数字)：\n${choiceList}`, '0');
        if (choice === null) return;
        const num = parseInt(choice);
        if (isNaN(num) || num < 0 || num > groups.length) { alert('无效选择'); return; }
        if (num === 0) { exportAllJSON(); } else { exportGroupJSON(groups[num-1].id); }
    };
    function exportAllJSON() { let data = { text: textCards, emoji: emojiCards, image: imageCards, status: statusCards, groups }; let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); let a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'wordbank.json'; a.click(); }
    wbImportJSON.onclick = () => jsonUploadInput.click();
    jsonUploadInput.onchange = e => { let f = e.target.files[0]; if (!f) return; let r = new FileReader(); r.onload = ev => { try { let data = JSON.parse(ev.target.result); textCards = data.text || []; emojiCards = data.emoji || []; imageCards = data.image || []; statusCards = data.status || []; groups = data.groups || [{ id: 'default', name: '未分组', color: '#90943f' }]; const defaultGroup = groups.find(g => g.id === 'default'); if (defaultGroup && defaultGroup.name === 'name') defaultGroup.name = '未分组'; if (!groups.some(g => g.id === 'default')) groups.unshift({ id: 'default', name: '未分组', color: '#90943f' }); updateContactStatus(); renderWB(); saveAllData(); } catch(ex) { alert('无效JSON') } }; r.readAsText(f); jsonUploadInput.value = ''; };
    cardList.addEventListener('click', e => { let delBtn = e.target.closest('[data-del]'); if (delBtn) { deleteCard(delBtn.dataset.del, currentTab); return } let editBtn = e.target.closest('[data-edit]'); if (editBtn) { let id = editBtn.dataset.edit, arr = getCardListArray(), c = arr.find(c => c.id == id); if (c) { let nv = prompt('编辑内容', c.content); if (nv !== null && nv.trim()) { if (arr.some(x => x.content === nv.trim() && x.id !== id)) alert('重复'); else { c.content = nv.trim(); if (currentTab === 'text') { let opts = groups.map(g => `${g.name}:${g.id}`).join(','); let ng = prompt('分组ID (可选: '+opts+')', c.groupId); if (ng && groups.some(g => g.id === ng)) c.groupId = ng } renderWB(); saveAllData(); } } } } });
    tabs.forEach(t => t.onclick = () => { tabs.forEach(tb => tb.classList.remove('active')); t.classList.add('active'); currentTab = t.dataset.tab; currentGroupFilter = 'all'; wbSearch.value = ''; renderWB() });
    wbSearch.oninput = renderWB;
    wbBack.onclick = () => wp.classList.remove('show');
    updateContactStatus();
    render(); updSlider(); applySet();

    function adjustLayout() {
        const c = document.querySelector('.c');
        if (!c) return;
        const availableHeight = window.innerHeight - 32;
        c.style.height = Math.min(availableHeight, 640) + 'px';
        c.style.transform = 'translateY(-25px)';
    }
    window.addEventListener('resize', adjustLayout);
    if (window.visualViewport) { window.visualViewport.addEventListener('resize', adjustLayout); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', adjustLayout); } else { adjustLayout(); }
})();