FROM python:3.11-slim

WORKDIR /app

# supervisord to run all 5 processes in one container
RUN apt-get update && apt-get install -y --no-install-recommends supervisor && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

COPY supervisord.conf /etc/supervisor/conf.d/backend.conf

EXPOSE 8000 9001 9002 9003 9004

CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/backend.conf"]
