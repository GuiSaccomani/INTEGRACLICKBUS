package com.integra.presentation.auth

import android.app.Activity
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.biometrics.PasskeyManager
import com.integra.biometrics.PasskeyResult
import com.integra.ui.theme.LocalIntegraColors
import com.integra.util.FeedbackManager
import kotlinx.coroutines.launch

@Composable
fun BiometricScreen(
    onSuccess: () -> Unit,
    onCancel: () -> Unit
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val activity = context as? Activity
    val scope = rememberCoroutineScope()
    val passkeyManager = remember { PasskeyManager(context) }

    var status by remember { mutableStateOf<String>("scanning") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val startAuth: () -> Unit = {
        status = "scanning"
        errorMessage = null
        if (activity != null) {
            scope.launch {
                when (val res = passkeyManager.authenticateWithPasskey(activity)) {
                    is PasskeyResult.Success -> {
                        status = "success"
                        FeedbackManager.vibrateSuccess(context)
                        FeedbackManager.playBeepSuccess()
                        kotlinx.coroutines.delay(600)
                        onSuccess()
                    }
                    is PasskeyResult.FallbackToPassword -> {
                        status = "fallback"
                        errorMessage = res.reason
                    }
                    is PasskeyResult.Error -> {
                        status = "error"
                        errorMessage = res.message
                    }
                }
            }
        } else {
            // Em preview ou sem activity
            status = "fallback"
            errorMessage = "Contexto de atividade indisponível para biometria nativa."
        }
    }

    LaunchedEffect(activity) {
        startAuth()
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(colors.surface)
                .border(1.dp, colors.border, RoundedCornerShape(24.dp))
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(84.dp)
                    .scale(if (status == "scanning") pulseScale else 1f)
                    .clip(CircleShape)
                    .background(
                        when (status) {
                            "success" -> colors.success
                            "error" -> colors.error.copy(alpha = 0.15f)
                            else -> colors.primaryLight
                        }
                    )
                    .border(
                        2.dp,
                        when (status) {
                            "success" -> colors.success
                            "error" -> colors.error
                            else -> colors.primary
                        },
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                when (status) {
                    "success" -> {
                        Text("✓", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                    }
                    "error" -> {
                        Text("✕", color = colors.error, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                    }
                    else -> {
                        Text("🛡", fontSize = 32.sp)
                    }
                }
            }

            Text(
                text = when (status) {
                    "success" -> "Autenticado"
                    "error" -> "Falha na Autenticação"
                    "fallback" -> "Biometria Indisponível"
                    else -> "Autenticando..."
                },
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = if (status == "error") colors.error else colors.text1,
                modifier = Modifier.padding(top = 24.dp, bottom = 8.dp)
            )

            Text(
                text = if (errorMessage != null)
                    errorMessage!!
                else
                    "Use a impressão digital, reconhecimento facial ou credencial da sua plataforma.",
                fontSize = 13.sp,
                color = colors.text3,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(28.dp))

            if (status == "error" || status == "fallback") {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .clip(RoundedCornerShape(100.dp))
                        .background(colors.primary)
                        .clickable { startAuth() },
                    contentAlignment = Alignment.Center
                ) {
                    Text("Tentar Novamente", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }

                Spacer(modifier = Modifier.height(12.dp))
            }

            Text(
                text = "Entrar com Senha",
                color = colors.primary,
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                modifier = Modifier
                    .clickable { onCancel() }
                    .padding(8.dp)
            )
        }
    }
}
