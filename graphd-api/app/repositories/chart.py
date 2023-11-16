import logging
import pickle
import uuid

from fastapi import FastAPI, status
from sqlalchemy import select

from app.core import sql
from app.core.storage import charts
from app.entities.chart import Chart as ChartEntity
from app.models.core.chart import Chart
from app.models.options.chart import ChartQueryOptions, ChartUpdateOptions
from app.models.schemas.response import (
    DataResponse,
    IdResponse,
    ModelResponse,
    Response,
)

app = FastAPI()


class ChartRepository:
    # async def get_chart_types(context, options: ChartTypeQueryOptions) -> ChartType:
    #     async for session in sql.get_session():
    #         if options.id is not None:
    #             return session.query(ChartType)

    async def get_charts(
        self, context, options: ChartQueryOptions
    ) -> DataResponse[Chart]:
        try:
            query = select(ChartEntity)

            if options.id is not None:
                query = query.where(ChartEntity.id == options.id)

            # optimize before prod
            response = DataResponse()
            async for session in sql.get_session():
                result = await session.execute(query)
                response.content = list()
                for x in result.scalars().all():
                    model = x.to_model()
                    if options.include_image:
                        model.image = charts.get_blob(
                            model.storage_url
                        ).download_as_bytes()
                    response.content.append(model)

            return response

        except Exception as err:
            logging.exception(err)
            return DataResponse(  # probably dont emit error msgs from here?
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    async def create_chart(self, context, model: Chart) -> IdResponse[str]:
        try:
            model.storage_url = str(uuid.uuid4())
            blob = charts.blob(model.storage_url)
            blob.upload_from_string(model.image)
            model.md5_hash = blob.md5_hash

            entity = ChartEntity.from_model(model)
            async for session in sql.get_session():
                session.add(entity)
                await session.commit()

            response = ModelResponse(
                status_code=status.HTTP_201_CREATED, content=entity.to_model()
            )
        except Exception as err:
            logging.exception(err)
            response = ModelResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return response.to_id_response()

    async def update_chart(
        self, context, model: Chart, options: ChartUpdateOptions = ChartUpdateOptions()
    ) -> Response:
        try:
            async for session in sql.get_session():
                entity = await session.get(ChartEntity, model.id)

                #
                data = pickle.loads(entity.data)
                if options.update_metadata:
                    data.metadata = model.data.metadata
                if options.update_xaxis:
                    data.x_axis = model.data.x_axis
                if options.update_yaxis:
                    data.y_axis = model.data.y_axis
                if options.update_series:
                    data.series = model.data.series
                entity.data = pickle.dumps(data)

                await session.commit()

            response = ModelResponse(
                status_code=status.HTTP_202_ACCEPTED, content=entity.to_model()
            )
        except Exception as err:
            logging.exception(err)
            response = ModelResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return response.to_response()
