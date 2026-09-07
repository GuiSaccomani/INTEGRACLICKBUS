package com.integra.presentation.passenger

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.integra.data.local.SessionManager
import com.integra.nfc.IntegraHceService
import com.integra.presentation.common.UiState
import com.integra.presentation.viewmodel.PassengerTicketViewModel
import com.integra.ui.theme.*
import com.integra.util.FeedbackManager

@Composable
fun NFCRipple(delayMillis: Int, sizeDp: Int) {
    val infiniteTransition = rememberInfiniteTransition()
    
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearOutSlowInEasing, delayMillis = delayMillis),
            repeatMode = RepeatMode.Restart
        )
    )
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.7f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearOutSlowInEasing, delayMillis = delayMillis),
            repeatMode = RepeatMode.Restart
        )
    )

    Box(
        modifier = Modifier
            .size(sizeDp.dp)
            .scale(scale)
            .border(2.dp, Color.White.copy(alpha = alpha), CircleShape)
    )
}

@Composable
fun CredencialNFCScreen(
    onNavigateBack: () -> Unit,
    viewModel: PassengerTicketViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val userId = remember { sessionManager.getCachedUserId() }

    val activeTicketState by viewModel.activeTicketState.collectAsState()

    LaunchedEffect(userId) {
        if (activeTicketState is UiState.Idle) {
            viewModel.loadTickets(userId)
        }
    }

    val ticket = (activeTicketState as? UiState.Success)?.data
        ?: remember { sessionManager.getCachedActiveTicket() }

    LaunchedEffect(ticket) {
        if (ticket != null) {
            val cred = ticket.utHash ?: ticket.ticketId
            IntegraHceService.activeCredentialRef = cred
            FeedbackManager.vibrateSuccess(context)
        }
    }

    val activeOperator by OperatorManager.currentOperator.collectAsState()
    val operatorName = activeOperator.name

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF0D0118),
                        Color(0xFF1A0533),
                        colors.primary,
                        colors.secondary
                    )
                )
            )
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 20.dp, end = 20.dp, top = 52.dp, bottom = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.1f))
                    .border(1.5.dp, Color.White.copy(alpha = 0.18f), RoundedCornerShape(12.dp))
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "Credencial NFC",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White.copy(alpha = 0.85f)
            )
        }

        // Card Area
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Cartão Estilo Wallet
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .shadow(24.dp, RoundedCornerShape(28.dp))
                    .clip(RoundedCornerShape(28.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                Color.White.copy(alpha = 0.18f),
                                Color.White.copy(alpha = 0.06f)
                            )
                        )
                    )
                    .border(1.5.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(28.dp))
                    .padding(22.dp, 24.dp, 22.dp, 20.dp)
            ) {
                // Card Header
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 18.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color.White.copy(alpha = 0.15f))
                                .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("I", color = Color.White, fontWeight = FontWeight.Black)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = operatorName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                    Text(
                        text = "EMBARQUE NFC",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.6f),
                        letterSpacing = 0.5.sp
                    )
                }

                // Nome do Passageiro
                Column(modifier = Modifier.padding(bottom = 16.dp)) {
                    Text(
                        text = "PASSAGEIRO",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.45f),
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = ticket?.passengerName ?: "Guilherme Santos",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        letterSpacing = (-0.5).sp
                    )
                }

                // Rota & Poltrona
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.2f), RoundedCornerShape(14.dp))
                        .padding(16.dp, 14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(bottom = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = ticket?.departure ?: "São Paulo",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Text("  ➔  ", fontSize = 12.sp, color = Color.White.copy(alpha = 0.6f))
                        Text(
                            text = ticket?.arrival ?: "Rio de Janeiro",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                    }

                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Column {
                            Text("PARTIDA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.4f), letterSpacing = 0.8.sp)
                            Text("14:30", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                        }
                        Column {
                            Text("POLTRONA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.4f), letterSpacing = 0.8.sp)
                            Text("${ticket?.seat ?: 18}", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                        }
                        Column {
                            Text("DATA", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White.copy(alpha = 0.4f), letterSpacing = 0.8.sp)
                            Text(ticket?.tripDate ?: "21 AGO", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color.White)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // NFC Status
                Row(
                    modifier = Modifier
                        .background(colors.success.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                        .border(1.5.dp, colors.success.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                        .padding(12.dp, 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val infiniteTransition = rememberInfiniteTransition()
                    val dotScale by infiniteTransition.animateFloat(
                        initialValue = 1f,
                        targetValue = 1.2f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(1600, easing = FastOutSlowInEasing),
                            repeatMode = RepeatMode.Reverse
                        )
                    )
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .scale(dotScale)
                            .shadow(8.dp, CircleShape, spotColor = colors.success)
                            .background(colors.success, CircleShape)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("NFC pronto para validação", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.success)
                }
            }

            // Animação de Proximidade NFC
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier.size(90.dp),
                    contentAlignment = Alignment.Center
                ) {
                    NFCRipple(delayMillis = 0, sizeDp = 90)
                    NFCRipple(delayMillis = 550, sizeDp = 90)
                    NFCRipple(delayMillis = 1100, sizeDp = 90)

                    val infiniteTransition = rememberInfiniteTransition()
                    val centerScale by infiniteTransition.animateFloat(
                        initialValue = 1f,
                        targetValue = 1.08f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(2200, easing = FastOutSlowInEasing),
                            repeatMode = RepeatMode.Reverse
                        )
                    )

                    Box(
                        modifier = Modifier
                            .size(58.dp)
                            .scale(centerScale)
                            .shadow(10.dp, CircleShape, spotColor = Color.Black.copy(alpha = 0.3f))
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.15f))
                            .border(2.dp, Color.White.copy(alpha = 0.3f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("NFC", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Aproxime seu celular",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    letterSpacing = (-0.2).sp
                )
                Text(
                    text = "do dispositivo de leitura do motorista",
                    fontSize = 13.sp,
                    color = Color.White.copy(alpha = 0.6f),
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}
