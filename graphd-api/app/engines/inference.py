import math
from datetime import datetime
from app.engines.base import Base
from app.models.core.chart import Chart, ChartAxisType, ChartType, ChartAxisSubType
from app.models.options.chart import ChartUpdateOptions

"""
The responsibility of the InferenceEngine is to populate a chart model in progress with the purly computational values needed to aid chart processing.
The inference engine should have high accuracy and precisison when populating values, as they are the basis for subsequent steps, and incorrect values will
cause cascading inaccuracies that will make future steps impossible.
"""
"""
7/22
Not convinced this is the right pattern here...  But works for now
Consider using new pydantic decorator "computed_field"

7/26
May need "ChartStatus" concept to track where in the process a chart is.  Would slim down on assertion requirements by short circuting later steps. Other benefits (UI), no drawbacks?
"""

DATE_FORMAT = '%Y-%m-%dT%H:%M:%S.%fZ'
YEAR_FORMAT = '%Y'
MONTH_FORMAT = '%Y-%m'
DAY_FORMAT = '%Y-%m-%d'

class InferenceWorker:
    def __init__(self, context, model: Chart, options: ChartUpdateOptions):
        self.context = context
        self.model = model
        self.options = options

    def process(self):
        pass

    def _metadata(self):
        pass


class ChartBarInference(InferenceWorker):
    def process(self):
        if self.options.update_metadata:
            self._metadata()
        if self.options.update_xaxis:
            self._x_axis()
        if self.options.update_yaxis:
            self._y_axis()
        if self.options.update_series:
            self._series()
        return self.model

    def __axis(self, model, axis):  # 2d cartesian
        assert (
            len(model.grid.data) > 1
        ), "ChartLineInference/__axis/multiple_data_points_required"

        model.grid.data = sorted(
            model.grid.data, key=lambda i: getattr(i.position, axis)
        )
        d1, d2 = model.grid.data[0:2]
        model.grid.value_per_pixel = (
            (d1.value - d2.value)
            / (getattr(d1.position, axis) - getattr(d2.position, axis))
        )
        model.grid.pixel_per_value = (
            getattr(d1.position, axis) - getattr(d2.position, axis)
        )
        # if model.type is ChartAxisType.value:
        #     value_per_pixel = ((d1.value - d2.value) / (getattr(d1.position, axis) - getattr(d1.position, axis)))
        # if model.type is ChartAxisType.category:
        #     pass
        # if model.type is ChartAxisType.time:
        #     pass
        return model

    def _x_axis(self):
        self.model.data.x_axis = self.__axis(self.model.data.x_axis, "x")

    def _y_axis(self):
        self.model.data.y_axis = self.__axis(self.model.data.y_axis, "y")

    def _series(self):
        # xpos = self.model.data.x_axis.grid.data[0]
        # ypos = self.model.data.y_axis.grid.data[0]
        xaxis = self.model.data.x_axis
        yaxis = self.model.data.y_axis

        # Exists assertion of pos handled in previous step, though I dont like the implicitness of previous assertions passing with this design pattern.
        # ValidationEngine should use ChartStatus enum to do all this validation prior to inference engine.  Or model validation??? Yeha probably that.

        xvpp = self.model.data.x_axis.grid.value_per_pixel
        yvpp = self.model.data.y_axis.grid.value_per_pixel

        xppc = self.model.data.x_axis.grid.pixel_per_value
        yppc = self.model.data.y_axis.grid.pixel_per_value

        for series in self.model.data.series.data:
            for data_point in series.data:
                if xvpp is not None:
                    if self.model.data.x_axis.type is ChartAxisType.value:
                        d1, d2 = data_point.position.x, xaxis.grid.data[0].position.x
                        data_point.value.x = (
                            ((d1 - d2) * xvpp) + xaxis.grid.data[0].value
                        ) or None
                    if self.model.data.x_axis.type is ChartAxisType.time:
                        data_point.value.x = None
                    if self.model.data.x_axis.type is ChartAxisType.category:
                        # category index
                        i = math.floor(data_point.position.x / xppc)
                        data_point.value.x = i or None

                if yvpp is not None:
                    if self.model.data.y_axis.type is ChartAxisType.value:
                        d1, d2 = data_point.position.y, yaxis.grid.data[0].position.y
                        data_point.value.y = (
                            ((d1 - d2) * yvpp) + yaxis.grid.data[0].value
                        ) or None
                    if self.model.data.y_axis.type is ChartAxisType.time:
                        data_point.value.y = None
                    if self.model.data.y_axis.type is ChartAxisType.category:
                        # category index
                        i = math.floor(data_point.position.y / yppc)
                        data_point.value.y = i or None


