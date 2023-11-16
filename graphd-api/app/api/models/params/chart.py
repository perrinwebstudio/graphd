from app.models.base import BaseModel
from app.models.options.chart import ChartQueryOptions


class ChartQueryParams(BaseModel):
    include_data: bool = True
    include_prediction: bool = False

    def to_query_options(self):
        return ChartQueryOptions(
            include_data=self.include_data,
            include_prediction=self.include_prediction,
        )
