package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
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
fun PassengerRegistrarBagagemScreen(
    onNavigateBack: () -> Unit,
    onNavigateToSucesso: (baggageId: String) -> Unit
) {
    val scrollState = rememberScrollState()
    var selectedType by remember { mutableStateOf("Mala Média (até 23kg)") }
    var descInput by remember { mutableStateOf("Mala de rodinhas preta com fita vermelha") }
    var isSubmitting by remember { mutableStateOf(false) }

    val baggageTypes = listOf(
        "Mala Pequena / Bordo (até 10kg)",
        "Mala Média (até 23kg)",
        "Mala Grande (até 32kg)",
        "Volume Especial / Frágil"
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
                text = "Nova Bagagem",
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
                .padding(20.dp)
        ) {
            // Icon central e título
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .background(DS_PrimaryLight, CircleShape)
                        .border(2.dp, DS_PrimaryMid, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🧳", fontSize = 34.sp)
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Registrar Bagagem",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DS_Text1
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "A bagagem será vinculada à sua passagem com etiqueta digital.",
                    fontSize = 13.sp,
                    color = DS_Text2,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Card da Viagem Vinculada
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DS_Surface, RoundedCornerShape(16.dp))
                    .border(1.dp, DS_Border, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = "VINCULADA À VIAGEM",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = DS_Text3,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("🚌", fontSize = 16.sp)
                    Text(
                        text = "São Paulo → Rio de Janeiro",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = DS_Text1
                    )
                }
                Text(
                    text = "Poltrona 18 · Executivo · Partida 14:30",
                    fontSize = 12.sp,
                    color = DS_Text2,
                    modifier = Modifier.padding(start = 24.dp, top = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Seletor de Tipo
            Text(
                text = "TIPO DE BAGAGEM",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text3,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            baggageTypes.forEach { type ->
                val isSelected = selectedType == type
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) DS_PrimaryLight else DS_Surface)
                        .border(
                            1.5.dp,
                            if (isSelected) DS_Primary else DS_BorderMd,
                            RoundedCornerShape(12.dp)
                        )
                        .clickable { selectedType = type }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = type,
                        fontSize = 14.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) DS_Primary else DS_Text1
                    )
                    Text(
                        text = if (isSelected) "●" else "○",
                        fontSize = 18.sp,
                        color = if (isSelected) DS_Primary else DS_Text3
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Descrição / Observações
            Text(
                text = "IDENTIFICAÇÃO VISUAL DA MALA",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text3,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = descInput,
                onValueChange = { descInput = it },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                placeholder = { Text("Ex: Mala preta Samsonite com fita vermelha", color = DS_Text3, fontSize = 13.sp) },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = DS_Surface,
                    unfocusedContainerColor = DS_Surface,
                    focusedIndicatorColor = DS_Primary,
                    unfocusedIndicatorColor = DS_BorderMd,
                    focusedTextColor = DS_Text1,
                    unfocusedTextColor = DS_Text1
                )
            )

            Spacer(modifier = Modifier.height(28.dp))

            // Botão Gerar Etiqueta Digital
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = Color(0x307B2CBF))
                    .background(
                        Brush.linearGradient(listOf(DS_PrimaryDark, DS_Primary)),
                        RoundedCornerShape(100.dp)
                    )
                    .clickable {
                        isSubmitting = true
                        onNavigateToSucesso("BAG-SP-4022-01")
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isSubmitting) "Gerando Etiqueta..." else "Cadastrar e Gerar Etiqueta Digital",
                    color = Color.White,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
