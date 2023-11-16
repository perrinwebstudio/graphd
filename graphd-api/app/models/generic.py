from typing import Generic, TypeVar

from app.models.base import BaseModel

T = TypeVar("T")


class IdModel(Generic[T], BaseModel):
    id: T


K = TypeVar("K")
V = TypeVar("V")


class KeyValueModel(Generic[K, V], BaseModel):
    key: K
    value: V
