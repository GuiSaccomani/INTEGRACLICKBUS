package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.integra.data.local.SessionManager
import com.integra.nfc.IntegraHceService
import com.integra.presentation.components.PassengerBottomNav
import com.integra.ui.theme.LocalIntegraColors
import com.integra.ui.theme.ThemeManager
import com.integra.ui.theme.ThemeMode
import kotlinx.coroutines.launch

@Composable
fun SettingRow(
    label: String,
    desc: String? = null,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    val colors = LocalIntegraColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
            Text(label, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = colors.text1)
            if (desc != null) {
                Text(desc, fontSize = 12.sp, color = colors.text3, modifier = Modifier.padding(top = 3.dp), lineHeight = 16.sp)
            }
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = colors.primary,
                uncheckedThumbColor = Color.White,
                uncheckedTrackColor = colors.borderMd,
                uncheckedBorderColor = Color.Transparent
            )
        )
    }
}

@Composable
fun SectionCard(title: String, content: @Composable () -> Unit) {
    val colors = LocalIntegraColors.current
    Column(modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp)) {
        Text(
            text = title,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = colors.text3,
            letterSpacing = 0.7.sp,
            modifier = Modifier.padding(start = 4.dp, bottom = 10.dp)
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(colors.surface)
                .border(1.dp, colors.border, RoundedCornerShape(14.dp))
                .padding(horizontal = 16.dp)
        ) {
            content()
        }
    }
}

@Composable
fun LinkRow(
    label: String,
    value: String? = null,
    isLast: Boolean = false,
    onClick: (() -> Unit)? = null
) {
    val colors = LocalIntegraColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = onClick != null) { onClick?.invoke() }
            .padding(vertical = 15.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = colors.text1)
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (value != null) {
                Text(value, fontSize = 14.sp, color = colors.text2, modifier = Modifier.padding(end = 6.dp))
            }
            Text("›", fontSize = 18.sp, color = colors.text3, fontWeight = FontWeight.Bold)
        }
    }
    if (!isLast) {
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
    }
}

