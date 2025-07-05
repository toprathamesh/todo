document.addEventListener('DOMContentLoaded', () => {
    // Learn section elements
    const addVideoBtn = document.getElementById('add-video-btn');
    const youtubeLinkInput = document.getElementById('youtube-link');
    const videoList = document.getElementById('video-list');

    // Implement section elements
    const addRepoBtn = document.getElementById('add-repo-btn');
    const repoLinkInput = document.getElementById('repo-link');
    const repoNoteInput = document.getElementById('repo-note');
    const repoList = document.getElementById('repo-list');

    // Load saved data on page load
    loadVideos();
    loadRepos();

    // Event listeners for Learn section
    addVideoBtn.addEventListener('click', addVideo);
    youtubeLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addVideo();
    });

    // Event listeners for Implement section
    addRepoBtn.addEventListener('click', addRepo);
    repoLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRepo();
    });
    repoNoteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRepo();
    });

    // --- Learn Section Functions ---
    function addVideo() {
        const link = youtubeLinkInput.value.trim();
        if (link) {
            const videoId = getYouTubeVideoId(link);
            if (videoId) {
                createVideoItem(videoId);
                saveVideo(videoId);
                youtubeLinkInput.value = '';
            } else {
                alert('Please enter a valid YouTube video link.');
            }
        }
    }

    function getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    function createVideoItem(videoId) {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';

        removeButton.addEventListener('click', () => {
            videoList.removeChild(videoItem);
            removeVideo(videoId);
        });

        videoItem.appendChild(iframe);
        videoItem.appendChild(removeButton);
        videoList.appendChild(videoItem);
    }

    function saveVideo(videoId) {
        let videos = JSON.parse(localStorage.getItem('videos')) || [];
        if (!videos.includes(videoId)) {
            videos.push(videoId);
            localStorage.setItem('videos', JSON.stringify(videos));
        }
    }

    function removeVideo(videoId) {
        let videos = JSON.parse(localStorage.getItem('videos')) || [];
        videos = videos.filter(id => id !== videoId);
        localStorage.setItem('videos', JSON.stringify(videos));
    }

    function loadVideos() {
        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        videos.forEach(videoId => createVideoItem(videoId));
    }

    // --- Implement Section Functions ---
    function addRepo() {
        const link = repoLinkInput.value.trim();
        const note = repoNoteInput.value.trim();
        if (link && note) {
            const repo = { link, note, id: Date.now().toString() };
            createRepoItem(repo);
            saveRepo(repo);
            repoLinkInput.value = '';
            repoNoteInput.value = '';
        } else {
            alert('Please enter both a repo link and a note.');
        }
    }

    function createRepoItem(repo) {
        const repoItem = document.createElement('div');
        repoItem.className = 'repo-item';

        const link = document.createElement('a');
        link.href = repo.link;
        link.textContent = repo.link;
        link.target = '_blank';

        const note = document.createElement('p');
        note.textContent = repo.note;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';

        removeButton.addEventListener('click', () => {
            repoList.removeChild(repoItem);
            removeRepo(repo.id);
        });

        repoItem.appendChild(link);
        repoItem.appendChild(note);
        repoItem.appendChild(removeButton);
        repoList.appendChild(repoItem);
    }

    function saveRepo(repo) {
        let repos = JSON.parse(localStorage.getItem('repos')) || [];
        repos.push(repo);
        localStorage.setItem('repos', JSON.stringify(repos));
    }

    function removeRepo(repoId) {
        let repos = JSON.parse(localStorage.getItem('repos')) || [];
        repos = repos.filter(repo => repo.id !== repoId);
        localStorage.setItem('repos', JSON.stringify(repos));
    }

    function loadRepos() {
        const repos = JSON.parse(localStorage.getItem('repos')) || [];
        repos.forEach(repo => createRepoItem(repo));
    }
}); 