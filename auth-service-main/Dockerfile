# ---------- build stage ----------
FROM golang:1.25-alpine AS builder
WORKDIR /src
COPY . .
# go mod tidy resolve as dependências do OpenTelemetry e regenera o go.sum.
RUN go mod tidy && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/auth-service .

# ---------- runtime stage ----------
FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=builder /out/auth-service /app/auth-service
USER nonroot:nonroot
EXPOSE 8001
ENTRYPOINT ["/app/auth-service"]
