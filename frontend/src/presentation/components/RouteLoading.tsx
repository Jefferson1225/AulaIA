export function RouteLoading() {
  return (
    <div className="view-container route-loading" role="status">
      <p>Cargando página…</p>
      <div className="route-loading-card" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
