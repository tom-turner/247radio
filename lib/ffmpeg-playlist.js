// Manage a directory of playlists that link a set of files together.
// Each playlist manages one track e.g.
// playlists
//  |- track1.mp3
//  |- track1.pl
//  |- track2.mp3
//  |- track2.pl
//
//  A *.pl file is formated like so:
//
//  ```
//  ffconcat version 1.0
//  file trackn.mp3
//  file track(n+1).pl
//  ```
//
//  We need to be able to:
//  * add a new track
//  * read the dir and generate the order of tracks
//  * remove a track

const fs = require('fs')
const path = require('path')

class Playlist {
  constructor(path) {
    this.playlistsPath = path
  }

  parsePlaylistFile(playlistFile) {
    return playlistFile
      .split("\n")
      .filter(line => line.match(/^file/))
      .map(line => line.match(/^file (.*)$/)[1])
  }

  readPlaylistFile(name) {
    return this.parsePlaylistFile(fs.readFileSync(path.join(this.playlistsPath, name), 'utf8'))
  }

  readPlaylist() {
    if (!fs.existsSync(path.join(this.playlistsPath, 'playlist.pl')))
      return []

    let playlist = []
    let unread = this.readPlaylistFile('playlist.pl')
   
    while (unread.length > 0) {
      const next = this.readPlaylistFile(unread.pop())
      const nextTrack = next.filter(file => file.match(/.*\.mp3/))[0]
      const nextPlaylistFile = next.filter(file => file.match(/.*\.pl/))[0]

      if (nextTrack)
        playlist.push(nextTrack)

      if (nextPlaylistFile === 'playlist.pl')
        break;

      if (nextPlaylistFile)
        unread.push(nextPlaylistFile)
    }

    return playlist.map(file => path.basename(file, '.mp3'))
  }

  renderPlaylistFile(track, playlist) {
    return `
    ffconcat version 1.0
    file ${track}.mp3
    file ${playlist || 'playlist'}.pl
    `.trim().replace(/(\n)\s+/g, '$1')
  }

  writeFirstTrack(name, next) {
    fs.writeFileSync(path.join(this.playlistsPath, `${name}.pl`), this.renderPlaylistFile(name, next))
    fs.writeFileSync(path.join(this.playlistsPath, 'playlist.pl'), `
    ffconcat version 1.0
    file ${name}.pl
    `.trim().replace(/(\n)\s+/, '$1'))
  }

  writeTrack(prev, name, next) {
    fs.writeFileSync(path.join(this.playlistsPath, `${name}.pl`), this.renderPlaylistFile(name, next))
    fs.writeFileSync(path.join(this.playlistsPath, `${prev}.pl`), this.renderPlaylistFile(prev, name))
  }

  addTrack(name, position) {
    const playlist = this.readPlaylist()
    position = position || playlist.length
    position = Math.max(0, Math.min(playlist.length, position))

    if (position === 0)
      return this.writeFirstTrack(name, playlist[0])

    const before = playlist[position - 1]
    const after = playlist[position]
    this.writeTrack(before, name, after)
  }

  removeTrack(name) {
    const playlist = this.readPlaylist()
    const position = playlist.indexOf(name)

    if (position === 0)
      return fs.writeFileSync(path.join(this.playlistsPath, 'playlist.pl'), `
        ffconcat version 1.0
        file playlist.pl
        `.trim().replace(/(\n)\s+/g, ''))

    const before = playlist[position - 1]
    const after = playlist[position + 1]
    fs.writeFileSync(path.join(this.playlistsPath, `${before}.pl`), this.renderPlaylistFile(before, after))
    fs.unlinkSync(path.join(this.playlistsPath, `${name}.pl`))
  }

  moveTrack(name, position) {
    this.removeTrack(name)
    this.addTrack(name, position)
  }
}

module.exports = Playlist
