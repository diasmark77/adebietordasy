function initDynamicPlayer(data) {
    const container = document.getElementById('audio-player-container');
    if (!container || !data.audioUrl) return;

    // Плеердің HTML құрылымы (Сенің дизайның негізінде)
    container.innerHTML = `
    <div style="text-align:center; margin: 16px 0 0;">
      <button id="zhurek-toggle" style="display: inline-flex; align-items: center; gap: 7px; background: #8B4513; color: #fff; border: none; border-radius: 20px; padding: 8px 20px; font-size: 14px; cursor: pointer; box-shadow: 0 2px 8px rgba(139,46,46,0.25);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm-2 13V8l6 4-6 4z"/></svg>
        Әнді тыңдау
      </button>
    </div>

    <div id="zhurek-player-wrap" style="max-height: 0; overflow: hidden; transition: 0.4s; opacity: 0;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; background: #fdf6f0; border: 1px solid #d4a97a; border-radius: 16px; padding: 20px 24px; max-width: 360px; margin: 14px auto 0; box-shadow: 0 2px 12px rgba(139,69,19,0.08);">
        
        <audio id="zhurek-audio" src="${data.audioUrl}" preload="metadata"></audio>

        <div style="font-size:15px; font-weight:600; color:#5a2a00;">🎵 ${data.audioDisplayName || 'Аудио'}</div>

        <div style="display:flex; align-items:center; gap:10px; width:100%;">
          <span id="zhurek-cur" style="font-size:12px; color:#999; min-width:32px;">0:00</span>
          <input type="range" id="zhurek-seek" min="0" max="100" step="0.1" value="0" style="flex:1; accent-color:#8B4513;">
          <span id="zhurek-dur" style="font-size:12px; color:#999; min-width:32px;">0:00</span>
        </div>

        <div style="display:flex; align-items:center; gap:16px;">
          <button id="zhurek-rew" style="width:38px; height:38px; border-radius:50%; border:1.5px solid #c8914f; background:none; color:#7a2020; cursor:pointer;">⏪</button>
          <button id="zhurek-play" style="width:52px; height:52px; border-radius:50%; background:#8B4513; border:none; color:#fff; cursor:pointer; font-size:20px;">▶</button>
          <button id="zhurek-fwd" style="width:38px; height:38px; border-radius:50%; border:1.5px solid #8B4513; background:none; color:#8B4513; cursor:pointer;">⏩</button>
        </div>

        <a href="${data.audioUrl}" download="${data.audioDisplayName || 'audio'}.mp3" 
           style="display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#8b2e2e; text-decoration:none; border:1px solid #d4a090; border-radius:8px; padding:6px 16px;">
           📥 Жүктеп алу
        </a>
      </div>
    </div>`;

    // Логиканы қосу
    setupPlayerLogic();
}

function setupPlayerLogic() {
    const audio = document.getElementById('zhurek-audio');
    const playBtn = document.getElementById('zhurek-play');
    const toggleBtn = document.getElementById('zhurek-toggle');
    const wrap = document.getElementById('zhurek-player-wrap');
    const seek = document.getElementById('zhurek-seek');

    toggleBtn.onclick = () => {
        const isOpen = wrap.style.maxHeight !== '0px' && wrap.style.maxHeight !== '';
        wrap.style.maxHeight = isOpen ? '0' : '400px';
        wrap.style.opacity = isOpen ? '0' : '1';
        if (isOpen) audio.pause();
        toggleBtn.innerText = isOpen ? "▶ Әнді тыңдау" : "✖ Жабу";
    };

    playBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerText = "⏸";
        } else {
            audio.pause();
            playBtn.innerText = "▶";
        }
    };

    document.getElementById('zhurek-rew').onclick = () => audio.currentTime -= 10;
    document.getElementById('zhurek-fwd').onclick = () => audio.currentTime += 10;

    audio.ontimeupdate = () => {
        seek.value = (audio.currentTime / audio.duration) * 100 || 0;
        document.getElementById('zhurek-cur').innerText = fmtTime(audio.currentTime);
    };

    audio.onloadedmetadata = () => {
        document.getElementById('zhurek-dur').innerText = fmtTime(audio.duration);
    };

    seek.oninput = () => audio.currentTime = (seek.value / 100) * audio.duration;

    function fmtTime(s) {
        let m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return m + ":" + (sec < 10 ? "0" : "") + sec;
    }
}
