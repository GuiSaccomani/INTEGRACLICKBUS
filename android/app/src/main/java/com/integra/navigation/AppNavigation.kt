package com.integra.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.integra.presentation.auth.WelcomeScreen
import com.integra.presentation.auth.LoginScreen
import com.integra.presentation.auth.RegisterScreen
import com.integra.presentation.auth.ForgotPasswordScreen
import com.integra.presentation.auth.BiometricScreen
import com.integra.presentation.passenger.*
import com.integra.presentation.driver.*

@Composable
fun PlaceholderScreen(title: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Em construção: $title")
    }
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val startDestination = "welcome"

    NavHost(navController = navController, startDestination = startDestination) {
        // --- AUTENTICAÇÃO ---
        composable("welcome") {
            WelcomeScreen(
                onNavigateToLogin = { navController.navigate("login") },
                onNavigateToRegister = { navController.navigate("register") }
            )
        }
        composable("register") {
            RegisterScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToLogin = { 
                    navController.navigate("login") {
                        popUpTo("welcome")
                    }
                }
            )
        }
        composable("login") {
            LoginScreen(
                onNavigateToHome = {
                    navController.navigate("passenger_home") {
                        popUpTo(0)
                    }
                },
                onNavigateToDriver = {
                    navController.navigate("driver_home") {
                        popUpTo(0)
                    }
                },
                onLoginWithBiometrics = { navController.navigate("biometrics") },
                onNavigateToForgotPassword = { navController.navigate("forgot_password") }
            )
        }
        composable("biometrics") {
            BiometricScreen(
                onSuccess = {
                    navController.navigate("passenger_home") {
                        popUpTo(0)
                    }
                },
                onCancel = { navController.popBackStack() }
            )
        }
        composable("forgot_password") {
            ForgotPasswordScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // --- PASSAGEIRO ---
        composable("passenger_home") {
            PassengerHomeScreen(
                onNavigateToDigitalPass = { navController.navigate("passenger_viagens") { popUpTo(0) } },
                onNavigateToBagagens = { navController.navigate("passenger_bagagens") { popUpTo(0) } },
                onNavigateToConta = { navController.navigate("passenger_conta") { popUpTo(0) } }
            )
        }
        composable("passenger_viagens") {
            DigitalBoardingPassScreen(
                onNavigateToHome = { navController.navigate("passenger_home") { popUpTo(0) } },
                onNavigateToBagagens = { navController.navigate("passenger_bagagens") { popUpTo(0) } },
                onNavigateToConta = { navController.navigate("passenger_conta") { popUpTo(0) } },
                onNavigateToNfc = { navController.navigate("passenger_nfc") },
                onNavigateToQrCode = { navController.navigate("passenger_qrcode") },
                onNavigateToValidada = { navController.navigate("passenger_validada") }
            )
        }
        composable("passenger_bagagens") {
            PassengerBagagensScreen(
                onNavigateToHome = { navController.navigate("passenger_home") { popUpTo(0) } },
                onNavigateToViagens = { navController.navigate("passenger_viagens") { popUpTo(0) } },
                onNavigateToConta = { navController.navigate("passenger_conta") { popUpTo(0) } },
                onNavigateToRegistrarBagagem = { navController.navigate("passenger_bagagem_nova") },
                onNavigateToDetalhe = { _ -> navController.navigate("passenger_bagagem_detalhe") }
            )
        }
        composable("passenger_conta") {
            PassengerContaScreen(
                onNavigateToHome = { navController.navigate("passenger_home") { popUpTo(0) } },
                onNavigateToViagens = { navController.navigate("passenger_viagens") { popUpTo(0) } },
                onNavigateToBagagens = { navController.navigate("passenger_bagagens") { popUpTo(0) } },
                onNavigateToNotificacoes = { navController.navigate("passenger_notificacoes") },
                onNavigateToAjuda = { navController.navigate("passenger_ajuda") },
                onNavigateToHistorico = { navController.navigate("passenger_historico") },
                onNavigateToDriver = { navController.navigate("driver_home") },
                onLogout = {
                    navController.navigate("welcome") {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        composable("passenger_nfc") {
            CredencialNFCScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("passenger_qrcode") {
            QRCodeScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToValidada = { navController.navigate("passenger_validada") }
            )
        }
        composable("passenger_validada") {
            PassagemValidadaScreen(
                onNavigateToHome = {
                    navController.navigate("passenger_home") {
                        popUpTo(0)
                    }
                },
                onNavigateToBagagens = {
                    navController.navigate("passenger_bagagens") {
                        popUpTo(0)
                    }
                }
            )
        }
        composable("passenger_bagagem_nova") {
            PassengerRegistrarBagagemScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToSucesso = { _ ->
                    navController.navigate("passenger_bagagem_validada") {
                        popUpTo("passenger_bagagens")
                    }
                }
            )
        }
        composable("passenger_bagagem_validada") {
            PassengerBagagemValidadaScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToBagagens = {
                    navController.navigate("passenger_bagagens") {
                        popUpTo(0)
                    }
                }
            )
        }
        composable("passenger_bagagem_detalhe") {
            PassengerBagagemDetalheScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToRetirada = { navController.navigate("passenger_bagagem_retirada") }
            )
        }
        composable("passenger_bagagem_retirada") {
            PassengerRetiradaBagagemScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToBagagens = {
                    navController.navigate("passenger_bagagens") {
                        popUpTo(0)
                    }
                }
            )
        }
        composable("passenger_historico") {
            PassengerHistoricoScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("passenger_notificacoes") {
            PassengerNotificacoesScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("passenger_ajuda") {
            PassengerAjudaScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // --- MOTORISTA ---
        composable("driver_home") {
            DriverHomeScreen(
                onValidatePassenger = { navController.navigate("driver_validation") },
                onAddBaggage = { navController.navigate("driver_add_baggage") },
                onClearTag = { navController.navigate("driver_clear_tag") },
                onPassengerList = { navController.navigate("driver_passenger_list") },
                onBaggageList = { navController.navigate("driver_baggage_list") },
                onHistory = { navController.navigate("driver_history") },
                onDesembarque = { navController.navigate("driver_desembarque") },
                onPassengerMode = { navController.navigate("passenger_home") { popUpTo(0) } }
            )
        }
        composable("driver_passenger_list") {
            DriverPassengerListScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("driver_validation") {
            DriverValidationScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToAddBaggage = { navController.navigate("driver_add_baggage") }
            )
        }
        composable("driver_add_baggage") {
            DriverAddBaggageScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("driver_desembarque") {
            DriverDesembarqueScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("driver_clear_tag") {
            DriverClearTagScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("driver_baggage_list") {
            DriverBaggageListScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("driver_history") {
            DriverHistoryScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // --- FALLBACK ---
        composable("placeholder/{title}") { backStackEntry ->
            val title = backStackEntry.arguments?.getString("title") ?: "Tela"
            PlaceholderScreen(title)
        }
    }
}
