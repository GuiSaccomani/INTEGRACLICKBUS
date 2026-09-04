package com.integra.presentation.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.presentation.viewmodel.DriverPassengerListUiState
import com.integra.presentation.viewmodel.DriverPassengerListViewModel
import com.integra.ui.theme.*

@Composable
fun DriverPassengerListScreen(
    onNavigateBack: () -> Unit
) {
    val viewModel = remember { DriverPassengerListViewModel() }
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadPassengers()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Bg)
    ) {
        // Back Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DS_Surface)
                .padding(start = 20.dp, end = 20.dp, top = 52.dp, bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(DS_Surface)
                    .border(1.5.dp, DS_BorderMd, RoundedCornerShape(12.dp))
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Lista de Passageiros", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        when (val state = uiState) {
            is DriverPassengerListUiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = DS_Primary)
                }
            }

            is DriverPassengerListUiState.Success -> {
                val passengers = state.passengers
                if (passengers.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Nenhum passageiro encontrado nesta viagem.", color = DS_Text3, fontSize = 14.sp)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp, 20.dp, 16.dp, 30.dp)
                    ) {
                        items(passengers) { p ->
                            val isEmbarcado = p.isBoarded
                            val isBagOK = p.hasBaggage

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 14.dp)
                                    .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(DS_Surface)
                                    .border(1.dp, if (isEmbarcado) DS_Success else DS_Border, RoundedCornerShape(12.dp))
                                    .padding(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = p.passengerName,
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = DS_Text1
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(if (isEmbarcado) Color(0xFFD1FAE5) else DS_Bg)
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = "Poltrona ${p.seat}",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isEmbarcado) Color(0xFF065F46) else DS_Text2
                                        )
                                    }
                                }

                                Row(
                                    modifier = Modifier.padding(top = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (isEmbarcado) DS_Success else DS_PrimaryMid)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = if (isEmbarcado) "Embarcado com sucesso" else "Aguardando embarque",
                                        fontSize = 13.sp,
                                        color = if (isEmbarcado) DS_Success else DS_Text2,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }

                                if (isBagOK) {
                                    Row(
                                        modifier = Modifier.padding(top = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text("🧳", fontSize = 12.sp)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "${p.baggageCount} bagagem(ns) identificada(s)",
                                            fontSize = 12.sp,
                                            color = DS_Primary,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            is DriverPassengerListUiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(state.message, color = DS_Error, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(16.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(DS_Primary)
                                .clickable { viewModel.loadPassengers() }
                                .padding(horizontal = 16.dp, vertical = 10.dp)
                        ) {
                            Text("Recarregar", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
