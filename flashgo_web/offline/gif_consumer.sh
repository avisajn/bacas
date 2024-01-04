# deploy docker build . -t=gifify -f Dockerfile.gifify
docker run -it --rm -v /datadrive/flashgo:/datadrive/flashgo gifify bash -c "cd /app/sale_aggregator_service/offline && PYTHONPATH=/app/sale_aggregator_service/ python3 gif_consumer.py"
