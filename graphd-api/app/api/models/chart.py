from fastapi import UploadFile

from app.models.base import Base
from app.models.core.chart import Chart

# View Models


class ChartUpload(Base):
    file: UploadFile

    async def to_model(self) -> Chart:
        return Chart(
            filename=self.file.filename,
            image_type=self.file.content_type,
            image=await self.file.read(),
        )
