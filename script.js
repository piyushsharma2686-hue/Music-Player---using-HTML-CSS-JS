console.log("Lets write some javaScript");

// ======================= AUDIO SETUP =======================

const currentSong = new Audio();
let currentSongURL = null;
let songs = [];

const playButton = document.querySelector(".playButton");
const songUl = document.querySelector(".songList");

// ======================= LOAD ALBUMS =======================

async function loadAlbums() {
  let response = await fetch("/songs.json");
  let data = await response.json();

  let cardContainer = document.querySelector(".cardCont");
  cardContainer.innerHTML = "";

  for (let album of data.albums) {
    let card = document.createElement("div");
    card.classList.add("card");
    card.dataset.folder = album.folder;

    card.innerHTML = `
      <img src="songs/${album.folder}/cover.jpg">
      <button class="play-btn">▶</button>
      <h2>${album.title}</h2>
      <p>${album.description}</p>
    `;

    cardContainer.appendChild(card);
  }
}

// ======================= LOAD SONGS =======================

async function getsongs(folder) {
  let response = await fetch(`/songs/${folder}/songs.json`);
  let data = await response.json();

  return data.songs.map(song =>
    `/songs/${folder}/${encodeURIComponent(song)}`
  );
}

// ======================= PLAY FUNCTION =======================

function playMusic(src, songName) {
  if (currentSongURL !== src) {
    currentSong.src = src;
    currentSongURL = src;
  }

  currentSong.currentTime = 0;
  currentSong.play();

  document.querySelector(".songInfo").innerText = songName;
  document.querySelector(".songTimeline").innerHTML = "00:00/00:00";
}

// ======================= TIME FORMAT =======================

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// ======================= PLAYER CONTROLS =======================

playButton.addEventListener("click", () => {
  if (!currentSongURL) return;

  if (currentSong.paused) {
    currentSong.play();
  } else {
    currentSong.pause();
  }
});

currentSong.addEventListener("play", () => {
  playButton.src = "pause.svg";
});

currentSong.addEventListener("pause", () => {
  playButton.src = "playbutton.svg";
});

currentSong.addEventListener("timeupdate", () => {
  if (!currentSong.duration) return;

  document.querySelector(".songTimeline").innerHTML =
    `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;

  document.querySelector(".circle").style.left =
    (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

// ======================= SEEK BAR =======================

document.querySelector(".seekBar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.clientWidth) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentSong.currentTime = (currentSong.duration * percent) / 100;
});

// ======================= MAIN FUNCTION =======================

async function main() {
  await loadAlbums();

 
  document.querySelector(".cardCont").addEventListener("click", async (e) => {
    let card = e.target.closest(".card");
    if (!card) return;

    songs = await getsongs(card.dataset.folder);
    songUl.innerHTML = "";

    for (let song of songs) {
      let li = document.createElement("li");
      li.dataset.src = song;

      li.innerHTML = `
        <img class="invert" src="https://ico.hugeicons.com/music-note-03-stroke-rounded@2x.webp">
        <div class="info">
          <div class="songName">${decodeURIComponent(song.split("/").pop())}</div>
          <div class="songArtist">Song Artist</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img src="playbutton.svg">
        </div>
      `;

      songUl.appendChild(li);
    }

    let firstSongName = decodeURIComponent(songs[0].split("/").pop());
    playMusic(songs[0], firstSongName);
  });

  
  songUl.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;

    let songName = li.querySelector(".songName").innerText;
    playMusic(li.dataset.src, songName);
  });

 
  document.querySelector(".previousButton").addEventListener("click", () => {
    if (!currentSongURL) return;

    let index = songs.indexOf(currentSongURL);
    if (index <= 0) return;

    let prevSong = songs[index - 1];
    let songName = decodeURIComponent(prevSong.split("/").pop());

    playMusic(prevSong, songName);
  });

  
  document.querySelector(".forwardButton").addEventListener("click", () => {
    if (!currentSongURL) return;

    let index = songs.indexOf(currentSongURL);
    if (index === -1 || index === songs.length - 1) return;

    let nextSong = songs[index + 1];
    let songName = decodeURIComponent(nextSong.split("/").pop());

    playMusic(nextSong, songName);
  });


  // adding event listenr on hamburger 
  document.querySelector(".hamburger").addEventListener('click',(e)=>{ document.querySelector('.left-cont').style.left = '0%' })

  document.querySelector('.cross').addEventListener('click',()=>{ document.querySelector('.left-cont').style.left = '-110%' })

  
  
  // Volume
  document.querySelector(".range input")
    .addEventListener("input", (e) => {
      currentSong.volume = e.target.value / 100;
    });

  // Mute toggle
  document.querySelector(".volume>img")
    .addEventListener("click", (e) => {
      if (currentSong.volume > 0) {
        currentSong.volume = 0;
        e.target.src = "mute.svg";
        document.querySelector(".range input").value = 0;
      } else {
        currentSong.volume = 1;
        e.target.src = "volumeOn.svg";
        document.querySelector(".range input").value = 100;
      }
    });
}

main();
