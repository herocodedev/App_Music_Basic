const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const cd = $('.cd')
const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
        name: "Ren Remix uuu",
        singer: "Raftaar x Fortnite",
        path: "./mp3/1.mp3",
        image: "https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg"
    }, {
        name: "Tu Phir Se Aana",
        singer: "Raftaar x Salim Merchant x Karma",
        path: "./mp3/2.mp3",
        image: "https://1.bp.blogspot.com/-kX21dGUuTdM/X85ij1SBeEI/AAAAAAAAKK4/feboCtDKkls19cZw3glZWRdJ6J8alCm-gCNcBGAsYHQ/s16000/Tu%2BAana%2BPhir%2BSe%2BRap%2BSong%2BLyrics%2BBy%2BRaftaar.jpg"
    }, {
        name: "Naachne Ka Shaunq",
        singer: "Raftaar x Brobha V",
        path: "./mp3/3.mp3",
        image: "https://i.ytimg.com/vi/QvswgfLDuPg/maxresdefault.jpg"
    }, {
        name: "Mantoiyat",
        singer: "Raftaar x Nawazuddin Siddiqui",
        path: "./mp3/4.mp3",
        image: "https://a10.gaanacdn.com/images/song/39/24225939/crop_480x480_1536749130.jpg"
    }, {
        name: "Aage Chal",
        singer: "Raftaar",
        path: "./mp3/5.mp3",
        image: "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg"
    }, {
        name: "Damn",
        singer: "Raftaar x kr$na",
        path: "./mp3/6.mp3",
        image: "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg"
    }, {
        name: "Feeling You",
        singer: "Raftaar x Harjas",
        path: "./mp3/7.mp3",
        image: "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp"
    }],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        var htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${this.currentIndex===index ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            // Lên đọc doc về get trong object.defineProperty
            // value: this.songs[this.currentIndex],
            // writable: false
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
            // Xử lí phóng to thu nhỏ
        const cdWidth = $('.cd').offsetWidth
        document.onscroll = function(e) {
            const scrollTop = document.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth

        }

        // Xử lí khi click play
        playBtn.onclick = function(e) {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi audio play
        audio.onplay = function(e) {
            player.classList.add('playing')
            _this.isPlaying = true
            cdThumbAnimate.play()
        }

        // Khi song pause
        audio.onpause = function(e) {
            player.classList.remove('playing')
            _this.isPlaying = false
            cdThumbAnimate.pause()
        }

        // Khi tiếp độ bài hát thay đổi
        audio.ontimeupdate = function(e) {
            if (audio.duration) {
                const percent = (audio.currentTime * 100) / audio.duration
                progress.value = Math.floor(percent)
            }
        }

        // Xử lí khi tua song
        progress.onchange = function(e) {
            const seekTime = (progress.value * audio.duration) / 100
            audio.currentTime = seekTime
        }

        // Xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lí khi next
        nextBtn.onclick = function(e) {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lí khi prev
        prevBtn.onclick = function(e) {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lí khi bật / tắt random
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lí khi audio ended
        audio.onended = function(e) {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Xử lí phát lại khi bấm nút reapeat
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lí hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },

    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },
    nextSong: function() {
        this.currentIndex++
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function(e) {
        setTimeout(function() {
            if (this.currentIndex > 0) {
                $('.song.active').scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                })
            } else {
                $('.song.active').scrollIntoView(false)
            }
        }, 300)
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

        // Object.assign(this,this.config)
    },
    start: function() {
        // Gán cấu hình các nút vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính
        app.defineProperties()

        // Xử lí sự kiện
        app.handleEvents()

        // load song
        app.loadCurrentSong()

        // render song
        app.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()