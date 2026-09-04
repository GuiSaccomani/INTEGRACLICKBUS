package com.integra.presentation.passenger

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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun PassengerRetiradaBagagemScreen(
    onNavigateBack: () -> Unit,
    onNavigateToBagagens: () -> Unit
) {
    var isConfirmed by remember { mutableStateOf(false) }

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
                text = "Retirada de Bagagem",
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
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .shadow(12.dp, CircleShape, ambientColor = if (isConfirmed) DS_Success.copy(alpha = 0.4f) else DS_Primary.copy(alpha = 0.2f))
                    .background(
                        if (isConfirmed) Brush.linearGradient(listOf(DS_Success, Color(0xFF15803D)))
                        else Brush.linearGradient(listOf(DS_PrimaryLight, DS_PrimaryMid)),
                        CircleShape
                    )
                    .border(2.dp, if (isConfirmed) DS_Success else DS_Primary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isConfirmed) "✓" else "🧳",
                    fontSize = if (isConfirmed) 42.sp else 40.sp,
                    color = if (isConfirmed) Color.White else DS_Primary,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = if (isConfirmed) "Bagagem Entregue com Sucesso!" else "Conferir Retirada no Desembarque",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = DS_Text1,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (isConfirmed)
                    "A devolução da bagagem IN-20481 foi confirmada e o ciclo da viagem foi concluído com segurança."
                else
                    "Apresente seu bilhete ao motorista na retirada da bagagem para confirmar a titularidade.",
                fontSize = 14.sp,
                color = DS_Text2,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(36.dp))

            if (!isConfirmed) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x307B2CBF))
                        .background(
                            Brush.linearGradient(listOf(DS_PrimaryDark, DS_Primary)),
                            RoundedCornerShape(100.dp)
                        )
                        .clickable { isConfirmed = true },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Confirmar Devolução da Bagagem",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x30059669))
                        .background(
                            Brush.linearGradient(listOf(DS_Success, Color(0xFF047857))),
                            RoundedCornerShape(100.dp)
                        )
                        .clickable { onNavigateToBagagens() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Voltar para Minhas Bagagens",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
