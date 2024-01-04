docker run -it --rm \
--name maxwell \
-v /root/.aws:/root/.aws \
zendesk/maxwell sh -c 'cp /app/kinesis-producer-library.properties.example /app/kinesis-producer-library.properties && echo "Region=ap-southeast-1" >> /app/kinesis-producer-library.properties && bin/maxwell --user=maxwell --password=zggcdws --host= --producer=kinesis --kinesis_stream=flashgo-mysql-binlog'
