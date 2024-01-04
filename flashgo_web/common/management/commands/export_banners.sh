USERNAME="baca"
PASSWORD="e4b054013c95"
HOST="paydayloan-aggregator.csidpbq21yh5.ap-southeast-1.rds.amazonaws.com"
DBNAME="flashgo"

OUTPUT="/datadrive/flashgo/export/banners"
mkdir -p /datadrive/flashgo/export/
rm ${OUTPUT}

mysql -u${USERNAME} -p${PASSWORD} -h${HOST} --max_allowed_packet=1G -q ${DBNAME} \
 -e "select * from banners" | awk -F"\t" -v OFS="," '{print $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11}' > ${OUTPUT}

gsutil cp ${OUTPUT} gs://flashgo-export-db/banners
