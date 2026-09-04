package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun PassagemValidadaScreen(
    onNavigateToBagagens: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    val scrollState = rememberScrollState()
    val passengerName = "Guilherme Santos"
    val seatNumber = "18"
    val departure = "São Paulo"
    val arrival = "Rio de Janeiro"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Bg)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Badge Salvo no Sistema
        Row(
            modifier = Modifier
                .background(DS_SuccessLight, RoundedCornerShape(100.dp))
                .border(1.dp, DS_Success.copy(alpha = 0.4f), RoundedCornerShape(100.dp))
                .padding(horizontal = 14.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(DS_Success, CircleShape)
            )
            Text(
                text = "✓ SALVO NO SISTEMA · REGISTRO ATIVO",
                color = DS_Success,
                fontSize = 11.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.5.sp
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Círculo Verde com Checkmark
        Box(
            modifier = Modifier
                .size(88.dp)
                .shadow(16.dp, CircleShape, ambientColor = DS_Success.copy(alpha = 0.4f))
                .background(
                    Brush.linearGradient(listOf(DS_Success, Color(0xFF15803D))),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "✓",
                color = Color.White,
                fontSize = 42.sp,
                fontWeight = FontWeight.Black
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Passagem Aprovada!",
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold,
            color = DS_Text1,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Embarque liberado com sucesso. Tenha uma ótima viagem!",
            fontSize = 14.sp,
            color = DS_Text2,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Card de Resumo da Passagem
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(6.dp, RoundedCornerShape(20.dp), ambientColor = Color(0x10000000))
                .background(DS_Surface, RoundedCornerShape(20.dp))
                .border(1.dp, DS_Border, RoundedCornerShape(20.dp))
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(DS_PrimaryLight, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎫", fontSize = 18.sp)
                    }
                    Column {
                        Text("PASSAGEIRO", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = DS_Text3)
                        Text(passengerName, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                    }
                }
                Box(
                    modifier = Modifier
                        .background(DS_SuccessLight, RoundedCornerShape(100.dp))
                        .border(1.dp, DS_Success, RoundedCornerShape(100.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("Aprovada", color = DS_Success, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Itinerário e Poltrona Box
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Bg, RoundedCornerShape(12.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(12.dp))
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("ITINERÁRIO", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text("$departure → $arrival", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("POLTRONA", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(seatNumber, fontSize = 20.sp, fontWeight = FontWeight.Black, color = DS_Primary)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Horário: 14:30", fontSize = 12.sp, color = DS_Text2)
                Text("Classe: Executivo", fontSize = 12.sp, color = DS_Text2)
                Text("Portão: P4", fontSize = 12.sp, color = DS_Text2)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Card de Bagagem
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DS_Surface, RoundedCornerShape(16.dp))
                .border(1.dp, DS_Border, RoundedCornerShape(16.dp))
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(DS_PrimaryLight, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("🧳", fontSize = 22.sp)
            }
            Column(modifier = Modifier.weight(1f)) {
                Text("1 Bagagem Despachada", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                Text("Etiqueta: IN-20481 · No Bagageiro", fontSize = 12.sp, color = DS_Text2)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Botões de Ação
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x307B2CBF))
                .background(
                    Brush.linearGradient(listOf(DS_PrimaryDark, DS_Primary)),
                    RoundedCornerShape(100.dp)
                )
                .clickable { onNavigateToBagagens() },
            contentAlignment = Alignment.Center
        ) {
            Text("Ver Minhas Bagagens", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(12.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .border(1.5.dp, DS_BorderMd, RoundedCornerShape(100.dp))
                .clickable { onNavigateToHome() },
            contentAlignment = Alignment.Center
        ) {
            Text("Voltar ao Início", color = DS_Text1, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
