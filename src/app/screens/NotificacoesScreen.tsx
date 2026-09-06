import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, Fonts } from "../components/MobileLayout";
import { luggageApi, passengerApi, type TicketDetails } from "../../services/api";
import { getStoredUserId } from "../../services/session";
import { cityOf, formatTripDateFull, shortId } from "../../services/format";

/**
 * O schema Oracle não possui tabela de notificações. Em vez de exibir avisos
 * fictícios, esta tela deriva os itens dos eventos reais observáveis nos dados:
 * situação de cada passagem (TICKET_SOLD / TICKET_USED) e bagagens vinculadas.
 */
interface Notification {
  id: string;
  title: string;
  desc: string;
  meta: string;
  isNew: boolean;
}

export function NotificacoesScreen() {
  const DS = useDS();
  const nav = useNavigate();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    function buildFromTicket(ticket: TicketDetails): Notification {
      const route = `${cityOf(ticket.departure)} → ${cityOf(ticket.arrival)}`;
      const meta = ticket.tripDate ? `Viagem em ${formatTripDateFull(ticket.tripDate)}` : "Sem data definida";

      if (ticket.used === 1) {
        return {
          id: `boarded-${ticket.ticketId}`,
          title: "Embarque realizado",
          desc: `Sua passagem ${route} foi validada com sucesso. Poltrona ${ticket.seat ?? "--"}.`,
          meta,
          isNew: false,
        };
      }

      if (ticket.sold === 1) {
        return {
          id: `confirmed-${ticket.ticketId}`,
          title: "Passagem confirmada",
          desc: `${route}, poltrona ${ticket.seat ?? "--"}. Apresente seu QR Code ao motorista no embarque.`,
          meta,
          isNew: true,
        };
      }

      return {
        id: `pending-${ticket.ticketId}`,
        title: "Passagem pendente de confirmação",
        desc: `A passagem ${route} ainda não está confirmada no sistema e não permite embarque.`,
        meta,
        isNew: true,
      };
    }

    async function loadNotifications() {
      const userId = getStoredUserId();
      if (!userId) {
        if (active) {
          setLoading(false);
          setLoadError("Sessão não encontrada. Entre novamente para ver suas notificações.");
        }
        return;
      }

      try {
        const tickets = await passengerApi.getUserTickets(userId);
        const list = Array.isArray(tickets) ? tickets : [];

        // Passagens pendentes de embarque primeiro, depois as já utilizadas
        const pending = list.filter(t => t.used !== 1);
        const boarded = list.filter(t => t.used === 1);
        const notifications: Notification[] = [...pending, ...boarded].map(buildFromTicket);

        // Bagagens vinculadas à passagem ativa
        const activeTicket = pending[0] || list[0] || null;
        if (activeTicket?.ticketId) {
          try {
            const { luggages } = await luggageApi.getByTicket(activeTicket.ticketId);
            const route = `${cityOf(activeTicket.departure)} → ${cityOf(activeTicket.arrival)}`;
            const meta = activeTicket.tripDate
              ? `Viagem em ${formatTripDateFull(activeTicket.tripDate)}`
              : "Sem data definida";

            (luggages || []).forEach((bag, index) => {
              notifications.push({
                id: `baggage-${bag.baggageId}`,
                title: "Bagagem vinculada",
                desc: `Volume ${String(index + 1).padStart(2, "0")} (${shortId(bag.baggageId, 12)}) associado à sua passagem ${route}.`,
                meta,
                isNew: false,
              });
            });
          } catch {
            // A ausência de bagagens não impede a exibição das demais notificações
          }
        }

        if (active) setItems(notifications);
      } catch (err: any) {
        if (active) setLoadError(err?.message || "Não foi possível carregar suas notificações.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotifications();
    return () => { active = false; };
  }, []);

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Notificações" onBack={() => nav(-1)} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        {loading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            padding: "40px 20px",
          }}>
            <div style={{
              width: 26, height: 26,
              border: `3px solid ${DS.primaryMid}`, borderTopColor: DS.primary,
              borderRadius: "50%", animation: "spin 1s linear infinite",
            }} />
            <p style={{ margin: 0, fontSize: 13, color: DS.text2 }}>Carregando notificações...</p>
          </div>
        ) : items.length > 0 ? (
          items.map((n) => (
            <div key={n.id} style={{
              background: DS.surface, borderRadius: 12, padding: "16px", marginBottom: 12,
              border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
              position: "relative"
            }}>
              {n.isNew && <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: DS.primary }} />}
              <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading, paddingRight: 16 }}>{n.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>{n.desc}</p>
              <p style={{ margin: "10px 0 0", fontSize: 11, color: DS.text3, fontWeight: 600 }}>{n.meta}</p>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ margin: 0, color: loadError ? DS.warning : DS.text3, fontSize: 14, lineHeight: 1.4 }}>
              {loadError || "Você não tem novas notificações."}
            </p>
          </div>
        )}
      </div>
    </Screen>
  );
}
