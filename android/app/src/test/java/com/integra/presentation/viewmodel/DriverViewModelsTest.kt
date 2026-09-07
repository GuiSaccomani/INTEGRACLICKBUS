package com.integra.presentation.viewmodel

import com.integra.data.model.*
import com.integra.data.repository.DriverRepository
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
class DriverViewModelsTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val sampleTrip = TripDto(
        tripId = "TRIP-REAL-123",
        departure = "São Paulo, SP",
        arrival = "Rio de Janeiro, RJ",
        tripDate = "2026-09-10",
        ticketsCount = 38,
        occupation = "85%"
    )

    private val samplePassenger = TripPassengerDto(
        ticketId = "TKT-001",
        seat = 12,
        passengerName = "Carlos Lima",
        passengerEmail = "carlos@email.com",
        isBoarded = true,
        baggageCount = 2
    )

    private val sampleSummary = TripSummaryDto(
        tripId = "TRIP-REAL-123",
        departure = "São Paulo, SP",
        arrival = "Rio de Janeiro, RJ",
        tripDate = "2026-09-10",
        totalTicketsCount = 42,
        soldCount = 38,
        boardedCount = 25,
        baggageCount = 18,
        tripOccupation = "85%"
    )

    @Test
    fun testDriverPassengerListResolvesActiveTripDynamically() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getDriverTrips(driverId: String): Response<DriverTripsResponse> {
                return Response.success(DriverTripsResponse(listOf(sampleTrip)))
            }

            override suspend fun getTripPassengers(tripId: String): Response<TripPassengersResponse> {
                assertEquals("TRIP-REAL-123", tripId)
                return Response.success(TripPassengersResponse(listOf(samplePassenger)))
            }
        }

        val repository = DriverRepository(fakeApi)
        val viewModel = DriverPassengerListViewModel(repository = repository, sessionManager = null)

        viewModel.loadPassengers(tripId = null, driverId = "DRV-10293")

        val state = viewModel.uiState.value
        assertTrue(state is DriverPassengerListUiState.Success)
        val passengers = (state as DriverPassengerListUiState.Success).passengers
        assertEquals(1, passengers.size)
        assertEquals("Carlos Lima", passengers[0].passengerName)
        assertEquals("TKT-001", passengers[0].ticketId)
    }

    @Test
    fun testDriverPassengerListHandlesNoTrips() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getDriverTrips(driverId: String): Response<DriverTripsResponse> {
                return Response.success(DriverTripsResponse(emptyList()))
            }
        }

        val repository = DriverRepository(fakeApi)
        val viewModel = DriverPassengerListViewModel(repository = repository, sessionManager = null)

        viewModel.loadPassengers(tripId = null, driverId = "DRV-EMPTY")

        val state = viewModel.uiState.value
        assertTrue(state is DriverPassengerListUiState.Success)
        assertTrue((state as DriverPassengerListUiState.Success).passengers.isEmpty())
    }

    @Test
    fun testDriverHomeViewModelResolvesActiveTripSummary() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getDriverTrips(driverId: String): Response<DriverTripsResponse> {
                return Response.success(DriverTripsResponse(listOf(sampleTrip)))
            }

            override suspend fun getTripSummary(tripId: String): Response<TripSummaryDto> {
                assertEquals("TRIP-REAL-123", tripId)
                return Response.success(sampleSummary)
            }
        }

        val repository = DriverRepository(fakeApi)
        val viewModel = DriverHomeViewModel(repository = repository, sessionManager = null)

        viewModel.loadTripSummary(tripId = null, driverId = "DRV-10293")

        val state = viewModel.uiState.value
        assertTrue(state is DriverHomeUiState.Success)
        val summary = (state as DriverHomeUiState.Success).summary
        assertEquals("TRIP-REAL-123", summary.tripId)
        assertEquals(25, summary.boardedCount)
        assertEquals("85%", summary.tripOccupation)
    }

    @Test
    fun testDriverHomeViewModelHandlesNoAssignedTrips() = runTest {
        val fakeApi = object : BaseFakeApiService() {
            override suspend fun getDriverTrips(driverId: String): Response<DriverTripsResponse> {
                return Response.success(DriverTripsResponse(emptyList()))
            }
        }

        val repository = DriverRepository(fakeApi)
        val viewModel = DriverHomeViewModel(repository = repository, sessionManager = null)

        viewModel.loadTripSummary(tripId = null, driverId = "DRV-NO-TRIP")

        val state = viewModel.uiState.value
        assertTrue(state is DriverHomeUiState.Error)
        assertEquals("Nenhuma viagem atribuída a este motorista.", (state as DriverHomeUiState.Error).message)
    }
}
