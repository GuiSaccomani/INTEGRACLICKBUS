package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

data class TripHistoryItem(
    val id: Int,
    val from: String,
    val to: String,
    val date: String,
    val time: String,
    val status: String,
    val isSuccess: Boolean
)

private val TRIPS_LIST = listOf(
    TripHistoryItem(1, "São Paulo", "Rio de Janeiro", "21 AGO 2025", "14:30", "Pronta para embarque", true),
    TripHistoryItem(2, "São Paulo", "Campinas", "12 AGO 2025", "09:00", "Concluída", false),
    TripHistoryItem(3, "Campinas", "Rio de Janeiro", "28 JUL 2025", "16:30", "Concluída", false),
    TripHistoryItem(4, "Rio de Janeiro", "São Paulo", "15 JUL 2025", "08:45", "Concluída", false),
    TripHistoryItem(5, "São Paulo", "Ribeirão Preto", "02 JUN 2025", "11:00", "Concluída", false)
)

@Composable
fun PassengerHistoricoScreen(
    onNavigateBack: () -> Unit
) {
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
                .padding(start = 16.dp, end = 16.dp, top = 50.dp, bottom = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(DS_Bg)
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "←",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = DS_Text1
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Histórico de viagens",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text1
            )
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        // Body
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Chips de resumo
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp, start = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100.dp))
                            .background(DS_PrimaryLight)
                            .border(1.dp, DS_BorderMd, RoundedCornerShape(100.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "5 viagens",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Primary
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100.dp))
                            .background(DS_Surface)
                            .border(1.dp, DS_BorderMd, RoundedCornerShape(100.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = "2025",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Text2
                        )
                    }
                }
            }

            // Lista de viagens
            itemsIndexed(TRIPS_LIST) { index, trip ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 10.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(DS_Surface)
                        .border(1.dp, DS_Border, RoundedCornerShape(16.dp))
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Ícone da rota
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(13.dp))
                            .background(if (index == 0) DS_PrimaryLight else DS_Bg),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🚌",
                            fontSize = 18.sp
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    // Detalhes da rota
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = trip.from,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text1,
                                letterSpacing = (-0.2).sp
                            )
                            Text(
                                text = " → ",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text3
                            )
                            Text(
                                text = trip.to,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text1,
                                letterSpacing = (-0.2).sp
                            )
                        }
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = "${trip.date} · ${trip.time}",
                            fontSize = 12.sp,
                            color = DS_Text2
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Badge de status
                    val badgeBg = if (trip.isSuccess) Color(0xFFD1FAE5) else DS_Bg
                    val badgeColor = if (trip.isSuccess) Color(0xFF065F46) else DS_Text2
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100.dp))
                            .background(badgeBg)
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = trip.status,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = badgeColor
                        )
                    }
                }
            }
        }
    }
}
