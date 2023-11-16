from google.cloud import storage

from app.core import config

client = storage.Client()
charts = client.get_bucket(config.settings.CHARTS_STORAGE_HOST)