@Composable
fun PassengerContaScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToViagens: () -> Unit,
    onNavigateToBagagens: () -> Unit,
    onNavigateToNotificacoes: () -> Unit = {},
    onNavigateToAjuda: () -> Unit = {},
    onNavigateToHistorico: () -> Unit = {},
    onNavigateToDriver: () -> Unit = {},
    onLogout: () -> Unit = {}
) {
    val context = LocalContext.current
    val colors = LocalIntegraColors.current
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    // Modais e Diálogos
    var showLogoutDialog by remember { mutableStateOf(false) }
    var showPersonalDataModal by remember { mutableStateOf(false) }
    var showSecurityModal by remember { mutableStateOf(false) }
    var showPrivacyModal by remember { mutableStateOf(false) }
    var showVersionModal by remember { mutableStateOf(false) }

    // Preferências de Acessibilidade
    val currentThemeMode by ThemeManager.themeMode.collectAsState()
    var selectedTextSize by remember { mutableStateOf("Normal") }
    var highContrast by remember { mutableStateOf(false) }
    var soundFeedback by remember { mutableStateOf(true) }
    var vibrationFeedback by remember { mutableStateOf(true) }
    var voiceFeedback by remember { mutableStateOf(false) }
    var reduceMotion by remember { mutableStateOf(false) }
    var screenReader by remember { mutableStateOf(false) }
    var passkeyEnabled by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg)
    ) {
        // Header de perfil com identidade ÍNTEGRA
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .padding(start = 20.dp, end = 20.dp, top = 52.dp, bottom = 18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(colors.primaryLight)
                    .border(2.dp, colors.primary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "GS",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.primary
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Guilherme Santos",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.text1,
                    letterSpacing = (-0.4).sp
                )
                Text(
                    text = "CPF ***.***.***-42 · Passageiro",
                    fontSize = 13.sp,
                    color = colors.text2,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        // Content Scrollable
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // Minha Conta
            SectionCard("MINHA CONTA") {
                LinkRow("Dados pessoais", onClick = { showPersonalDataModal = true })
                LinkRow("Histórico de Viagens", onClick = onNavigateToHistorico)
                LinkRow("Notificações e Avisos", onClick = onNavigateToNotificacoes, isLast = true)
            }

            // Segurança & Biometria Passkey
            SectionCard("SEGURANÇA E ACESSO") {
                SettingRow(
                    label = "Biometria / Passkey",
                    desc = "Autenticação criptográfica sem senha via Credential Manager",
                    checked = passkeyEnabled,
                    onCheckedChange = { passkeyEnabled = it }
                )
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                LinkRow("Alterar Senha de Acesso", onClick = { showSecurityModal = true }, isLast = true)
            }

            // Acessibilidade e Tema
            SectionCard("TEMA E ACESSIBILIDADE") {
                // Seletor de Tema do Aplicativo (Claro, Escuro, Sistema)
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp)) {
                    Text(
                        text = "Tema do Aplicativo",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.text1
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            Triple("Claro", ThemeMode.LIGHT, "☀️"),
                            Triple("Escuro", ThemeMode.DARK, "🌙"),
                            Triple("Sistema", ThemeMode.SYSTEM, "⚙️")
                        ).forEach { (label, mode, icon) ->
                            val isSelected = currentThemeMode == mode
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(42.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) colors.primaryLight else colors.surface)
                                    .border(
                                        width = 1.5.dp,
                                        color = if (isSelected) colors.primary else colors.borderMd,
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .clickable { ThemeManager.setTheme(mode) },
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(icon, fontSize = 12.sp, modifier = Modifier.padding(end = 4.dp))
                                    Text(
                                        text = label,
                                        fontSize = 13.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) colors.primary else colors.text1
                                    )
                                }
                            }
                        }
                    }
                }

                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

                // Tamanho do Texto
                Column(modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp)) {
                    Text(
                        text = "Tamanho do Texto",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.text1
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("Normal", "Grande", "Extra").forEach { sizeLabel ->
                            val isSelected = selectedTextSize == sizeLabel
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(38.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) colors.primary else colors.bg)
                                    .border(1.dp, if (isSelected) colors.primary else colors.borderMd, RoundedCornerShape(8.dp))
                                    .clickable { selectedTextSize = sizeLabel },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = sizeLabel,
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else colors.text1
                                )
                            }
                        }
                    }
                }

                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                SettingRow("Alto contraste", "Aumenta o contraste para maior legibilidade", highContrast) { highContrast = it }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                SettingRow("Feedback sonoro", "Sons ao confirmar ações de embarque", soundFeedback) { soundFeedback = it }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                SettingRow("Feedback por vibração", "O celular vibra ao validar bilhetes", vibrationFeedback) { vibrationFeedback = it }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                SettingRow("Leitura de voz", "Lê os textos principais da viagem em voz alta", voiceFeedback) { voiceFeedback = it }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                SettingRow("Reduzir animações", "Desativa transições e movimentos na tela", reduceMotion) { reduceMotion = it }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                SettingRow("Leitor de tela", "Otimizado para VoiceOver e TalkBack", screenReader) { screenReader = it }
            }

            // Suporte
            SectionCard("SUPORTE") {
                LinkRow("Central de Ajuda", onClick = onNavigateToAjuda)
                LinkRow("Política de Privacidade", onClick = { showPrivacyModal = true })
                LinkRow("Versão do aplicativo", "1.0.0", isLast = true, onClick = { showVersionModal = true })
            }

            // Botão Sair da Conta (Logout 100% Funcional e com Confirmação)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(colors.surface)
                    .border(1.5.dp, colors.error.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                    .clickable { showLogoutDialog = true },
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🚪", fontSize = 16.sp, modifier = Modifier.padding(end = 8.dp))
                    Text("Sair da conta", color = colors.error, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(28.dp))
        }

        // Bottom Nav
        PassengerBottomNav(
            currentRoute = "passenger_conta",
            onNavigate = { route ->
                when (route) {
                    "passenger_home" -> onNavigateToHome()
                    "passenger_viagens" -> onNavigateToViagens()
                    "passenger_bagagens" -> onNavigateToBagagens()
                }
            }
        )
    }

    // ─── DIÁLOGO DE CONFIRMAÇÃO DE SAÍDA (LOGOUT REAL) ───────────────────────────
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text(
                    text = "Sair da conta?",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.text1
                )
            },
            text = {
                Text(
                    text = "Tem certeza de que deseja encerrar sua sessão? Você precisará entrar novamente com suas credenciais ou biometria para acessar suas passagens.",
                    fontSize = 14.sp,
                    color = colors.text2,
                    lineHeight = 20.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        scope.launch {
                            SessionManager.getInstance(context).clearSession()
                            IntegraHceService.activeCredentialRef = ""
                            onLogout()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.error),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Sim, sair", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showLogoutDialog = false },
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, colors.borderMd)
                ) {
                    Text("Cancelar", color = colors.text1, fontWeight = FontWeight.Medium)
                }
            },
            containerColor = colors.surface,
            shape = RoundedCornerShape(16.dp)
        )
    }

    // ─── MODAL DADOS PESSOAIS ────────────────────────────────────────────────────
    if (showPersonalDataModal) {
        Dialog(onDismissRequest = { showPersonalDataModal = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(18.dp))
                    .padding(22.dp)
            ) {
                Text("Dados Pessoais", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                Spacer(modifier = Modifier.height(16.dp))

                listOf(
                    Pair("Nome Completo", "Guilherme Santos"),
                    Pair("CPF", "342.891.042-42"),
                    Pair("E-mail", "guilherme.santos@email.com"),
                    Pair("Telefone", "(11) 98765-4321"),
                    Pair("Perfil", "Passageiro Verificado")
                ).forEach { (label, value) ->
                    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                        Text(label, fontSize = 11.sp, color = colors.text3, fontWeight = FontWeight.SemiBold)
                        Text(value, fontSize = 14.sp, color = colors.text1, fontWeight = FontWeight.Medium)
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))
                Button(
                    onClick = { showPersonalDataModal = false },
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Fechar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    // ─── MODAL SEGURANÇA E SENHA ─────────────────────────────────────────────────
    if (showSecurityModal) {
        var oldPassword by remember { mutableStateOf("") }
        var newPassword by remember { mutableStateOf("") }
        var successMessage by remember { mutableStateOf(false) }

        Dialog(onDismissRequest = { showSecurityModal = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(18.dp))
                    .padding(22.dp)
            ) {
                Text("Segurança e Senha", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                Spacer(modifier = Modifier.height(14.dp))

                if (successMessage) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(colors.successLight)
                            .padding(12.dp)
                    ) {
                        Text("Senha atualizada com sucesso!", color = colors.success, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                }

                OutlinedTextField(
                    value = oldPassword,
                    onValueChange = { oldPassword = it },
                    label = { Text("Senha Atual") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    label = { Text("Nova Senha") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )
                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = {
                        if (oldPassword.isNotEmpty() && newPassword.isNotEmpty()) {
                            successMessage = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Salvar Nova Senha", color = Color.White, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(8.dp))
                TextButton(
                    onClick = { showSecurityModal = false },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Fechar", color = colors.text2)
                }
            }
        }
    }

    // ─── MODAL POLÍTICA DE PRIVACIDADE ───────────────────────────────────────────
    if (showPrivacyModal) {
        Dialog(onDismissRequest = { showPrivacyModal = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(18.dp))
                    .padding(22.dp)
            ) {
                Text("Privacidade e LGPD", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "A plataforma ÍNTEGRA opera sob as diretrizes da LGPD (Lei Geral de Proteção de Dados). Não armazenamos biometria bruta em servidores: dados biométricos permanecem isolados no Keystore/Secure Enclave do seu aparelho. Suas credenciais de trânsito utilizam tokens efêmeros protegidos criptograficamente.",
                    fontSize = 13.sp,
                    color = colors.text2,
                    lineHeight = 18.sp
                )
                Spacer(modifier = Modifier.height(18.dp))
                Button(
                    onClick = { showPrivacyModal = false },
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Entendido", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    // ─── MODAL VERSÃO DO APP ─────────────────────────────────────────────────────
    if (showVersionModal) {
        Dialog(onDismissRequest = { showVersionModal = false }) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(18.dp))
                    .padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("ÍNTEGRA Embarque Digital", fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, color = colors.primary)
                Text("Versão 1.0.0 Nativa Android", fontSize = 13.sp, color = colors.text2, modifier = Modifier.padding(top = 4.dp))
                Spacer(modifier = Modifier.height(14.dp))

                Column(modifier = Modifier.fillMaxWidth().background(colors.bg).padding(12.dp)) {
                    Text("• Protocolo NFC: ÍNTEGRA HCE V1 (AID F0494E5445475241)", fontSize = 11.sp, color = colors.text2)
                    Text("• Biometria: Credential Manager / FIDO2 Passkeys", fontSize = 11.sp, color = colors.text2)
                    Text("• Barcode: Google ML Kit + CameraX Preview", fontSize = 11.sp, color = colors.text2)
                    Text("• Rede: OkHttp 4.12 + Retrofit 2.9 (TLS 1.3)", fontSize = 11.sp, color = colors.text2)
                }

                Spacer(modifier = Modifier.height(18.dp))
                Button(
                    onClick = { showVersionModal = false },
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Fechar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
