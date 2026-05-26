FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/evaluation-service .

FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=builder /out/evaluation-service /app/evaluation-service
USER nonroot:nonroot
EXPOSE 8004
ENTRYPOINT ["/app/evaluation-service"]
