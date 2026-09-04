package com.integra.presentation.driver

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun DriverHistoryScreen(
    onNavigateBack: () -> Unit
) {
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
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Resumo da Viagem", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(16.dp, 20.dp, 16.dp, 30.dp)
        ) {
            // Stats Card
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp)
                    .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                    .clip(RoundedCornerShape(16.dp))
                    .background(DS_Surface)
                    .padding(20.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("TOTAL", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                    Text("42", fontSize = 28.sp, fontWeight = FontWeight.Black, color = DS_Text1)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("EMBARCADOS", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                    Text("38", fontSize = 28.sp, fontWeight = FontWeight.Black, color = DS_Success)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("FALTAM", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = DS_Text3)
                    Text("4", fontSize = 28.sp, fontWeight = FontWeight.Black, color = DS_Error)
                }
            }

            Text("Últimos Embarques", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1, modifier = Modifier.padding(bottom = 16.dp))

            val history = listOf(
                Pair("Marcos Oliveira", "14:28 - Poltrona 12"),
                Pair("Ana Costa", "14:27 - Poltrona 14"),
                Pair("João Silva", "14:25 - Poltrona 18")
            )

            history.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(DS_Surface)
                        .border(1.dp, DS_Border, RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(DS_Success))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(item.first, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        Text(item.second, fontSize = 13.sp, color = DS_Text2)
                    }
                }
            }
        }
    }
}
