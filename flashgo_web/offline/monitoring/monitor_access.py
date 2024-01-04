# run on ad02
import datetime
import os
import smtplib
from email.mime.text import MIMEText

SENDER = 'robot@newsinpalm.com'
PASSWD = 'bpJbdZQYj2ZmdJ9r'
HOST = 'smtp.exmail.qq.com'
RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
# RECEIVERS = ['lingfeng@newsinpalm.com']

# online nginx access.log
ACCESS_LOG_PATH = '/datadrive/flashgo/logs/nginx/access.log'


# dev nginx access.log path
# ACCESS_LOG_PATH = '/datadrive/PaydayLoan/logs/service/nginx/access.log'


class MailSender(object):
    def __init__(self, name, password, host=HOST):
        self.username = name
        self.password = password
        self.host = host

    def _create_message(self, content, subject, to_addr):
        message = MIMEText(content, 'plain')
        message['From'] = self.username
        message['To'] = ', '.join(to_addr)
        message['Subject'] = subject
        message['Cc'] = ''
        message_full = message.as_string()
        return message_full

    def send(self, to_addr, subject, content):
        message_full = self._create_message(content, subject, to_addr)
        smtp_server = smtplib.SMTP(self.host)
        smtp_server.starttls()
        smtp_server.login(self.username, self.password)
        for i in range(3):
            try:
                smtp_server.sendmail(from_addr=self.username, to_addrs=to_addr, msg=message_full)
                smtp_server.quit()
                return True
            except:
                smtp_server.quit()
                return False


mail_sender = MailSender(SENDER, PASSWD)


def get_per_hour_api_count(api_pattern=None, record_size=None, start_time=None, status_pattern=None):
    basic_command = 'tail'

    # count limit
    record_size = 150000 if record_size is None else record_size
    basic_command = '{} -n {} {} '.format(basic_command, record_size, ACCESS_LOG_PATH)

    # duration limit
    date_pattern = (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).strftime(
        '%d/%b/%Y:%H') if start_time is None else start_time.strftime('%d/%b/%Y:%H')
    basic_command = basic_command + '| grep {}'.format(date_pattern)

    # url limit
    basic_command = basic_command if api_pattern is None else basic_command + ' | grep {} '.format(
        api_pattern)
    with os.popen("{} | wc -l".format(basic_command)) as total_buffer:
        total_count = total_buffer.read()

    # status code limit
    status_pattern = ' 5[0-9][0-9] ' if status_pattern is None else status_pattern

    with os.popen(basic_command + " | grep \"HTTP/1.1\\\"{}\" | wc -l".format(status_pattern)) as error_buffer:
        error_count = error_buffer.read()
    return int(total_count), int(error_count)


def monitor_login(ratio):
    api_pattern = '/user_center/users/login'
    total_count, error_count = get_per_hour_api_count(api_pattern=api_pattern)
    total_count = total_count if total_count != 0 else 1
    if float(error_count) / float(total_count) >= ratio:
        failure_ratio = '%.4f%%' % (100 * float(error_count) / float(total_count))
        mail_sender.send(
            RECEIVERS,
            'User Login Monitoring Alert',
            """
            ATTENTION User Login PLEASE !!!
                In the last hour, the API for login
                {}, {} / {} failure, Percentage of request failures is {}.
            """.format(api_pattern, error_count, total_count, failure_ratio))


def monitor_total(ratio):
    api_pattern = None
    total_count, error_count = get_per_hour_api_count(api_pattern)
    total_count = total_count if total_count != 0 else 1
    if float(error_count) / float(total_count) >= ratio:
        failure_ratio = '%.4f%%' % (100 * float(error_count) / float(total_count))
        mail_sender.send(
            RECEIVERS,
            'Service API Monitoring Alert',
            """
            ATTENTION Service PLEASE !!!
                In the last hour, 
                {}, {} / {} failure, Percentage of request failures is {}.
            """.format(api_pattern, error_count, total_count, failure_ratio)
        )


def main():
    import sys
    if len(sys.argv) >= 2:
        action = sys.argv[1]
    else:
        action = None

    if action == 'total':
        monitor_total(0.05)
    elif action == 'login':
        monitor_login(0.3)
    else:
        api_pattern = action
        total_count, error_count = get_per_hour_api_count(api_pattern)
        print(api_pattern)
        print('{} / {} failure in the last hour.'.format(error_count, total_count))


def _test():
    get_per_hour_api_count(api_pattern=None, record_size=None, start_time=None, status_pattern=None)


if __name__ == "__main__":
    main()
    # _test()
