from enum import Enum

from pydantic import BaseModel as Base


class BaseModel(Base):
    pass


class BaseEnum(str, Enum):
    pass
