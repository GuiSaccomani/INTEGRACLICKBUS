package com.integra.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.integra.data.local.SessionManager
import com.integra.data.model.TicketDetailsDto
import com.integra.data.repository.LuggageRepository
import com.integra.data.repository.PassengerRepository
import com.integra.nfc.IntegraHceService
import com.integra.presentation.common.UiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PassengerNotificationItem(
    val id: String,
    val title: String,
    val desc: String,
    val meta: String,
    val isNew: Boolean
)

class PassengerTicketViewModel(
    private val passengerRepository: PassengerRepository = PassengerRepository(),
    private val luggageRepository: LuggageRepository = LuggageRepository(),
    private val sessionManager: SessionManager? = null
) : ViewModel() {

    private val _activeTicketState = MutableStateFlow<UiState<TicketDetailsDto?>>(UiState.Idle)
    val activeTicketState: StateFlow<UiState<TicketDetailsDto?>> = _activeTicketState.asStateFlow()

    private val _ticketsListState = MutableStateFlow<UiState<List<TicketDetailsDto>>>(UiState.Idle)
    val ticketsListState: StateFlow<UiState<List<TicketDetailsDto>>> = _ticketsListState.asStateFlow()

    private val _notificationsState = MutableStateFlow<UiState<List<PassengerNotificationItem>>>(UiState.Idle)
    val notificationsState: StateFlow<UiState<List<PassengerNotificationItem>>> = _notificationsState.asStateFlow()

    fun loadTickets(userId: String) {
        _activeTicketState.value = UiState.Loading
        _ticketsListState.value = UiState.Loading
        _notificationsState.value = UiState.Loading

        viewModelScope.launch {
            val result = passengerRepository.getUserTickets(userId)
            result.onSuccess { tickets ->
                _ticketsListState.value = UiState.Success(tickets)
                sessionManager?.saveOfflineTickets(tickets)

                val active = tickets.firstOrNull { it.isReadyToBoard } ?: tickets.firstOrNull()
                _activeTicketState.value = UiState.Success(active)

                if (active != null) {
                    val credential = active.utHash ?: active.ticketId
                    sessionManager?.setActiveTicket(active.ticketId, credential)
                    IntegraHceService.activeCredentialRef = credential
                }

                // Derivação 100% Client-Side das Notificações a partir de tickets e bagagens
                deriveNotifications(tickets, active?.ticketId)
            }.onFailure { err ->
                val cached = sessionManager?.getOfflineTickets() ?: emptyList()
                if (cached.isNotEmpty()) {
                    _ticketsListState.value = UiState.Success(cached)
                    val active = cached.firstOrNull { it.isReadyToBoard } ?: cached.firstOrNull()
                    _activeTicketState.value = UiState.Success(active)
                    deriveNotifications(cached, active?.ticketId)
                } else {
                    val msg = err.message ?: "Não foi possível carregar as passagens."
                    _activeTicketState.value = UiState.Error(msg)
                    _ticketsListState.value = UiState.Error(msg)
                    _notificationsState.value = UiState.Error(msg)
                }
            }
        }
    }

    private suspend fun deriveNotifications(tickets: List<TicketDetailsDto>, activeTicketId: String?) {
        val notifications = mutableListOf<PassengerNotificationItem>()

        tickets.forEach { ticket ->
            val route = "${ticket.departure} → ${ticket.arrival}"
            val meta = "Viagem em ${ticket.tripDate}"

            if (ticket.used == 1) {
                notifications.add(
                    PassengerNotificationItem(
                        id = "boarded-${ticket.ticketId}",
                        title = "Embarque realizado",
                        desc = "Sua passagem $route foi validada com sucesso. Poltrona ${ticket.seat}.",
                        meta = meta,
                        isNew = false
                    )
                )
            } else if (ticket.sold == 1) {
                notifications.add(
                    PassengerNotificationItem(
                        id = "confirmed-${ticket.ticketId}",
                        title = "Passagem confirmada",
                        desc = "$route, poltrona ${ticket.seat}. Apresente seu QR Code ou aproxime por NFC.",
                        meta = meta,
                        isNew = true
                    )
                )
            }
        }

        // Adiciona notificação de bagagens vinculadas à passagem ativa
        if (activeTicketId != null) {
            val luggageResult = luggageRepository.getLuggagesByTicket(activeTicketId)
            luggageResult.onSuccess { luggages ->
                luggages.forEachIndexed { index, bag ->
                    notifications.add(
                        PassengerNotificationItem(
                            id = "baggage-${bag.baggageId}",
                            title = "Bagagem vinculada",
                            desc = "Volume 0${index + 1} (${bag.baggageId.take(12)}) associado à sua viagem.",
                            meta = "Bagagem ativa",
                            isNew = false
                        )
                    )
                }
            }
        }

        _notificationsState.value = UiState.Success(notifications)
    }
}
