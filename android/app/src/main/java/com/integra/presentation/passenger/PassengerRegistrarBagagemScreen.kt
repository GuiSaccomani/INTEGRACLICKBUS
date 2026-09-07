package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.integra.data.local.SessionManager
import com.integra.presentation.common.UiState
import com.integra.presentation.viewmodel.PassengerLuggageViewModel
import com.integra.ui.theme.LocalIntegraColors
import java.util.UUID

@Composable
fun PassengerRegistrarBagagemScreen(
    onNavigateBack: () -> Unit,
    onNavigateToSucesso: (baggageId: String) -> Unit,
    viewModel: PassengerLuggageViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val sessionManager = remember { SessionManager.getInstance(context) }
    val activeTicket = remember { sessionManager.getCachedActiveTicket() }
    val ticketId = activeTicket?.ticketId ?: "TKT-SP-RJ-1001"

    var selectedType by remember { mutableStateOf("Mala Média (até 23kg)") }
    var descInput by remember { mutableStateOf("Mala de rodinhas com identificador NFC") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val actionState by viewModel.actionState.collectAsState()

    val baggageTypes = listOf(
        "Mala Pequena / Bordo (até 10kg)",
        "Mala Média (até 23kg)",
        "Mala Grande (até 32kg)",
        "Volume Especial / Frágil"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.bg)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(colors.surface)
                .padding(start = 20.dp, end = 20.dp, top = 48.dp, bottom = 16.dp)
                .border(1.dp, colors.border, RoundedCornerShape(bottomStart = 0.dp, bottomEnd = 0.dp)),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.5.dp, colors.borderMd, RoundedCornerShape(12.dp))
                    .background(colors.surface)
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("←", fontSize = 18.sp, color = colors.text1, fontWeight = FontWeight.Bold)
            }

            Text(
                text = "Nova Bagagem",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text1,
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
                        .background(colors.primaryLight, CircleShape)
                        .border(2.dp, colors.primaryMid, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🧳", fontSize = 34.sp)
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Registrar Bagagem",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.text1
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = if (activeTicket != null)
                        "Vinculando à viagem: ${activeTicket.departure} → ${activeTicket.arrival}"
                    else
                        "A bagagem será vinculada à sua passagem com etiqueta digital.",
                    fontSize = 13.sp,
                    color = colors.text2,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Seletor de Tipo
            Text(
                text = "TIPO DE BAGAGEM",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text3,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            baggageTypes.forEach { type ->
                val isSelected = selectedType == type
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) colors.primaryLight else colors.surface)
                        .border(
                            1.5.dp,
                            if (isSelected) colors.primary else colors.borderMd,
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
                        color = if (isSelected) colors.primary else colors.text1
                    )
                    Text(
                        text = if (isSelected) "●" else "○",
                        fontSize = 18.sp,
                        color = if (isSelected) colors.primary else colors.text3
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Descrição / Observações
            Text(
                text = "IDENTIFICAÇÃO VISUAL DA MALA",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = colors.text3,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = descInput,
                onValueChange = { descInput = it },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                placeholder = { Text("Ex: Mala preta com fita vermelha", color = colors.text3, fontSize = 13.sp) },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = colors.surface,
                    unfocusedContainerColor = colors.surface,
                    focusedIndicatorColor = colors.primary,
                    unfocusedIndicatorColor = colors.borderMd,
                    focusedTextColor = colors.text1,
                    unfocusedTextColor = colors.text1
                )
            )

            if (errorMessage != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = errorMessage!!,
                    color = colors.error,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            val isLoading = actionState is UiState.Loading

            // Botão Gerar Etiqueta Digital
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = colors.primary.copy(alpha = 0.3f))
                    .background(colors.primary, RoundedCornerShape(100.dp))
                    .clickable(enabled = !isLoading) {
                        errorMessage = null
                        val newBagId = "BAG-${UUID.randomUUID().toString().take(8).uppercase()}"
                        viewModel.addLuggage(
                            ticketId = ticketId,
                            baggageId = newBagId,
                            onSuccess = {
                                onNavigateToSucesso(newBagId)
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, strokeWidth = 3.dp, modifier = Modifier.size(24.dp))
                } else {
                    Text(
                        text = "Cadastrar e Gerar Etiqueta Digital",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
