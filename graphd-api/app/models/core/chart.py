from uuid import UUID, uuid4

from pydantic import Field, validator

from app.models.base import BaseEnum, BaseModel


class ChartType(BaseEnum):
    line = "line"
    bar = "bar"
    pie = "pie"


class ChartAxisType(BaseEnum):
    value = "value"
    category = "category"
    time = "time"
    log = "log"


class ChartAxisSubType(BaseEnum):
    int = "int"
    float = "float"
    percentage = "percentage"
    year = "year"
    month = "month"
    day = "day"
    hour = "hour"
    minute = "minute"
    second = "second"
    millisecond = "millisecond"


CHART_AXIS_TYPE_MAP = {
    ChartAxisType.value: [
        None,
        ChartAxisSubType.int,
        ChartAxisSubType.float,
        ChartAxisSubType.percentage,
    ],
    ChartAxisType.category: [None],
    ChartAxisType.time: [
        ChartAxisSubType.year,
        ChartAxisSubType.month,
        ChartAxisSubType.day,
        ChartAxisSubType.hour,
        ChartAxisSubType.minute,
        ChartAxisSubType.second,
        ChartAxisSubType.millisecond,
    ],
    ChartAxisType.log: [None],
}


class ChartDataPointPositionRange(BaseModel):
    min: int
    max: int


class ChartDataPointPositionCoordinate(BaseModel):
    x: int
    y: int


class ChartDataPointValueCoordinate(BaseModel):
    x: int | float | str
    y: int | float | str


class ChartDataPoint(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    position: int | ChartDataPointPositionRange | ChartDataPointPositionCoordinate
    value: int | str | ChartDataPointValueCoordinate


class ChartAxisGrid(BaseModel):
    data: list[ChartDataPoint] = []
    value_per_pixel: float = None
    pixel_per_value: float = None


class ChartAxis(BaseModel):
    name: str
    type: ChartAxisType
    subtype: ChartAxisSubType = None
    grid: ChartAxisGrid

    @validator("subtype")
    def subtype_must_match_type(cls, v, values, **kwargs):
        assert v in CHART_AXIS_TYPE_MAP[values["type"]], "must be a valid axis subtype"
        return v


class ChartSeriesData(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    color: str
    data: list[ChartDataPoint]


class ChartSeries(BaseModel):
    name: str
    data: list[ChartSeriesData]


class ChartMetadata(BaseModel):
    title: str = None
    type: ChartType = None


class ChartData(BaseModel):
    metadata: ChartMetadata = ChartMetadata()
    x_axis: ChartAxis = None
    y_axis: ChartAxis = None
    r_axis: ChartAxis = None
    series: ChartSeries = None


class Chart(BaseModel):
    id: str = None
    filename: str
    md5_hash: str = None
    storage_url: str = None
    image: str | bytes = None
    image_type: str
    data: ChartData = ChartData()

    # @validator("data")
    # def data_must_be_chartdata_subclass(cls, v):
    #     assert issubclass(type(v), ChartData), "data must be subclass of ChartData"
    #     return v


"""
Notes
Axis has two types -- cartesian (nd), polar

Need to nail down prediction vs chart

User uploads chart, return the chart id
user queries chart, returns chart
user sets title, chart type, returns 201
kicks off
each time chart is updated, the prediction model is run to generate a new prediction for the rest of the untouched fields
prediction is included in asset response on demand, or queried indv

Two storage options:
-
chart data as JSONB
approach: serializers for each rsptv model
pros: flexibility, less work
cons: complexity around mig and mgmt
-
chart data as structured tables
pros: easier to work with? maybe
cons: hard to set up. More rigid. probably less performant

hybrid?
cons: complicated. no.


"""
