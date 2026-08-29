import { useNavigate } from "react-router";
import { useDS, Screen, BackHeader, Fonts } from "../components/MobileLayout";

const FAQS = [
  { q: "Como uso minha passagem NFC?", a: "Basta encostar a parte superior do seu celular no leitor do motorista. Não precisa abrir o aplicativo se já tiver adicionado à carteira do celular." },
  { q: "O app funciona sem internet?", a: "Sim! Depois que sua viagem for sincronizada, você pode embarcar normalmente mesmo sem conexão na rodoviária." },
  { q: "Como adiciono bagagem?", a: "Entregue a bagagem ao motorista. Ele irá colar uma tag NFC e ler com o aparelho dele, que sincronizará automaticamente na sua conta." },
];

export function AjudaScreen() {
  const DS = useDS();
  const nav = useNavigate();

  return (
    <Screen bg={DS.bg}>
      <BackHeader title="Central de Ajuda" onBack={() => nav(-1)} />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: DS.text1, fontFamily: Fonts.heading }}>
          Como podemos ajudar?
        </p>
        
        <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
          <button style={{ flex: 1, height: 48, borderRadius: 12, border: "none", background: DS.primaryLight, color: DS.primary, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Chat Online
          </button>
          <button style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${DS.borderMd}`, background: DS.surface, color: DS.text1, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            E-mail
          </button>
        </div>

        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: DS.text2, textTransform: "uppercase" }}>
          Perguntas Frequentes
        </p>

        <div style={{ background: DS.surface, borderRadius: 12, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ padding: "16px", borderBottom: i < FAQS.length - 1 ? `1px solid ${DS.border}` : "none" }}>
              <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: DS.text1 }}>{faq.q}</p>
              <p style={{ margin: 0, fontSize: 13, color: DS.text2, lineHeight: 1.5 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
