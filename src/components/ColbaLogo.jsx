// Logo oficial de Grupo Colba con borde degradado

export function ColbaLogoIcon({ size = 40, className = "" }) {
  const borderWidth = Math.max(3, Math.round(size * 0.055)); // borde proporcional al tamaño

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "18px",
        // Degradado corporativo como borde
        background: "linear-gradient(135deg, #64d4f7 0%, #29b6f6 30%, #1565c0 65%, #0d2a52 100%)",
        padding: borderWidth,
        boxShadow: "0 0 22px rgba(41,182,246,0.55), 0 4px 20px rgba(0,0,0,0.45)",
        flexShrink: 0,
      }}
    >
      {/* Interior blanco que contiene la imagen */}
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: "13px",
        background: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        <img
          src="/logo-colba.png"
          alt="Grupo Colba"
          style={{ width: "90%", height: "90%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

export function ColbaLogoBrand({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ColbaLogoIcon size={65} />
      <div>
        <p className="text-base font-bold text-white leading-tight tracking-wide">Colba Empleos</p>
        <p className="text-xs leading-tight" style={{ color: "#64d4f7" }}>Grupo Colba</p>
      </div>
    </div>
  );
}
