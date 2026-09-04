package com.integra.presentation.passenger

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.presentation.components.PassengerBottomNav
import com.integra.ui.theme.LocalIntegraColors

@Composable
fun SuitcaseVector(modifier: Modifier = Modifier, primaryColor: Color, lightColor: Color) {
    Canvas(modifier = modifier.size(52.dp)) {
        val w = size.width
        val h = size.height

        // Corpo da mala
        drawRoundRect(
            color = lightColor,
            topLeft = Offset(w * 0.16f, h * 0.32f),
            size = Size(w * 0.68f, h * 0.52f),
            cornerRadius = CornerRadius(6.dp.toPx(), 6.dp.toPx())
        )
        drawRoundRect(
            color = primaryColor,
            topLeft = Offset(w * 0.16f, h * 0.32f),
            size = Size(w * 0.68f, h * 0.52f),
            cornerRadius = CornerRadius(6.dp.toPx(), 6.dp.toPx()),
            style = Stroke(width = 1.8.dp.toPx())
        )

        // Alça superior da mala
        val handlePath = Path().apply {
            moveTo(w * 0.34f, h * 0.32f)
            lineTo(w * 0.34f, h * 0.20f)
            cubicTo(w * 0.34f, h * 0.14f, w * 0.66f, h * 0.14f, w * 0.66f, h * 0.20f)
            lineTo(w * 0.66f, h * 0.32f)
        }
        drawPath(
            path = handlePath,
            color = primaryColor,
            style = Stroke(width = 1.8.dp.toPx())
        )

        // Linha central
        drawLine(
            color = primaryColor.copy(alpha = 0.5f),
            start = Offset(w * 0.16f, h * 0.58f),
            end = Offset(w * 0.84f, h * 0.58f),
            strokeWidth = 1.4.dp.toPx()
        )

        // Rodinhas
        drawCircle(
            color = primaryColor.copy(alpha = 0.5f),
            radius = 2.5.dp.toPx(),
            center = Offset(w * 0.35f, h * 0.88f)
        )
        drawCircle(
            color = primaryColor.copy(alpha = 0.5f),
            radius = 2.5.dp.toPx(),
            center = Offset(w * 0.65f, h * 0.88f)
        )

        // Símbolo NFC interno (ondas)
        drawArc(
            color = primaryColor,
            startAngle = 200f,
            sweepAngle = 140f,
            useCenter = false,
            topLeft = Offset(w * 0.42f, h * 0.42f),
            size = Size(w * 0.16f, h * 0.14f),
            style = Stroke(width = 1.4.dp.toPx())
        )
        drawCircle(
            color = primaryColor,
            radius = 1.2.dp.toPx(),
            center = Offset(w * 0.50f, h * 0.51f)
        )
    }
}

@Composable
fun PassengerBagagensScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToViagens: () -> Unit,
    onNavigateToConta: () -> Unit,
    onNavigateToRegistrarBagagem: () -> Unit = {},
    onNavigateToDetalhe: (String) -> Unit = {}
) {
    val colors = LocalIntegraColors.current
    val scrollState = rememberScrollState()

    // Animação de pulso para o status ativo do NFC
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alphaPulse by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alphaPulse"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg)
    ) {
        // Header alinhado com o padrão ÍNTEGRA
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .padding(start = 20.dp, end = 20.dp, top = 52.dp, bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(colors.surface)
                        .border(1.dp, colors.borderMd, RoundedCornerShape(10.dp))
                        .clickable { onNavigateToHome() },
                    contentAlignment = Alignment.Center
                ) {
                    Text("<", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                }
                Spacer(modifier = Modifier.width(14.dp))
                Text(
                    text = "Minhas Bagagens",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.text1
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(colors.primaryLight)
                    .border(1.dp, colors.primaryMid, RoundedCornerShape(10.dp))
                    .clickable { onNavigateToRegistrarBagagem() }
                    .padding(horizontal = 12.dp, vertical = 7.dp)
            ) {
                Text(
                    text = "+ Despachar",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary
                )
            }
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))

        // Content
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // Banner de informação vinculado
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(colors.primaryLight)
                    .border(1.5.dp, colors.primaryMid, RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("⚡", fontSize = 16.sp, modifier = Modifier.padding(end = 10.dp))
                Column {
                    Text(
                        text = "Suas bagagens",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primary
                    )
                    Text(
                        text = "Vinculadas automaticamente à sua viagem.",
                        fontSize = 12.sp,
                        color = colors.text2
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Card Retangular da Bagagem 01 (Design Reto e Polido)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(4.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.06f))
                    .clip(RoundedCornerShape(12.dp))
                    .background(colors.surface)
                    .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                    .clickable { onNavigateToDetalhe("IN-20481") }
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        SuitcaseVector(
                            primaryColor = colors.primary,
                            lightColor = colors.primaryLight
                        )
                        Spacer(modifier = Modifier.width(14.dp))
                        Column {
                            Text(
                                text = "Bagagem 01",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.text1
                            )
                            Text(
                                text = "ID: IN-20481",
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                color = colors.text2,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100.dp))
                            .background(colors.successLight)
                            .border(1.dp, colors.success, RoundedCornerShape(100.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "✓ Registrada",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.success
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Tabela interna reta e estruturada
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(colors.bg)
                        .border(1.dp, colors.border, RoundedCornerShape(10.dp))
                        .padding(horizontal = 14.dp, vertical = 10.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Viagem", fontSize = 12.sp, color = colors.text2)
                        Text("São Paulo → Rio de Janeiro", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.text1)
                    }
                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Status", fontSize = 12.sp, color = colors.text2)
                        Text("✓ Registrada", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.success)
                    }
                    Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(colors.border))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Identificação NFC", fontSize = 12.sp, color = colors.text2)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(colors.success.copy(alpha = alphaPulse))
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Ativo", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.success)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Esta bagagem será validada junto à sua viagem.",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.primary,
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Ver detalhes", fontSize = 12.sp, color = colors.text2, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("›", fontSize = 14.sp, color = colors.text3, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Card de Adicionar Bagagem com Borda Retangular Pontilhada
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(colors.surface)
                    .border(
                        width = 1.5.dp,
                        color = colors.primaryMid,
                        shape = RoundedCornerShape(12.dp)
                    )
                    .clickable { onNavigateToRegistrarBagagem() }
                    .padding(18.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Start
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(colors.primaryLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("+", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = colors.primary)
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Adicionar bagagem",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                        Text(
                            text = "Registrar nova mala com NFC",
                            fontSize = 12.sp,
                            color = colors.text2,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // Bottom Nav
        PassengerBottomNav(
            currentRoute = "passenger_bagagens",
            onNavigate = { route ->
                when (route) {
                    "passenger_home" -> onNavigateToHome()
                    "passenger_viagens" -> onNavigateToViagens()
                    "passenger_conta" -> onNavigateToConta()
                }
            }
        )
    }
}