class ChartLineInference(InferenceWorker):
    def process(self):
        if self.options.update_metadata:
            self._metadata()
        if self.options.update_xaxis:
            self._x_axis()
        if self.options.update_yaxis:
            self._y_axis()
        if self.options.update_series:
            self._series()
        return self.model

    def __axis(self, model, axis):  # 2d cartesian
        assert (
            len(model.grid.data) > 1
        ), "ChartLineInference/__axis/multiple_data_points_required"

        model.grid.data = sorted(
            model.grid.data, key=lambda i: getattr(i.position, axis)
        )
        d1, d2 = model.grid.data[0:2]

        # convert datetime to epoch for simpler inference
        if model.type is ChartAxisType.time:
            d1.value = datetime.strptime(d1.value, DATE_FORMAT).timestamp()
            d2.value = datetime.strptime(d2.value, DATE_FORMAT).timestamp()
        
        model.grid.value_per_pixel = (
            (d1.value - d2.value)
            / (getattr(d1.position, axis) - getattr(d2.position, axis))
        )
        model.grid.pixel_per_value = (
            getattr(d1.position, axis) - getattr(d2.position, axis)
        )
            
        return model

    def _x_axis(self):
        self.model.data.x_axis = self.__axis(self.model.data.x_axis, "x")

    def _y_axis(self):
        self.model.data.y_axis = self.__axis(self.model.data.y_axis, "y")

    def _series(self):
        xaxis = self.model.data.x_axis
        yaxis = self.model.data.y_axis

        # Exists assertion of pos handled in previous step, though I dont like the implicitness of previous assertions passing with this design pattern.
        # ValidationEngine should use ChartStatus enum to do all this validation prior to inference engine.  Or model validation??? Yeha probably that.

        xvpp = self.model.data.x_axis.grid.value_per_pixel
        yvpp = self.model.data.y_axis.grid.value_per_pixel

        xppc = self.model.data.x_axis.grid.pixel_per_value
        yppc = self.model.data.y_axis.grid.pixel_per_value

        for series in self.model.data.series.data:
            for data_point in series.data:
                if xvpp is not None:
                    if self.model.data.x_axis.type is ChartAxisType.value:
                        d1, d2 = data_point.position.x, xaxis.grid.data[0].position.x
                        data_point_value = (
                            ((d1 - d2) * xvpp) + xaxis.grid.data[0].value
                        )
                        if self.model.data.x_axis.subtype is ChartAxisSubType.int:
                            data_point.value.x = round(data_point_value, 0)
                        else:
                            data_point.value.x = data_point_value
                    if self.model.data.x_axis.type is ChartAxisType.time:
                        d1, d2 = data_point.position.x, xaxis.grid.data[0].position.x
                        data_point_epoch_value = (
                            ((d1 - d2) * xvpp) + xaxis.grid.data[0].value
                        )

                        # convert from epoch time to datetime for display
                        data_point_datetime_value = datetime.fromtimestamp(data_point_epoch_value)
                        
                        # round to time subtype
                        if self.model.data.x_axis.subtype is ChartAxisSubType.year:
                            data_point.value.x = data_point_datetime_value.strftime(YEAR_FORMAT)
                        elif self.model.data.x_axis.subtype is ChartAxisSubType.month:
                            data_point.value.x = data_point_datetime_value.strftime(MONTH_FORMAT)
                        elif self.model.data.x_axis.subtype is ChartAxisSubType.day:
                            data_point.value.x = data_point_datetime_value.strftime(DAY_FORMAT)
                        else:
                            data_point.value.x = data_point_datetime_value.strftime(DATE_FORMAT)
                    if self.model.data.x_axis.type is ChartAxisType.category:
                        # category index
                        i = math.floor(data_point.position.x / xppc)
                        data_point.value.x = i or None

                if yvpp is not None:
                    if self.model.data.y_axis.type is ChartAxisType.value:
                        d1, d2 = data_point.position.y, yaxis.grid.data[0].position.y
                        data_point_value = (
                            ((d1 - d2) * yvpp) + yaxis.grid.data[0].value
                        )
                        if self.model.data.y_axis.subtype is ChartAxisSubType.int:
                            data_point.value.y = round(data_point_value, 0)
                        else:
                            data_point.value.y = data_point_value
                    if self.model.data.y_axis.type is ChartAxisType.time:
                        d1, d2 = data_point.position.x, xaxis.grid.data[0].position.x
                        data_point_epoch_value = (
                            ((d1 - d2) * xvpp) + xaxis.grid.data[0].value
                        )

                        # convert from epoch time to datetime for display
                        data_point_datetime_value = datetime.fromtimestamp(data_point_epoch_value)
                        
                        # round to time subtype
                        if self.model.data.x_axis.subtype is ChartAxisSubType.year:
                            data_point.value.x = data_point_datetime_value.strftime(YEAR_FORMAT)
                        elif self.model.data.x_axis.subtype is ChartAxisSubType.month:
                            data_point.value.x = data_point_datetime_value.strftime(MONTH_FORMAT)
                        elif self.model.data.x_axis.subtype is ChartAxisSubType.day:
                            data_point.value.x = data_point_datetime_value.strftime(DAY_FORMAT)
                        else:
                            data_point.value.x = data_point_datetime_value.strftime(DATE_FORMAT)
                    if self.model.data.y_axis.type is ChartAxisType.category:
                        # category index
                        i = math.floor(data_point.position.y / yppc)
                        data_point.value.y = i or None


class ChartPieInference(InferenceWorker):
    def _axis(self):
        pass

    def _series(self):
        pass


class InferenceEngine(Base):
    type_map = {
        ChartType.line: ChartLineInference,
        ChartType.bar: ChartBarInference,
        ChartType.pie: ChartPieInference,
    }

    async def process(self, context, model: Chart, options: ChartUpdateOptions):
        worker = None
        if model.data.metadata.type in self.type_map:
            worker = self.type_map[model.data.metadata.type](context, model, options)

        if worker:
            model = worker.process()

        return model
