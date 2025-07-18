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

    // Note Modal elements
    const noteModal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('modal-title');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const closeBtn = document.querySelector('.close-btn');
    const busyCheckbox = document.getElementById('busy-checkbox');
    let currentNoteDate = null;
    let displayedDate = new Date();

    // Whiteboard elements
    const whiteboardCanvas = document.getElementById('whiteboard-canvas');
    const whiteboardControls = document.getElementById('whiteboard-controls');
    const clearBoardBtn = document.getElementById('clear-board-btn');
    const eraserBtn = document.getElementById('eraser-btn');

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

    // --- Data Loading and Cleanup ---
    function cleanAndLoadData() {
        const keys = ['learnItems', 'planItems', 'repoItems'];
        keys.forEach(key => {
            const items = JSON.parse(localStorage.getItem(key)) || [];
            if (items.length === 0) return;
    
            const uniqueItems = [];
            const seen = new Set();
    
            // Iterate backwards to keep the most recent item in case of duplication
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                // Skip any malformed entries
                if (!item || typeof item.link === 'undefined' || typeof item.note === 'undefined') continue;
                
                const itemKey = `${item.link}|${item.note}`;
                if (!seen.has(itemKey)) {
                    uniqueItems.unshift(item); // Add to front to maintain original order
                    seen.add(itemKey);
                }
            }
    
            // If duplicates were found, update localStorage with the clean list
            if (items.length !== uniqueItems.length) {
                localStorage.setItem(key, JSON.stringify(uniqueItems));
            }
    
            // Load the cleaned items into the DOM
            const listElement = getListElementByKey(key);
            if (listElement) {
                listElement.innerHTML = ''; // Clear the list before rendering
                uniqueItems.forEach(item => createItemElement(item, listElement, key, key.replace('Items', '')));
            }
        });
    }
    
    function getListElementByKey(key) {
        if (key === 'learnItems') return learnList;
        if (key === 'planItems') return planList;
        if (key === 'repoItems') return repoList;
        return null;
    }

    // --- General Functions ---
    function updateDateTime() {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
        
        const dateString = `${day} / ${month} / ${year}`;
        const timeString = now.toLocaleTimeString('en-US', timeOptions);

        dateTimeElement.innerHTML = `<span class="date-part">${dateString}</span><span class="time-part">${timeString}</span>`;
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
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
        const timestamp = `${day} / ${month} / ${year} ${now.toLocaleTimeString('en-US', timeOptions)}`;

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
    function setupCalendarNavigation() {
        document.getElementById('prev-month-btn').addEventListener('click', () => {
            displayedDate.setMonth(displayedDate.getMonth() - 1, 1);
            renderCalendar();
        });

        document.getElementById('next-month-btn').addEventListener('click', () => {
            displayedDate.setMonth(displayedDate.getMonth() + 1, 1);
            renderCalendar();
        });
    }

    function renderCalendar() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const month = displayedDate.getMonth();
        const year = displayedDate.getFullYear();

        document.getElementById('calendar-month-year').textContent = 
            `${displayedDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        let calendarHtml = '<table><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody><tr>';

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHtml += '<td></td>';
        }

        let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        let notes = JSON.parse(localStorage.getItem('calendarNotes')) || {};
        let busyDates = JSON.parse(localStorage.getItem('calendarBusyDates')) || {};

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month + 1}-${day}`;
            const cellDate = new Date(year, month, day);
            cellDate.setHours(0,0,0,0);

            const isPresent = attendance[dateStr];
            const isToday = today.getTime() === cellDate.getTime();
            const isPast = cellDate < today;
            const note = notes[dateStr];
            const isBusy = busyDates[dateStr];

            let cellClass = '';
            if (isToday) cellClass += 'today ';
            if (isBusy) cellClass += 'busy ';
            
            if (isPast) {
                if (isPresent) {
                    cellClass += 'present';
                } else if (!isBusy) {
                    cellClass += 'absent';
                }
            } else {
                if (isPresent) {
                    cellClass += 'present';
                }
            }
            
            calendarHtml += `<td class="${cellClass.trim()}" data-date="${dateStr}">${day}`;
            if (note) {
                calendarHtml += `<div class="note-indicator" title="${note}"></div>`;
            }
            calendarHtml += `</td>`;

            if ((firstDayOfMonth + day) % 7 === 0 && day < daysInMonth) {
                calendarHtml += '</tr><tr>';
            }
        }
        
        calendarHtml += '</tr></tbody></table>';
        calendarElement.innerHTML = calendarHtml;

        const calendarContainerHeader = document.querySelector('.calendar-header');
        if (calendarContainerHeader) {
            let downloadBtn = document.getElementById('download-pdf-btn');
            if (!downloadBtn) {
                downloadBtn = document.createElement('button');
                downloadBtn.id = 'download-pdf-btn';
                downloadBtn.textContent = 'Download PDF';
                calendarContainerHeader.appendChild(downloadBtn);
                downloadBtn.addEventListener('click', downloadCalendarAsPDF);
            }
        }

        calendarElement.querySelectorAll('td[data-date]').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const dateStr = e.target.closest('td').dataset.date;
                toggleAttendance(dateStr);
            });
            cell.addEventListener('dblclick', (e) => {
                const dateStr = e.target.closest('td').dataset.date;
                openNoteModal(dateStr);
            });
        });
    }

    // --- Note Modal Functions ---
    function openNoteModal(dateStr) {
        currentNoteDate = dateStr;
        const notes = JSON.parse(localStorage.getItem('calendarNotes')) || {};
        const busyDates = JSON.parse(localStorage.getItem('calendarBusyDates')) || {};
        
        const note = notes[dateStr] || '';
        const isBusy = busyDates[dateStr] || false;

        const parts = dateStr.split('-').map(p => parseInt(p, 10));
        const year = parts[0];
        const month = parts[1] - 1; // Adjust for 0-based month
        const day = parts[2];
        const modalDate = new Date(year, month, day);

        const formattedDate = `${day} / ${month + 1} / ${year}`;

        modalTitle.textContent = `Note for ${formattedDate}`;
        noteInput.value = note;
        busyCheckbox.checked = isBusy;
        noteModal.style.display = 'flex';
    }

    function closeNoteModal() {
        noteModal.style.display = 'none';
        currentNoteDate = null;
    }

    function saveNote() {
        if (!currentNoteDate) return;

        const notes = JSON.parse(localStorage.getItem('calendarNotes')) || {};
        const noteText = noteInput.value.trim();

        if (noteText) {
            notes[currentNoteDate] = noteText;
        } else {
            delete notes[currentNoteDate];
        }
        localStorage.setItem('calendarNotes', JSON.stringify(notes));

        const busyDates = JSON.parse(localStorage.getItem('calendarBusyDates')) || {};
        if (busyCheckbox.checked) {
            busyDates[currentNoteDate] = true;
        } else {
            delete busyDates[currentNoteDate];
        }
        localStorage.setItem('calendarBusyDates', JSON.stringify(busyDates));

        closeNoteModal();
        renderCalendar();
    }

    function toggleAttendance(dateStr) {
        if (!dateStr) return;

        let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
        attendance[dateStr] = !attendance[dateStr];
        localStorage.setItem('attendance', JSON.stringify(attendance));
        renderCalendar();
    }

    closeBtn.addEventListener('click', closeNoteModal);
    saveNoteBtn.addEventListener('click', saveNote);
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });

    // --- PDF Download Function ---
    function downloadCalendarAsPDF() {
        const { jsPDF } = window.jspdf;
        const calendarElement = document.getElementById('calendar');
        const calendarContainer = document.querySelector('.calendar-container');
        const notes = JSON.parse(localStorage.getItem('calendarNotes')) || {};

        // Add a class for print-specific styles
        calendarContainer.classList.add('printing-pdf');

        // Temporarily add notes to the calendar for printing
        const calendarCells = calendarElement.querySelectorAll('td[data-date]');
        
        calendarCells.forEach(cell => {
            const dateStr = cell.dataset.date;
            if (notes[dateStr]) {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-for-pdf';
                noteElement.textContent = notes[dateStr];
                cell.appendChild(noteElement);

                const indicator = cell.querySelector('.note-indicator');
                if (indicator) {
                    indicator.style.display = 'none';
                }
            }
        });

        html2canvas(calendarElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('calendar_with_notes.pdf');
        }).finally(() => {
            // Clean up: remove the class and the added notes
            calendarContainer.classList.remove('printing-pdf');
            calendarElement.querySelectorAll('.note-for-pdf').forEach(el => el.remove());
            calendarElement.querySelectorAll('.note-indicator').forEach(indicator => {
                indicator.style.display = '';
            });
        });
    }

    // Initial Load
    cleanAndLoadData();
    setupCalendarNavigation();
    renderCalendar();
}); 