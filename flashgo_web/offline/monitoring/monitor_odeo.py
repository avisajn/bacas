import datetime
import smtplib
from email.mime.text import MIMEText

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, TIMESTAMP



SENDER = 'robot@newsinpalm.com'
PASSWD = 'nqFfucJWWo3h8fTa'
HOST = 'smtp.exmail.qq.com'
RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
# RECEIVERS = ['lingfeng@newsinpalm.com']


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

table_metaclass = declarative_base()


class PhoneOrders(table_metaclass):
    __tablename__ = 'phone_orders'

    id = Column(Integer, primary_key=True)
    created_time = Column(TIMESTAMP)
    updated_time = Column(TIMESTAMP)
    subscriber_number = Column(String)
    buying_price = Column(Integer)
    selling_price = Column(Integer)
    status = Column(Integer)
    unique_order_id = Column(String)
    bill_info_id = Column(Integer)


class OrderStatus(table_metaclass):
    __tablename__ = 'order_statuses'

    id = Column(Integer, primary_key=True)
    created_time = Column(TIMESTAMP)
    updated_time = Column(TIMESTAMP)
    user_id = Column(Integer)
    unique_order_id = Column(String)
    partner_order_id = Column(Integer)
    status = Column(Integer)
    message = Column(String)
    price = Column(Integer)


db_engine = create_engine("mysql+pymysql://baca:KpP1HAXj@payday-loan-prod.csidpbq21yh5.ap-southeast-1.rds.amazonaws.com:3306/payment?charset=utf8mb4",
                          echo=False,
                          pool_recycle=600)


def main():
    session_class = sessionmaker(bind=db_engine)
    session = session_class()
    try:
        min_datetime = datetime.datetime.now() - datetime.timedelta(days=1)
        orders_partner_order_ids = {order.partner_order_id for order in session.query(OrderStatus).filter(OrderStatus.created_time > min_datetime).all()}
        error_orders = []
        for partner_order_id in orders_partner_order_ids:
            if partner_order_id is not None:
                orders = session.query(OrderStatus).filter(OrderStatus.partner_order_id == partner_order_id).all()
                if len(set(order.status for order in orders)) > 2:
                    error_orders.append(partner_order_id)
        else:
            if error_orders:
                mail_sender.send(RECEIVERS,
                                 "ODEO CALLBACK MONITOR",
                                 f"Data of orders followed are incorrect, partner_order_id {tuple(error_orders)}")
    finally:
        session.close()


if __name__ == '__main__':
    main()
