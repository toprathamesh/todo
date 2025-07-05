document.addEventListener('DOMContentLoaded', () => {
    // General elements
    const dateTimeElement = document.getElementById('date-time');

    // Learn section elements
    const addLearnBtn = document.getElementById('add-learn-btn');
    const learnLinkInput = document.getElementById('learn-link');
    const learnNoteInput = document.getElementById('learn-note');
    const learnList = document.getElementById('learn-list');

    // Plan section elements
    const addPlanBtn = document.getElementById('add-plan-btn');
    const planLinkInput = document.getElementById('plan-link');
    const planNoteInput = document.getElementById('plan-note');
    const planList = document.getElementById('plan-list');

    // Implement section elements
    const addRepoBtn = document.getElementById('add-repo-btn');
    const repoLinkInput = document.getElementById('repo-link');
    const repoNoteInput = document.getElementById('repo-note');
    const repoList = document.getElementById('repo-list');

    // Calendar elements
    const calendarElement = document.getElementById('calendar');

    // Whiteboard elements
    const whiteboardCanvas = document.getElementById('whiteboard-canvas');
    const whiteboardControls = document.getElementById('whiteboard-controls');
    const clearBoardBtn = document.getElementById('clear-board-btn');
    const eraserBtn = document.getElementById('eraser-btn');

    // Load saved data on page load
    loadItems('learnItems', learnList, 'learn');
    loadItems('planItems', planList, 'plan');
    loadItems('repoItems', repoList, 'repo');
    renderCalendar();
    
    // Whiteboard setup
    resizeCanvas();
    loadBoard();
    window.addEventListener('resize', resizeCanvas);

    // Drawing listeners
    whiteboardCanvas.addEventListener('mousedown', startDrawing);
    whiteboardCanvas.addEventListener('mouseup', stopDrawing);
    whiteboardCanvas.addEventListener('mouseout', stopDrawing);
    whiteboardCanvas.addEventListener('mousemove', draw);
    
    // Touch listeners
    whiteboardCanvas.addEventListener('touchstart', startDrawing);
    whiteboardCanvas.addEventListener('touchend', stopDrawing);
    whiteboardCanvas.addEventListener('touchmove', draw);

    // --- General Functions ---
    function updateDateTime() {
        dateTimeElement.textContent = new Date().toLocaleString();
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // --- Event Listeners ---
    addLearnBtn.addEventListener('click', () => addItem('learn'));
    addPlanBtn.addEventListener('click', () => addItem('plan'));
    addRepoBtn.addEventListener('click', () => addItem('repo'));

    // --- Universal Item Functions ---
    function addItem(type) {
        let link, note, list, storageKey, item;
        const now = new Date();
        const timestamp = now.toLocaleString();

        switch (type) {
            case 'learn':
                link = learnLinkInput.value.trim();
                note = learnNoteInput.value.trim();
                list = learnList;
                storageKey = 'learnItems';
                if (!link && !note) {
                    alert('Please enter a link or a note.');
                    return;
                }
                item = { link, note, id: Date.now().toString(), timestamp };
                learnLinkInput.value = '';
                learnNoteInput.value = '';
                break;
            case 'plan':
                link = planLinkInput.value.trim();
                note = planNoteInput.value.trim();
                list = planList;
                storageKey = 'planItems';
                if (!link && !note) {
                    alert('Please enter a link or a note.');
                    return;
                }
                item = { link, note, id: Date.now().toString(), timestamp };
                planLinkInput.value = '';
                planNoteInput.value = '';
                break;
            case 'repo':
                link = repoLinkInput.value.trim();
                note = repoNoteInput.value.trim();
                list = repoList;
                storageKey = 'repoItems';
                if (!link && !note) {
                    alert('Please enter a repo link or a note.');
                    return;
                }
                item = { link, note, id: Date.now().toString(), timestamp };
                repoLinkInput.value = '';
                repoNoteInput.value = '';
                break;
        }

        createItemElement(item, list, storageKey, type);
        saveItem(item, storageKey);
    }

    function createItemElement(item, list, storageKey, type) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.id = item.id;

        const timestampElement = document.createElement('div');
        timestampElement.className = 'timestamp';
        timestampElement.textContent = item.timestamp;
        itemElement.appendChild(timestampElement);

        if (item.link) {
            const videoId = getYouTubeVideoId(item.link);
            if (videoId && (type === 'learn' || type === 'plan')) {
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                itemElement.appendChild(iframe);
            } else {
                const linkElement = document.createElement('a');
                linkElement.href = item.link;
                linkElement.textContent = item.link;
                linkElement.target = '_blank';
                itemElement.appendChild(linkElement);
            }
        }

        if (item.note) {
            const noteElement = document.createElement('p');
            noteElement.textContent = item.note;
            itemElement.appendChild(noteElement);
        }

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';
        removeButton.addEventListener('click', () => {
            list.removeChild(itemElement);
            removeItem(item.id, storageKey);
        });

        itemElement.appendChild(removeButton);
        list.appendChild(itemElement);
    }

    function saveItem(item, storageKey) {
        let items = JSON.parse(localStorage.getItem(storageKey)) || [];
        items.push(item);
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    function removeItem(id, storageKey) {
        let items = JSON.parse(localStorage.getItem(storageKey)) || [];
        items = items.filter(item => item.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    function loadItems(storageKey, list, type) {
        const items = JSON.parse(localStorage.getItem(storageKey)) || [];
        items.forEach(item => createItemElement(item, list, storageKey, type));
    }

    function getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // --- Whiteboard Functions ---
    const ctx = whiteboardCanvas.getContext('2d');
    let isDrawing = false;
    let penColor = 'black';
    let penSize = 3;

    function resizeCanvas() {
        const imageData = getCanvasImage();
        const container = whiteboardCanvas.parentElement;
        whiteboardCanvas.width = container.clientWidth;
        whiteboardCanvas.height = 500; // Fixed height
        if (imageData) {
            putCanvasImage(imageData);
        }
    }

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
        saveBoard();
    }

    function draw(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        const rect = whiteboardCanvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = penColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function saveBoard() {
        localStorage.setItem('whiteboard', whiteboardCanvas.toDataURL());
    }

    function loadBoard() {
        const dataURL = localStorage.getItem('whiteboard');
        if (dataURL) {
           putCanvasImage(dataURL);
        }
    }
    
    function getCanvasImage() {
        if (isCanvasBlank(whiteboardCanvas)) return null;
        return whiteboardCanvas.toDataURL();
    }

    function putCanvasImage(dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            ctx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
            ctx.drawImage(img, 0, 0);
        }
    }

    function isCanvasBlank(canvas) {
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        return canvas.toDataURL() === blank.toDataURL();
    }

    whiteboardControls.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const allButtons = whiteboardControls.querySelectorAll('button');
        allButtons.forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');

        if (target.dataset.color) {
            penColor = target.dataset.color;
            penSize = 3;
            ctx.globalCompositeOperation = 'source-over';
        } else if (target.id === 'eraser-btn') {
            penColor = '#FFFFFF';
            penSize = 20;
            ctx.globalCompositeOperation = 'destination-out';
        }
    });

    clearBoardBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
        saveBoard();
    });

    // --- Calendar Functions ---
    function renderCalendar() {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        let calendarHtml = '<table><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody><tr>';

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHtml += '<td></td>';
        }

        let attendance = JSON.parse(localStorage.getItem('attendance')) || {};

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const isPresent = attendance[dateStr];
            const isToday = day === today.getDate();
            
            calendarHtml += `<td class="${isToday ? 'today' : ''} ${isPresent ? 'present' : ''}" data-date="${dateStr}">${day}</td>`;
            if ((firstDayOfMonth + day) % 7 === 0) {
                calendarHtml += '</tr><tr>';
            }
        }
        
        calendarHtml += '</tr></tbody></table>';
        calendarElement.innerHTML = calendarHtml;

        calendarElement.querySelectorAll('td[data-date]').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const dateStr = e.target.dataset.date;
                let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
                attendance[dateStr] = !attendance[dateStr];
                localStorage.setItem('attendance', JSON.stringify(attendance));
                renderCalendar(); 
            });
        });
    }
}); 