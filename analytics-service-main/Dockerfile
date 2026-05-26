FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN useradd -m -u 10001 appuser
COPY --from=builder /root/.local /home/appuser/.local
COPY . .
ENV PATH=/home/appuser/.local/bin:$PATH
USER appuser
EXPOSE 8005
CMD ["python", "app.py"]
