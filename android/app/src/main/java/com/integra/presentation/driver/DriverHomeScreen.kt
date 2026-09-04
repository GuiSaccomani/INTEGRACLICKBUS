package com.integra.presentation.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.integra.presentation.passenger.StatusBadge
import com.integra.presentation.viewmodel.DriverHomeViewModel
import com.integra.presentation.viewmodel.DriverHomeUiState
import com.integra.ui.theme.LocalIntegraColors

@Composable
fun BottomNavDriver(
    onHome: () -> Unit = {},
    onTrips: () -> Unit = {},
    onBaggages: () -> Unit = {},
    onPassengerMode: () -> Unit = {}
) {
    val colors = LocalIntegraColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(colors.surface)
            .border(1.dp, colors.border)
            .padding(bottom = 18.dp, top = 11.dp),
        horizontalArrangement = Arrangement.SpaceAround
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.clickable { onHome() }.padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text("Início", color = colors.primary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.clickable { onTrips() }.padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text("Passageiros", color = colors.text3, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.clickable { onBaggages() }.padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text("Bagagens", color = colors.text3, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.clickable { onPassengerMode() }.padding(horizontal = 12.dp, vertical = 4.dp)
        ) {
            Text("Modo Passageiro", color = colors.text3, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun DriverHomeScreen(
    viewModel: DriverHomeViewModel = viewModel(),
    onValidatePassenger: () -> Unit,
    onAddBaggage: () -> Unit,
    onClearTag: () -> Unit,
    onPassengerList: () -> Unit,
    onBaggageList: () -> Unit,
    onHistory: () -> Unit,
    onDesembarque: () -> Unit = {},
    onPassengerMode: () -> Unit = {}
) {
    val colors = LocalIntegraColors.current
    val scrollState = rememberScrollState()
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        bottomBar = {
            BottomNavDriver(
                onHome = {},
                onTrips = onPassengerList,
                onBaggages = onBaggageList,
                onPassengerMode = onPassengerMode
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.bg)
                .padding(paddingValues)
        ) {
            // Header Operacional Reto e Limpo
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.surface)
                    .padding(start = 20.dp, end = 20.dp, top = 52.dp, bottom = 20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "MODO MOTORISTA",
                        color = colors.text3,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.8.sp
                    )
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(colors.primaryLight)
                            .border(1.dp, colors.primaryMid, RoundedCornerShape(8.dp))
                            .clickable { onPassengerMode() }
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text("Ver Passageiro", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = colors.primary)
                    }
                }
                Text(
                    text = "Operação de Embarque",
                    color = colors.text1,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = (-0.5).sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
                Text(
                    text = "Gerencie o embarque e as bagagens da viagem.",
                    color = colors.text2,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

            // Main Content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Ações Operacionais (Cards Retos com Cantos 12.dp)
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Action 1 - Validar
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(8.dp, RoundedCornerShape(12.dp), spotColor = colors.primary.copy(alpha = 0.25f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(Brush.linearGradient(colors = listOf(colors.primaryDark, colors.primary)))
                            .clickable { onValidatePassenger() }
                            .padding(20.dp, 18.dp)
                    ) {
                        Column {
                            Text("Validar passageiro", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
                            Text("Leia NFC ou QR Code para confirmar o embarque.", color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 4.dp))
                        }
                    }

                    // Action 2 - Adicionar Bagagem
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.04f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                            .clickable { onAddBaggage() }
                            .padding(18.dp)
                    ) {
                        Column {
                            Text("Adicionar bagagem", color = colors.text1, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold)
                            Text("Associe uma tag NFC à bagagem do passageiro.", color = colors.text2, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                        }
                    }

                    // Action 3 - Desembarque de Bagagem
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.04f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                            .clickable { onDesembarque() }
                            .padding(18.dp)
                    ) {
                        Column {
                            Text("Desembarque de bagagem", color = colors.text1, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold)
                            Text("Identifique e confirme a entrega das malas aos passageiros.", color = colors.text2, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                        }
                    }

                    // Action 4 - Limpar Tag
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.04f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                            .clickable { onClearTag() }
                            .padding(18.dp)
                    ) {
                        Column {
                            Text("Limpar tag de bagagem", color = colors.text1, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                            Text("Remova os dados da tag para reutilização.", color = colors.text3, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }

                // Resumo da Viagem com Dados Reais da API
                Column {
                    Text(
                        "RESUMO DA VIAGEM",
                        color = colors.text3,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.8.sp,
                        modifier = Modifier.padding(start = 4.dp, bottom = 10.dp)
                    )
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(3.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(colors.surface)
                            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                            .padding(18.dp)
                    ) {
                        Column {
                            val summary = (uiState as? DriverHomeUiState.Success)?.summary
                            val destination = summary?.arrival ?: "Belo Horizonte"
                            val passengersCount = summary?.let { (it.soldCount.takeIf { s -> s > 0 } ?: it.totalTicketsCount).toString() } ?: "38"
                            val boardedCount = summary?.boardedCount?.toString() ?: "26"
                            val luggageCount = summary?.baggageCount?.toString() ?: "19"

                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Bottom
                            ) {
                                Column {
                                    Text("PRÓXIMO DESTINO", fontSize = 11.sp, color = colors.text3, fontWeight = FontWeight.SemiBold)
                                    Text(destination, fontSize = 18.sp, color = colors.text1, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 4.dp))
                                }
                                StatusBadge("Em rota", "primary")
                            }
                            Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                            Spacer(modifier = Modifier.height(14.dp))
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text(passengersCount, fontSize = 22.sp, color = colors.text1, fontWeight = FontWeight.Black)
                                    Text("Passageiros\nna viagem", fontSize = 11.sp, color = colors.text3, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 2.dp))
                                }
                                Column {
                                    Text(boardedCount, fontSize = 22.sp, color = colors.success, fontWeight = FontWeight.Black)
                                    Text("Embarcados\ncom sucesso", fontSize = 11.sp, color = colors.text3, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 2.dp))
                                }
                                Column {
                                    Text(luggageCount, fontSize = 22.sp, color = colors.primary, fontWeight = FontWeight.Black)
                                    Text("Bagagens\nidentificadas", fontSize = 11.sp, color = colors.text3, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 2.dp))
                                }
                            }
                        }
                    }
                }

                // Acesso Rápido
                Column {
                    Text(
                        "ACESSO RÁPIDO",
                        color = colors.text3,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.8.sp,
                        modifier = Modifier.padding(start = 4.dp, bottom = 10.dp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        QuickAccessButton(
                            text = "Lista de\npassageiros",
                            modifier = Modifier.weight(1f),
                            onClick = onPassengerList
                        )
                        QuickAccessButton(
                            text = "Lista de\nbagagens",
                            modifier = Modifier.weight(1f),
                            onClick = onBaggageList
                        )
                        QuickAccessButton(
                            text = "Histórico\nda viagem",
                            modifier = Modifier.weight(1f),
                            onClick = onHistory
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun QuickAccessButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val colors = LocalIntegraColors.current
    Box(
        modifier = modifier
            .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.04f))
            .clip(RoundedCornerShape(12.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(vertical = 14.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = colors.text1,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = 16.sp,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}
