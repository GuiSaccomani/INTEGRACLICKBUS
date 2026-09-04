package com.integra.presentation.driver

import android.app.Activity
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.presentation.viewmodel.DriverValidationUiState
import com.integra.presentation.viewmodel.DriverValidationViewModel
import com.integra.qr.QrScannerView
import com.integra.ui.theme.*

@Composable
fun DriverValidationScreen(
    onNavigateBack: () -> Unit,
    onNavigateToAddBaggage: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val viewModel = remember { DriverValidationViewModel() }
    val state by viewModel.uiState.collectAsState()

    var manualCodeInput by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()

    DisposableEffect(activity) {
        if (activity != null) {
            viewModel.initializeNfc(activity)
            viewModel.startNfcListening()
        }
        onDispose {
            viewModel.stopNfcListening()
        }
    }

    // Se estiver em modo Scanner QR, renderiza a câmera CameraX em tela cheia
    if (state is DriverValidationUiState.ShowingQrScanner) {
        QrScannerView(
            onCodeScanned = { code ->
                viewModel.onQrCodeDetected(code)
            },
            onDismiss = {
                viewModel.closeQrScanner()
                viewModel.startNfcListening()
            }
        )
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Surface)
    ) {
        // Back Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
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
            Text("Validar Passageiro", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            when (val currentState = state) {
                is DriverValidationUiState.Idle,
                is DriverValidationUiState.ListeningNfc -> {
                    // Animação de pulso do leitor NFC
                    Box(
                        modifier = Modifier
                            .size(160.dp)
                            .padding(bottom = 24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        val infiniteTransition = rememberInfiniteTransition()
                        val pulseScale by infiniteTransition.animateFloat(
                            initialValue = 0.8f,
                            targetValue = 1.6f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(1800, easing = LinearOutSlowInEasing),
                                repeatMode = RepeatMode.Restart
                            )
                        )
                        val pulseAlpha by infiniteTransition.animateFloat(
                            initialValue = 0.6f,
                            targetValue = 0f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(1800, easing = LinearOutSlowInEasing),
                                repeatMode = RepeatMode.Restart
                            )
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .scale(pulseScale)
                                .border(2.dp, DS_Primary.copy(alpha = pulseAlpha), CircleShape)
                        )

                        Box(
                            modifier = Modifier
                                .size(90.dp)
                                .clip(CircleShape)
                                .background(DS_PrimaryLight)
                                .border(2.dp, DS_PrimaryMid, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("NFC", color = DS_Primary, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                        }
                    }

                    Text(
                        text = "Aproxime o Celular do Passageiro",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DS_Text1,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = "A leitura NFC HCE está ativa no topo do aparelho.",
                        fontSize = 14.sp,
                        color = DS_Text2,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 6.dp, bottom = 28.dp)
                    )

                    // Ação alternativa: QR Code via CameraX + ML Kit
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(DS_Surface)
                            .border(2.dp, DS_Primary, RoundedCornerShape(16.dp))
                            .clickable { viewModel.openQrScanner() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "📷 Escanear QR Code (Câmera)",
                            color = DS_Primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Busca/Digitação Manual de Contingência
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Bg)
                            .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                            .padding(14.dp)
                    ) {
                        Text(
                            text = "CÓDIGO MANUAL / CREDENCIAL",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Text3
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = manualCodeInput,
                                onValueChange = { manualCodeInput = it },
                                placeholder = { Text("Código de referência", fontSize = 13.sp, color = DS_Text3) },
                                modifier = Modifier.weight(1f).height(48.dp),
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
                                    .height(48.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(DS_Primary)
                                    .clickable {
                                        if (manualCodeInput.isNotBlank()) {
                                            viewModel.validateCredentialOnApi(manualCodeInput)
                                        }
                                    }
                                    .padding(horizontal = 14.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("Validar", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            }
                        }
                    }
                }

                is DriverValidationUiState.Validating -> {
                    CircularProgressIndicator(color = DS_Primary, strokeWidth = 4.dp, modifier = Modifier.size(56.dp))
                    Spacer(modifier = Modifier.height(20.dp))
                    Text("Validando no Backend...", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                    Text("Verificando regras e garantindo atomicidade.", fontSize = 13.sp, color = DS_Text2, modifier = Modifier.padding(top = 4.dp))
                }

                is DriverValidationUiState.Success -> {
                    val ticket = currentState.ticket
                    Box(
                        modifier = Modifier
                            .size(90.dp)
                            .clip(CircleShape)
                            .background(DS_Success),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("✓", color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.ExtraBold)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "EMBARQUE AUTORIZADO",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DS_Success,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Card de Detalhes da Validação Real
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Surface)
                            .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                            .padding(18.dp)
                    ) {
                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Passageiro:", fontSize = 13.sp, color = DS_Text2)
                            Text(ticket.passengerName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                        }
                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Poltrona:", fontSize = 13.sp, color = DS_Text2)
                            Text("${ticket.seat}", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = DS_Primary)
                        }
                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Itinerário:", fontSize = 13.sp, color = DS_Text2)
                            Text("${ticket.departure} → ${ticket.arrival}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = DS_Text1)
                        }
                        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Bagagens:", fontSize = 13.sp, color = DS_Text2)
                            Text("${ticket.luggagesCount} despachada(s)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = DS_Text1)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Primary)
                                .clickable { onNavigateToAddBaggage() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Adicionar Bagagem para Este Passageiro", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(DS_Bg)
                                .clickable {
                                    viewModel.resetState()
                                    viewModel.startNfcListening()
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Validar Próximo Passageiro", color = DS_Text1, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        }
                    }
                }

                is DriverValidationUiState.InvalidTicket -> {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(DS_Error),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("✕", color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "EMBARQUE RECUSADO",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DS_Error,
                        textAlign = TextAlign.Center
                    )
                    Text(
                        text = currentState.reason,
                        fontSize = 14.sp,
                        color = DS_Text2,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Primary)
                            .clickable {
                                viewModel.resetState()
                                viewModel.startNfcListening()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Tentar Novamente", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }

                is DriverValidationUiState.Error -> {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(DS_Error),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("!", color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text("FALHA DE COMUNICAÇÃO", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Error)
                    Text(currentState.message, fontSize = 13.sp, color = DS_Text2, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 4.dp, bottom = 24.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Primary)
                            .clickable {
                                viewModel.resetState()
                                viewModel.startNfcListening()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Repetir Leitura", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
                else -> {}
            }
        }
    }
}
