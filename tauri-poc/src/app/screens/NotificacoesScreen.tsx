import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, Fonts } from "../components/MobileLayout";

const NOTIFICATIONS = [
  { id: 1, title: "Embarque Iniciado", desc: "O embarque para a sua viagem para o Rio de Janeiro acaba de começar. Dirija-se à plataforma.", time: "Agora mesmo", isNew: true },
  { id: 2, title: "Troca de Plataforma", desc: "Atenção: A plataforma da sua viagem foi alterada para a Plataforma P4.", time: "Há 15 min", isNew: true },
  { id: 3, title: "Bem-vindo ao Íntegra", desc: "Seu cadastro foi realizado com sucesso. Prepare-se para embarcar via NFC.", time: "Ontem", isNew: false },
];

export function NotificacoesScreen() {
  const DS = useDS();
  const nav = useNavigate();

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Notificações" onBack={() => nav(-1)} />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        {NOTIFICATIONS.length > 0 ? NOTIFICATIONS.map((n) => (
          <div key={n.id} style={{
            background: DS.surface, borderRadius: 12, padding: "16px", marginBottom: 12,
            border: `1px solid ${DS.border}`, boxShadow: DS.shadowXs,
            position: "relative"
          }}>
            {n.isNew && <div style={{ position: "absolute", top: 16, right: 16, width: 8, height: 8, borderRadius: "50%", background: DS.primary }} />}
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading, paddingRight: 16 }}>{n.title}</p>
            <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.4 }}>{n.desc}</p>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: DS.text3, fontWeight: 600 }}>{n.time}</p>
          </div>
        )) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: DS.text3, fontSize: 14 }}>Você não tem novas notificações.</p>
          </div>
        )}
      </div>
    </Screen>
  );
}
