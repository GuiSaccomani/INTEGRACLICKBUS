package com.integra.presentation.driver

import androidx.compose.animation.*
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
fun DriverClearTagScreen(
    onNavigateBack: () -> Unit
) {
    var phase by remember { mutableStateOf("waiting") }
    var showConfirm by remember { mutableStateOf(false) }

    LaunchedEffect(phase) {
        if (phase == "reading") {
            delay(2000)
            phase = "success" // Assume success for flow
        }
    }

    val centerColor = when (phase) {
        "success" -> DS_Success
        "error" -> DS_Error
        "reading" -> DS_Primary
        else -> DS_PrimaryLight
    }

    val statusText = when (phase) {
        "waiting" -> "Limpar tag NFC"
        "reading" -> "Acessando tag..."
        "success" -> "DADOS REMOVIDOS"
        else -> "FALHA NA LEITURA"
    }

    val statusSub = when (phase) {
        "waiting" -> "Aproxime o celular da tag da bagagem retirada."
        "reading" -> "Limpando informações..."
        "success" -> "Esta tag está pronta para ser reutilizada."
        else -> "Tente aproximar o celular novamente."
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DS_Surface)
        ) {
            // Back Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
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
                Text("Desembarque", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Animation Box
                Box(
                    modifier = Modifier
                        .size(180.dp)
                        .padding(bottom = 36.dp),
                    contentAlignment = Alignment.Center
                ) {
                    val infiniteTransition = rememberInfiniteTransition()
                    val pulseScale by infiniteTransition.animateFloat(
                        initialValue = 0.6f,
                        targetValue = 1.9f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(2000, easing = LinearOutSlowInEasing),
                            repeatMode = RepeatMode.Restart
                        )
                    )
                    val pulseAlpha by infiniteTransition.animateFloat(
                        initialValue = 0.6f,
                        targetValue = 0f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(2000, easing = LinearOutSlowInEasing),
                            repeatMode = RepeatMode.Restart
                        )
                    )

                    if (phase == "reading") {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .scale(pulseScale)
                                .border(2.dp, DS_Primary.copy(alpha = pulseAlpha), CircleShape)
                        )
                    }

                    val iconScale by animateFloatAsState(
                        targetValue = if (phase == "success" || phase == "error") 1f else 0.5f,
                        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow)
                    )

                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(centerColor)
                            .border(
                                if (phase == "waiting") 2.dp else 0.dp,
                                if (phase == "waiting") DS_PrimaryMid else Color.Transparent,
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        when (phase) {
                            "waiting" -> Text("TAG", color = DS_Primary, fontWeight = FontWeight.Bold)
                            "reading" -> Text("...", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                            "success" -> Text("✓", color = Color.White, fontSize = 44.sp, fontWeight = FontWeight.Bold, modifier = Modifier.scale(iconScale))
                            "error" -> Text("!", color = Color.White, fontSize = 44.sp, fontWeight = FontWeight.Bold, modifier = Modifier.scale(iconScale))
                        }
                    }
                }

                Text(
                    text = statusText,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (phase == "success") DS_Success else if (phase == "error") DS_Error else DS_Text1,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = statusSub,
                    fontSize = 16.sp,
                    color = DS_Text2,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 8.dp, bottom = 36.dp)
                )

                if (phase == "waiting") {
                    Box(modifier = Modifier.fillMaxWidth().height(56.dp).clip(RoundedCornerShape(16.dp)).background(DS_Primary).clickable { showConfirm = true }, contentAlignment = Alignment.Center) {
                        Text("Limpar Tag", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }

                if (phase == "error") {
                    Box(modifier = Modifier.fillMaxWidth().height(56.dp).clip(RoundedCornerShape(16.dp)).background(DS_Primary).clickable { phase = "waiting" }, contentAlignment = Alignment.Center) {
                        Text("Tentar novamente", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }

                if (phase == "success") {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        Box(modifier = Modifier.fillMaxWidth().height(56.dp).clip(RoundedCornerShape(16.dp)).background(DS_PrimaryLight).border(2.dp, DS_PrimaryMid, RoundedCornerShape(16.dp)).clickable { phase = "waiting" }, contentAlignment = Alignment.Center) {
                            Text("Limpar outra tag", color = DS_Primary, fontWeight = FontWeight.Bold)
                        }
                        Box(modifier = Modifier.fillMaxWidth().height(50.dp).clip(RoundedCornerShape(16.dp)).background(Color.Transparent).clickable { onNavigateBack() }, contentAlignment = Alignment.Center) {
                            Text("Voltar ao início", color = DS_Text2, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Modal de confirmação
        if (showConfirm) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.6f))
                    .clickable { showConfirm = false },
                contentAlignment = Alignment.BottomCenter
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                        .background(DS_Surface)
                        .padding(20.dp, 30.dp, 20.dp, 40.dp)
                        .clickable(enabled = false) {}, // Intercept click
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(modifier = Modifier.size(56.dp).padding(bottom = 20.dp)) {
                        Text("⚠", fontSize = 32.sp, color = DS_Error)
                    }
                    Text("Limpar esta Tag?", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = DS_Text1, modifier = Modifier.padding(bottom = 12.dp))
                    Text("Todos os dados vinculados a esta bagagem serão permanentemente removidos. Deseja continuar?", fontSize = 15.sp, color = DS_Text2, textAlign = TextAlign.Center, modifier = Modifier.padding(bottom = 32.dp))
                    
                    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(modifier = Modifier.fillMaxWidth().height(56.dp).clip(RoundedCornerShape(16.dp)).background(DS_Primary).clickable { showConfirm = false; phase = "reading" }, contentAlignment = Alignment.Center) {
                            Text("Sim, limpar tag", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                        Box(modifier = Modifier.fillMaxWidth().height(50.dp).clip(RoundedCornerShape(16.dp)).background(Color.Transparent).clickable { showConfirm = false }, contentAlignment = Alignment.Center) {
                            Text("Cancelar", color = DS_Text2, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
