USERNAME="baca"
PASSWORD="e4b054013c95"
HOST="paydayloan-aggregator.csidpbq21yh5.ap-southeast-1.rds.amazonaws.com"
DBNAME="flashgo"
STORAGE_DATE=`date +%Y%m%d`
YESTERDAY=`date -d "1 day ago" +%Y-%m-%d`
TODAY=`date +%Y-%m-%d`

OUTPUT="/datadrive/flashgo/export/news_properties"
DATA_PATH="/datadrive/flashgo/export/"
mkdir -p ${DATA_PATH}
rm ${OUTPUT}
cat > /tmp/export_news_properties.sql <<EOF
select IFNULL(n.news_id, '')                                         as item_id,
       IFNULL(n.news_type, '')                                       as item_type,
       IFNULL(r.name, '')                                            as author,
       IFNULL(nc.category_id, '')                                    as category_id,
       IFNULL(fc.en_name, '')                                        as category,
       IF(fc.gender = 1, 'Male', IF(fc.gender = 2, 'Female', 'All')) as news_gender,
       IFNULL(date(n.created_time), '')                              as date,
       IFNULL(n.valid, '')                                           as valid,
       IFNULL(n.rss_id, 0)                                           as rss_id,
       IFNULL(n.media_id, 0)                                         as media_id,
       IFNULL(u.name, '')                                            as ugc_author,
       IFNULL(u.user_type, 2)                                        as user_type,
       IFNULL(unr.rate_id, 0)                                        as rate
from news n
         left join ugc_news_rate unr on unr.news_id = n.news_id
         left join rss r on n.rss_id = r.id
         left join news_categories nc on n.news_id = nc.news_id
         left join common_flashgo_news_categories fc on nc.category_id = fc.id
         left join users u on n.media_id = u.id;
EOF

mysql -u${USERNAME} -p${PASSWORD} -h${HOST} --max_allowed_packet=1G -q ${DBNAME} < /tmp/export_news_properties.sql | awk -F"\t" -v OFS="," '{if($12=="1") {print $1,$2,$11,$4,$5,$6,$7,$8,$9,$10,"fake",$13} else if($10>=100000){print $1,$2,$11,$4,$5,$6,$7,$8,$9,$10,"ugc",$13}else{print $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,"crawler",$13}}' > ${DATA_PATH}news.tmp

mysql -u${USERNAME} -p${PASSWORD} -h${HOST} --max_allowed_packet=1G -N -q ${DBNAME} -e 'select distinct news_id from news_topics where status=1' > ${DATA_PATH}has_topics_news_id
mysql -u${USERNAME} -p${PASSWORD} -h${HOST} --max_allowed_packet=1G -N -q ${DBNAME} -e 'select distinct news_id from ugc_news_tags where status=1' > ${DATA_PATH}has_tags_news_id

awk -F "," -v OFS="," 'ARGIND==1{
map_has_topic[$1]=0
}
ARGIND==2{
map_has_tag[$1]=0
}
ARGIND==3{
has_tag=0;
has_topic=0;
if ($1 in map_has_topic) {has_topic=1}
if ($1 in map_has_tag) {has_tag=1}
print $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,has_topic,has_tag,$12
}' ${DATA_PATH}has_topics_news_id ${DATA_PATH}has_tags_news_id ${DATA_PATH}news.tmp > ${OUTPUT}

gsutil cp ${OUTPUT} gs://flashgo-news-properties/news_properties
cp ${OUTPUT} /datadrive/flashgo/export/news_snapshot_${STORAGE_DATE}