package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.data.local.SessionManager
import com.integra.data.model.TicketDetailsDto
import com.integra.data.repository.PassengerRepository
import com.integra.presentation.common.ErrorStateView
import com.integra.presentation.common.LoadingStateView
import com.integra.presentation.common.UiState
import com.integra.ui.theme.LocalIntegraColors
import com.integra.util.NetworkMonitor
import kotlinx.coroutines.launch

enum class TicketFilter(val label: String) {
    TODAS("Todas"),
    EMBARCADAS("Embarcadas"),
    PENDENTES("Pendentes")
}

@Composable
fun PassengerHistoricoCompletoScreen(
    onNavigateBack: () -> Unit
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val repository = remember { PassengerRepository() }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val networkMonitor = remember { NetworkMonitor.getInstance(context) }
    val isOnline by networkMonitor.isOnline.collectAsState()
    val scope = rememberCoroutineScope()

    var selectedFilter by remember { mutableStateOf(TicketFilter.TODAS) }
    var uiState by remember { mutableStateOf<UiState<List<TicketDetailsDto>>>(UiState.Loading) }

    val loadHistory: () -> Unit = {
        scope.launch {
            uiState = UiState.Loading
            val userId = sessionManager.getUserId() ?: "E1F2A3B4C5D6E7F80123456789ABCDEF"
            val result = repository.getUserTickets(userId)
            result.onSuccess { tickets ->
                sessionManager.saveOfflineTickets(tickets)
                uiState = UiState.Success(tickets)
            }.onFailure { err ->
                val cached = sessionManager.getOfflineTickets()
                if (cached.isNotEmpty()) {
                    uiState = UiState.Success(cached)
                } else {
                    uiState = UiState.Error(
                        message = err.message ?: "Não foi possível carregar suas viagens.",
                        isOffline = !isOnline
                    )
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        loadHistory()
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
                .padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(colors.surface)
                    .border(1.5.dp, colors.borderMd, RoundedCornerShape(12.dp))
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("←", fontSize = 18.sp, color = colors.text1, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.width(14.dp))

            Text(
                text = "Histórico de Viagens",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text1
            )
        }

        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        // Filtros (Pills)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            TicketFilter.values().forEach { filter ->
                val isSelected = selectedFilter == filter
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(100.dp))
                        .background(if (isSelected) colors.primaryLight else colors.surface)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) colors.primary else colors.borderMd,
                            shape = RoundedCornerShape(100.dp)
                        )
                        .clickable { selectedFilter = filter }
                        .padding(horizontal = 18.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = filter.label,
                        color = if (isSelected) colors.primary else colors.text2,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        // Conteúdo
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 12.dp)
        ) {
            when (val state = uiState) {
                is UiState.Loading -> {
                    LoadingStateView(message = "Carregando histórico de viagens...")
                }
                is UiState.Error -> {
                    ErrorStateView(
                        message = state.message,
                        isOffline = state.isOffline,
                        onRetry = loadHistory
                    )
                }
                is UiState.Success -> {
                    val allTickets = state.data
                    val filteredTickets = allTickets.filter { ticket ->
                        when (selectedFilter) {
                            TicketFilter.TODAS -> true
                            TicketFilter.EMBARCADAS -> ticket.used == 1
                            TicketFilter.PENDENTES -> ticket.used != 1
                        }
                    }

                    if (filteredTickets.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Nenhuma viagem encontrada neste filtro.",
                                color = colors.text3,
                                fontSize = 14.sp
                            )
                        }
                    } else {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            contentPadding = PaddingValues(bottom = 32.dp)
                        ) {
                            itemsIndexed(filteredTickets) { _, ticket ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(14.dp))
                                        .padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(colors.primaryLight),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text("🚌", fontSize = 16.sp)
                                        }

                                        Spacer(modifier = Modifier.width(12.dp))

                                        Column {
                                            Text(
                                                text = "${ticket.departure} → ${ticket.arrival}",
                                                fontSize = 15.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = colors.text1
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = "Data: ${ticket.tripDate} • Poltrona ${ticket.seat}",
                                                fontSize = 12.sp,
                                                color = colors.text2
                                            )
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(100.dp))
                                            .background(if (ticket.used == 1) colors.primaryLight else colors.successLight)
                                            .border(
                                                1.dp,
                                                if (ticket.used == 1) colors.primary else colors.success,
                                                RoundedCornerShape(100.dp)
                                            )
                                            .padding(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = if (ticket.used == 1) "Embarcada" else "Pronto",
                                            color = if (ticket.used == 1) colors.primary else colors.success,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
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
