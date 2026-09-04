package com.integra.presentation.auth

import androidx.compose.animation.*
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun LogoMarkSmall() {
    Box(
        modifier = Modifier
            .size(32.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(DS_Primary),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(18.dp)) {
            drawArc(
                color = Color.White,
                startAngle = 180f,
                sweepAngle = -180f,
                useCenter = false,
                topLeft = Offset(2.dp.toPx(), 2.dp.toPx()),
                size = androidx.compose.ui.geometry.Size(14.dp.toPx(), 14.dp.toPx()),
                style = Stroke(width = 1.5.dp.toPx(), cap = StrokeCap.Round)
            )
            drawCircle(
                color = Color.White,
                radius = 1.5.dp.toPx(),
                center = Offset(9.dp.toPx(), 9.dp.toPx())
            )
        }
    }
}

@Composable
fun RegisterScreen(
    onNavigateBack: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    var step by remember { mutableIntStateOf(1) }
    var success by remember { mutableStateOf(false) }

    var nome by remember { mutableStateOf("") }
    var cpf by remember { mutableStateOf("") }
    var nasc by remember { mutableStateOf("") }
    var cel by remember { mutableStateOf("") }

    var email by remember { mutableStateOf("") }
    var senha by remember { mutableStateOf("") }
    var confirma by remember { mutableStateOf("") }

    val scrollState = rememberScrollState()

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
                // Success icon
            }
            Text(
                text = "Conta criada!",
                fontSize = 26.sp,
                fontWeight = FontWeight.Black,
                color = DS_Text1,
                letterSpacing = (-0.8).sp,
                modifier = Modifier.padding(top = 28.dp, bottom = 8.dp)
            )
            Text(
                text = "Bem-vindo, ${nome.split(" ").firstOrNull() ?: ""}! Sua conta foi criada com sucesso.",
                fontSize = 15.sp,
                color = DS_Text2,
                lineHeight = 22.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(bottom = 32.dp)
            )
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp)
                    .shadow(20.dp, RoundedCornerShape(18.dp), spotColor = DS_Primary.copy(alpha = 0.22f))
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(colors = listOf(DS_PrimaryDark, DS_Primary)))
                    .clickable { onNavigateToLogin() },
                contentAlignment = Alignment.Center
            ) {
                Text("Fazer login", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold)
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
                    .clickable {
                        if (step == 2) step = 1 else onNavigateBack()
                    },
                contentAlignment = Alignment.Center
            ) {
                Text("<", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = DS_Text1)
            }
            Spacer(modifier = Modifier.width(14.dp))
            LogoMarkSmall()
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text("PASSO $step DE 2", fontSize = 10.sp, color = DS_Text3, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                Text(if (step == 1) "Seus dados" else "Acesso à conta", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = DS_Text1)
            }
        }
        
        // Progress Bar
        val progressWidth by animateFloatAsState(targetValue = if (step == 1) 0.5f else 1f)
        Box(modifier = Modifier.fillMaxWidth().height(3.dp).background(DS_Border)) {
            Box(modifier = Modifier.fillMaxWidth(progressWidth).fillMaxHeight().background(Brush.horizontalGradient(colors = listOf(DS_PrimaryDark, DS_Primary))))
        }

        // Form fields
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(scrollState)
                .padding(24.dp)
        ) {
            if (step == 1) {
                CustomField("Nome completo", "Guilherme Santos", nome, { nome = it })
                CustomField("CPF", "000.000.000-00", cpf, { cpf = it })
                CustomField("Data de nascimento", "", nasc, { nasc = it })
                CustomField("Celular", "(11) 99999-0000", cel, { cel = it })
            } else {
                CustomField("E-mail", "guilherme@email.com", email, { email = it })
                CustomField("Senha", "Mínimo 8 caracteres", senha, { senha = it }, isPassword = true)
                CustomField("Confirmar senha", "Repita sua senha", confirma, { confirma = it }, isPassword = true)
                
                Box(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(DS_PrimaryLight).border(1.5.dp, DS_PrimaryMid, RoundedCornerShape(12.dp)).padding(12.dp, 14.dp)) {
                    Text("Sua senha deve ter pelo menos 8 caracteres.", color = DS_Primary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        // CTA
        Column(modifier = Modifier.fillMaxWidth().padding(start = 24.dp, end = 24.dp, bottom = 44.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp)
                    .shadow(20.dp, RoundedCornerShape(18.dp), spotColor = DS_Primary.copy(alpha = 0.22f))
                    .clip(RoundedCornerShape(18.dp))
                    .background(Brush.linearGradient(colors = listOf(DS_PrimaryDark, DS_Primary)))
                    .clickable { 
                        if (step == 1) step = 2 else success = true 
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(if (step == 1) "Continuar" else "Criar conta", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold)
            }
            if (step == 1) {
                Row(modifier = Modifier.fillMaxWidth().padding(top = 14.dp), horizontalArrangement = Arrangement.Center) {
                    Text("Já tem conta? ", color = DS_Text3, fontSize = 12.sp)
                    Text("Entrar", color = DS_Primary, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clickable { onNavigateToLogin() })
                }
            }
        }
    }
}
