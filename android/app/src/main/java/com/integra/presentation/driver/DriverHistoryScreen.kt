package com.integra.presentation.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.data.local.SessionManager
import com.integra.data.model.TripDto
import com.integra.data.repository.DriverRepository
import com.integra.presentation.common.ErrorStateView
import com.integra.presentation.common.LoadingStateView
import com.integra.presentation.common.UiState
import com.integra.ui.theme.LocalIntegraColors
import kotlinx.coroutines.launch

@Composable
fun DriverHistoryScreen(
    onNavigateBack: () -> Unit,
    driverRepository: DriverRepository = remember { DriverRepository() }
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf<UiState<List<TripDto>>>(UiState.Loading) }

    val loadHistory: () -> Unit = {
        state = UiState.Loading
        scope.launch {
            val driverId = sessionManager.getCachedUserId() ?: "00000000000000000000000000000001"
            val result = driverRepository.getTrips(driverId)
            result.onSuccess { trips ->
                state = UiState.Success(trips)
            }.onFailure { err ->
                state = UiState.Error(err.message ?: "Não foi possível carregar o histórico de viagens.")
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
        // Back Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .padding(start = 20.dp, end = 20.dp, top = 52.dp, bottom = 16.dp),
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
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = colors.text1)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Histórico de Viagens", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = colors.text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (val currentState = state) {
                is UiState.Loading -> {
                    LoadingStateView(message = "Carregando histórico de viagens...")
                }
                is UiState.Error -> {
                    ErrorStateView(
                        message = currentState.message,
                        onRetry = loadHistory
                    )
                }
                is UiState.Success -> {
                    val trips = currentState.data

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentPadding = PaddingValues(bottom = 24.dp)
                    ) {
                        item {
                            // Stats Card
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 24.dp)
                                    .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(colors.surface)
                                    .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                    .padding(20.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("TOTAL", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = colors.text3)
                                    Text("${trips.size}", fontSize = 28.sp, fontWeight = FontWeight.Black, color = colors.text1)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("OPERADAS", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = colors.text3)
                                    Text("${trips.size}", fontSize = 28.sp, fontWeight = FontWeight.Black, color = colors.success)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("PASSAGEIROS", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = colors.text3)
                                    val totalTickets = trips.sumOf { it.ticketsCount }
                                    Text("$totalTickets", fontSize = 28.sp, fontWeight = FontWeight.Black, color = colors.primary)
                                }
                            }

                            Text(
                                text = "Viagens Operadas Recentemente",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.text1,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )
                        }

                        if (trips.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                        .padding(32.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "Nenhuma viagem operada por este motorista.",
                                        fontSize = 14.sp,
                                        color = colors.text3,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        } else {
                            items(trips) { trip ->
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 12.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(14.dp))
                                        .padding(16.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "${trip.departure} → ${trip.arrival}",
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.text1
                                        )
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(100.dp))
                                                .background(colors.successLight)
                                                .padding(horizontal = 8.dp, vertical = 3.dp)
                                        ) {
                                            Text("Concluída", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = colors.success)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Data: ${trip.tripDate}",
                                            fontSize = 12.sp,
                                            color = colors.text2
                                        )
                                        Text(
                                            text = "${trip.ticketsCount} passageiros · ${trip.occupation}",
                                            fontSize = 12.sp,
                                            color = colors.text3,
                                            fontWeight = FontWeight.Medium
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

