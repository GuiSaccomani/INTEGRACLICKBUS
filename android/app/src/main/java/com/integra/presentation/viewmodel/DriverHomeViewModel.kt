package com.integra.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.local.SessionManager
import com.integra.data.model.TripSummaryDto
import com.integra.data.repository.DriverRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DriverHomeUiState {
    object Loading : DriverHomeUiState()
    data class Success(val summary: TripSummaryDto) : DriverHomeUiState()
    data class Error(val message: String) : DriverHomeUiState()
}

class DriverHomeViewModel(
    private val repository: DriverRepository = DriverRepository(),
    private val sessionManager: SessionManager? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverHomeUiState>(DriverHomeUiState.Loading)
    val uiState: StateFlow<DriverHomeUiState> = _uiState.asStateFlow()

    init {
        if (sessionManager != null) {
            loadTripSummary()
        }
    }

    fun loadTripSummary(tripId: String? = null, driverId: String? = null) {
        _uiState.value = DriverHomeUiState.Loading
        viewModelScope.launch {
            val targetTripId = if (!tripId.isNullOrBlank()) {
                tripId
            } else {
                val effectiveDriverId = driverId 
                    ?: sessionManager?.getCachedUserId()
                    ?: "00000000000000000000000000000001"
                val tripsResult = repository.getTrips(effectiveDriverId)
                val trips = tripsResult.getOrNull()
                trips?.firstOrNull()?.tripId
            }

            if (targetTripId.isNullOrBlank()) {
                _uiState.value = DriverHomeUiState.Error("Nenhuma viagem atribuída a este motorista.")
                return@launch
            }

            val result = repository.getTripSummary(targetTripId)
            result.onSuccess { summary ->
                _uiState.value = DriverHomeUiState.Success(summary)
            }.onFailure { err ->
                _uiState.value = DriverHomeUiState.Error(err.message ?: "Falha ao consultar resumo da viagem.")
            }
        }
    }
}
