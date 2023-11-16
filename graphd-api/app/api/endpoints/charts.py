from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

from app.api.models.chart import ChartUpload
from app.api.models.params.chart import ChartQueryParams
from app.managers.asset import AssetManager
from app.models.core.chart import (
    CHART_AXIS_TYPE_MAP,
    Chart,
    ChartAxis,
    ChartMetadata,
    ChartSeries,
    ChartType,
)
from app.models.options.chart import ChartQueryOptions, ChartUpdateOptions
from app.models.schemas.response import (
    DataResponse,
    IdResponse,
    ModelResponse,
    Response,
)

router = APIRouter()


@router.post("/")
async def create_chart(
    file: UploadFile = File(...), graph_manager: AssetManager = Depends(AssetManager)
) -> IdResponse[str]:
    model = await ChartUpload(file=file).to_model()
    response = await graph_manager.create_chart(None, model)
    return response


@router.get("/types")
async def get_chart_types() -> DataResponse[ChartType]:
    return DataResponse(content=list(ChartType))


@router.get("/axes/types")
async def get_chart_axes_types() -> ModelResponse[dict]:
    return ModelResponse(content=CHART_AXIS_TYPE_MAP)


@router.get("/")
async def get_charts(
    params: ChartQueryParams = Depends(),
    graph_manager: AssetManager = Depends(AssetManager),
) -> DataResponse[Chart]:
    return await graph_manager.get_charts(None, params.to_query_options())


@router.get("/{chart_id}")
async def get_chart(
    chart_id,
    params: ChartQueryParams = Depends(),
    graph_manager: AssetManager = Depends(AssetManager),
) -> ModelResponse[Chart]:
    return await graph_manager.get_chart(None, chart_id, params.to_query_options())


@router.get("/{chart_id}/image")
async def get_chart_image(
    chart_id,
    graph_manager: AssetManager = Depends(AssetManager),
) -> StreamingResponse:
    response = await graph_manager.get_chart(
        None, chart_id, options=ChartQueryOptions(include_image=True)
    )
    return StreamingResponse(
        content=iter([response.content.image]), media_type=response.content.image_type
    )


# @router.put("/")
# async def update_chart(
#     model: Chart,
#     graph_manager: AssetManager = Depends(AssetManager),
# ) -> Response:
#     response = await graph_manager.update_chart(
#         None, model, ChartUpdateOptions(update_metadata=True)
#     )
#     return response.to_response()


@router.put("/{chart_id}/metadata")
async def update_chart_metadata(
    chart_id,
    metadata: ChartMetadata,
    graph_manager: AssetManager = Depends(AssetManager),
) -> Response:
    response = await graph_manager.get_chart(None, chart_id)
    if not response.success:
        return response
    model = response.content
    model.data.metadata = metadata
    response = await graph_manager.update_chart(
        None, model, ChartUpdateOptions(update_metadata=True)
    )
    return response.to_response()


@router.put("/{chart_id}/axes/x")
async def update_chart_xaxis(
    chart_id, axis: ChartAxis, graph_manager: AssetManager = Depends(AssetManager)
) -> Response:
    response = await graph_manager.get_chart(None, chart_id)
    if not response.success:
        return response
    model = response.content
    model.data.x_axis = axis
    response = await graph_manager.update_chart(
        None, model, ChartUpdateOptions(update_xaxis=True)
    )
    return response.to_response()


@router.put("/{chart_id}/axes/y")
async def update_chart_yaxis(
    chart_id, axis: ChartAxis, graph_manager: AssetManager = Depends(AssetManager)
) -> Response:
    response = await graph_manager.get_chart(None, chart_id)
    if not response.success:
        return response
    model = response.content
    model.data.y_axis = axis
    response = await graph_manager.update_chart(
        None, model, ChartUpdateOptions(update_yaxis=True)
    )
    return response.to_response()


@router.put("/{chart_id}/series")
async def update_chart_series(
    chart_id, series: ChartSeries, graph_manager: AssetManager = Depends(AssetManager)
) -> Response:
    response = await graph_manager.get_chart(None, chart_id)
    if not response.success:
        return response
    model = response.content
    model.data.series = series
    response = await graph_manager.update_chart(
        None, model, ChartUpdateOptions(update_series=True)
    )
    return response.to_response()

from enum import Enum
import pandas as pd
import numpy as np

class TableType(str, Enum):
    denormalized = "denormalized"
    pivot = "pivot"

@router.get("/{chart_id}/table")
async def get_chart_table(
    chart_id,
    table_type: TableType,
    graph_manager: AssetManager = Depends(AssetManager),
) -> Response:
    response = await graph_manager.get_chart(None, chart_id)
    if not response.success:
        return response
    
    try:
        model = response.content
        all_series_data = model.data.series.data
        data_table = []

        series_column_name = model.data.series.name
        x_column_name = model.data.x_axis.name
        y_column_name = model.data.y_axis.name
        header_row = [
            series_column_name,
            x_column_name,
            y_column_name
        ]

        for series in all_series_data:
            one_series_data = series.data
            for point in one_series_data:
                series_row = []
                series_row = [
                    series.name, 
                    point.value.x, 
                    point.value.y
                ]
                data_table.append(series_row)
        
        data_df = pd.DataFrame(data=data_table, columns=header_row) 

        if table_type == 'denormalized':
            output_df = data_df.copy()
        elif table_type == 'pivot':
            # update column name if there is name collision
            if x_column_name in (data_df[series_column_name].tolist()):
                x_column_name_new = f'{x_column_name}_x'
                data_df.rename(columns={f'{x_column_name}': f'{x_column_name_new}'}, inplace=True)
                x_column_name = x_column_name_new

            output_df = pd.pivot_table(data_df, values=y_column_name, index=[x_column_name], columns=series_column_name, fill_value=0).reset_index()
        else:
            raise HTTPException(status_code=404, detail="Not a valid table type")
        
        output_header = [output_df.columns.values.tolist()]
        output_table = output_df.values.tolist()
        
        response.content = {
            'header': output_header,
            'data': output_table
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failure in table transform")
    return response


"""
dont think of it like updating a model, think of it as verifying a "Prediction".  Introduce a Prediction entity
that links two Charts in time, and tracks which one is the prediction and which is the user correction.  This should
be masked from the end user of course


or something like that..
"""
