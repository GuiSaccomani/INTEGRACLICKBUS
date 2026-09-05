package com.integra.presentation.auth

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.ui.theme.*

@Composable
fun WelcomeScreen(
    onNavigateToLogin: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Surface)
    ) {
        // Soft top gradient
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.55f)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(DS_PrimaryLight, Color.Transparent)
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo Mark Oficial ÍNTEGRA
            Box(
                modifier = Modifier
                    .width(140.dp)
                    .height(88.dp),
                contentAlignment = Alignment.Center
            ) {
                // Ambient glow da marca
                Box(
                    modifier = Modifier
                        .size(120.dp, 70.dp)
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(DS_Primary.copy(alpha = 0.45f), Color.Transparent)
                            ),
                            shape = CircleShape
                        )
                )
                androidx.compose.foundation.Image(
                    painter = androidx.compose.ui.res.painterResource(id = com.integra.R.drawable.logo_in),
                    contentDescription = "Logotipo Oficial ÍNTEGRA",
                    contentScale = androidx.compose.ui.layout.ContentScale.Fit,
                    modifier = Modifier
                        .fillMaxSize()
                )
            }
            
            Spacer(modifier = Modifier.height(28.dp))

            // Wordmark
            Text(
                text = "ÍNTEGRA",
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                color = DS_Text1,
                letterSpacing = (-1.5).sp,
                lineHeight = 38.sp
            )
            Text(
                text = "BY CLICKBUS",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Primary,
                letterSpacing = 3.sp,
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Tagline
            Text(
                text = "Sua viagem começa aqui.",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = DS_Text1,
                letterSpacing = (-0.5).sp,
                textAlign = TextAlign.Center
            )
            Text(
                text = "Tenha sua passagem, embarque e bagagem sempre com você.",
                fontSize = 15.sp,
                fontWeight = FontWeight.Normal,
                color = DS_Text2,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 10.dp).width(280.dp)
            )
        }

        // Bottom CTAs
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(start = 24.dp, end = 24.dp, bottom = 52.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
                    .shadow(20.dp, RoundedCornerShape(18.dp), spotColor = DS_Primary.copy(alpha = 0.22f))
                    .clip(RoundedCornerShape(18.dp))
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(DS_PrimaryDark, DS_Primary)
                        )
                    )
                    .clickable { onNavigateToLogin() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Entrar",
                    color = Color.White,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(DS_Surface)
                    .border(1.5.dp, DS_BorderMd, RoundedCornerShape(16.dp))
                    .clickable { onNavigateToRegister() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Criar conta",
                    color = DS_Text1,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Acesso seguro e criptografado",
                fontSize = 12.sp,
                color = DS_Text3,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
