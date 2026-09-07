package com.integra.presentation.common

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.LocalIntegraColors

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String, val isOffline: Boolean = false) : UiState<Nothing>()
}

@Composable
fun LoadingStateView(
    modifier: Modifier = Modifier,
    message: String = "Carregando..."
) {
    val colors = LocalIntegraColors.current
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            color = colors.primary,
            strokeWidth = 3.dp,
            modifier = Modifier.size(36.dp)
        )
        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = message,
            color = colors.text2,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun ErrorStateView(
    message: String,
    isOffline: Boolean = false,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val colors = LocalIntegraColors.current
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(colors.surface)
            .border(1.dp, colors.border, RoundedCornerShape(14.dp))
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(if (isOffline) colors.warningLight else colors.errorLight),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isOffline) "⚡" else "⚠",
                fontSize = 22.sp,
                color = if (isOffline) colors.warning else colors.error
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = if (isOffline) "Sem Conexão à Internet" else "Não foi possível carregar",
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
            color = colors.text1,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = message,
            fontSize = 13.sp,
            color = colors.text2,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )

        if (onRetry != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(100.dp))
                    .background(colors.primary)
                    .clickable { onRetry() }
                    .padding(horizontal = 20.dp, vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Tentar novamente",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
