# dev image
FROM python:3.10-slim
ENV PYTHONDONTWRITEBYTECODE 1
RUN apt-get update && apt-get install -y git
WORKDIR /usr/src/app
# copy and install dependencies
COPY requirements.txt update_locations.py psi_webpage_icon_extractor.py ./
RUN pip install -r requirements.txt

CMD ["python", "update_locations.py"]
