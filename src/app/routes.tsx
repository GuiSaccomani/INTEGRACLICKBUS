import { createBrowserRouter, redirect } from "react-router";
import { Root }                from "./Root";
import { WelcomeScreen }       from "./screens/WelcomeScreen";
import { LoginScreen }         from "./screens/LoginScreen";
import { HomeScreen }          from "./screens/HomeScreen";
import { PassagemDigitalScreen } from "./screens/PassagemDigitalScreen";
import { ValidacaoNFCScreen }  from "./screens/ValidacaoNFCScreen";
import { CredencialNFCScreen } from "./screens/CredencialNFCScreen";
import { QRCodeScreen }        from "./screens/QRCodeScreen";
import { PassagemValidadaScreen } from "./screens/PassagemValidadaScreen";
import { BagagensScreen }      from "./screens/BagagensScreen";
import { RegistrarBagemScreen } from "./screens/RegistrarBagemScreen";
import { BagemValidadaScreen } from "./screens/BagemValidadaScreen";
import { HistoricoScreen }     from "./screens/HistoricoScreen";
import { ContaScreen }         from "./screens/ContaScreen";
import { BagemDetalheScreen }  from "./screens/BagemDetalheScreen";
import { RetiradaBagemScreen } from "./screens/RetiradaBagemScreen";
import { CriarContaScreen }    from "./screens/CriarContaScreen";
import { MotoristaHomeScreen } from "./screens/MotoristaHomeScreen";
import { MotoristaValidacaoScreen } from "./screens/MotoristaValidacaoScreen";
import { MotoristaBagagemScreen } from "./screens/MotoristaBagagemScreen";
import { MotoristaDesembarqueScreen } from "./screens/MotoristaDesembarqueScreen";
import { MotoristaPassageirosScreen } from "./screens/MotoristaPassageirosScreen";
import { MotoristaHistoricoScreen } from "./screens/MotoristaHistoricoScreen";
import { MotoristaListaBagagensScreen } from "./screens/MotoristaListaBagagensScreen";
import { ViagensHistoricoCompletoScreen } from "./screens/ViagensHistoricoCompletoScreen";
import { NotificacoesScreen } from "./screens/NotificacoesScreen";
import { AjudaScreen } from "./screens/AjudaScreen";
import { ErroConexaoScreen } from "./screens/ErroConexaoScreen";

const toHome = () => redirect("/home");

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true,             Component: WelcomeScreen },
      { path: "login",           Component: LoginScreen },
      { path: "criar-conta",     Component: CriarContaScreen },
      { path: "home",            Component: HomeScreen },
      { path: "passagem",        Component: PassagemDigitalScreen },
      { path: "nfc",             Component: ValidacaoNFCScreen },
      { path: "qrcode",          Component: QRCodeScreen },
      { path: "credencial-nfc",  Component: CredencialNFCScreen },
      { path: "validada",        Component: PassagemValidadaScreen },
      { path: "bagagens",        Component: BagagensScreen },
      { path: "bagagem-nova",    Component: RegistrarBagemScreen },
      { path: "bagagem-ok",      Component: BagemValidadaScreen },
      { path: "historico",       Component: HistoricoScreen },
      { path: "historico-completo", Component: ViagensHistoricoCompletoScreen },
      { path: "notificacoes",    Component: NotificacoesScreen },
      { path: "ajuda",           Component: AjudaScreen },
      { path: "erro-conexao",    Component: ErroConexaoScreen },
      { path: "conta",            Component: ContaScreen },
      { path: "bagagem-detalhe", Component: BagemDetalheScreen },
      { path: "bagagem-retirada",Component: RetiradaBagemScreen },
      { path: "motorista/home",  Component: MotoristaHomeScreen },
      { path: "motorista/validacao", Component: MotoristaValidacaoScreen },
      { path: "motorista/bagagem", Component: MotoristaBagagemScreen },
      { path: "motorista/desembarque", Component: MotoristaDesembarqueScreen },
      { path: "motorista/passageiros", Component: MotoristaPassageirosScreen },
      { path: "motorista/historico",   Component: MotoristaHistoricoScreen },
      { path: "motorista/lista-bagagens", Component: MotoristaListaBagagensScreen },
      { path: "motorista/conta",       Component: ContaScreen },
      { path: "inicio",          loader: toHome },
      { path: "*",               loader: toHome },
    ],
  }
]);
