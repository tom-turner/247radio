RTMP_SERVER='rtmp://a.rtmp.youtube.com/live2/d09z-kjt5-06vd-a7sq-awfm'
IMAGE_FILE='public/images/metal-radio.jpg'

ffmpeg -loop 1 -y -i "$IMAGE_FILE" -re -i ./approved_uploads/playlist.txt -f flv "$RTMP_SERVER"
