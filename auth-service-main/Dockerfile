# ---------- build stage ----------
FROM golang:1.24-alpine AS builder
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/auth-service .

# ---------- runtime stage ----------
FROM gcr.io/distroless/static:nonroot
WORKDIR /app
COPY --from=builder /out/auth-service /app/auth-service
USER nonroot:nonroot
EXPOSE 8001
ENTRYPOINT ["/app/auth-service"]
