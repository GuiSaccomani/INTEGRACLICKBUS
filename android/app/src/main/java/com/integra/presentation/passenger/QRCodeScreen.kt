package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun QRCodeScreen(
    onNavigateBack: () -> Unit,
    onNavigateToValidada: () -> Unit = {}
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val sessionManager = remember { com.integra.data.local.SessionManager.getInstance(context) }
    val feedbackManager = remember { com.integra.util.FeedbackManager.getInstance(context) }
    val scrollState = rememberScrollState()

    var activeTicket by remember { mutableStateOf<com.integra.data.model.TicketDetailsDto?>(null) }
    var isScanningMode by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val cached = sessionManager.getActiveOfflineTicket()
        if (cached != null) {
            activeTicket = cached
        } else {
            val userId = sessionManager.getUserId() ?: "E1F2A3B4C5D6E7F80123456789ABCDEF"
            val res = com.integra.data.repository.PassengerRepository().getUserTickets(userId)
            res.onSuccess { list ->
                sessionManager.saveOfflineTickets(list)
                activeTicket = list.firstOrNull { it.isReadyToBoard } ?: list.firstOrNull()
            }
        }
    }

    val passengerName = activeTicket?.passengerName ?: "Guilherme Santos"
    val seatNumber = "${activeTicket?.seat ?: 18}"
    val route = if (activeTicket != null) "${activeTicket!!.departure} → ${activeTicket!!.arrival}" else "São Paulo → Rio de Janeiro"
    val credentialRef = activeTicket?.utHash ?: activeTicket?.ticketId ?: "UT_7A9B2C4D8E1F3A5B"

    val qrImageBitmap = remember(credentialRef) {
        com.integra.qr.QrCodeGenerator.generateImageBitmap(credentialRef, 400)
    }

    if (isScanningMode) {
        com.integra.qr.QrScannerView(
            onCodeScanned = { scannedCode ->
                feedbackManager.notifySuccess("QR Code validado com sucesso")
                isScanningMode = false
                onNavigateToValidada()
            },
            onDismiss = {
                isScanningMode = false
            }
        )
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Bg)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DS_Surface)
                .padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 16.dp)
                .border(1.dp, DS_Border, RoundedCornerShape(bottomStart = 0.dp, bottomEnd = 0.dp)),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.5.dp, DS_BorderMd, RoundedCornerShape(12.dp))
                    .background(DS_Surface)
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("←", fontSize = 18.sp, color = DS_Text1, fontWeight = FontWeight.Bold)
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "QR Code de Embarque",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = DS_Text1
                )
                Text(
                    text = "Apresente este código ao motorista",
                    fontSize = 12.sp,
                    color = DS_Text2
                )
            }

            // Botão para abrir câmera e ler QR Code
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DS_PrimaryLight)
                    .border(1.dp, DS_PrimaryMid, RoundedCornerShape(12.dp))
                    .clickable { isScanningMode = true },
                contentAlignment = Alignment.Center
            ) {
                Text("📷", fontSize = 18.sp)
            }
        }

        // Scrollable Body
        Column(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Status Badge
            Box(
                modifier = Modifier
                    .background(DS_SuccessLight, RoundedCornerShape(100.dp))
                    .border(1.dp, DS_Success, RoundedCornerShape(100.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = if (activeTicket?.used == 1) "Embarque Realizado" else "Pronto para Validação",
                    color = DS_Success,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // QR Code Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(24.dp), ambientColor = Color(0x10000000))
                    .background(DS_Surface, RoundedCornerShape(24.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(24.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // QR Code Visual Box com imagem real ZXing
                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.5.dp, DS_BorderMd, RoundedCornerShape(16.dp))
                        .padding(14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    androidx.compose.foundation.Image(
                        bitmap = qrImageBitmap,
                        contentDescription = "QR Code real gerado para validação de passagem",
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Ref: $credentialRef",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    color = DS_Text2,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Divider
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

                Spacer(modifier = Modifier.height(14.dp))

                // Metadata Rows
                QRInfoRow(label = "Passageiro", value = passengerName, icon = "👤")
                Spacer(modifier = Modifier.height(8.dp))
                QRInfoRow(label = "Poltrona", value = seatNumber, icon = "💺")
                Spacer(modifier = Modifier.height(8.dp))
                QRInfoRow(label = "Itinerário", value = route, icon = "🚌")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // CTA Button Simular Validação
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(12.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x307B2CBF))
                    .background(
                        androidx.compose.ui.graphics.Brush.linearGradient(
                            listOf(DS_PrimaryDark, DS_Primary)
                        ),
                        RoundedCornerShape(100.dp)
                    )
                    .clickable { onNavigateToValidada() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Simular Leitura do QR Code",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Ghost Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .border(1.5.dp, DS_BorderMd, RoundedCornerShape(100.dp))
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Voltar ao Bilhete",
                    color = DS_Text1,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun QRInfoRow(label: String, value: String, icon: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(icon, fontSize = 14.sp)
            Text(label, fontSize = 13.sp, color = DS_Text2)
        }
        Text(value, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = DS_Text1)
    }
}
