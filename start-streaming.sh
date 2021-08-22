RTMP_SERVER='rtmp://a.rtmp.youtube.com/live2/mwfy-4t7f-2843-qr7w-7ufa'
IMAGE_FILE='public/images/metal-radio.jpg'

ffmpeg -loop 1 -y -i "$IMAGE_FILE" -re -i ./approved_uploads/playlist.txt -f flv "$RTMP_SERVER"
