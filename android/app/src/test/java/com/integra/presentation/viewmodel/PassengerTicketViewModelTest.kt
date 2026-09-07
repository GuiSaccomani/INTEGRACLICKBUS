package com.integra.presentation.viewmodel

import com.integra.data.model.*
import com.integra.data.repository.LuggageRepository
import com.integra.data.repository.PassengerRepository
import com.integra.nfc.IntegraHceService
import com.integra.presentation.common.UiState
import com.integra.testutil.BaseFakeApiService
import com.integra.testutil.MainDispatcherRule
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.*
import org.junit.Rule
import org.junit.Test
import retrofit2.Response

@OptIn(ExperimentalCoroutinesApi::class)
class PassengerTicketViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val sampleTicket = TicketDetailsDto(
        ticketId = "TKT-TEST-001",
        tripId = "TRIP-001",
        passengerName = "Guilherme Santos",
        seat = 18,
        departure = "São Paulo",
        arrival = "Rio de Janeiro",
        tripDate = "21/08/2026",
        sold = 1,
        used = 0,
        utHash = "HASH_NFC_CREDENTIAL_123"
    )

    @Test
    fun testLoadTicketsSuccessSelectsActiveTicketAndConfiguresHce() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getUserTickets(userId: String): Response<List<TicketDetailsDto>> {
                return Response.success(listOf(sampleTicket))
            }

            override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
                return Response.success(LuggagesByTicketResponse(emptyList()))
            }
        }

        val passengerRepo = PassengerRepository(fakeApi)
        val luggageRepo = LuggageRepository(fakeApi)
        val viewModel = PassengerTicketViewModel(passengerRepo, luggageRepo, sessionManager = null)

        viewModel.loadTickets("USR-001")

        // 1. Verifica lista de tickets carregada com sucesso
        val listState = viewModel.ticketsListState.value
        assertTrue(listState is UiState.Success)
        assertEquals(1, (listState as UiState.Success).data.size)

        // 2. Verifica bilhete ativo
        val activeState = viewModel.activeTicketState.value
        assertTrue(activeState is UiState.Success)
        val activeTicket = (activeState as UiState.Success).data
        assertNotNull(activeTicket)
        assertEquals("TKT-TEST-001", activeTicket?.ticketId)

        // 3. Verifica credencial configurada no HCE service
        assertEquals("HASH_NFC_CREDENTIAL_123", IntegraHceService.activeCredentialRef)
    }

    @Test
    fun testClientSideNotificationDerivation() = runTest {
        val luggage = BaggageItemDto("BAG-ACTIVE-01", "HASH-ACTIVE-01")

        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getUserTickets(userId: String): Response<List<TicketDetailsDto>> {
                return Response.success(listOf(sampleTicket))
            }

            override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
                return Response.success(LuggagesByTicketResponse(listOf(luggage)))
            }
        }

        val passengerRepo = PassengerRepository(fakeApi)
        val luggageRepo = LuggageRepository(fakeApi)
        val viewModel = PassengerTicketViewModel(passengerRepo, luggageRepo, sessionManager = null)

        viewModel.loadTickets("USR-001")

        // Verifica que as notificações foram 100% derivadas no client-side
        val notifState = viewModel.notificationsState.value
        assertTrue(notifState is UiState.Success)
        val notifications = (notifState as UiState.Success).data

        // Deve conter notificação da passagem confirmada + notificação da bagagem vinculada
        assertTrue(notifications.any { it.title == "Passagem confirmada" })
        assertTrue(notifications.any { it.title == "Bagagem vinculada" })
        assertEquals(2, notifications.size)
    }

    @Test
    fun testLoadTicketsErrorWithoutCache() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getUserTickets(userId: String): Response<List<TicketDetailsDto>> {
                val errorBody = "{\"error\":\"Servidor indisponível\"}"
                    .toResponseBody("application/json".toMediaTypeOrNull())
                return Response.error(500, errorBody)
            }
        }

        val passengerRepo = PassengerRepository(fakeApi)
        val luggageRepo = LuggageRepository(fakeApi)
        val viewModel = PassengerTicketViewModel(passengerRepo, luggageRepo, sessionManager = null)

        viewModel.loadTickets("USR-001")

        assertTrue(viewModel.ticketsListState.value is UiState.Error)
        assertTrue(viewModel.activeTicketState.value is UiState.Error)
        assertTrue(viewModel.notificationsState.value is UiState.Error)
    }
}
