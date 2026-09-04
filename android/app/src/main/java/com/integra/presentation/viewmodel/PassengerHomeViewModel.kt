package com.integra.presentation.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.local.SessionManager
import com.integra.data.model.TicketDetailsDto
import com.integra.data.repository.PassengerRepository
import com.integra.nfc.IntegraHceService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class PassengerHomeUiState {
    object Loading : PassengerHomeUiState()
    data class Success(val tickets: List<TicketDetailsDto>, val activeTicket: TicketDetailsDto?) : PassengerHomeUiState()
    data class Error(val message: String) : PassengerHomeUiState()
}

class PassengerHomeViewModel(
    context: Context,
    private val repository: PassengerRepository = PassengerRepository(),
    private val sessionManager: SessionManager = SessionManager.getInstance(context)
) : ViewModel() {

    private val _uiState = MutableStateFlow<PassengerHomeUiState>(PassengerHomeUiState.Loading)
    val uiState: StateFlow<PassengerHomeUiState> = _uiState.asStateFlow()

    init {
        loadTickets()
    }

    fun loadTickets() {
        _uiState.value = PassengerHomeUiState.Loading
        viewModelScope.launch {
            val userId = sessionManager.getUserId() ?: "E1F2A3B4C5D6E7F80123456789ABCDEF"
            val result = repository.getUserTickets(userId)

            result.onSuccess { tickets ->
                val active = tickets.firstOrNull { it.isReadyToBoard } ?: tickets.firstOrNull()

                // Se houver bilhete ativo, configura o serviço HCE com a credencial
                if (active != null) {
                    val ref = active.utHash ?: active.ticketId
                    sessionManager.setActiveTicket(active.ticketId, ref)
                    IntegraHceService.activeCredentialRef = ref
                }

                _uiState.value = PassengerHomeUiState.Success(tickets, active)
            }.onFailure { err ->
                _uiState.value = PassengerHomeUiState.Error(err.message ?: "Falha ao consultar passagens.")
            }
        }
    }
}
