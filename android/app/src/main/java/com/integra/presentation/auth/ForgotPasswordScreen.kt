package com.integra.presentation.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var success by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    if (success) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DS_Surface)
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(44.dp))
                    .background(Brush.linearGradient(colors = listOf(DS_Success, Color(0xFF22A84A))))
                    .shadow(40.dp, spotColor = Color(0xFF059669).copy(alpha = 0.35f)),
                contentAlignment = Alignment.Center
            ) {
                Text("✓", color = Color.White, fontSize = 44.sp, fontWeight = FontWeight.Bold)
            }
            Text(
                text = "E-mail enviado!",
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                color = DS_Text1,
                letterSpacing = (-0.8).sp,
                modifier = Modifier.padding(top = 28.dp, bottom = 8.dp)
            )
            Text(
                text = "Enviamos as instruções de recuperação para o e-mail informado.",
                fontSize = 15.sp,
                color = DS_Text2,
                lineHeight = 22.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 32.dp)
            )
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp)
                    .shadow(20.dp, RoundedCornerShape(18.dp), spotColor = DS_Primary.copy(alpha = 0.22f))
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(colors = listOf(DS_PrimaryDark, DS_Primary)))
                    .clickable { onNavigateBack() },
                contentAlignment = Alignment.Center
            ) {
                Text("Voltar ao login", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            }
        }
        return
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
                .padding(start = 24.dp, end = 24.dp, top = 52.dp, bottom = 16.dp),
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
            Spacer(modifier = Modifier.width(14.dp))
            LogoMarkSmall()
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
        ) {
            Text(
                text = "Esqueci minha senha",
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                color = DS_Text1,
                letterSpacing = (-0.6).sp,
                modifier = Modifier.padding(top = 20.dp, bottom = 6.dp)
            )
            Text(
                text = "Informe seu e-mail cadastrado para enviarmos um link de recuperação.",
                fontSize = 15.sp,
                color = DS_Text2,
                modifier = Modifier.padding(bottom = 32.dp)
            )

            CustomField(
                label = "E-mail",
                placeholder = "guilherme@email.com",
                value = email,
                onValueChange = { email = it }
            )

            Spacer(modifier = Modifier.weight(1f))

            // Main CTA
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 44.dp)
                    .height(60.dp)
                    .shadow(
                        elevation = if (isLoading) 0.dp else 20.dp,
                        shape = RoundedCornerShape(18.dp),
                        spotColor = DS_Primary.copy(alpha = 0.22f)
                    )
                    .clip(RoundedCornerShape(18.dp))
                    .background(
                        if (isLoading) SolidColor(DS_PrimaryMid)
                        else Brush.linearGradient(colors = listOf(DS_PrimaryDark, DS_Primary))
                    )
                    .clickable(enabled = !isLoading && email.isNotBlank()) {
                        isLoading = true
                        coroutineScope.launch {
                            delay(1200)
                            isLoading = false
                            success = true
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    Text(
                        text = "Enviando...",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                } else {
                    Text(
                        text = "Recuperar senha",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
