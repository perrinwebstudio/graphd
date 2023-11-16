from fastapi import APIRouter

from app.api.endpoints import charts

api_router = APIRouter()
api_router.include_router(charts.router, prefix="/v1/charts", tags=["chart"])
