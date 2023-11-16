import pickle
import uuid

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import PickleType

from app.entities.base import Base
from app.models.core.chart import Chart as ChartModel

# sqlalchemy 2.x equivalent filename: Mapped[str] https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html#using-annotated-declarative-table-type-annotated-forms-for-mapped-column


class Chart(Base):
    __tablename__ = "chart"
    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False), primary_key=True, default=lambda _: str(uuid.uuid4())
    )
    filename: Mapped[str]
    image_type: Mapped[str]
    md5_hash: Mapped[str]
    storage_url: Mapped[str]
    data = Column(PickleType)

    @classmethod
    def from_model(cls, model: ChartModel) -> "Chart":
        entity = cls(
            id=model.id,
            filename=model.filename,
            image_type=model.image_type,
            md5_hash=model.md5_hash,
            storage_url=model.storage_url,
            data=pickle.dumps(model.data),
        )
        return entity

    def to_model(self) -> ChartModel:
        model = ChartModel(
            id=self.id,
            filename=self.filename,
            image_type=self.image_type,
            md5_hash=self.md5_hash,
            storage_url=self.storage_url,
            data=pickle.loads(self.data),
        )
        return model
