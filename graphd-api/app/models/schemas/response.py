from typing import Any, Generic, TypeVar, Union

from fastapi import Response as FastAPIResponse
from pydantic.generics import GenericModel

from app.models.base import BaseEnum, BaseModel
from app.models.generic import IdModel


class BaseResponse(BaseModel):
    # may define additional fields or config shared across responses
    content: Any = None
    success: bool = True
    status_code: int = 200
    messages: list = []

    def to_api_response(self):
        return FastAPIResponse(content=self.content, status_code=self.status_code)


class Response(BaseResponse):
    def to_response(self) -> "Response":
        return Response(
            success=self.success, status_code=self.status_code, messages=self.messages
        )


T = TypeVar("T")


class IdResponse(Response, GenericModel, Generic[T]):
    content: IdModel[T] | None


M = TypeVar("M", bound=Union[BaseModel, BaseEnum, str])


class ModelResponse(Response, GenericModel, Generic[T]):
    content: T | None

    def to_id_response(self) -> IdResponse[T]:
        t = type(self.content.id) if self.content else None
        response = IdResponse[t](
            success=self.success,
            status_code=self.status_code,
            messages=self.messages,
        )
        if self.success and self.content is not None:
            response.content = IdModel[t](id=self.content.id)
        return response


class DataResponse(Response, GenericModel, Generic[M]):
    content: list[M] = []
    count: int = None

    class Config:
        use_enum_values = True

    def to_model_response(self):
        response = ModelResponse[M](
            success=self.success,
            status_code=self.status_code,
            messages=self.messages,
        )

        if self.success:
            response.content = self.content[0]

        return response
