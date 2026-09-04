package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

data class TimelineStep(val label: String, val sub: String, val done: Boolean)

@Composable
fun PassengerBagagemDetalheScreen(
    baggageId: String = "IN-20481",
    onNavigateBack: () -> Unit,
    onNavigateToRetirada: () -> Unit
) {
    val scrollState = rememberScrollState()

    val timeline = listOf(
        TimelineStep("Registrada", "Bagagem identificada no sistema", true),
        TimelineStep("Vinculada à viagem", "SP → RJ · 21 AGO · 14:30", true),
        TimelineStep("Em trânsito", "Alocada no bagageiro do ônibus", false),
        TimelineStep("Retirada", "Confirmação de entrega no destino", false)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Bg)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DS_Surface)
                .padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 16.dp)
                .border(1.dp, DS_Border, RoundedCornerShape(bottomStart = 0.dp, bottomEnd = 0.dp)),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.5.dp, DS_BorderMd, RoundedCornerShape(12.dp))
                    .background(DS_Surface)
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("←", fontSize = 18.sp, color = DS_Text1, fontWeight = FontWeight.Bold)
            }

            Text(
                text = "Detalhe da Bagagem",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text1,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )

            Spacer(modifier = Modifier.size(40.dp))
        }

        // Scrollable Body
        Column(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .verticalScroll(scrollState)
                .padding(16.dp)
        ) {
            // Card Ilustração da Mala
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Surface, RoundedCornerShape(16.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(DS_PrimaryLight, RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🧳", fontSize = 42.sp)
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(modifier = Modifier.size(8.dp).background(DS_Success, CircleShape))
                    Text(
                        text = "Etiqueta Digital Ativa",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = DS_Success
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Card Informações
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Surface, RoundedCornerShape(16.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(16.dp))
                    .padding(horizontal = 16.dp)
            ) {
                val rows = listOf(
                    Pair("ID da bagagem", baggageId),
                    Pair("Viagem vinculada", "São Paulo → Rio de Janeiro"),
                    Pair("Data da viagem", "21 AGO · 14:30"),
                    Pair("Status", "✓ Registrada no Bagageiro"),
                    Pair("Tipo", "Mala Média (18kg)")
                )

                rows.forEachIndexed { i, (label, value) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 13.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(label, fontSize = 13.sp, color = DS_Text2)
                        Text(
                            text = value,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (value.startsWith("✓")) DS_Success else DS_Text1
                        )
                    }
                    if (i < rows.size - 1) {
                        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Card Proteção Digital
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Surface, RoundedCornerShape(14.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .background(DS_PrimaryLight, RoundedCornerShape(10.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🛡️", fontSize = 18.sp)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text("Bagagem Rastreada e Segura", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                    Text("Identificação vinculada ao bilhete oficial", fontSize = 11.sp, color = DS_Text2)
                }
                Box(
                    modifier = Modifier
                        .background(DS_SuccessLight, RoundedCornerShape(100.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text("Protegida", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = DS_Success)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Timeline da Jornada
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Surface, RoundedCornerShape(16.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = "JORNADA DA BAGAGEM",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = DS_Text3,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                timeline.forEachIndexed { index, step ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .background(if (step.done) DS_Primary else DS_Surface, CircleShape)
                                    .border(2.dp, if (step.done) DS_Primary else DS_BorderMd, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                if (step.done) {
                                    Text("✓", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                } else {
                                    Box(modifier = Modifier.size(8.dp).background(DS_BorderMd, CircleShape))
                                }
                            }
                            if (index < timeline.size - 1) {
                                Box(
                                    modifier = Modifier
                                        .width(2.dp)
                                        .height(28.dp)
                                        .background(if (step.done) DS_Primary else DS_Border)
                                )
                            }
                        }

                        Column(modifier = Modifier.padding(top = 2.dp)) {
                            Text(
                                text = step.label,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (step.done) DS_Text1 else DS_Text3
                            )
                            Text(
                                text = (if (step.done) "✓ " else "○ ") + step.sub,
                                fontSize = 11.sp,
                                color = if (step.done) DS_Primary else DS_Text3
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Botão Retirar Bagagem
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x307B2CBF))
                .background(
                    Brush.linearGradient(listOf(DS_PrimaryDark, DS_Primary)),
                    RoundedCornerShape(100.dp)
                )
                .clickable { onNavigateToRetirada() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Confirmar Retirada de Bagagem",
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
