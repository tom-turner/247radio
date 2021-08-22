RTMP_SERVER='udp://localhost:8000'
IMAGE_FILE='public/images/metal-radio.jpg'

ffmpeg -loop 1 -y -i "$IMAGE_FILE" -re -i ./approved_uploads/playlist.txt -f flv "$RTMP_SERVER"
