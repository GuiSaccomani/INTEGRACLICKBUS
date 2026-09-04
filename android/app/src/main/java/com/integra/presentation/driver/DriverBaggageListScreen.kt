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

data class Baggage(val id: String, val owner: String, val status: String)

@Composable
fun DriverBaggageListScreen(
    onNavigateBack: () -> Unit
) {
    val baggages = listOf(
        Baggage("TAG-7654", "Marcos Oliveira", "Embarcada"),
        Baggage("TAG-3421", "João Silva", "Aguardando"),
        Baggage("TAG-8822", "Ana Costa", "Pendente")
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
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Lista de Bagagens", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(16.dp, 20.dp, 16.dp, 30.dp)
        ) {
            baggages.forEach { b ->
                val isOk = b.status == "Embarcada"

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .shadow(2.dp, RoundedCornerShape(12.dp), spotColor = Color.Black.copy(alpha = 0.05f))
                        .clip(RoundedCornerShape(12.dp))
                        .background(DS_Surface)
                        .border(1.dp, if (isOk) DS_Success else DS_Border, RoundedCornerShape(12.dp))
                        .padding(16.dp)
                ) {
                    Text(
                        text = b.id,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DS_Text1,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                    
                    Text(
                        text = "Dono: ${b.owner}",
                        fontSize = 14.sp,
                        color = DS_Text2,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(if (isOk) DS_Success else DS_Text3)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = b.status,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isOk) DS_Success else DS_Text2
                        )
                    }
                }
            }
        }
    }
}
