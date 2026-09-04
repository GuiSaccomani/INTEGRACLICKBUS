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
    val scrollState = rememberScrollState()
    val passengerName = "Guilherme Santos"
    val seatNumber = "18"
    val route = "São Paulo → Rio de Janeiro"
    val credentialRef = "UT_7A9B2C4D8E1F3A5B"

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

            Spacer(modifier = Modifier.size(40.dp))
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
                    text = "Pronto para Validação",
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
                // QR Code Visual Box
                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .background(Color(0xFFF8FAFC), RoundedCornerShape(16.dp))
                        .border(1.5.dp, DS_BorderMd, RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "█▀▀▀▀▀█ ▄ █▀▀▀▀▀█\n█ ███ █ █ █ ███ █\n█ ▀▀▀ █ ▄ █ ▀▀▀ █\n▀▀▀▀▀▀▀ ▀ ▀▀▀▀▀▀▀\n█ █▄ ▀▄▀▀▄█▄▀█▀▄█\n▀ ▀▀ ▀▀ ▀ ▀▀▀▀  ▀\n█▀▀▀▀▀█ ▄ █▄█ ▀ █\n█ ███ █ █ █ ▀██▄█\n█ ▀▀▀ █ ▄ ▀▀▀█ ▀█\n▀▀▀▀▀▀▀ ▀▀ ▀ ▀  ▀",
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            lineHeight = 12.sp,
                            color = DS_PrimaryDark,
                            textAlign = TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Ref: $credentialRef",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 12.sp,
                    color = DS_Text2,
                    fontWeight = FontWeight.SemiBold
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
