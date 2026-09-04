package com.integra.presentation.auth

import androidx.compose.animation.core.*
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import com.integra.ui.theme.*

@Composable
fun BiometricScreen(
    onSuccess: () -> Unit,
    onCancel: () -> Unit
) {
    var state by remember { mutableStateOf("scanning") }

    LaunchedEffect(Unit) {
        delay(1500)
        state = "success"
        delay(800)
        onSuccess()
    }

    val infiniteTransition = rememberInfiniteTransition()
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Bg),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(DS_Surface)
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .scale(if (state == "scanning") pulseScale else 1f)
                    .clip(CircleShape)
                    .background(if (state == "success") DS_Success else DS_PrimaryLight)
                    .border(2.dp, if (state == "success") DS_Success else DS_Primary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                if (state == "success") {
                    Text("✓", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                } else {
                    Text("🛡", fontSize = 32.sp) // Fallback icon
                }
            }

            Text(
                text = if (state == "success") "Autenticado" else "Autenticando...",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text1,
                modifier = Modifier.padding(top = 24.dp, bottom = 8.dp)
            )

            Text(
                text = "Use o Face ID ou a sua Digital",
                fontSize = 14.sp,
                color = DS_Text3,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "Cancelar",
                color = DS_Primary,
                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp,
                modifier = Modifier.clickable { if (state == "scanning") onCancel() }.padding(8.dp)
            )
        }
    }
}
