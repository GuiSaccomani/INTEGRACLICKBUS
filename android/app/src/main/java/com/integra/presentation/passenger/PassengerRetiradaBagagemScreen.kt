package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
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
import com.integra.util.FeedbackManager

@Composable
fun PassengerRetiradaBagagemScreen(
    baggageId: String = "IN-20481",
    onNavigateBack: () -> Unit,
    onNavigateToBagagens: () -> Unit,
    viewModel: PassengerLuggageViewModel = viewModel()
) {
    val colors = LocalIntegraColors.current
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val activeTicket = remember { sessionManager.getCachedActiveTicket() }
    val ticketId = activeTicket?.ticketId ?: "TKT-SP-RJ-1001"

    val actionState by viewModel.actionState.collectAsState()
    var isConfirmed by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.surface)
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
                text = "Retirada de Bagagem",
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
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .shadow(12.dp, CircleShape, ambientColor = if (isConfirmed) colors.success.copy(alpha = 0.4f) else colors.primary.copy(alpha = 0.2f))
                    .background(
                        if (isConfirmed) colors.success else colors.primaryLight,
                        CircleShape
                    )
                    .border(2.dp, if (isConfirmed) colors.success else colors.primary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isConfirmed) "✓" else "🧳",
                    fontSize = if (isConfirmed) 42.sp else 40.sp,
                    color = if (isConfirmed) Color.White else colors.primary,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = if (isConfirmed) "Bagagem Entregue com Sucesso!" else "Conferir Retirada no Desembarque",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = colors.text1,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (isConfirmed)
                    "A devolução da bagagem $baggageId foi confirmada e o ciclo da viagem foi concluído com segurança."
                else
                    "Apresente seu bilhete ao motorista na retirada da bagagem para confirmar a titularidade e dar baixa.",
                fontSize = 14.sp,
                color = colors.text2,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(36.dp))

            val isLoading = actionState is UiState.Loading

            if (!isConfirmed) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = colors.primary.copy(alpha = 0.3f))
                        .background(colors.primary, RoundedCornerShape(100.dp))
                        .clickable(enabled = !isLoading) {
                            viewModel.deleteLuggage(
                                baggageId = baggageId,
                                ticketId = ticketId,
                                onSuccess = {
                                    isConfirmed = true
                                    FeedbackManager.vibrateSuccess(context)
                                    FeedbackManager.playBeepSuccess()
                                }
                            )
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = Color.White, strokeWidth = 3.dp, modifier = Modifier.size(24.dp))
                    } else {
                        Text(
                            text = "Confirmar Devolução da Bagagem",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(10.dp, RoundedCornerShape(100.dp), ambientColor = colors.success.copy(alpha = 0.3f))
                        .background(colors.success, RoundedCornerShape(100.dp))
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
