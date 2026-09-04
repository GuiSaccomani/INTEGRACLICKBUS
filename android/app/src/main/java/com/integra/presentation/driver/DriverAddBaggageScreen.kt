package com.integra.presentation.driver

import android.app.Activity
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
import com.integra.presentation.viewmodel.DriverAddBaggageUiState
import com.integra.presentation.viewmodel.DriverAddBaggageViewModel
import com.integra.ui.theme.*

@Composable
fun DriverAddBaggageScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val viewModel = remember { DriverAddBaggageViewModel() }
    val uiState by viewModel.uiState.collectAsState()

    var ticketIdInput by remember { mutableStateOf("B1C2D3E4F5A60123456789ABCDEF0123") }
    var baggageIdInput by remember { mutableStateOf(viewModel.generateSecureBaggageId()) }
    var selectedSeat by remember { mutableStateOf("18") }
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
            Text("Adicionar Bagagem", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
        }
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            when (val state = uiState) {
                is DriverAddBaggageUiState.Idle -> {
                    Text(
                        text = "Vincular Bagagem ao Passageiro",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = DS_Text1,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Text(
                        text = "Informe a passagem e aproxime a tag NFC física para gravação.",
                        fontSize = 13.sp,
                        color = DS_Text2,
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp, bottom = 20.dp)
                    )

                    // Card do Passageiro / Poltrona
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Bg)
                            .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "PASSAGEM / POLTRONA",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Text3,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = ticketIdInput,
                            onValueChange = { ticketIdInput = it },
                            label = { Text("ID da Passagem (32 hex)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = DS_Primary,
                                unfocusedBorderColor = DS_BorderMd,
                                focusedContainerColor = DS_Surface,
                                unfocusedContainerColor = DS_Surface
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // BAGGAGE_ID Gerado
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Bg)
                            .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "BAGGAGE_ID (RAW 32 / 64 HEX)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text3,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "Gerar Novo",
                                color = DS_Primary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.clickable {
                                    baggageIdInput = viewModel.generateSecureBaggageId()
                                }
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = baggageIdInput,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = DS_Text1,
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(DS_Surface, RoundedCornerShape(8.dp))
                                .border(1.dp, DS_Border, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Diferente do UID físico da tag, este é o ID lógico do Oracle.",
                            fontSize = 11.sp,
                            color = DS_Text3
                        )
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(DS_Primary)
                            .clickable {
                                viewModel.associateBaggage(ticketIdInput, baggageIdInput)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Gravar na Tag NFC e Salvar",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                is DriverAddBaggageUiState.SavingOnApi -> {
                    CircularProgressIndicator(color = DS_Primary, strokeWidth = 4.dp, modifier = Modifier.size(54.dp))
                    Spacer(modifier = Modifier.height(20.dp))
                    Text("Registrando Bagagem no Sistema...", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
                }

                is DriverAddBaggageUiState.WaitingForNfcTag -> {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = DS_Primary, strokeWidth = 4.dp, modifier = Modifier.size(60.dp))
                        Spacer(modifier = Modifier.height(24.dp))
                        Text("Aproxime a Tag NFC Física", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
                        Text(
                            text = "Gravando BAGGAGE_ID no padrão NDEF...",
                            fontSize = 13.sp,
                            color = DS_Text2,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                        Spacer(modifier = Modifier.height(30.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(DS_Bg)
                                .clickable { viewModel.resetState() }
                                .padding(horizontal = 20.dp, vertical = 10.dp)
                        ) {
                            Text("Cancelar", color = DS_Text2, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                is DriverAddBaggageUiState.Success -> {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(DS_Success),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("✓", color = Color.White, fontSize = 44.sp, fontWeight = FontWeight.ExtraBold)
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Text("BAGAGEM VINCULADA COM SUCESSO", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, color = DS_Success, textAlign = TextAlign.Center)
                    Text("Tag física gravada e persistida no Oracle.", fontSize = 14.sp, color = DS_Text2, modifier = Modifier.padding(top = 4.dp, bottom = 28.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(DS_Primary)
                            .clickable {
                                viewModel.resetState()
                                baggageIdInput = viewModel.generateSecureBaggageId()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Vincular Outra Bagagem", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
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
                        Text("Voltar", color = DS_Text1, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                is DriverAddBaggageUiState.Error -> {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(DS_Error),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("✕", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("FALHA AO ADICIONAR BAGAGEM", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Error)
                    Spacer(modifier = Modifier.height(6.dp))
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
