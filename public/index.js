const searchbar = document.querySelector('#searchbar')
const searchBarTOP = document.querySelector('#searchBarTOP');

// Player DOM elements
const audio = document.querySelector('audio')
const titlePlayer = document.querySelector('#titlePlayer')
const imagePlayer = document.querySelector('#imagePlayer')
const positionPlayer = document.querySelector('#positionPlayer')
const durationPlayer = document.querySelector('#durationPlayer')
const likeBtn = document.querySelector('#likeBtn')
const searchBtn = document.getElementById('searchBtn');
const pauseIndicator = document.getElementById("pauseIndicator");
const positionIndicator = document.querySelector('#positionIndicator');

const allSongsDiv = document.querySelector('#allSongs')
const currentlyPlayingHome = document.querySelector('#currentlyPlayingHome');
const pauseBtnHome = document.querySelector('#pauseBtnHome');
const currentPlayingImage = document.querySelector('#currentPlayingImage')
const currentPlayingTitle = document.querySelector('#currentPlayingTitle')
const pauseImg = document.querySelector('#pauseImg');

// Init all sections (page)
const homePage = document.querySelector('#HomePage')
const loadingPage = document.querySelector('#LoadingPage')
const searchPage = document.querySelector('#SearchPage')
const playerPage = document.querySelector('#PlayerPage');
const favoritePage = document.querySelector('#FavoritePage');

