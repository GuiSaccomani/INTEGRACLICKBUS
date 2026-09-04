package com.integra.presentation.passenger

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*
import com.integra.presentation.components.PassengerBottomNav

@Composable
fun DigitalBoardingPassScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToBagagens: () -> Unit,
    onNavigateToConta: () -> Unit,
    onNavigateToNfc: () -> Unit,
    onNavigateToQrCode: () -> Unit = {},
    onNavigateToValidada: () -> Unit = {}
) {
    var flipped by remember { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (flipped) 180f else 0f,
        animationSpec = tween(durationMillis = 600)
    )
    val scrollState = rememberScrollState()

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
                    .clickable { onNavigateToHome() },
                contentAlignment = Alignment.Center
            ) {
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Minha Passagem", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // Security Badge
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("✓ Credencial protegida · Validação segura", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DS_Success)
            }

            // Flip Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(328.dp)
                    .padding(bottom = 16.dp)
                    .graphicsLayer {
                        rotationY = rotation
                        cameraDistance = 12f * density
                    }
            ) {
                if (rotation <= 90f) {
                    // FRONT
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .shadow(8.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.1f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(DS_Surface)
                            .border(1.dp, DS_Border, RoundedCornerShape(12.dp))
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .padding(24.dp, 20.dp, 20.dp, 22.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column {
                                    Text("PASSAGEIRO", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                                    Text("Guilherme Santos", fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
                                }
                                StatusBadge("Pronto", "success")
                            }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("ORIGEM", fontSize = 10.sp, color = DS_Text3)
                                    Text("SP", fontSize = 24.sp, fontWeight = FontWeight.Black, color = DS_Text1)
                                    Text("São Paulo", fontSize = 11.sp, color = DS_Text2)
                                }
                                Text("~5h30", fontSize = 9.sp, color = DS_Text3)
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("DESTINO", fontSize = 10.sp, color = DS_Text3)
                                    Text("RJ", fontSize = 24.sp, fontWeight = FontWeight.Black, color = DS_Text1)
                                    Text("Rio de Janeiro", fontSize = 11.sp, color = DS_Text2)
                                }
                            }
                        }
                        // Dashed separator simulation (Solid for simplicity)
                        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))
                        Column(
                            modifier = Modifier
                                .background(DS_Bg)
                                .padding(14.dp, 20.dp, 16.dp, 20.dp)
                        ) {
                            Row(modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("DATA", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                                    Text("21 AGO", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("HORÁRIO", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                                    Text("14:30", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("ASSENTO", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                                    Text("18", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
                                }
                            }
                        }
                    }
                } else {
                    // BACK (QR Code placeholder)
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .shadow(8.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.1f))
                            .clip(RoundedCornerShape(12.dp))
                            .background(DS_Surface)
                            .border(1.dp, DS_Border, RoundedCornerShape(12.dp))
                            .padding(20.dp)
                            .graphicsLayer { rotationY = 180f },
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text("QR Code alternativo", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        Text("Use se NFC não estiver disponível", fontSize = 11.sp, color = DS_Text3, modifier = Modifier.padding(bottom = 14.dp))
                        Box(
                            modifier = Modifier
                                .size(160.dp)
                                .background(Color.White)
                                .padding(8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Canvas(modifier = Modifier.fillMaxSize()) {
                                val squareSize = size.width / 8
                                for (i in 0 until 8) {
                                    for (j in 0 until 8) {
                                        // Randomly draw squares to fake a QR code, but keep the corners
                                        val isCorner = (i < 3 && j < 3) || (i > 4 && j < 3) || (i < 3 && j > 4)
                                        if (isCorner || (i * j + i + j) % 3 == 0) {
                                            drawRect(
                                                color = Color.Black,
                                                topLeft = Offset(i * squareSize, j * squareSize),
                                                size = Size(squareSize - 1, squareSize - 1)
                                            )
                                        }
                                    }
                                }
                                // Draw corner markers
                                drawRect(Color.White, topLeft = Offset(squareSize, squareSize), size = Size(squareSize, squareSize))
                                drawRect(Color.White, topLeft = Offset(size.width - 2 * squareSize, squareSize), size = Size(squareSize, squareSize))
                                drawRect(Color.White, topLeft = Offset(squareSize, size.height - 2 * squareSize), size = Size(squareSize, squareSize))
                                drawRect(Color.Black, topLeft = Offset(squareSize + 2, squareSize + 2), size = Size(squareSize - 4, squareSize - 4))
                                drawRect(Color.Black, topLeft = Offset(size.width - 2 * squareSize + 2, squareSize + 2), size = Size(squareSize - 4, squareSize - 4))
                                drawRect(Color.Black, topLeft = Offset(squareSize + 2, size.height - 2 * squareSize + 2), size = Size(squareSize - 4, squareSize - 4))
                            }
                        }
                    }
                }
            }

            // Actions
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Surface)
                    .border(1.dp, DS_Border, RoundedCornerShape(12.dp))
                    .padding(18.dp)
                    .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.05f))
            ) {
                Text("PRÓXIMO PASSO", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = DS_Primary)
                Text("Aproxime seu celular do celular do motorista.", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = DS_Text1, modifier = Modifier.padding(bottom = 14.dp))
                
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 14.dp)) {
                    Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(DS_Success))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("NFC disponível", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = DS_Success)
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(DS_Primary)
                        .clickable { onNavigateToNfc() },
                    contentAlignment = Alignment.Center
                ) {
                    Text("Embarcar com NFC", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                Column(
                    modifier = Modifier.fillMaxWidth().padding(top = 18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Não consegue usar NFC?", fontSize = 13.sp, color = DS_Text2, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text(
                            if (flipped) "Girar Cartão" else "Mostrar QR Code",
                            color = DS_Text1,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { flipped = !flipped }.padding(4.dp)
                        )
                        Text(
                            "QR Tela Cheia",
                            color = DS_Primary,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigateToQrCode() }.padding(4.dp)
                        )
                        Text(
                            "Comprovante",
                            color = DS_Success,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigateToValidada() }.padding(4.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Timeline
            Text(
                text = "Sua jornada",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = DS_Text1,
                modifier = Modifier.padding(bottom = 20.dp, start = 4.dp)
            )

            val steps = listOf(
                Pair("Compra aprovada", "Pago via Cartão de Crédito final 4321"),
                Pair("Check-in concluído", "Assento 18 confirmado"),
                Pair("Pronto para embarque", "Aguarde a chamada no terminal"),
                Pair("Bagagem despachada", null)
            )

            steps.forEachIndexed { index, step ->
                val isLast = index == steps.size - 1
                val isCompleted = index < 2
                val isCurrent = index == 2

                Row(modifier = Modifier.fillMaxWidth().padding(start = 4.dp)) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(20.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(
                                    when {
                                        isCompleted -> DS_Success
                                        isCurrent -> DS_Primary
                                        else -> DS_BorderMd
                                    }
                                )
                        )
                        if (!isLast) {
                            Box(
                                modifier = Modifier
                                    .width(2.dp)
                                    .height(if (step.second == null) 30.dp else 46.dp)
                                    .background(if (isCompleted) DS_Success else DS_BorderMd)
                            )
                        }
                    }
                    Column(modifier = Modifier.padding(start = 16.dp).offset(y = (-2).dp)) {
                        Text(
                            text = step.first,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isCompleted || isCurrent) DS_Text1 else DS_Text3
                        )
                        if (step.second != null) {
                            Text(
                                text = step.second!!,
                                fontSize = 13.sp,
                                color = DS_Text2,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                        if (!isLast) Spacer(modifier = Modifier.height(24.dp))
                    }
                }
            }
            Spacer(modifier = Modifier.height(40.dp))
        }
        
        PassengerBottomNav(
            currentRoute = "passenger_viagens",
            onNavigate = { route ->
                when (route) {
                    "passenger_home" -> onNavigateToHome()
                    "passenger_bagagens" -> onNavigateToBagagens()
                    "passenger_conta" -> onNavigateToConta()
                }
            }
        )
    }
}
