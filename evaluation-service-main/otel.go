package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

// initOTel configura os providers de trace e de métrica exportando via OTLP/gRPC
// para o OTel Collector. Toda a configuração vem de variáveis de ambiente padrão
// do OpenTelemetry (OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_SERVICE_NAME, ...), então
// nada aqui precisa mudar entre local, homologação e produção.
//
// Retorna uma função de shutdown que deve ser chamada no encerramento do processo
// para garantir o flush dos spans e métricas ainda em buffer.
func initOTel(ctx context.Context, defaultServiceName string) func(context.Context) {
	serviceName := os.Getenv("OTEL_SERVICE_NAME")
	if serviceName == "" {
		serviceName = defaultServiceName
	}

	// Sem endpoint configurado a telemetria fica desligada: o serviço continua
	// subindo normalmente em ambiente local, sem tentar exportar para lugar nenhum.
	if os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT") == "" {
		log.Println("OTEL_EXPORTER_OTLP_ENDPOINT não definida - telemetria desabilitada")
		return func(context.Context) {}
	}

	res, err := resource.New(ctx,
		// WithFromEnv lê a variável OTEL_RESOURCE_ATTRIBUTES.
		resource.WithFromEnv(),
		resource.WithTelemetrySDK(),
		resource.WithAttributes(
			semconv.ServiceName(serviceName),
			attribute.String("service.version", "1.0.0"),
		),
	)
	if err != nil {
		log.Printf("Aviso: não foi possível montar o resource do OTel: %v", err)
		res = resource.Default()
	}

	// --- Traces ---
	traceExp, err := otlptracegrpc.New(ctx, otlptracegrpc.WithInsecure())
	if err != nil {
		log.Printf("Aviso: exporter de traces indisponível: %v", err)
		return func(context.Context) {}
	}

	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExp),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(tracerProvider)

	// Propagação W3C: é o que costura os spans de serviços diferentes num único
	// trace distribuído quando um serviço chama o outro por HTTP.
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	// --- Métricas ---
	// O otelhttp usa este MeterProvider para emitir http.server.request.duration,
	// que é a métrica em cima da qual o alerta de taxa de 5xx é construído.
	metricExp, err := otlpmetricgrpc.New(ctx, otlpmetricgrpc.WithInsecure())
	if err != nil {
		log.Printf("Aviso: exporter de métricas indisponível: %v", err)
		return func(shutdownCtx context.Context) {
			_ = tracerProvider.Shutdown(shutdownCtx)
		}
	}

	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(metricExp,
			sdkmetric.WithInterval(15*time.Second))),
		sdkmetric.WithResource(res),
	)
	otel.SetMeterProvider(meterProvider)

	log.Printf("OpenTelemetry inicializado para o serviço '%s'", serviceName)

	return func(shutdownCtx context.Context) {
		if err := tracerProvider.Shutdown(shutdownCtx); err != nil {
			log.Printf("Erro no shutdown do tracer: %v", err)
		}
		if err := meterProvider.Shutdown(shutdownCtx); err != nil {
			log.Printf("Erro no shutdown do meter: %v", err)
		}
	}
}
