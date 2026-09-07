package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.integra.data.local.SessionManager
import com.integra.presentation.common.ErrorStateView
import com.integra.presentation.common.LoadingStateView
import com.integra.presentation.common.UiState
import com.integra.presentation.viewmodel.PassengerTicketViewModel
import com.integra.ui.theme.LocalIntegraColors

@Composable
fun PassengerHistoricoScreen(
    onNavigateBack: () -> Unit,
    onNavigateToHistoricoCompleto: () -> Unit = {},
    viewModel: PassengerTicketViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val userId = remember { sessionManager.getCachedUserId() }

    val ticketsState by viewModel.ticketsListState.collectAsState()

    LaunchedEffect(userId) {
        if (ticketsState is UiState.Idle) {
            viewModel.loadTickets(userId)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .padding(start = 16.dp, end = 16.dp, top = 50.dp, bottom = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(colors.bg)
                        .clickable { onNavigateBack() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "←",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.text1
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Histórico de viagens",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.text1
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(colors.primaryLight)
                    .border(1.dp, colors.primaryMid, RoundedCornerShape(8.dp))
                    .clickable { onNavigateToHistoricoCompleto() }
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "Ver Todas",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary
                )
            }
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        // Body com UiState
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (val currentState = ticketsState) {
                is UiState.Loading -> {
                    LoadingStateView(message = "Carregando histórico de viagens...")
                }
                is UiState.Error -> {
                    ErrorStateView(
                        message = currentState.message,
                        onRetry = { viewModel.loadTickets(userId) }
                    )
                }
                is UiState.Success -> {
                    val tickets = currentState.data

                    if (tickets.isEmpty()) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(CircleShape)
                                    .background(colors.primaryLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("🎫", fontSize = 28.sp)
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Nenhuma viagem encontrada",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.text1
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Suas viagens concluídas e ativas aparecerão listadas aqui.",
                                fontSize = 13.sp,
                                color = colors.text2,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 16.dp),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            // Chips de resumo
                            item {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 16.dp, start = 4.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(100.dp))
                                            .background(colors.primaryLight)
                                            .border(1.dp, colors.borderMd, RoundedCornerShape(100.dp))
                                            .padding(horizontal = 12.dp, vertical = 6.dp)
                                    ) {
                                        Text(
                                            text = "${tickets.size} viagens",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.primary
                                        )
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(100.dp))
                                            .background(colors.surface)
                                            .border(1.dp, colors.borderMd, RoundedCornerShape(100.dp))
                                            .padding(horizontal = 12.dp, vertical = 6.dp)
                                    ) {
                                        Text(
                                            text = "Embarcadas: ${tickets.count { it.used == 1 }}",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.text2
                                        )
                                    }
                                }
                            }

                            // Lista de viagens reais
                            itemsIndexed(tickets) { _, trip ->
                                val isBoarded = trip.used == 1
                                val statusText = when {
                                    isBoarded -> "Embarcada"
                                    trip.isReadyToBoard -> "Pronta para embarque"
                                    else -> "Confirmada"
                                }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 10.dp)
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Ícone da rota
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(RoundedCornerShape(13.dp))
                                            .background(if (trip.isReadyToBoard) colors.primaryLight else colors.bg),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = if (trip.isReadyToBoard) "🚌" else "✓",
                                            fontSize = 18.sp
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(14.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "${trip.departure} → ${trip.arrival}",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.text1
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "${trip.tripDate} · Poltrona ${trip.seat}",
                                            fontSize = 12.sp,
                                            color = colors.text2
                                        )
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(100.dp))
                                            .background(if (isBoarded) colors.successLight else colors.primaryLight)
                                            .border(
                                                1.dp,
                                                if (isBoarded) colors.success else colors.primaryMid,
                                                RoundedCornerShape(100.dp)
                                            )
                                            .padding(horizontal = 9.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = statusText,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isBoarded) colors.success else colors.primary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                else -> {}
            }
        }
    }
}
