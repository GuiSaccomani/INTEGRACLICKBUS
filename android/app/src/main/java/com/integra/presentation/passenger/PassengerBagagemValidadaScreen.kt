package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun PassengerBagagemValidadaScreen(
    baggageId: String = "BAG-SP-4022-01",
    onNavigateBack: () -> Unit,
    onNavigateToBagagens: () -> Unit
) {
    val scrollState = rememberScrollState()

    val nodes = listOf(
        Triple("Passageiro", "Guilherme Santos", "👤"),
        Triple("Viagem", "SP → RJ · 21 AGO · 14:30", "🚌"),
        Triple("Bagagem", "$baggageId · Bagagem 01", "🧳")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Surface)
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
                text = "Conferência de Bagagem",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text1,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )

            Spacer(modifier = Modifier.size(40.dp))
        }

        // Body
        Column(
            modifier = Modifier
                .fillMaxSize()
                .weight(1f)
                .verticalScroll(scrollState)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Status Badge
            Row(
                modifier = Modifier
                    .background(DS_SuccessLight, RoundedCornerShape(14.dp))
                    .border(1.5.dp, DS_SuccessMid, RoundedCornerShape(14.dp))
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("✓", color = DS_Success, fontSize = 16.sp, fontWeight = FontWeight.Black)
                Text(
                    text = "Bagagem Identificada",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DS_Success
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Correspondência confirmada. Esta bagagem pertence a esta viagem.",
                fontSize = 14.sp,
                color = DS_Text2,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Node Cards com Linhas Conectoras
            nodes.forEachIndexed { index, (label, value, icon) ->
                val isBaggage = index == 2
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(if (isBaggage) 6.dp else 1.dp, RoundedCornerShape(14.dp), ambientColor = Color(0x10000000))
                        .background(DS_Bg, RoundedCornerShape(14.dp))
                        .border(
                            1.5.dp,
                            if (isBaggage) DS_SuccessMid else DS_Border,
                            RoundedCornerShape(14.dp)
                        )
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(if (isBaggage) DS_SuccessLight else DS_PrimaryLight, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(icon, fontSize = 20.sp)
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = label,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Text3,
                            letterSpacing = 0.4.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = value,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Text1
                        )
                    }

                    Text("✓", color = if (isBaggage) DS_Success else DS_Text3, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                if (index < nodes.size - 1) {
                    Box(
                        modifier = Modifier
                            .width(2.dp)
                            .height(20.dp)
                            .background(DS_PrimaryMid)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Botão Concluir
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x307B2CBF))
                    .background(
                        androidx.compose.ui.graphics.Brush.linearGradient(
                            listOf(DS_PrimaryDark, DS_Primary)
                        ),
                        RoundedCornerShape(100.dp)
                    )
                    .clickable { onNavigateToBagagens() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Acompanhar no Bagageiro",
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
