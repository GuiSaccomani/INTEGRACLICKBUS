package com.integra.presentation.passenger

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
fun PassengerNotificacoesScreen(
    onNavigateBack: () -> Unit,
    viewModel: PassengerTicketViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val userId = remember { sessionManager.getCachedUserId() }

    val notificationsState by viewModel.notificationsState.collectAsState()

    LaunchedEffect(userId) {
        if (notificationsState is UiState.Idle) {
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
            verticalAlignment = Alignment.CenterVertically
        ) {
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
                text = "Notificações",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text1
            )
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        // Body com UiState
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (val currentState = notificationsState) {
                is UiState.Loading -> {
                    LoadingStateView(message = "Atualizando notificações...")
                }
                is UiState.Error -> {
                    ErrorStateView(
                        message = currentState.message,
                        onRetry = { viewModel.loadTickets(userId) }
                    )
                }
                is UiState.Success -> {
                    val notifications = currentState.data

                    if (notifications.isEmpty()) {
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
                                Text("🔔", fontSize = 28.sp)
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Nenhuma notificação",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.text1
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Você não possui notificações pendentes no momento. Avisos sobre embarque e bagagens aparecerão aqui.",
                                fontSize = 13.sp,
                                color = colors.text2,
                                textAlign = TextAlign.Center,
                                lineHeight = 18.sp
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 16.dp),
                            contentPadding = PaddingValues(vertical = 16.dp)
                        ) {
                            items(notifications) { item ->
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 12.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(colors.surface)
                                        .border(1.dp, colors.border, RoundedCornerShape(14.dp))
                                        .padding(16.dp)
                                ) {
                                    Column(modifier = Modifier.fillMaxWidth()) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.Top
                                        ) {
                                            Text(
                                                text = item.title,
                                                fontSize = 15.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = colors.text1,
                                                modifier = Modifier.weight(1f).padding(end = 8.dp)
                                            )
                                            if (item.isNew) {
                                                Box(
                                                    modifier = Modifier
                                                        .size(8.dp)
                                                        .clip(CircleShape)
                                                        .background(colors.primary)
                                                )
                                            }
                                        }
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = item.desc,
                                            fontSize = 13.sp,
                                            color = colors.text2,
                                            lineHeight = 18.sp
                                        )
                                        Spacer(modifier = Modifier.height(10.dp))
                                        Text(
                                            text = item.meta,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = colors.text3
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
