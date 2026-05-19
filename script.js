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

    /* ---------- IndexedDB / localStorage 适配 ---------- */
    let dbAvailable = false;
    let db;

    function initDB() {
        return new Promise((resolve) => {
            if (!window.indexedDB) {
                dbAvailable = false;
                resolve();
                return;
            }
            const request = indexedDB.open('ChatAppDB', 1);
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('messages')) db.createObjectStore('messages');
                if (!db.objectStoreNames.contains('letters')) db.createObjectStore('letters');
                if (!db.objectStoreNames.contains('stickers')) db.createObjectStore('stickers');
            };
            request.onsuccess = e => { db = e.target.result; dbAvailable = true; resolve(); };
            request.onerror = () => { dbAvailable = false; resolve(); };
        });
    }

    async function saveDataToStorage() {
        // 设置和字卡始终存 localStorage
        localStorage.setItem('chatSettings', JSON.stringify({ myName, ctName, myAv, ctAv, rDelay, aMin, atChecked: at.checked, etChecked: et.checked }));
        localStorage.setItem('wordCards', JSON.stringify({ textCards, emojiCards, imageCards, statusCards, groups }));

        if (dbAvailable && db) {
            // IndexedDB 可用时，聊天记录、信件、表情包存这里
            const tx = db.transaction(['messages','letters','stickers'], 'readwrite');
            tx.objectStore('messages').put(msgs, 'msgs');
            tx.objectStore('messages').put(nid, 'nid');
            tx.objectStore('letters').put(letters, 'data');
            tx.objectStore('stickers').put(chatStickers, 'data');
            await new Promise(r => tx.oncomplete = r);
            // 同时清理 localStorage 中的旧数据（如果存在）
            if (localStorage.getItem('chatMessages')) localStorage.removeItem('chatMessages');
            if (localStorage.getItem('letters')) localStorage.removeItem('letters');
            if (localStorage.getItem('chatStickers')) localStorage.removeItem('chatStickers');
        } else {
            // 回退到 localStorage
            localStorage.setItem('chatMessages', JSON.stringify({ msgs, nid }));
            localStorage.setItem('letters', JSON.stringify(letters));
            localStorage.setItem('chatStickers', JSON.stringify(chatStickers));
        }
    }

    function loadDataFromStorage() {
        const chatSettings = JSON.parse(localStorage.getItem('chatSettings'));
        if (chatSettings) {
            myName = chatSettings.myName || '我'; ctName = chatSettings.ctName || 'Norton·Campbell';
            myAv = chatSettings.myAv || '我'; ctAv = chatSettings.ctAv || '🌿';
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

        if (dbAvailable && db) {
            // 从 IndexedDB 读取
            const tx = db.transaction(['messages','letters','stickers'], 'readonly');
            const msgStore = tx.objectStore('messages');
            const letterStore = tx.objectStore('letters');
            const stickerStore = tx.objectStore('stickers');
            const getMsgs = new Promise(res => { const r = msgStore.get('msgs'); r.onsuccess = () => res(r.result); });
            const getNid = new Promise(res => { const r = msgStore.get('nid'); r.onsuccess = () => res(r.result); });
            const getLetters = new Promise(res => { const r = letterStore.get('data'); r.onsuccess = () => res(r.result); });
            const getStickers = new Promise(res => { const r = stickerStore.get('data'); r.onsuccess = () => res(r.result); });
            return Promise.all([getMsgs, getNid, getLetters, getStickers]).then(([m, n, l, s]) => {
                msgs = m || [];
                nid = n || 1000;
                letters = l || [];
                chatStickers = s || [];
            });
        } else {
            // 从 localStorage 读取
            const chatMessages = JSON.parse(localStorage.getItem('chatMessages'));
            if (chatMessages) { msgs = chatMessages.msgs || []; nid = chatMessages.nid || 1000; }
            letters = JSON.parse(localStorage.getItem('letters')) || [];
            chatStickers = JSON.parse(localStorage.getItem('chatStickers')) || [];
            return Promise.resolve();
        }
    }

    async function initializeData() {
        await initDB();
        await loadDataFromStorage();
        // 如果 IndexedDB 可用且 localStorage 中仍有旧数据（尚未迁移），则迁移一次
        if (dbAvailable && localStorage.getItem('chatMessages')) {
            // 迁移并删除
            msgs = JSON.parse(localStorage.getItem('chatMessages')).msgs || [];
            nid = JSON.parse(localStorage.getItem('chatMessages')).nid || 1000;
            letters = JSON.parse(localStorage.getItem('letters')) || [];
            chatStickers = JSON.parse(localStorage.getItem('chatStickers')) || [];
            await saveDataToStorage(); // 存到 IndexedDB
            localStorage.removeItem('chatMessages');
            localStorage.removeItem('letters');
            localStorage.removeItem('chatStickers');
        }
        updateContactStatus();
        checkScheduledReplies();
        render(); updSlider(); applySet();
    }
    /* ------------------------------------------- */

    function showTyping() { if (!isTyping) { previousStatusText = contactStatusEl.textContent; isTyping = true; } contactStatusEl.textContent = '对方正在输入...'; }
    function hideTyping() { contactStatusEl.textContent = previousStatusText; isTyping = false; }
    function updateNightUI() { nightModeToggle.textContent = isNight ? '☀️' : '🌙' }
    updateNightUI(); if (isNight) applyNight();

    function compressImage(file, callback, maxWidth=160, quality=0.5) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

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

    function sendRapidReplies() { /* 同上，略 */ }
    function handleRapidReply(e) { e.preventDefault(); sendRapidReplies(); }
    rapidReplyBtn.addEventListener('click', handleRapidReply);
    rapidReplyBtn.addEventListener('touchend', handleRapidReply);

    function simReply() { /* 略 */ }
    function updSlider() { let v = parseInt(rs.value); rsv.textContent = Math.floor(v/10)+'秒'; rDelay = v*100; let m = parseInt(ai.value); aiv.textContent = m+'分钟'; aMin = m }
    rs.oninput = updSlider; ai.oninput = updSlider; at.onchange = () => { ai.disabled = !at.checked; air.style.opacity = at.checked ? '1' : '.5' }
    function applySet() {
        myName = mn.value||'我'; ctName = ctn.value||'Norton·Campbell'; cn.textContent = ctName;
        stopTimers(); if (at.checked) startAuto();
        render(); sp.classList.remove('show'); saveDataToStorage();
    }
    ap.onclick = applySet;

    function handleUpload(file, type) { /* 略 */ }
    document.querySelectorAll('.au').forEach(b => b.onclick = () => { let t = b.dataset.avatar, up = t==='my'?mu:ctu; up.click(); up.onchange = e => { if (e.target.files[0]) handleUpload(e.target.files[0], t); up.value = '' } });

    function init() { if (msgs.length === 0) { msgs = []; } }
    init();
    function find(id) { return msgs.find(m => m.id === id) }
    function esc(t) { let d = document.createElement('div'); d.textContent = t; return d.innerHTML }
    function highlight(id) { /* 略 */ }
    function avHtml(v) { return v && v.startsWith('data:image') ? `<img src="${v}" style="width:100%;height:100%;object-fit:cover">` : v }
    function render() { /* 略 */ }
    function updQBar() { /* 略 */ }
    function send(txt, q = null, msgType = 'text') { /* 略 */ }
    function del(id) { /* 略 */ }
    snd.onclick = () => { send(mi.value, quoteMsg); };
    mi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(mi.value, quoteMsg); } });

    function handleMessageClick(e) { /* 略 */ }
    ma.addEventListener('click', handleMessageClick);
    ma.addEventListener('touchend', handleMessageClick);

    qbx.onclick = () => { quoteMsg = null; updQBar() };
    document.addEventListener('click', e => { if (!e.target.closest('.mb') && !e.target.closest('.ab')) document.querySelectorAll('.mactions').forEach(a => a.style.display = 'none') });
    st.onclick = e => { e.stopPropagation(); sm.classList.toggle('show') };
    sm.addEventListener('click', e => { /* 略 */ });
    bk.onclick = () => sp.classList.remove('show');
    themeBack.onclick = () => tp.classList.remove('show');
    hpBack.onclick = () => hp.classList.remove('show');
    kpBack.onclick = () => kp.classList.remove('show');
    document.addEventListener('click', e => { if (!sm.contains(e.target) && e.target !== st) sm.classList.remove('show') });

    imgBtn.onclick = () => { chatImageInput.click(); };
    chatImageInput.onchange = e => {
        let files = e.target.files; if (!files.length) return;
        Array.from(files).forEach(f => { compressImage(f, (compressed) => { send(compressed, null, 'image'); }); });
        chatImageInput.value = '';
    };

    function renderStickerPanel() { /* 略 */ }
    stickerBtn.onclick = (e) => { e.stopPropagation(); stickerPanel.classList.toggle('show'); if (stickerPanel.classList.contains('show')) renderStickerPanel(); };
    addStickerBtn.onclick = () => { stickerFileInput.click(); };
    stickerFileInput.onchange = e => {
        let files = e.target.files; if (!files.length) return;
        Array.from(files).forEach(f => { compressImage(f, (compressed) => { chatStickers.push(compressed); saveDataToStorage(); renderStickerPanel(); }); });
        stickerFileInput.value = '';
    };
    document.addEventListener('click', (e) => { if (!e.target.closest('.sticker-panel') && !e.target.closest('.sticker-btn')) { stickerPanel.classList.remove('show'); } });

    function deleteLetter(idx) { /* 略 */ }
    function formatDate(ts) { /* 略 */ }
    function renderMailbox() { /* 略 */ }
    function sendLetter() { /* 略 */ }
    function checkScheduledReplies() { /* 略 */ }
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
    function syncHex(target) { /* 略 */ }
    document.querySelectorAll('.hex-input').forEach(inp => { /* 略 */ });
    document.querySelectorAll('input[type="color"]').forEach(inp => { /* 略 */ });
    function setThemeInputs(theme) { /* 略 */ }
    function loadTheme() { /* 略 */ }
    function applyTheme() { /* 略 */ }
    fontSizeSlider.oninput = () => { fontSizeValue.textContent = fontSizeSlider.value + 'px' };
    applyThemeBtn.onclick = () => { if (isNight) { isNight = false; localStorage.setItem('nightMode', 'false'); updateNightUI(); } applyTheme(); tp.classList.remove('show') };
    resetThemeBtn.onclick = () => { setThemeInputs(defTheme); applyTheme() };
    loadTheme();

    /* 通话功能 */
    let inCall = false, callStartTime = null, callTimerId = null, callMinimized = false, incomingWaiting = false, isDialing = false, dialTimer = null;
    const callBtn = Q('callBtn'), callWindow = Q('callWindow'), callHeader = Q('callHeader'), callMin = Q('callMin'), callAvatar = Q('callAvatar'), callTimer = Q('callTimer'), callTitle = Q('callTitle'), callBody = Q('callBody'), callHangup = Q('callHangup'), incActions = Q('incActions'), incAccept = Q('incAccept'), incHangup = Q('incHangup'), cmiBar = Q('cmiBar'), cmiTime = Q('cmiTime'), callRestore = Q('callRestore');

    function formatTime(sec) { let h = Math.floor(sec/3600); let m = Math.floor((sec%3600)/60); let s = sec%60; return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }
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
        if (!fromSystem) { msgs.push({ id:nid++, senderId:SYS, text:'📞 通话开始', timestamp:Date.now() }); render(); saveDataToStorage(); }
        render();
    }
    function endCall() { /* 略 */ }
    function incomingCall() { /* 略 */ }
    function startDialing() { /* 略 */ }
    incAccept.onclick = () => { incomingWaiting = false; startCall(true); };
    incHangup.onclick = () => { endCall(); };
    callBtn.onclick = () => { if (inCall) { endCall(); } else if (incomingWaiting) { endCall(); } else if (isDialing) { endCall(); } else { startDialing(); } };
    callHangup.onclick = endCall;
    callMin.onclick = (e) => { /* 略 */ };
    callRestore.onclick = () => { callMin.click(); };
    callMin.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    callMin.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: false});
    callRestore.addEventListener('mousedown', (e) => { e.stopPropagation(); });
    callRestore.addEventListener('touchstart', (e) => { e.stopPropagation(); }, {passive: false});
    let dragInfo = null;
    function startDrag(e) { /* 略 */ }
    function onDrag(e) { /* 略 */ }
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
    function scheduleIncomingCall() { /* 略 */ }
    scheduleIncomingCall();

    function renderHist() { /* 略 */ }
    historySearch.oninput = renderHist;
    jumpDateBtn.onclick = () => { if (historyDate.value) renderHist(); };
    clearDateFilter.onclick = () => { historyDate.value = ''; renderHist(); };
    exportHistoryBtn.onclick = () => { const dataStr = JSON.stringify(msgs, null, 2); const blob = new Blob([dataStr], { type:'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chat_history.json'; a.click(); };
    importHistoryBtn.onclick = () => historyJSONInput.click();
    historyJSONInput.onchange = (e) => { /* 略 */ };

    clearAllHistoryBtn.onclick = async () => {
        if (confirm('⚠️ 确定要永久清除所有聊天记录吗？此操作不可恢复。')) {
            msgs = []; nid = 1000;
            render();
            if (dbAvailable && db) {
                const tx = db.transaction(['messages'], 'readwrite');
                tx.objectStore('messages').clear();
                await new Promise(r => tx.oncomplete = r);
            }
            localStorage.removeItem('chatMessages');
            saveDataToStorage();
            alert('聊天记录已清除');
        }
    };

    function renderGroupBar() { /* 略 */ }
    function exportGroupJSON(groupId) { /* 略 */ }
    function getCardListArray() { /* 略 */ }
    function renderWB() { /* 略 */ }
    function addCard(content, type, groupId = 'default') { /* 略 */ }
    function getCardArrByType(type) { /* 略 */ }
    function deleteCard(id, type) { /* 略 */ }
    function importText(text, type, groupId='default') { /* 略 */ }
    wbImportText.onclick = () => { /* 略 */ };
    wbUploadImg.onclick = () => imgUploadInput.click();

    function handleImportConfirm(e) { /* 略 */ }
    function handleImportCancel(e) { e.preventDefault(); importArea.style.display = 'none'; }
    confirmImport.addEventListener('click', handleImportConfirm);
    confirmImport.addEventListener('touchend', handleImportConfirm);
    cancelImport.addEventListener('click', handleImportCancel);
    cancelImport.addEventListener('touchend', handleImportCancel);

    imgUploadInput.onchange = e => {
        let files = e.target.files; if (!files.length) return;
        Array.from(files).forEach(f => { compressImage(f, (compressed) => { addCard(compressed, 'image'); }); });
        renderWB(); imgUploadInput.value = '';
    };
    wbExport.onclick = () => { /* 略 */ };
    function exportAllJSON() { /* 略 */ }
    wbImportJSON.onclick = () => jsonUploadInput.click();
    jsonUploadInput.onchange = e => { /* 略 */ };
    cardList.addEventListener('click', e => { /* 略 */ });
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

    // 启动所有数据加载
    initializeData();
})();