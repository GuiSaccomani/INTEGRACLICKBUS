package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

data class NotificationItem(
    val id: Int,
    val title: String,
    val desc: String,
    val time: String,
    val isNew: Boolean
)

private val NOTIFICATIONS_LIST = listOf(
    NotificationItem(
        id = 1,
        title = "Embarque Iniciado",
        desc = "O embarque para a sua viagem para o Rio de Janeiro acaba de começar. Dirija-se à plataforma.",
        time = "Agora mesmo",
        isNew = true
    ),
    NotificationItem(
        id = 2,
        title = "Troca de Plataforma",
        desc = "Atenção: A plataforma da sua viagem foi alterada para a Plataforma P4.",
        time = "Há 15 min",
        isNew = true
    ),
    NotificationItem(
        id = 3,
        title = "Bem-vindo ao Íntegra",
        desc = "Seu cadastro foi realizado com sucesso. Prepare-se para embarcar via NFC.",
        time = "Ontem",
        isNew = false
    )
)

@Composable
fun PassengerNotificacoesScreen(
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
                text = "Notificações",
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
            items(NOTIFICATIONS_LIST) { item ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(DS_Surface)
                        .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                        .padding(16.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Text(
                                text = item.title,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text1,
                                modifier = Modifier.weight(1f).padding(end = 8.dp)
                            )
                            if (item.isNew) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(DS_Primary)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = item.desc,
                            fontSize = 13.sp,
                            color = DS_Text2,
                            lineHeight = 18.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = item.time,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = DS_Text3
                        )
                    }
                }
            }
        }
    }
}
