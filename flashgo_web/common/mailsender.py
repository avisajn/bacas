import smtplib
from email.mime.text import MIMEText
from typing import List
from common.loggers import get_offline_logger
from common.config import MAIL_SENDER_CONFIG


SENDER = MAIL_SENDER_CONFIG['username']
PASSWD = MAIL_SENDER_CONFIG['password']
HOST = MAIL_SENDER_CONFIG['host']
logger = get_offline_logger(__name__, 'monitoring.log')


class MailSender(object):
    def __init__(self, name, password, host=HOST):
        self.username = name
        self.password = password
        self.host = host

    def _create_message(self, content, subject, to_addr: List[str]):
        message = MIMEText(content, 'plain')
        message['From'] = self.username
        message['To'] = ', '.join(to_addr)
        message['Subject'] = subject
        message['Cc'] = ''
        message_full = message.as_string()
        return message_full

    def send(self, to_addr: List[str], subject, content):
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
                logger.info(
                    """
                    Send 
                        subject: %s, 
                        content: %s, 
                        error.
                    """ % (subject, content)
                )
                smtp_server.quit()
                return False


mail_sender = MailSender(SENDER, PASSWD)

