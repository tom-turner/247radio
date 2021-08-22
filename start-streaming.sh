RTMP_SERVER=''
IMAGE_FILE=''

ffmpeg -loop 1 -y -i "$IMAGE_FILE" -re ./playlist/playlist.txt -f flv "$RTMP_SERVER"
