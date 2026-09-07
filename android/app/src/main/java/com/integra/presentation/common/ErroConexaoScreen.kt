package com.integra.presentation.common

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.LocalIntegraColors
import com.integra.util.NetworkMonitor

@Composable
fun ErroConexaoScreen(
    onRetryConnect: () -> Unit,
    onViewOfflineTicket: () -> Unit
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val networkMonitor = remember { NetworkMonitor.getInstance(context) }
    val isOnline by networkMonitor.isOnline.collectAsState()

    LaunchedEffect(isOnline) {
        if (isOnline) {
            onRetryConnect()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Ícone de Offline
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(colors.warningLight)
                .border(2.dp, colors.warning, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "⚡",
                fontSize = 36.sp
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Você está offline",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = colors.text1,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Parece que o local está sem sinal de internet no momento. Mas não se preocupe!\n\nSua passagem já está salva no dispositivo. Você pode embarcar normalmente aproximando o celular do leitor ou apresentando o QR Code.",
            fontSize = 14.sp,
            color = colors.text2,
            textAlign = TextAlign.Center,
            lineHeight = 22.sp,
            modifier = Modifier.padding(horizontal = 12.dp)
        )

        Spacer(modifier = Modifier.height(36.dp))

        // Botão Tentar Reconectar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .clip(RoundedCornerShape(100.dp))
                .background(colors.primary)
                .clickable {
                    val online = networkMonitor.refresh()
                    if (online) {
                        onRetryConnect()
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Tentar Reconectar",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Botão Ver Passagem Offline
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
                .clip(RoundedCornerShape(100.dp))
                .background(Color.Transparent)
                .border(1.5.dp, colors.borderMd, RoundedCornerShape(100.dp))
                .clickable { onViewOfflineTicket() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Ver Passagem Offline",
                color = colors.text1,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}
