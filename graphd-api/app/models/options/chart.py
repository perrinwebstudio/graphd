from app.models.base import BaseModel


class ChartTypeQueryOptions(BaseModel):
    id: str = None
    type: str = None


class ChartQueryOptions(BaseModel):
    id: str = None
    include_image: bool = False
    include_data: bool = True
    include_prediction: bool = False


class ChartUpdateOptions(BaseModel):
    update_metadata: bool = False
    update_xaxis: bool = False
    update_yaxis: bool = False
    update_series: bool = False
