package com.integra.presentation.passenger

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.style.TextAlign
import com.integra.ui.theme.*
import com.integra.presentation.components.PassengerBottomNav

@Composable
fun StatusBadge(label: String, kind: String = "neutral") {
    val (bgColor, textColor) = when (kind) {
        "success" -> Pair(DS_SuccessLight, DS_Success)
        "primary" -> Pair(DS_PrimaryLight, DS_Primary)
        "warning" -> Pair(DS_WarningLight, DS_Warning)
        "error" -> Pair(DS_ErrorLight, DS_Error)
        else -> Pair(DS_Border, DS_Text2)
    }

    Box(
        modifier = Modifier
            .background(bgColor, RoundedCornerShape(100.dp))
            .border(1.dp, textColor, RoundedCornerShape(100.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.2.sp
        )
    }
}

@Composable
fun PassengerHomeScreen(
    onNavigateToDigitalPass: () -> Unit,
    onNavigateToBagagens: () -> Unit,
    onNavigateToConta: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val viewModel = remember { com.integra.presentation.viewmodel.PassengerHomeViewModel(context) }
    val homeState by viewModel.uiState.collectAsState()

    var expanded by remember { mutableStateOf(false) }
    var showSeatMap by remember { mutableStateOf(false) }
    val arrowRotation by animateFloatAsState(if (expanded) 180f else 0f)
    val scrollState = rememberScrollState()

    val activeTicket = when (val state = homeState) {
        is com.integra.presentation.viewmodel.PassengerHomeUiState.Success -> state.activeTicket
        else -> null
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DS_Bg)
        ) {
        // OperatorHeader Placeholder
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(DS_Bg)
                .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "OPERADO POR INTEGRA",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text3,
                letterSpacing = 0.5.sp
            )
        }

        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DS_Surface)
                .padding(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 16.dp)
                .border(1.dp, DS_Border, RoundedCornerShape(bottomStart = 0.dp, bottomEnd = 0.dp)),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .border(1.5.dp, DS_Primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Box(modifier = Modifier.size(14.dp).background(Color.Transparent).border(1.5.dp, DS_Primary, RoundedCornerShape(4.dp)))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(text = "BOM DIA", fontSize = 11.sp, color = DS_Text3, fontWeight = FontWeight.Medium)
                    Text(text = "Olá, Guilherme", fontSize = 17.sp, color = DS_Text1, fontWeight = FontWeight.ExtraBold, letterSpacing = (-0.3).sp)
                }
            }
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        // Content
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(scrollState)
                .padding(horizontal = 16.dp, vertical = 16.dp)
        ) {
            // Próxima viagem badge
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Próxima viagem",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = DS_Text3,
                    letterSpacing = 0.6.sp
                )
                StatusBadge(label = "Pronto para embarque", kind = "success")
            }

            // Expandable Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(12.dp, RoundedCornerShape(20.dp), spotColor = DS_Primary.copy(alpha = 0.2f))
                    .clip(RoundedCornerShape(20.dp))
                    .background(Brush.linearGradient(colors = listOf(Color(0xFF1A0533), DS_Primary)))
                    .border(1.dp, DS_Border.copy(alpha = 0.1f), RoundedCornerShape(20.dp))
                    .clickable { expanded = !expanded }
            ) {
                // Circle detail top right
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .offset(x = 50.dp, y = (-50).dp)
                        .size(160.dp)
                        .background(Color.White.copy(alpha = 0.05f), CircleShape)
                )

                Column(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(18.dp, 20.dp, 18.dp, 16.dp)) {
                        Row(modifier = Modifier.fillMaxWidth().padding(bottom = 14.dp)) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("ORIGEM", fontSize = 10.sp, color = Color.White.copy(alpha = 0.5f), fontWeight = FontWeight.SemiBold)
                                Text(
                                    text = (activeTicket?.departure ?: "SÃO PAULO").uppercase(),
                                    fontSize = 18.sp,
                                    color = Color.White,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                            Column(modifier = Modifier.weight(1f), horizontalAlignment = Alignment.End) {
                                Text("DESTINO", fontSize = 10.sp, color = Color.White.copy(alpha = 0.5f), fontWeight = FontWeight.SemiBold)
                                Text(
                                    text = (activeTicket?.arrival ?: "RIO DE JANEIRO").uppercase(),
                                    fontSize = 18.sp,
                                    color = Color.White,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("DATA", fontSize = 10.sp, color = Color.White.copy(alpha = 0.45f), fontWeight = FontWeight.SemiBold)
                                Text(
                                    text = activeTicket?.tripDate ?: "21 AGO",
                                    fontSize = 15.sp,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Box(modifier = Modifier.width(1.dp).height(28.dp).background(Color.White.copy(alpha = 0.12f)))
                            Column {
                                Text("HORÁRIO", fontSize = 10.sp, color = Color.White.copy(alpha = 0.45f), fontWeight = FontWeight.SemiBold)
                                Text("14:30", fontSize = 15.sp, color = Color.White, fontWeight = FontWeight.Bold)
                            }
                            Box(modifier = Modifier.width(1.dp).height(28.dp).background(Color.White.copy(alpha = 0.12f)))
                            Box(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                                    .clickable { showSeatMap = true }
                            ) {
                                Column {
                                    Text("ASSENTO", fontSize = 10.sp, color = Color.White.copy(alpha = 0.8f), fontWeight = FontWeight.SemiBold)
                                    Text(
                                        text = activeTicket?.seat?.toString() ?: "18",
                                        fontSize = 15.sp,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Text(
                                text = "▼",
                                color = Color.White.copy(alpha = 0.5f),
                                modifier = Modifier.rotate(arrowRotation)
                            )
                        }
                    }

                    AnimatedVisibility(visible = expanded) {
                        Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
                            val items = listOf("Passageiro" to "Guilherme Santos", "Empresa" to "Viação Cometa", "Classe" to "Executivo Leito", "Plataforma" to "Terminal Novo Rio · P4")
                            items.forEachIndexed { index, pair ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 9.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(pair.first, fontSize = 12.sp, color = Color.White.copy(alpha = 0.6f))
                                    Text(pair.second, fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.SemiBold)
                                }
                                if (index < items.size - 1) Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(Color.White.copy(alpha = 0.1f)))
                            }
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 14.dp)
                            .height(50.dp)
                            .clip(RoundedCornerShape(13.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(13.dp))
                            .clickable { onNavigateToDigitalPass() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Ver passagem e embarcar",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(20.dp))

            Text("O que você precisa fazer", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1, modifier = Modifier.padding(start = 4.dp, bottom = 12.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(4.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                    .clip(RoundedCornerShape(12.dp))
                    .background(DS_Surface)
                    .border(1.dp, DS_Border, RoundedCornerShape(12.dp))
            ) {
                // Step 1
                Row(modifier = Modifier.fillMaxWidth().padding(14.dp, 16.dp)) {
                    Text("1.", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DS_Primary, modifier = Modifier.padding(end = 14.dp))
                    Column {
                        Text("Validar passagem", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        Text("Aproxime seu celular do leitor NFC.", fontSize = 12.sp, color = DS_Text2)
                        Box(
                            modifier = Modifier
                                .padding(top = 8.dp)
                                .height(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Brush.linearGradient(colors = listOf(DS_PrimaryDark, DS_Primary)))
                                .clickable { onNavigateToDigitalPass() }
                                .padding(horizontal = 16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Validar agora", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

                // Step 2
                Row(modifier = Modifier.fillMaxWidth().padding(14.dp, 16.dp)) {
                    Text("2.", fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = DS_Primary, modifier = Modifier.padding(end = 14.dp))
                    Column {
                        Text("Bagagem registrada automaticamente", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        Text("Não é necessário fazer nada.", fontSize = 12.sp, color = DS_Text2)
                        Box(
                            modifier = Modifier
                                .padding(top = 6.dp)
                                .background(DS_SuccessLight, RoundedCornerShape(100.dp))
                                .padding(horizontal = 10.dp, vertical = 2.dp)
                        ) {
                            Text("Automático", color = DS_Success, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
        
        PassengerBottomNav(
            currentRoute = "passenger_home",
            onNavigate = { route ->
                when (route) {
                    "passenger_viagens" -> onNavigateToDigitalPass()
                    "passenger_bagagens" -> onNavigateToBagagens()
                    "passenger_conta" -> onNavigateToConta()
                }
            }
        )
    }

    if (showSeatMap) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.6f))
                .clickable { showSeatMap = false },
            contentAlignment = Alignment.BottomCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                    .background(DS_Surface)
                    .padding(20.dp, 24.dp, 20.dp, 40.dp)
                    .clickable(enabled = false) {}, // Intercept click
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Mapa do Ônibus", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                    Text("×", fontSize = 24.sp, color = DS_Text3, modifier = Modifier.clickable { showSeatMap = false }.padding(8.dp))
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DS_Bg, RoundedCornerShape(16.dp))
                        .padding(vertical = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Mockup visual de um ônibus
                    Box(
                        modifier = Modifier
                            .width(120.dp)
                            .height(240.dp)
                            .border(2.dp, DS_BorderMd, RoundedCornerShape(20.dp, 20.dp, 8.dp, 8.dp))
                    ) {
                        Box(modifier = Modifier.padding(10.dp).fillMaxWidth().height(30.dp).background(Color.Black.copy(alpha = 0.05f), RoundedCornerShape(8.dp)))
                        
                        // Assentos genéricos
                        listOf(60, 90, 120, 150, 180).forEach { y ->
                            Box(modifier = Modifier.absoluteOffset(x = 15.dp, y = y.dp).size(24.dp).background(DS_BorderMd, RoundedCornerShape(6.dp)))
                        }
                        
                        // Assento 18
                        Box(
                            modifier = Modifier
                                .absoluteOffset(x = 81.dp, y = 120.dp) // Alinhado à direita
                                .size(24.dp)
                                .background(DS_Primary, RoundedCornerShape(6.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("18", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }

                        Text(
                            text = "FRENTE DO VEÍCULO",
                            color = DS_Text3,
                            fontSize = 10.sp,
                            modifier = Modifier.align(Alignment.BottomCenter).absoluteOffset(y = 20.dp)
                        )
                    }
                }
            }
        }
    }
}
}
