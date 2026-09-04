package com.integra.data.repository

import com.integra.data.local.SessionManager
import com.integra.data.model.LoginRequest
import com.integra.data.model.UserProfileDto
import com.integra.data.network.ApiService
import com.integra.data.network.RetrofitClient

class AuthRepository(
    private val apiService: ApiService = RetrofitClient.getApiService(),
    private val sessionManager: SessionManager
) {
    suspend fun login(email: String, pass: String): Result<UserProfileDto> {
        return try {
            val response = apiService.login(LoginRequest(email.trim(), pass))
            if (response.isSuccessful && response.body() != null) {
                val user = response.body()!!.user
                sessionManager.saveUserSession(user)
                Result.success(user)
            } else {
                val msg = RetrofitClient.parseErrorMessage(response)
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Não foi possível conectar ao servidor. Verifique sua conexão.", e))
        }
    }

    suspend fun logout() {
        sessionManager.clearSession()
    }
}