function youtubeThumbnailURL(id) {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

// Show/Hide "Search Songs" on focus
searchbar.addEventListener('focus', () => {
    document.querySelector('#placeholder').classList.add('hidden')
})
searchbar.addEventListener('blur', () => {
    if (searchbar.value == "") {
        document.querySelector('#placeholder').classList.remove('hidden')
    }
})

searchbar.addEventListener('change', () => {
    let q = searchbar.value

    if (q !== "") {
        // Hide home and show loading
        homePage.classList.add('hidden')
        loadingPage.classList.remove('hidden')

        download_PlaySong(q);
        searchBarTOP.value = searchbar.value

        searchBarTOP.addEventListener("change", () => {
            loadingPage.classList.remove('hidden')
            searchPage.classList.add('hidden')
            download_PlaySong(searchBarTOP.value);
        })
    }
})

const homeBtns = document.querySelectorAll('#homeBtn')
homeBtns.forEach(home => {
    home.addEventListener('click', () => {
        homePage.classList.remove('hidden')
        if (!searchPage.classList.contains('hidden')) {
            searchPage.classList.add('hidden')
            searchbar.value = ""
            document.querySelector('#placeholder').classList.remove('hidden')
        } else if (!playerPage.classList.contains('hidden')) {
            playerPage.classList.add('hidden')
        } else if (!favoritePage.classList.add('hidden')) {
            favoritePage.classList.add('hidden')
        }
    })
});
const favBtn = document.querySelectorAll('#favBtn');
favBtn.forEach(fav => {
    fav.addEventListener('click', () => {
        favoritePage.classList.remove('hidden')
        if (!searchPage.classList.contains('hidden')) {
            searchPage.classList.add('hidden')
        } else if (!playerPage.classList.contains('hidden')) {
            playerPage.classList.add('hidden')
        } else if (!homePage.classList.add('hidden')) {
            homePage.classList.add('hidden')
        }
    })
});

function download_PlaySong(query) {
    window.scrollTo(0, 0)
    fetch('/query', { 
        body: JSON.stringify({
            query: query
        }),
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response=>response.json())
    .then(data => {
        allSongsDiv.innerHTML = ''
        loadingPage.classList.add('hidden')
        searchPage.classList.remove('hidden')

        data.videos.forEach(video => {
            let title = video.original_title;
            let id = video.id;

            if (title.length > 40) {
                title = title.slice(0, 40) + "..."
            }

            let minutes = Math.floor(video.duration / 60);
            let seconds = video.duration % 60;

            if (seconds.toString().length <= 1) {
                seconds = "0" + seconds
            }

            if (minutes < 60) {
                if (title.includes("/")) {
                    title = title.replace(/\//g, '');  // Remplace tous les caractères "/" par une chaîne vide
                }
                if (title.includes("|")) {
                    title = title.replace(/\|/g, '');  // Remplace tous les caractères "|" par une chaîne vide
                }
                if (title.includes("?")) {
                    title = title.replace(/\?/g, '');  // Remplace tous les caractères "?" par une chaîne vide
                }
    
                const div = document.createElement('div')
                div.className = "z-10 w-[282px] h-[103px] bg-transparent rounded-[14px] relative flex flex-col place-items-center text-[15px] border-white border-4"
                allSongsDiv.appendChild(div)

                const bg_img = document.createElement('img')
                bg_img.className = "z-0 w-[282px] h-[95px] object-cover rounded-[14px] opacity-40"
                bg_img.src = youtubeThumbnailURL(id)
                div.appendChild(bg_img)

                const titleElement = document.createElement('h2')
                titleElement.innerHTML = title;
                titleElement.className = "font-montserrat text-white w-[250px] mt-1.5 absolute top-1"
                div.appendChild(titleElement)
    
                const playBtn = document.createElement('img')
                playBtn.src = "image/play.svg";
                playBtn.className = "absolute top-[55%] left-[43%]"
                div.appendChild(playBtn)

                const durationTime = document.createElement('h3')
                durationTime.innerHTML = minutes + ":" + seconds;
                durationTime.className = "absolute bottom-0.5 left-2 font-montserrat font-semibold text-white"
                div.appendChild(durationTime)
    
                div.addEventListener('click', () => {
                    loadingPage.classList.remove('hidden')
                    searchPage.classList.add('hidden')

                    fetch('/download', { 
                        body: JSON.stringify({
                            id: id,
                            title: title,
                        }),
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(response=>response.json())
                    .then(data => {
                        loadingPage.classList.add('hidden')
                        playerPage.classList.remove('hidden')
                        audio.src = `output/${data.title}.mp4`

                        audio.play()

                        // Update current time every sec
                        setInterval(() => {
                            let base_secondes = Math.floor(audio.currentTime)
                            let duration_secondes = Math.floor(audio.duration)

                            let pos_minutes = Math.floor(base_secondes / 60);
                            let pos_seconds = base_secondes % 60;

                            if (pos_seconds.toString().length <= 1) {
                                pos_seconds = "0" + pos_seconds
                            }

                            // Current time update
                            positionPlayer.textContent = `${pos_minutes}:${pos_seconds}`

                            // Progress bar update
                            let coef = 211 / duration_secondes
                            positionIndicator.style.width = Math.floor(base_secondes * coef) + "px";
                            
                            // play/pause indiactor
                            if (!audio.paused) {
                                pauseIndicator.classList.add('hidden')
                                imagePlayer.classList.remove('opacity-30')
                                imagePlayer.classList.remove('blur-sm')
                                pauseImg.src = "image/pause.svg"
                            } else {
                                pauseIndicator.classList.remove('hidden')
                                imagePlayer.classList.add('opacity-30')
                                imagePlayer.classList.add('blur-sm')
                                pauseImg.src = "image/play_16px.svg"
                            }
                        }, 500)

                        audio.addEventListener('play', function() {
                            currentlyPlayingHome.classList.remove('hidden')
                        
                            currentPlayingImage.src = youtubeThumbnailURL(id)
                            currentPlayingTitle.textContent = data.title
        
                            currentPlayingTitle.addEventListener("click", () => {
                                homePage.classList.add('hidden')
                                playerPage.classList.remove('hidden')
                            })
                            currentPlayingImage.addEventListener("click", () => {
                                homePage.classList.add('hidden')
                                playerPage.classList.remove('hidden')
                            })
                        });

                        // play/pause control
                        imagePlayer.addEventListener('click', () => {
                            if (audio.paused) {
                                audio.play()
                                pauseIndicator.classList.add('hidden')
                                imagePlayer.classList.remove('opacity-30')
                                imagePlayer.classList.remove('blur-sm')
                            } else {
                                audio.pause()
                                pauseIndicator.classList.remove('hidden')
                                imagePlayer.classList.add('opacity-30')
                                imagePlayer.classList.add('blur-sm')
                            }
                        })
                        pauseBtnHome.addEventListener('click', () => {
                            if (audio.paused) {
                                audio.play()
                                pauseImg.src = "image/pause.svg"
                            } else {
                                audio.pause()
                                pauseImg.src = "image/play_16px.svg"
                            }
                        })

                        titlePlayer.textContent = data.title;
                        imagePlayer.src = youtubeThumbnailURL(id)
                        durationPlayer.textContent = minutes + ":" + seconds

                        i = 0;
                        likeBtn.addEventListener('click', () => {
                            if (i == 0) {
                                likeBtn.src = "image/Heart_active.svg";
                                if (window.navigator.vibrate) window.navigator.vibrate(100)
                                i++;
                            } else {
                                likeBtn.src = "image/Heart.svg";
                                if (window.navigator.vibrate) window.navigator.vibrate(100)
                                i = 0;
                            }
                        })

                        searchBtn.addEventListener('click', () => {
                            playerPage.classList.add('hidden')
                            searchPage.classList.remove('hidden')
                        })
                    })

                })
            }
        });
    })
}