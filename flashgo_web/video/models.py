from sqlalchemy import Column, Integer, PrimaryKeyConstraint

from common.viewmodelutils import ORMBase, ORMModelBase


class VideoDeals(ORMBase, ORMModelBase):
    __tablename__ = 'video_deals'
    __table_args__ = (
        PrimaryKeyConstraint('video_id', 'deal_id'),
    )

    video_id = Column(Integer)
    deal_id = Column(Integer)
