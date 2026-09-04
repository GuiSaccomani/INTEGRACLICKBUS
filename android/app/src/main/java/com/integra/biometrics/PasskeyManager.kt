package com.integra.biometrics

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.integra.data.local.SessionManager
import com.integra.data.model.UserProfileDto
import com.integra.data.model.WebAuthnLoginOptionsRequest
import com.integra.data.model.WebAuthnLoginVerifyRequest
import com.integra.data.network.ApiService
import com.integra.data.network.RetrofitClient
import org.json.JSONObject

sealed class PasskeyResult {
    data class Success(val user: UserProfileDto) : PasskeyResult()
    data class FallbackToPassword(val reason: String) : PasskeyResult()
    data class Error(val message: String) : PasskeyResult()
}

class PasskeyManager(
    private val context: Context,
    private val apiService: ApiService = RetrofitClient.getApiService(),
    private val sessionManager: SessionManager = SessionManager.getInstance(context)
) {
    companion object {
        private const val TAG = "PasskeyManager"
    }

    private val credentialManager = CredentialManager.create(context)

    /**
     * Executa o fluxo de autenticação por Passkey / Biometria da plataforma:
     * 1. Solicita options com challenge ao backend WebAuthn (/auth/webauthn/login/options).
     * 2. Aciona o Android Credential Manager no dispositivo (SO valida biometria).
     * 3. Envia a resposta assinada para validação final (/auth/webauthn/login/verify).
     * 4. Salva a sessão autenticada.
     */
    suspend fun authenticateWithPasskey(activity: Activity, email: String? = null): PasskeyResult {
        return try {
            Log.i(TAG, "Iniciando obtenção de login options do backend WebAuthn...")
            val optionsResponse = apiService.getWebAuthnLoginOptions(WebAuthnLoginOptionsRequest(email))

            if (!optionsResponse.isSuccessful || optionsResponse.body() == null) {
                val error = RetrofitClient.parseErrorMessage(optionsResponse)
                return PasskeyResult.Error("Falha ao obter desafio biométrico do servidor: $error")
            }

            val optionsMap = optionsResponse.body()!!
            val optionsJsonString = RetrofitClient.gson.toJson(optionsMap)
            Log.i(TAG, "Desafio WebAuthn recebido com sucesso.")

            // Monta opção pública para o Credential Manager
            val getPublicKeyCredentialOption = GetPublicKeyCredentialOption(
                requestJson = optionsJsonString
            )

            val getCredRequest = GetCredentialRequest(
                credentialOptions = listOf(getPublicKeyCredentialOption)
            )

            // Invoca a interface nativa do SO
            val result = credentialManager.getCredential(
                request = getCredRequest,
                context = activity
            )

            val credential = result.credential
            if (credential is PublicKeyCredential) {
                val responseJson = credential.authenticationResponseJson
                Log.i(TAG, "Asserção criptográfica gerada pelo dispositivo.")

                val verifyResponse = apiService.verifyWebAuthnLogin(
                    WebAuthnLoginVerifyRequest(
                        response = JSONObject(responseJson).toString(),
                        challengeKey = email
                    )
                )

                if (verifyResponse.isSuccessful && verifyResponse.body() != null) {
                    val verifyBody = verifyResponse.body()!!
                    if (verifyBody.verified) {
                        sessionManager.saveUserSession(verifyBody.user)
                        Log.i(TAG, "Login biométrico via Passkey validado com sucesso!")
                        PasskeyResult.Success(verifyBody.user)
                    } else {
                        PasskeyResult.Error(verifyBody.message)
                    }
                } else {
                    val error = RetrofitClient.parseErrorMessage(verifyResponse)
                    PasskeyResult.Error("Assinatura biométrica não reconhecida: $error")
                }
            } else {
                PasskeyResult.FallbackToPassword("Tipo de credencial incompatível.")
            }
        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "Autenticação cancelada pelo usuário.")
            PasskeyResult.FallbackToPassword("Autenticação cancelada.")
        } catch (e: NoCredentialException) {
            Log.w(TAG, "Nenhuma passkey cadastrada neste dispositivo.")
            PasskeyResult.FallbackToPassword("Nenhuma biometria cadastrada. Use e-mail e senha.")
        } catch (e: GetCredentialException) {
            Log.e(TAG, "Erro no Credential Manager: ${e.message}", e)
            PasskeyResult.FallbackToPassword("Biometria indisponível. Entre com sua senha.")
        } catch (e: Exception) {
            Log.e(TAG, "Erro inesperado no fluxo de passkey", e)
            PasskeyResult.Error("Falha na autenticação: ${e.message}")
        }
    }
}
