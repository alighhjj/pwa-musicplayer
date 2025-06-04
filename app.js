const audio = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const playlist = document.getElementById('playlist');

// 在文件开头添加安装提示逻辑
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installPrompt').style.display = 'block';
});

document.getElementById('installPrompt').addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') {
      document.getElementById('installPrompt').style.display = 'none';
    }
  });
});

// 增加动态播放列表加载
async function loadPlaylist() {
  try {
    // 替换为本地音乐数据源
    const songs = [
      { title: '歌曲1', url: '/music/song1.mp3' },
      { title: '歌曲2', url: '/music/song2.mp3' },
      { title: '歌曲3', url: '/music/song3.mp3' }
    ];

    // 初始化播放列表
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.onclick = () => loadSong(index);
      playlist.appendChild(li);
    });

    let currentSong = 0;

    // 在loadSong函数中增加高亮逻辑
    function loadSong(index) {
      currentSong = index;
      audio.src = songs[index].url;
      audio.play();
      document.querySelectorAll('#playlist li').forEach(li => li.classList.remove('current'));
      document.querySelectorAll('#playlist li')[index].classList.add('current');
    }

    playBtn.addEventListener('click', () => {
      audio.paused ? audio.play() : audio.pause();
    });

    audio.addEventListener('play', () => {
      playBtn.textContent = '⏸';
    });

    audio.addEventListener('pause', () => {
      playBtn.textContent = '▶';
    });

    audio.addEventListener('timeupdate', () => {
      progress.value = (audio.currentTime / audio.duration) * 100;
    });

    progress.addEventListener('input', (e) => {
      audio.currentTime = (e.target.value / 100) * audio.duration;
    });

    volume.addEventListener('input', (e) => {
      audio.volume = e.target.value;
    });

    // 添加自动播放下一首功能
    audio.addEventListener('ended', () => {
      currentSong = (currentSong + 1) % songs.length;
      loadSong(currentSong);
    });

    // 添加网络状态检测
    window.addEventListener('online', () => {
      document.getElementById('offline-alert').style.display = 'none';
    });

    window.addEventListener('offline', () => {
      document.getElementById('offline-alert').style.display = 'block';
    });

    // 添加媒体会话支持
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => loadSong(currentSong - 1));
      navigator.mediaSession.setActionHandler('nexttrack', () => loadSong(currentSong + 1));
    }
  } catch (error) {
    console.error('无法加载播放列表:', error);
  }
}
// 替换原来的示例播放列表初始化
loadPlaylist();
