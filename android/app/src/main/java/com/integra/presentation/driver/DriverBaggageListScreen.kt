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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.data.model.TripPassengerDto
import com.integra.data.repository.DriverRepository
import com.integra.presentation.common.ErrorStateView
import com.integra.presentation.common.LoadingStateView
import com.integra.presentation.common.UiState
import com.integra.ui.theme.LocalIntegraColors
import kotlinx.coroutines.launch

data class DriverBaggageUiModel(
    val id: String,
    val owner: String,
    val seat: Int,
    val isChecked: Boolean
)

@Composable
fun DriverBaggageListScreen(
    onNavigateBack: () -> Unit,
    driverRepository: DriverRepository = remember { DriverRepository() }
) {
    val colors = LocalIntegraColors.current
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf<UiState<List<DriverBaggageUiModel>>>(UiState.Loading) }

    val loadBaggages: () -> Unit = {
        state = UiState.Loading
        scope.launch {
            val result = driverRepository.getTripPassengers("TRIP-SP-RJ-001")
            result.onSuccess { passengers ->
                val list = mutableListOf<DriverBaggageUiModel>()
                passengers.forEach { p ->
                    for (i in 1..p.baggageCount) {
                        list.add(
                            DriverBaggageUiModel(
                                id = "BAG-${p.ticketId.takeLast(4)}-$i",
                                owner = p.passengerName,
                                seat = p.seat,
                                isChecked = p.isBoarded
                            )
                        )
                    }
                }
                // Se a lista estiver vazia por ser mock da rota, adiciona os passageiros com bagagens
                if (list.isEmpty()) {
                    list.add(DriverBaggageUiModel("TAG-7654", "Marcos Oliveira", 12, true))
                    list.add(DriverBaggageUiModel("TAG-3421", "João Silva", 18, true))
                    list.add(DriverBaggageUiModel("TAG-8822", "Ana Costa", 14, false))
                }
                state = UiState.Success(list)
            }.onFailure { err ->
                state = UiState.Error(err.message ?: "Não foi possível carregar as bagagens.")
            }
        }
    }

    LaunchedEffect(Unit) {
        loadBaggages()
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
            Text("Lista de Bagagens", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = colors.text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (val currentState = state) {
                is UiState.Loading -> {
                    LoadingStateView(message = "Carregando manifesto de bagagens...")
                }
                is UiState.Error -> {
                    ErrorStateView(
                        message = currentState.message,
                        onRetry = loadBaggages
                    )
                }
                is UiState.Success -> {
                    val baggages = currentState.data
                    val checkedCount = baggages.count { it.isChecked }
                    val pendingCount = baggages.size - checkedCount

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        contentPadding = PaddingValues(bottom = 24.dp)
                    ) {
                        item {
                            // Resumo de contagem
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                                        .padding(14.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text("EMBARCADAS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.success)
                                        Text("$checkedCount", fontSize = 22.sp, fontWeight = FontWeight.Black, color = colors.success)
                                    }
                                }

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                                        .padding(14.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text("PENDENTES", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.error)
                                        Text("$pendingCount", fontSize = 22.sp, fontWeight = FontWeight.Black, color = colors.error)
                                    }
                                }
                            }
                        }

                        items(baggages) { b ->
                            val isOk = b.isChecked

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 12.dp)
                                    .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(colors.surface)
                                    .border(1.dp, if (isOk) colors.success else colors.border, RoundedCornerShape(12.dp))
                                    .padding(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = b.id,
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontFamily = FontFamily.Monospace,
                                        color = colors.text1
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(100.dp))
                                            .background(if (isOk) colors.successLight else colors.error.copy(alpha = 0.1f))
                                            .border(1.dp, if (isOk) colors.success else colors.error, RoundedCornerShape(100.dp))
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                    ) {
                                        Text(
                                            text = if (isOk) "✓ Embarcada" else "Pendente",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isOk) colors.success else colors.error
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Passageiro: ${b.owner}",
                                        fontSize = 13.sp,
                                        color = colors.text2
                                    )
                                    Text(
                                        text = "Poltrona ${b.seat}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.primary
                                    )
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
