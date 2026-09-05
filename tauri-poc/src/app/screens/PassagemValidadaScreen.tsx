import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, StatusBadge, BtnPrimary, BtnGhost, Fonts } from "../components/MobileLayout";
import { playValidationSuccessSound, triggerSuccessHaptic } from "../../services/sound";

export function PassagemValidadaScreen() {
  const DS = useDS();
  const nav = useNavigate();
  const location = useLocation();

  const stateData = location.state as {
    passengerName?: string;
    seat?: string | number;
    departure?: string;
    arrival?: string;
    luggageId?: string;
  } | null;

  const passengerName = stateData?.passengerName || "Guilherme Santos";
  const seatNumber = stateData?.seat ? String(stateData.seat) : "18";
  const departureCity = stateData?.departure || "São Paulo";
  const arrivalCity = stateData?.arrival || "Rio de Janeiro";
  const luggageId = stateData?.luggageId || "IN-20481";

  useEffect(() => {
    // Toca som de sucesso e vibra o dispositivo para gravar o momento da aprovação
    playValidationSuccessSound();
    triggerSuccessHaptic();
  }, []);

  return (
    <Screen bg={DS.bg}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "44px 20px 0",
        }}
      >
        {/* Badge superior de confirmação "SALVO" */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            padding: "6px 14px",
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: DS.success }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: DS.success,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            ✓ Salvo no Sistema · Registro Ativo
          </span>
        </motion.div>

        {/* Círculo com checkmark de aprovação */}
        <div style={{ position: "relative", marginBottom: 20, flexShrink: 0 }}>
          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2.5px solid ${DS.success}`,
              }}
            />
          ))}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${DS.success}, #15803d)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 14px 40px rgba(16, 185, 129, 0.4)`,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M5 12l4 4 10-10"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Título de "Passagem Aprovada" */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={{ textAlign: "center", marginBottom: 22 }}
        >
          <h1
            style={{
              fontFamily: Fonts.heading,
              margin: "0 0 6px",
              fontSize: 27,
              fontWeight: 900,
              color: DS.text1,
              letterSpacing: "-0.6px",
            }}
          >
            Passagem Aprovada!
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: DS.text2 }}>
            Embarque liberado com sucesso. Tenha uma ótima viagem!
          </p>
        </motion.div>

        {/* Cards de Resumo da Passagem Aprovada */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={{ width: "100%", maxWidth: 360, marginBottom: 20 }}
        >
          {/* Card Passagem */}
          <div
            style={{
              background: DS.surface,
              border: `1px solid ${DS.border}`,
              borderRadius: "16px 16px 0 0",
              padding: "16px 18px",
              boxShadow: DS.shadowSm,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: DS.primaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="12" rx="2" stroke={DS.primary} strokeWidth="2" />
                    <path d="M8 12h8" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Passageiro
                  </p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: DS.text1 }}>
                    {passengerName}
                  </p>
                </div>
              </div>
              <StatusBadge label="Aprovada" kind="success" />
            </div>

            <div
              style={{
                background: DS.bg,
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                border: `1px solid ${DS.border}`,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600 }}>ITINERÁRIO</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: DS.text1 }}>
                  {departureCity} → {arrivalCity}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 600 }}>POLTRONA</p>
                <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 900, color: DS.primary, fontFamily: Fonts.heading }}>
                  {seatNumber}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: DS.text3 }}>Horário: <strong style={{ color: DS.text1 }}>14:30</strong></span>
              <span style={{ color: DS.text3 }}>Classe: <strong style={{ color: DS.text1 }}>Executivo</strong></span>
              <span style={{ color: DS.text3 }}>Plataforma: <strong style={{ color: DS.text1 }}>P4</strong></span>
            </div>
          </div>

          {/* Divisor "Vinculada Automaticamente" */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              background: DS.surface,
              borderLeft: `1px solid ${DS.border}`,
              borderRight: `1px solid ${DS.border}`,
            }}
          >
            <div style={{ flex: 1, height: 1, background: DS.border }} />
            <div
              style={{
                margin: "0 8px",
                padding: "4px 10px",
                borderRadius: 100,
                background: DS.bg,
                border: `1px solid ${DS.border}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: DS.text2, letterSpacing: "0.5px" }}>
                VINCULADA AUTOMATICAMENTE
              </p>
            </div>
            <div style={{ flex: 1, height: 1, background: DS.border }} />
          </div>

          {/* Card Bagagem */}
          <div
            style={{
              background: DS.surface,
              border: `1px solid ${DS.border}`,
              borderTop: "none",
              borderRadius: "0 0 16px 16px",
              padding: "16px 18px",
              boxShadow: DS.shadowSm,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(16, 185, 129, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.success} strokeWidth="2" />
                    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.success} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, color: DS.text3, fontWeight: 700, textTransform: "uppercase" }}>Bagagem</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: DS.text1 }}>Mala Principal · {luggageId}</p>
                </div>
              </div>
              <StatusBadge label="Salva" kind="success" />
            </div>

            <p style={{ margin: "8px 0 0", fontSize: 12, color: DS.success, fontWeight: 600 }}>
              ✓ Bagagem vinculada com sucesso no sistema e liberada para o bagageiro.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Botões de Ação */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        style={{ padding: "12px 20px 36px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <BtnPrimary
          label="Ver Minhas Bagagens"
          onClick={() => nav("/bagagens")}
        />
        <BtnGhost
          label="Voltar para o Início"
          onClick={() => nav("/home")}
        />
      </motion.div>
    </Screen>
  );
}
