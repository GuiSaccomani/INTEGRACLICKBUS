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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.integra.data.local.SessionManager
import com.integra.presentation.common.ErrorStateView
import com.integra.presentation.common.LoadingStateView
import com.integra.presentation.common.UiState
import com.integra.presentation.viewmodel.PassengerLuggageViewModel
import com.integra.ui.theme.LocalIntegraColors

data class TimelineStep(val label: String, val sub: String, val done: Boolean)

@Composable
fun PassengerBagagemDetalheScreen(
    baggageId: String = "IN-20481",
    onNavigateBack: () -> Unit,
    onNavigateToRetirada: (String) -> Unit = {},
    viewModel: PassengerLuggageViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val sessionManager = remember { SessionManager.getInstance(context) }
    val activeTicket = remember { sessionManager.getCachedActiveTicket() }

    val state by viewModel.detailState.collectAsState()

    LaunchedEffect(baggageId) {
        viewModel.loadLuggageDetail(baggageId)
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
                .padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 16.dp)
                .border(1.dp, colors.border, RoundedCornerShape(bottomStart = 0.dp, bottomEnd = 0.dp)),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.5.dp, colors.borderMd, RoundedCornerShape(12.dp))
                    .background(colors.surface)
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("←", fontSize = 18.sp, color = colors.text1, fontWeight = FontWeight.Bold)
            }

            Text(
                text = "Detalhe da Bagagem",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text1,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )

            Spacer(modifier = Modifier.size(40.dp))
        }

        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (val currentState = state) {
                is UiState.Loading -> {
                    LoadingStateView(message = "Carregando detalhes da bagagem...")
                }
                is UiState.Error -> {
                    ErrorStateView(
                        message = currentState.message,
                        onRetry = { viewModel.loadLuggageDetail(baggageId) }
                    )
                }
                is UiState.Success -> {
                    val detail = currentState.data
                    val isChecked = activeTicket?.isUsed == true

                    val timeline = listOf(
                        TimelineStep("Registrada", "Bagagem identificada no sistema", true),
                        TimelineStep("Vinculada à viagem", if (activeTicket != null) "${activeTicket.departure} → ${activeTicket.arrival}" else "Viagem ativa", true),
                        TimelineStep("Em trânsito", if (isChecked) "Alocada no bagageiro do ônibus" else "Aguardando embarque no bagageiro", isChecked),
                        TimelineStep("Retirada", "Confirmação de entrega no destino", false)
                    )

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(scrollState)
                            .padding(16.dp)
                    ) {
                        // Card Ilustração da Mala
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(colors.surface, RoundedCornerShape(16.dp))
                                .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(80.dp)
                                    .background(colors.primaryLight, RoundedCornerShape(20.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("🧳", fontSize = 42.sp)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(modifier = Modifier.size(8.dp).background(colors.success, CircleShape))
                                Text(
                                    text = if (isChecked) "Embarcada no Ônibus" else "Etiqueta Digital Ativa",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.success
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Card Informações
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(colors.surface, RoundedCornerShape(16.dp))
                                .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                .padding(horizontal = 16.dp)
                        ) {
                            val rows = listOf(
                                Pair("ID da bagagem", detail.baggageId),
                                Pair("Viagem vinculada", if (activeTicket != null) "${activeTicket.departure} → ${activeTicket.arrival}" else "${detail.departure} → ${detail.arrival}"),
                                Pair("Passagem", detail.ticketId),
                                Pair("Status", if (isChecked) "✓ Embarcada no Bagageiro" else "✓ Registrada"),
                                Pair("Data da viagem", detail.tripDate)
                            )

                            rows.forEachIndexed { i, (label, value) ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 13.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(label, fontSize = 13.sp, color = colors.text2)
                                    Text(
                                        text = value,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = colors.text1,
                                        fontFamily = if (label.contains("ID") || label.contains("Passagem")) FontFamily.Monospace else null
                                    )
                                }
                                if (i < rows.size - 1) {
                                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Timeline de Rastreio
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(colors.surface, RoundedCornerShape(16.dp))
                                .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "RASTREIO DA BAGAGEM",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.text3,
                                letterSpacing = 0.5.sp,
                                modifier = Modifier.padding(bottom = 14.dp)
                            )

                            timeline.forEachIndexed { index, step ->
                                Row(modifier = Modifier.fillMaxWidth()) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        modifier = Modifier.width(24.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(20.dp)
                                                .background(
                                                    if (step.done) colors.primary else colors.borderMd,
                                                    CircleShape
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            if (step.done) {
                                                Text("✓", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                        if (index < timeline.size - 1) {
                                            Box(
                                                modifier = Modifier
                                                    .width(2.dp)
                                                    .height(34.dp)
                                                    .background(if (step.done) colors.primary else colors.borderMd)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column(modifier = Modifier.padding(bottom = if (index < timeline.size - 1) 18.dp else 0.dp)) {
                                        Text(
                                            text = step.label,
                                            fontSize = 14.sp,
                                            fontWeight = if (step.done) FontWeight.Bold else FontWeight.Normal,
                                            color = if (step.done) colors.text1 else colors.text3
                                        )
                                        Text(
                                            text = step.sub,
                                            fontSize = 12.sp,
                                            color = colors.text2
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Botão Retirar Bagagem
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .shadow(8.dp, RoundedCornerShape(100.dp), ambientColor = colors.primary.copy(alpha = 0.3f))
                                .background(colors.primary, RoundedCornerShape(100.dp))
                                .clickable { onNavigateToRetirada(detail.baggageId) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Retirar Esta Bagagem",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
                else -> {}
            }
        }
    }
}
