const fs = require('fs')
const path = require('path')
const Playlist = require('./lib/ffmpeg-playlist')

let playlist = new Playlist(path.join(__dirname, 'approved_uploads'))

let currentTracks = playlist.readPlaylist()
let allTracks = fs.readdirSync(path.join(__dirname, 'approved_uploads'))
  .filter(file => file.match(/\.mp3/))
  .map(file => path.basename(file, '.mp3'))

let unAddedTracks = allTracks.filter(track => currentTracks.indexOf(track) < 0)

for (let track of unAddedTracks) {
  playlist.addTrack(track)
}
