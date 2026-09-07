import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useDS, Screen, BackHeader, StatusBadge, BtnPrimary } from "../components/MobileLayout";
import { luggageApi, passengerApi, type BaggageItem, type TicketDetails } from "../../services/api";
import { getStoredUserId } from "../../services/session";
import { cityOf, shortId } from "../../services/format";

interface UserLuggageItem extends BaggageItem {
  departure?: string;
  arrival?: string;
  seat?: number;
  ticketUsed?: number;
  tripDate?: string;
  ticketId?: string;
}

function SuitcaseSVG() {
  const DS = useDS();
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="9" y="18" width="34" height="26" rx="5" fill={DS.primaryLight} stroke={DS.primaryMid} strokeWidth="1.8" />
      <path d="M18 18v-5a4 4 0 014-4h8a4 4 0 014 4v5" stroke={DS.primary} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="30" x2="43" y2="30" stroke={DS.primaryMid} strokeWidth="1.8" />
      <circle cx="19" cy="46" r="2.5" fill={DS.primary} opacity="0.5" />
      <circle cx="33" cy="46" r="2.5" fill={DS.primary} opacity="0.5" />
      {/* NFC */}
      <path d="M22 23.5C23.2 22.2 24.5 21.5 26 21.5s2.8.7 4 2" stroke={DS.primary} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 25.5c.6-.7 1.2-1 2-1s1.4.3 2 1" stroke={DS.primary} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26" cy="27" r="1.2" fill={DS.primary} />
    </svg>
  );
}

export function BagagensScreen() {
  const DS = useDS();
  const nav = useNavigate();

  const [luggages, setLuggages] = useState<UserLuggageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLuggages = useCallback(async () => {
    const userId = getStoredUserId();
    if (!userId) {
      setLoading(false);
      setLoadError("Sessão não encontrada. Entre novamente para ver suas bagagens.");
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      // 1. Busca todas as bagagens diretamente pelo userId
      const userRes = await luggageApi.getByUser(userId).catch(() => ({ luggages: [] }));
      let allLuggages = Array.isArray(userRes.luggages) ? userRes.luggages : [];

      // 2. Se a busca por usuário não retornar, tenta agregação por tickets
      if (allLuggages.length === 0) {
        const tickets = await passengerApi.getUserTickets(userId).catch(() => []);
        if (Array.isArray(tickets) && tickets.length > 0) {
          const fetchedByTicket: UserLuggageItem[] = [];
          for (const t of tickets) {
            try {
              const res = await luggageApi.getByTicket(t.ticketId);
              if (Array.isArray(res.luggages)) {
                for (const b of res.luggages) {
                  fetchedByTicket.push({
                    ...b,
                    departure: t.departure,
                    arrival: t.arrival,
                    seat: t.seat,
                    ticketUsed: t.used,
                    ticketId: t.ticketId,
                  });
                }
              }
            } catch (_) {}
          }
          allLuggages = fetchedByTicket;
        }
      }

      setLuggages(allLuggages);
    } catch (err: any) {
      setLoadError(err?.message || "Não foi possível carregar suas bagagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLuggages();
  }, [fetchLuggages]);

  const handleRemoveLuggage = async (baggageId: string) => {
    if (!confirm("Deseja realmente remover esta bagagem da sua viagem?")) return;

    try {
      setDeletingId(baggageId);
      await luggageApi.removeLuggage(baggageId);
      await fetchLuggages();
    } catch (err: any) {
      alert("Erro ao remover bagagem: " + (err.message || "falha na comunicação"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Minhas bagagens" onBack={() => nav("/home")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 30px" }}>
        {/* Subtítulo informativo */}
        <div style={{
          background: DS.primaryLight, border: `1.5px solid ${DS.primaryMid}`,
          borderRadius: 14, padding: "12px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DS.primary }}>Suas bagagens ativas</p>
              <p style={{ margin: "1px 0 0", fontSize: 12, color: DS.text2 }}>
                {luggages.length === 1 ? "1 volume registrado" : `${luggages.length} volumes registrados`}
              </p>
            </div>
          </div>
          <button
            onClick={() => nav("/bagagens/registrar")}
            style={{
              padding: "6px 12px", borderRadius: 8, background: DS.primary, color: "#fff",
              border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            + Adicionar
          </button>
        </div>

        {/* Estado de carregamento */}
        {loading && (
          <div style={{
            background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`,
            padding: "36px 20px", marginBottom: 12,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 28, height: 28,
              border: `3px solid ${DS.primaryMid}`, borderTopColor: DS.primary,
              borderRadius: "50%", animation: "spin 1s linear infinite",
            }} />
            <p style={{ margin: 0, fontSize: 13, color: DS.text2 }}>Carregando bagagens vinculadas...</p>
          </div>
        )}

        {/* Erro */}
        {loadError && !loading && (
          <div style={{
            background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`,
            padding: "24px 20px", textAlign: "center", marginBottom: 12,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: DS.error, fontWeight: 600 }}>{loadError}</p>
          </div>
        )}

        {/* Lista de Bagagens */}
        {!loading && !loadError && luggages.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {luggages.map((bag, i) => {
              const isBoarded = bag.ticketUsed === 1;
              return (
                <div
                  key={bag.baggageId}
                  style={{
                    background: DS.surface,
                    borderRadius: 14,
                    border: `1px solid ${DS.border}`,
                    padding: "16px",
                    boxShadow: DS.shadowXs,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: DS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <rect x="4" y="7" width="16" height="12" rx="2" stroke={DS.primary} strokeWidth="2" />
                          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={DS.primary} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: DS.text1 }}>
                          Bagagem #{i + 1}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: DS.text3, fontFamily: "monospace" }}>
                          ID: {shortId(bag.baggageId, 12)}
                        </p>
                      </div>
                    </div>

                    <StatusBadge label={isBoarded ? "Em trânsito" : "Registrada"} kind={isBoarded ? "primary" : "success"} />
                  </div>

                  {bag.departure && bag.arrival && (
                    <div style={{ background: DS.bg, borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: DS.text2 }}>
                        {cityOf(bag.departure)} → {cityOf(bag.arrival)}
                      </span>
                      {bag.seat && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: DS.primary }}>
                          Poltrona {bag.seat}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => handleRemoveLuggage(bag.baggageId)}
                      disabled={deletingId === bag.baggageId}
                      style={{
                        background: "none",
                        border: "1px solid rgba(220,38,38,0.3)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        color: DS.error,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: deletingId === bag.baggageId ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === bag.baggageId ? "Removendo..." : "Remover Bagagem"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state quando não há bagagens */}
        {!loading && !loadError && luggages.length === 0 && (
          <div style={{
            background: DS.surface, borderRadius: 14, border: `1px solid ${DS.border}`,
            padding: "40px 20px", textAlign: "center", marginBottom: 20,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <SuitcaseSVG />
            <p style={{ margin: "16px 0 6px", fontSize: 16, fontWeight: 700, color: DS.text1 }}>
              Nenhuma bagagem registrada
            </p>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: DS.text2, lineHeight: 1.4, maxWidth: 280 }}>
              Você ainda não vinculou nenhuma mala à sua viagem. Use o botão abaixo para adicionar.
            </p>
            <button
              onClick={() => nav("/bagagens/registrar")}
              style={{
                height: 44, padding: "0 22px", borderRadius: 100, border: "none",
                background: `linear-gradient(135deg, ${DS.primaryDark}, ${DS.primary})`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              + Adicionar Bagagem
            </button>
          </div>
        )}
      </div>
    </Screen>
  );
}
