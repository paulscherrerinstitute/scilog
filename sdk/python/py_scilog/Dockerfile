# dev image
FROM python:3.8-slim as dev
ENV PYTHONDONTWRITEBYTECODE 1
WORKDIR /usr/src/app

COPY poetry.lock pyproject.toml ./
RUN pip install poetry \
    && poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi \
    && poetry export -f requirements.txt --output requirements.txt

FROM python:3.8-slim AS prod
WORKDIR /usr/src/app
# copy and install dependencies
COPY --from=dev /usr/src/app/requirements.txt ./
RUN pip install -r requirements.txt
# copy app sources
COPY ./*.py ./
COPY scilog scilog

CMD ["python", "update_locations.py"]
