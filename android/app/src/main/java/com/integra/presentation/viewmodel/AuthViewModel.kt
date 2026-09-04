package com.integra.presentation.viewmodel

import android.app.Activity
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.biometrics.PasskeyManager
import com.integra.biometrics.PasskeyResult
import com.integra.data.local.SessionManager
import com.integra.data.model.UserProfileDto
import com.integra.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    data class Success(val user: UserProfileDto) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(
    context: Context,
    private val repository: AuthRepository = AuthRepository(sessionManager = SessionManager.getInstance(context)),
    private val passkeyManager: PasskeyManager = PasskeyManager(context)
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun loginWithCredentials(email: String, pass: String) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = AuthUiState.Error("Preencha seu e-mail e senha.")
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            val result = repository.login(email, pass)
            result.onSuccess { user ->
                _uiState.value = AuthUiState.Success(user)
            }.onFailure { err ->
                _uiState.value = AuthUiState.Error(err.message ?: "Falha ao realizar login.")
            }
        }
    }

    fun loginWithBiometrics(activity: Activity, email: String? = null) {
        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            when (val res = passkeyManager.authenticateWithPasskey(activity, email)) {
                is PasskeyResult.Success -> {
                    _uiState.value = AuthUiState.Success(res.user)
                }
                is PasskeyResult.FallbackToPassword -> {
                    _uiState.value = AuthUiState.Error(res.reason)
                }
                is PasskeyResult.Error -> {
                    _uiState.value = AuthUiState.Error(res.message)
                }
            }
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
