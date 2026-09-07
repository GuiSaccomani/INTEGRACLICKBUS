package com.integra.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.local.SessionManager
import com.integra.data.model.TripPassengerDto
import com.integra.data.repository.DriverRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class DriverPassengerListUiState {
    object Loading : DriverPassengerListUiState()
    data class Success(val passengers: List<TripPassengerDto>) : DriverPassengerListUiState()
    data class Error(val message: String) : DriverPassengerListUiState()
}

class DriverPassengerListViewModel(
    private val repository: DriverRepository = DriverRepository(),
    private val sessionManager: SessionManager? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow<DriverPassengerListUiState>(DriverPassengerListUiState.Loading)
    val uiState: StateFlow<DriverPassengerListUiState> = _uiState.asStateFlow()

    fun loadPassengers(tripId: String? = null, driverId: String? = null) {
        _uiState.value = DriverPassengerListUiState.Loading
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
                _uiState.value = DriverPassengerListUiState.Success(emptyList())
                return@launch
            }

            val result = repository.getTripPassengers(targetTripId)
            result.onSuccess { passengers ->
                _uiState.value = DriverPassengerListUiState.Success(passengers)
            }.onFailure { err ->
                _uiState.value = DriverPassengerListUiState.Error(err.message ?: "Erro ao carregar lista de passageiros.")
            }
        }
    }
}

