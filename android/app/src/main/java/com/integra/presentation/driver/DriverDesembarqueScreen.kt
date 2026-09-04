package com.integra.presentation.driver

import android.app.Activity
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.presentation.viewmodel.DriverDesembarqueUiState
import com.integra.presentation.viewmodel.DriverDesembarqueViewModel
import com.integra.ui.theme.*

@Composable
fun DriverDesembarqueScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val viewModel = remember { DriverDesembarqueViewModel() }
    val uiState by viewModel.uiState.collectAsState()

    var manualIdInput by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()

    DisposableEffect(activity) {
        if (activity != null) {
            viewModel.initializeNfc(activity)
        }
        onDispose {
            viewModel.resetState()
        }
    }

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
                text = "Desembarque de Bagagem",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text1
            )
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        // Content
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .verticalScroll(scrollState),
            contentAlignment = Alignment.Center
        ) {
            when (val state = uiState) {
                is DriverDesembarqueUiState.Idle -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(DS_PrimaryLight)
                                .border(2.dp, DS_PrimaryMid, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🧳", fontSize = 32.sp)
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "Identificar Bagagem para Entrega",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = DS_Text1,
                            letterSpacing = (-0.4).sp
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Aproxime o celular da tag NFC da mala ou digite o código da etiqueta.",
                            fontSize = 13.sp,
                            color = DS_Text2,
                            lineHeight = 18.sp,
                            modifier = Modifier.padding(horizontal = 16.dp),
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(28.dp))

                        // Botão Leitura Real de Tag NFC
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Primary)
                                .clickable {
                                    viewModel.startReadingTag()
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Ler Tag NFC da Mala",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Busca manual
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Bg)
                                .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "BUSCAR POR CÓDIGO MANUAL",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text3,
                                letterSpacing = 0.6.sp
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(modifier = Modifier.fillMaxWidth()) {
                                OutlinedTextField(
                                    value = manualIdInput,
                                    onValueChange = { manualIdInput = it },
                                    placeholder = { Text("ID da Bagagem (64 hex)", fontSize = 13.sp, color = DS_Text3) },
                                    modifier = Modifier.weight(1f).height(50.dp),
                                    singleLine = true,
                                    shape = RoundedCornerShape(10.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = DS_Primary,
                                        unfocusedBorderColor = DS_BorderMd,
                                        focusedContainerColor = DS_Surface,
                                        unfocusedContainerColor = DS_Surface
                                    )
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .height(50.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(DS_Primary)
                                        .clickable {
                                            if (manualIdInput.isNotBlank()) {
                                                viewModel.fetchBaggageDetails(manualIdInput)
                                            }
                                        }
                                        .padding(horizontal = 16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "Buscar",
                                        color = Color.White,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                is DriverDesembarqueUiState.ReadingTag -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = DS_Primary, strokeWidth = 4.dp, modifier = Modifier.size(56.dp))
                        Spacer(modifier = Modifier.height(20.dp))
                        Text("Aproxime da Mala", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        Text("Lendo os dados gravados na tag física NDEF...", fontSize = 13.sp, color = DS_Text2, modifier = Modifier.padding(top = 6.dp))
                        Spacer(modifier = Modifier.height(24.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(DS_Bg)
                                .clickable { viewModel.resetState() }
                                .padding(horizontal = 20.dp, vertical = 10.dp)
                        ) {
                            Text("Cancelar Leitura", color = DS_Text2, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                is DriverDesembarqueUiState.LoadingDetails,
                is DriverDesembarqueUiState.ReleasingInBackend,
                is DriverDesembarqueUiState.ClearingPhysicalTag -> {
                    val label = when (state) {
                        is DriverDesembarqueUiState.LoadingDetails -> "Consultando Bagagem na API..."
                        is DriverDesembarqueUiState.ReleasingInBackend -> "Desvinculando no Oracle..."
                        else -> "Aproxime da tag física para limpar..."
                    }
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = DS_Primary, strokeWidth = 4.dp, modifier = Modifier.size(54.dp))
                        Spacer(modifier = Modifier.height(20.dp))
                        Text(label, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                    }
                }

                is DriverDesembarqueUiState.ConfirmDelivery -> {
                    val luggage = state.luggage
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Conferir Bagagem do Passageiro", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Confirme os dados antes de entregar a mala ao passageiro.", fontSize = 13.sp, color = DS_Text2)
                        Spacer(modifier = Modifier.height(20.dp))

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Surface)
                                .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                                .padding(18.dp)
                        ) {
                            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Passageiro:", fontSize = 13.sp, color = DS_Text2)
                                Text(luggage.passengerName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                            }
                            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Poltrona:", fontSize = 13.sp, color = DS_Text2)
                                Text("${luggage.seat}", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = DS_Primary)
                            }
                            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Itinerário:", fontSize = 13.sp, color = DS_Text2)
                                Text("${luggage.departure} → ${luggage.arrival}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = DS_Text1)
                            }
                            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("ID Bagagem:", fontSize = 13.sp, color = DS_Text2)
                                Text(luggage.baggageId.take(16) + "...", fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace, color = DS_Text2)
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Primary)
                                .clickable {
                                    viewModel.confirmDeliveryAndClearTag()
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Confirmar Entrega e Liberar Tag", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Bg)
                                .clickable { viewModel.resetState() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Cancelar", color = DS_Text2, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                is DriverDesembarqueUiState.Success -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(CircleShape)
                                .background(DS_Success),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "✓", fontSize = 42.sp, color = Color.White, fontWeight = FontWeight.ExtraBold)
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        Text(
                            text = "DESEMBARQUE CONFIRMADO",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = DS_Success,
                            letterSpacing = (-0.3).sp
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Associação de bagagem encerrada com sucesso no sistema.",
                            fontSize = 13.sp,
                            color = DS_Text2,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color(0xFFE8F5E9))
                                .border(1.dp, DS_Success, RoundedCornerShape(14.dp))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = if (state.physicalTagCleaned) "✓ Tag Física Limpa e Reutilizável" else "⚠️ Tag Limpa no Sistema",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Success
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "A associação foi finalizada no Oracle e a tag está pronta para o próximo passageiro.",
                                fontSize = 12.sp,
                                color = DS_Text1,
                                lineHeight = 17.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Primary)
                                .clickable {
                                    viewModel.resetState()
                                    manualIdInput = ""
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Entregar Outra Bagagem", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Bg)
                                .clickable { onNavigateBack() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Voltar ao Início", color = DS_Text1, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                is DriverDesembarqueUiState.Error -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(DS_Error),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "✕", fontSize = 36.sp, color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text("FALHA NO DESEMBARQUE", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = DS_Error)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(state.message, fontSize = 13.sp, color = DS_Text2, textAlign = TextAlign.Center)

                        Spacer(modifier = Modifier.height(24.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Primary)
                                .clickable { viewModel.resetState() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Tentar Novamente", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
