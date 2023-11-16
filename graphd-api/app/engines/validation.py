from app.engines.base import Base
from app.models.core.chart import Chart


class ValidationWorker:
    pass


class ValidationEngine(Base):
    type_map = {}

    async def process(self, context, model: Chart, options):
        worker = None
        if model.data.metadata.type in self.type_map:
            worker = self.type_map[model.data.metadata.type](model)

        if worker:
            model = worker.process()

        return model
