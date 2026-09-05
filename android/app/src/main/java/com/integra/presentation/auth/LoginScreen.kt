package com.integra.presentation.auth

import android.app.Activity
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.integra.presentation.viewmodel.AuthUiState
import com.integra.presentation.viewmodel.AuthViewModel
import com.integra.ui.theme.*

@Composable
fun CustomField(
    label: String,
    placeholder: String,
    value: String,
    onValueChange: (String) -> Unit,
    isPassword: Boolean = false
) {
    var isFocused by remember { mutableStateOf(false) }
    val borderColor by animateColorAsState(if (isFocused) DS_Primary else DS_BorderMd)
    val bgColor by animateColorAsState(if (isFocused) DS_PrimaryLight else DS_Surface)

    Column(modifier = Modifier.padding(bottom = 16.dp)) {
        Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = DS_Text2,
            modifier = Modifier.padding(bottom = 7.dp)
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(bgColor)
                .border(2.dp, borderColor, RoundedCornerShape(14.dp))
                .padding(horizontal = 16.dp),
            contentAlignment = Alignment.CenterStart
        ) {
            if (value.isEmpty()) {
                Text(
                    text = placeholder,
                    color = DS_Text3,
                    fontSize = 15.sp
                )
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .onFocusChanged { isFocused = it.isFocused },
                textStyle = TextStyle(
                    fontSize = 16.sp,
                    color = DS_Text1,
                    fontWeight = FontWeight.Normal
                ),
                singleLine = true,
                cursorBrush = SolidColor(DS_Primary),
                visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
                keyboardOptions = if (isPassword) KeyboardOptions(keyboardType = KeyboardType.Password) else KeyboardOptions(keyboardType = KeyboardType.Email)
            )
        }
    }
}

@Composable
fun LoginScreen(
    onNavigateToHome: () -> Unit,
    onNavigateToDriver: () -> Unit,
    onLoginWithBiometrics: () -> Unit,
    onNavigateToForgotPassword: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val authViewModel = remember { AuthViewModel(context) }
    val authState by authViewModel.uiState.collectAsState()

    var emailOrCpf by remember { mutableStateOf("guilherme@integra.com") }
    var senha by remember { mutableStateOf("integra123") }
    val scrollState = rememberScrollState()

    // Reação aos estados de autenticação real
    LaunchedEffect(authState) {
        when (val state = authState) {
            is AuthUiState.Success -> {
                if (state.user.roles.isDriver) {
                    onNavigateToDriver()
                } else {
                    onNavigateToHome()
                }
                authViewModel.resetState()
            }
            else -> {}
        }
    }

    val isLoading = authState is AuthUiState.Loading

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DS_Surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp)
        ) {
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 56.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                androidx.compose.foundation.Image(
                    painter = androidx.compose.ui.res.painterResource(id = com.integra.R.drawable.logo_in),
                    contentDescription = "Logo ÍNTEGRA",
                    contentScale = androidx.compose.ui.layout.ContentScale.Fit,
                    modifier = Modifier
                        .height(36.dp)
                        .width(58.dp)
                )
                
                Text(
                    text = "Bem-vindo de volta",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = DS_Text1,
                    letterSpacing = (-0.6).sp,
                    modifier = Modifier.padding(top = 20.dp, bottom = 6.dp)
                )
                Text(
                    text = "Entre para continuar sua jornada",
                    fontSize = 14.sp,
                    color = DS_Text2
                )
            }

            // Form
            Column(modifier = Modifier.padding(top = 32.dp)) {
                CustomField(
                    label = "E-mail ou CPF",
                    placeholder = "seu@email.com",
                    value = emailOrCpf,
                    onValueChange = { emailOrCpf = it }
                )
                CustomField(
                    label = "Senha",
                    placeholder = "••••••••",
                    value = senha,
                    onValueChange = { senha = it },
                    isPassword = true
                )
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    Text(
                        text = "Esqueci minha senha",
                        color = DS_Primary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable { onNavigateToForgotPassword() }
                    )
                }

                // Alerta de Erro
                AnimatedVisibility(visible = authState is AuthUiState.Error) {
                    val errorMsg = (authState as? AuthUiState.Error)?.message ?: ""
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFFEE2E2))
                            .border(1.dp, DS_Error, RoundedCornerShape(12.dp))
                            .padding(14.dp)
                    ) {
                        Text(
                            text = errorMsg,
                            color = DS_Error,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Botão Entrar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
                    .shadow(
                        elevation = if (isLoading) 0.dp else 16.dp,
                        shape = RoundedCornerShape(18.dp),
                        spotColor = DS_Primary.copy(alpha = 0.22f)
                    )
                    .clip(RoundedCornerShape(18.dp))
                    .background(
                        if (isLoading) SolidColor(DS_PrimaryMid)
                        else Brush.linearGradient(colors = listOf(DS_PrimaryDark, DS_Primary))
                    )
                    .clickable(enabled = !isLoading) {
                        authViewModel.loginWithCredentials(emailOrCpf, senha)
                    },
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 3.dp
                    )
                } else {
                    Text(
                        text = "Entrar",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Divider
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 22.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(modifier = Modifier.weight(1f).height(1.dp).background(DS_Border))
                Text(
                    text = "ou",
                    color = DS_Text3,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
                Box(modifier = Modifier.weight(1f).height(1.dp).background(DS_Border))
            }

            // Biometric Passkey
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(DS_Surface)
                    .border(1.5.dp, DS_BorderMd, RoundedCornerShape(16.dp))
                    .clickable(enabled = !isLoading) {
                        if (activity != null) {
                            authViewModel.loginWithBiometrics(activity, emailOrCpf.ifBlank { null })
                        } else {
                            onLoginWithBiometrics()
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Entrar com biometria / Passkey",
                    color = DS_Text1,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(30.dp))
            
            Text(
                text = "Acesso seguro · Criptografia de ponta a ponta",
                fontSize = 11.sp,
                color = DS_Text3,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp),
                textAlign = TextAlign.Center
            )
        }
    }
}
