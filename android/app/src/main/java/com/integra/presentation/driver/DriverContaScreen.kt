package com.integra.presentation.driver

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.data.local.SessionManager
import com.integra.data.model.TripDto
import com.integra.data.repository.DriverRepository
import com.integra.presentation.common.LoadingStateView
import com.integra.ui.theme.LocalIntegraColors
import kotlinx.coroutines.launch

@Composable
fun DriverContaScreen(
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val driverRepository = remember { DriverRepository() }
    val scope = rememberCoroutineScope()

    val userProfile by sessionManager.userProfileFlow.collectAsState(initial = null)
    var currentTrip by remember { mutableStateOf<TripDto?>(null) }
    var isLoadingTrip by remember { mutableStateOf(true) }

    LaunchedEffect(userProfile) {
        val driverId = userProfile?.userId ?: "DRV-10293"
        scope.launch {
            isLoadingTrip = true
            val result = driverRepository.getTrips(driverId)
            result.onSuccess { trips ->
                currentTrip = trips.firstOrNull()
            }
            isLoadingTrip = false
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
                text = "Conta do Motorista",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text1
            )
        }

        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(20.dp)
        ) {
            // Card Perfil
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                    .padding(18.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(colors.primaryDark),
                    contentAlignment = Alignment.Center
                ) {
                    Text("👨‍✈️", fontSize = 26.sp)
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column {
                    Text(
                        text = userProfile?.userName ?: "Motorista Operador",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.text1
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = userProfile?.userEmail ?: "motorista@integra.clickbus.com",
                        fontSize = 13.sp,
                        color = colors.text2
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100.dp))
                            .background(colors.primaryLight)
                            .border(1.dp, colors.primary, RoundedCornerShape(100.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "Matrícula: DRV-${userProfile?.userId?.take(6) ?: "8812"}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Seção Minha Operação
            Text(
                text = "MINHA OPERAÇÃO ATUAL",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text3,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(14.dp))
                    .padding(16.dp)
            ) {
                if (isLoadingTrip) {
                    LoadingStateView(message = "Consultando viagem ativa...")
                } else if (currentTrip != null) {
                    val trip = currentTrip!!
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "${trip.departure} → ${trip.arrival}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.text1
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Viagem #${trip.tripId} • ${trip.tripDate}",
                                fontSize = 12.sp,
                                color = colors.text2
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(100.dp))
                                .background(colors.successLight)
                                .border(1.dp, colors.success, RoundedCornerShape(100.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Em Rota",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.success
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Ocupação", fontSize = 11.sp, color = colors.text3)
                            Text(trip.occupation, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Passageiros", fontSize = 11.sp, color = colors.text3)
                            Text("${trip.ticketsCount}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                        }
                    }
                } else {
                    Text(
                        text = "Nenhuma viagem escalada para o momento.",
                        color = colors.text3,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(30.dp))

            // Ações
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .clip(RoundedCornerShape(100.dp))
                    .background(colors.errorLight)
                    .border(1.dp, colors.error, RoundedCornerShape(100.dp))
                    .clickable {
                        scope.launch {
                            sessionManager.clearSession()
                            onLogout()
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Sair da Conta",
                    color = colors.error,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
