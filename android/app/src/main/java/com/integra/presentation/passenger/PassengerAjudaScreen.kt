package com.integra.presentation.passenger

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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

data class FaqItem(
    val question: String,
    val answer: String
)

private val FAQS_LIST = listOf(
    FaqItem(
        question = "Como uso minha passagem NFC?",
        answer = "Basta encostar a parte traseira ou superior do seu celular no leitor do motorista. O bilhete digital seguro é transmitido instantaneamente."
    ),
    FaqItem(
        question = "O app funciona sem internet?",
        answer = "Sim! Depois que sua viagem for sincronizada, seu bilhete seguro e chave de embarque offline permitem viajar normalmente mesmo sem sinal."
    ),
    FaqItem(
        question = "Como adiciono bagagem?",
        answer = "Entregue a mala ao despachante ou motorista. Eles associam uma tag de alta segurança criptografada que aparece na sua aba Bagagens."
    )
)

@Composable
fun PassengerAjudaScreen(
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
                text = "Central de Ajuda",
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
            contentPadding = PaddingValues(vertical = 20.dp)
        ) {
            item {
                Text(
                    text = "Como podemos ajudar?",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DS_Text1,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Botões de contato
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 28.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(DS_PrimaryLight)
                            .clickable { /* Abre chat */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Chat Online",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = DS_Primary
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(DS_Surface)
                            .border(1.dp, DS_BorderMd, RoundedCornerShape(12.dp))
                            .clickable { /* Envia e-mail */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "E-mail",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = DS_Text1
                        )
                    }
                }

                // Título FAQ
                Text(
                    text = "PERGUNTAS FREQUENTES",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = DS_Text3,
                    letterSpacing = 0.6.sp,
                    modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
                )
            }

            // Bloco de FAQs
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(DS_Surface)
                        .border(1.dp, DS_Border, RoundedCornerShape(14.dp))
                ) {
                    FAQS_LIST.forEachIndexed { index, faq ->
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp)
                        ) {
                            Text(
                                text = faq.question,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = DS_Text1
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = faq.answer,
                                fontSize = 13.sp,
                                color = DS_Text2,
                                lineHeight = 19.sp
                            )
                        }
                        if (index < FAQS_LIST.size - 1) {
                            Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(DS_Border))
                        }
                    }
                }
            }
        }
    }
}
