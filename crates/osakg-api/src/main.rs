use osakg_api::{create_router, AppState};
use osakg_evidence::EvidenceStore;
use osakg_graph::InMemoryGraphStore;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new("info"))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let graph = InMemoryGraphStore::new();
    let evidence = EvidenceStore::in_memory()?;
    let state = AppState {
        graph,
        evidence,
        tenant_id: "tenant-local-dev".to_string(),
    };

    let app = create_router(state);
    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));
    tracing::info!("OSAKG API listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
