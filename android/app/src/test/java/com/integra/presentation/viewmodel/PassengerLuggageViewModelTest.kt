package com.integra.presentation.viewmodel

import com.integra.data.model.*
import com.integra.data.repository.LuggageRepository
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
class PassengerLuggageViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun testLoadLuggagesSuccess() = runTest {
        val fakeLuggages = listOf(
            BaggageItemDto("BAG-100", "HASH-100"),
            BaggageItemDto("BAG-101", "HASH-101")
        )

        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
                return Response.success(
                    LuggagesByTicketResponse(
                        luggages = fakeLuggages
                    )
                )
            }
        }

        val repository = LuggageRepository(fakeApi)
        val viewModel = PassengerLuggageViewModel(repository)

        assertEquals(UiState.Idle, viewModel.luggagesState.value)

        viewModel.loadLuggages("TKT-123")

        val state = viewModel.luggagesState.value
        assertTrue(state is UiState.Success)
        val data = (state as UiState.Success).data
        assertEquals(2, data.size)
        assertEquals("BAG-100", data[0].baggageId)
    }

    @Test
    fun testLoadLuggagesError() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
                val errorBody = "{\"error\":\"Passagem não encontrada\"}"
                    .toResponseBody("application/json".toMediaTypeOrNull())
                return Response.error(404, errorBody)
            }
        }

        val repository = LuggageRepository(fakeApi)
        val viewModel = PassengerLuggageViewModel(repository)

        viewModel.loadLuggages("TKT-INVALID")

        val state = viewModel.luggagesState.value
        assertTrue(state is UiState.Error)
    }

    @Test
    fun testLoadLuggageDetailSuccess() = runTest {
        val detailDto = LuggageDetailDto(
            baggageId = "BAG-200",
            baggageUtHash = "HASH-200",
            ticketId = "TKT-123",
            userId = "USR-001",
            passengerName = "Guilherme Santos",
            seat = 18,
            departure = "São Paulo",
            arrival = "Rio de Janeiro",
            tripDate = "21/08/2026"
        )

        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getLuggageById(baggageId: String): Response<LuggageDetailResponse> {
                return Response.success(LuggageDetailResponse(detailDto))
            }
        }

        val repository = LuggageRepository(fakeApi)
        val viewModel = PassengerLuggageViewModel(repository)

        viewModel.loadLuggageDetail("BAG-200")

        val state = viewModel.detailState.value
        assertTrue(state is UiState.Success)
        assertEquals("BAG-200", (state as UiState.Success).data.baggageId)
        assertEquals("TKT-123", state.data.ticketId)
    }

    @Test
    fun testAddLuggageSuccess() = runTest {
        var callbackCalled = false
        val newBag = BaggageItemDto("BAG-NEW-1", "HASH-NEW-1")

        val fakeApi = object : BaseFakeApiService() {
            override suspend fun addLuggage(request: CreateLuggageRequest): Response<CreateLuggageResponse> {
                return Response.success(CreateLuggageResponse("Bagagem cadastrada", newBag))
            }
            override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
                return Response.success(LuggagesByTicketResponse(listOf(newBag)))
            }
        }

        val repository = LuggageRepository(fakeApi)
        val viewModel = PassengerLuggageViewModel(repository)

        viewModel.addLuggage("TKT-123", "BAG-NEW-1", onSuccess = {
            callbackCalled = true
        })

        assertTrue(callbackCalled)
        assertTrue(viewModel.actionState.value is UiState.Success)
    }

    @Test
    fun testDeleteLuggageSuccess() = runTest {
        var callbackCalled = false

        val fakeApi = object : BaseFakeApiService() {
            override suspend fun deleteLuggage(baggageId: String): Response<DeleteLuggageResponse> {
                return Response.success(DeleteLuggageResponse("Bagagem removida", true))
            }
            override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
                return Response.success(LuggagesByTicketResponse(emptyList()))
            }
        }

        val repository = LuggageRepository(fakeApi)
        val viewModel = PassengerLuggageViewModel(repository)

        viewModel.deleteLuggage("BAG-DEL-1", "TKT-123", onSuccess = {
            callbackCalled = true
        })

        assertTrue(callbackCalled)
        assertTrue(viewModel.actionState.value is UiState.Success)
    }
}
