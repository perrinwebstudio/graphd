import logging

from app.core.exception import AssetValidationException
from app.engines.inference import InferenceEngine
from app.engines.validation import ValidationEngine
from app.models.core.chart import Chart
from app.models.options.chart import ChartQueryOptions, ChartUpdateOptions
from app.models.schemas.response import (
    DataResponse,
    IdResponse,
    ModelResponse,
    Response,
)
from app.repositories.chart import ChartRepository

"""
Manager classes assume a persona.  In this case, the asset manager plays the role of
one who responds to client needs around charts, graphs, diagrams etc..  The methods here
align to core use-cases graphd intends to provide to clients.
"""


class AssetManager:
    def __init__(self):
        self.validation_engine = ValidationEngine()
        self.inference_engine = InferenceEngine()

    async def get_chart(
        self, context, id, options: ChartQueryOptions = ChartQueryOptions()
    ) -> ModelResponse[Chart]:
        options.id = id
        response = await self.get_charts(context, options)
        return response.to_model_response()

    async def get_charts(
        self, context, options: ChartQueryOptions = ChartQueryOptions()
    ) -> DataResponse[Chart]:
        return await ChartRepository().get_charts(context, options)

    async def create_chart(self, context, model: Chart) -> IdResponse:
        response = await ChartRepository().create_chart(context, model)
        return response

    async def update_chart(
        self, context, model: Chart, options: ChartUpdateOptions = ChartUpdateOptions()
    ) -> Response:
        try:
            await self.validation_engine.process(context, model, options)
            model = await self.inference_engine.process(context, model, options)
            response = await ChartRepository().update_chart(context, model, options)
            return response
        except AssetValidationException:
            return DataResponse(status_code=500)  # todo
        except AssertionError:
            return DataResponse(status_code=500)
        except Exception as err:
            logging.exception(err)
            return DataResponse(status_code=500)
