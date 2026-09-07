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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.integra.data.local.SessionManager
import com.integra.presentation.common.UiState
import com.integra.presentation.viewmodel.PassengerTicketViewModel
import com.integra.ui.theme.LocalIntegraColors
import com.integra.util.FeedbackManager

@Composable
fun PassagemValidadaScreen(
    onNavigateToBagagens: () -> Unit,
    onNavigateToHome: () -> Unit,
    viewModel: PassengerTicketViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val sessionManager = remember { SessionManager.getInstance(context) }
    val userId = remember { sessionManager.getCachedUserId() }

    val activeTicketState by viewModel.activeTicketState.collectAsState()

    LaunchedEffect(userId) {
        if (activeTicketState is UiState.Idle) {
            viewModel.loadTickets(userId)
        }
        FeedbackManager.vibrateSuccess(context)
        FeedbackManager.playBeepSuccess(context)
    }

    val ticket = (activeTicketState as? UiState.Success)?.data
        ?: remember { sessionManager.getCachedActiveTicket() }

    val passengerName = ticket?.passengerName ?: "Guilherme Santos"
    val seatNumber = "${ticket?.seat ?: 18}"
    val departure = ticket?.departure ?: "São Paulo"
    val arrival = ticket?.arrival ?: "Rio de Janeiro"
    val departureTime = "14:30"
    val tripDate = ticket?.tripDate ?: "21 AGO"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg)
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Badge Salvo no Sistema
        Row(
            modifier = Modifier
                .background(colors.successLight, RoundedCornerShape(100.dp))
                .border(1.dp, colors.success.copy(alpha = 0.4f), RoundedCornerShape(100.dp))
                .padding(horizontal = 14.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(colors.success, CircleShape)
            )
            Text(
                text = "✓ SALVO NO SISTEMA · EMBARQUE CONFIRMADO",
                color = colors.success,
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
                .shadow(16.dp, CircleShape, ambientColor = colors.success.copy(alpha = 0.4f))
                .background(colors.success, CircleShape),
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
            color = colors.text1,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Embarque liberado com sucesso. Tenha uma ótima viagem!",
            fontSize = 14.sp,
            color = colors.text2,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Card de Resumo da Passagem
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(6.dp, RoundedCornerShape(20.dp), ambientColor = Color(0x10000000))
                .background(colors.surface, RoundedCornerShape(20.dp))
                .border(1.dp, colors.border, RoundedCornerShape(20.dp))
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
                            .background(colors.primaryLight, RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎫", fontSize = 18.sp)
                    }
                    Column {
                        Text("PASSAGEIRO", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.text3)
                        Text(passengerName, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                    }
                }
                Box(
                    modifier = Modifier
                        .background(colors.successLight, RoundedCornerShape(100.dp))
                        .border(1.dp, colors.success, RoundedCornerShape(100.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("Aprovada", color = colors.success, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Rota
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(departure, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = colors.text1)
                    Text("Origem", fontSize = 11.sp, color = colors.text3)
                }
                Text("➔", fontSize = 18.sp, color = colors.primary, fontWeight = FontWeight.Bold)
                Column(horizontalAlignment = Alignment.End) {
                    Text(arrival, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = colors.text1)
                    Text("Destino", fontSize = 11.sp, color = colors.text3)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
            Spacer(modifier = Modifier.height(16.dp))

            // Horário, Poltrona e Data
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("HORÁRIO", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.text3)
                    Text(departureTime, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = colors.text1)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("POLTRONA", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.text3)
                    Text(seatNumber, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = colors.primary)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("DATA", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.text3)
                    Text(tripDate, fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = colors.text1)
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Botões de Ação
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .shadow(8.dp, RoundedCornerShape(100.dp), ambientColor = colors.primary.copy(alpha = 0.3f))
                .background(colors.primary, RoundedCornerShape(100.dp))
                .clickable { onNavigateToBagagens() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Conferir Minhas Bagagens",
                color = Color.White,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .background(colors.surface, RoundedCornerShape(100.dp))
                .border(1.dp, colors.borderMd, RoundedCornerShape(100.dp))
                .clickable { onNavigateToHome() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Voltar ao Início",
                color = colors.text1,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
