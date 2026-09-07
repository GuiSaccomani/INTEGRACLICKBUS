package com.integra.testutil

import com.integra.data.model.*
import com.integra.data.network.ApiService
import retrofit2.Response

open class BaseFakeApiService : ApiService {
    override suspend fun login(request: LoginRequest): Response<LoginResponse> {
        throw NotImplementedError()
    }

    override suspend fun getProfile(userId: String): Response<UserProfileDto> {
        throw NotImplementedError()
    }

    override suspend fun getUserTickets(userId: String): Response<List<TicketDetailsDto>> {
        throw NotImplementedError()
    }

    override suspend fun getTicket(ticketId: String): Response<TicketResponseDto> {
        throw NotImplementedError()
    }

    override suspend fun validateTicket(ticketId: String, request: ValidateTicketRequest): Response<ValidatedTicketResponseDto> {
        throw NotImplementedError()
    }

    override suspend fun validateCredential(request: ValidateCredentialRequest): Response<ValidatedTicketResponseDto> {
        throw NotImplementedError()
    }

    override suspend fun getDriverTrips(driverId: String): Response<DriverTripsResponse> {
        throw NotImplementedError()
    }

    override suspend fun getTripPassengers(tripId: String): Response<TripPassengersResponse> {
        throw NotImplementedError()
    }

    override suspend fun getTripSummary(tripId: String): Response<TripSummaryDto> {
        throw NotImplementedError()
    }

    override suspend fun addLuggage(request: CreateLuggageRequest): Response<CreateLuggageResponse> {
        throw NotImplementedError()
    }

    override suspend fun getLuggagesByTicket(ticketId: String): Response<LuggagesByTicketResponse> {
        throw NotImplementedError()
    }

    override suspend fun getLuggageById(baggageId: String): Response<LuggageDetailResponse> {
        throw NotImplementedError()
    }

    override suspend fun deleteLuggage(baggageId: String): Response<DeleteLuggageResponse> {
        throw NotImplementedError()
    }

    override suspend fun getWebAuthnLoginOptions(request: WebAuthnLoginOptionsRequest): Response<Map<String, Any>> {
        throw NotImplementedError()
    }

    override suspend fun verifyWebAuthnLogin(request: WebAuthnLoginVerifyRequest): Response<WebAuthnLoginVerifyResponse> {
        throw NotImplementedError()
    }

    override suspend fun getWebAuthnStatus(userId: String): Response<WebAuthnStatusResponse> {
        throw NotImplementedError()
    }

    override suspend fun healthCheck(): Response<Map<String, Any>> {
        throw NotImplementedError()
    }

    override suspend fun healthDbCheck(): Response<Map<String, Any>> {
        throw NotImplementedError()
    }
}
