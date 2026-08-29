import { useNavigate } from "react-router";
import { useDS, Screen, BtnPrimary, Fonts, BtnGhost } from "../components/MobileLayout";

export function ErroConexaoScreen() {
  const DS = useDS();
  const nav = useNavigate();

  return (
    <Screen bg={DS.bg} style={{ justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={DS.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="2" y1="2" x2="22" y2="22" stroke={DS.error} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <p style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading, textAlign: "center" }}>
        Você está offline
      </p>
      
      <p style={{ margin: "0 0 32px", fontSize: 15, color: DS.text2, textAlign: "center", lineHeight: 1.5, maxWidth: 300 }}>
        Parece que a rodoviária está sem sinal de internet no momento. Mas não se preocupe!
        <br /><br />
        <strong style={{ color: DS.text1 }}>Sua passagem já está salva.</strong> Você pode embarcar normalmente aproximando o celular do leitor.
      </p>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <BtnPrimary label="Tentar Reconectar" onClick={() => nav(-1)} />
        <BtnGhost label="Ver Passagem Offline" onClick={() => nav("/passagem")} />
      </div>
    </Screen>
  );
}
