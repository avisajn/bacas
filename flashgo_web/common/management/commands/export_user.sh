USERNAME="baca"
PASSWORD="e4b054013c95"
HOST="paydayloan-aggregator.csidpbq21yh5.ap-southeast-1.rds.amazonaws.com"
DBNAME="flashgo"
OUTPUT="/datadrive/flashgo/export/users.data"
mkdir -p /datadrive/flashgo/export/
rm ${OUTPUT}
TOTAL_COUNT=`mysql -u${USERNAME} -p${PASSWORD} -h${HOST} -q -N ${DBNAME} -e "select count(1) from users"`
COUNTER=0
while [[ ${COUNTER} -lt ${TOTAL_COUNT} ]]
do
    mysql -u${USERNAME} -p${PASSWORD} -h${HOST} --max_allowed_packet=1G -q -N \
        ${DBNAME} -e "select * from users limit ${COUNTER}, 100000" >> ${OUTPUT}
    COUNTER=`expr ${COUNTER} + 100000`
done


grep -v Facebook_ /datadrive/flashgo/export/users.data | awk -F"\t" -vOFS="\t" '{if($5=="NULL"){print $1,$2,$3,"",$6,$4}else{print $1,$2,$3,$5,$6,$4}}' > /datadrive/flashgo/export/not_login.gender.data
grep Facebook_ /datadrive/flashgo/export/users.data | awk -F"\t" -vOFS="\t" '{if($5=="NULL"){print $1,$2,$3,"",$6,$4}else{print $1,$2,$3,$5,$6,$4}}' > /datadrive/flashgo/export/login.gender.data

rm /datadrive/flashgo/export/user_profile
echo -e "id\tuser_id\tuser_pseudo_id\tgender\tcreated_time\tfcm_token" >> /datadrive/flashgo/export/user_profile
cat /datadrive/flashgo/export/login.gender.data >> /datadrive/flashgo/export/user_profile
awk -F "\t" -vOFS="\t" 'ARGIND==1{map[$3]=0}ARGIND==2{if(!($3 in map))print $0}' /datadrive/flashgo/export/login.gender.data /datadrive/flashgo/export/not_login.gender.data >> /datadrive/flashgo/export/user_profile

rm /datadrive/flashgo/export/login.gender.data /datadrive/flashgo/export/not_login.gender.data

gsutil cp /datadrive/flashgo/export/user_profile gs://flashgo-user-profile/user_profile

bash -x /datadrive/flashgo_data/scripts/load_users_table.sh
