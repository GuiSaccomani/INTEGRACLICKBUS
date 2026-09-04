package com.integra.data.network

import com.integra.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ─── AUTENTICAÇÃO ─────────────────────────────────────────────────────────

    @POST("/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @GET("/auth/profile/{userId}")
    suspend fun getProfile(
        @Path("userId") userId: String
    ): Response<UserProfileDto>

    // ─── PASSENGER & TICKETS ──────────────────────────────────────────────────

    @GET("/passenger/user/{userId}/tickets")
    suspend fun getUserTickets(
        @Path("userId") userId: String
    ): Response<List<TicketDetailsDto>>

    @GET("/passenger/ticket/{ticketId}")
    suspend fun getTicket(
        @Path("ticketId") ticketId: String
    ): Response<TicketResponseDto>

    @POST("/passenger/ticket/{ticketId}/validate")
    suspend fun validateTicket(
        @Path("ticketId") ticketId: String,
        @Body request: ValidateTicketRequest = ValidateTicketRequest()
    ): Response<ValidatedTicketResponseDto>

    @POST("/passenger/credential/validate")
    suspend fun validateCredential(
        @Body request: ValidateCredentialRequest
    ): Response<ValidatedTicketResponseDto>

    // ─── DRIVER & TRIPS ───────────────────────────────────────────────────────

    @GET("/driver/{driverId}/trips")
    suspend fun getDriverTrips(
        @Path("driverId") driverId: String
    ): Response<DriverTripsResponse>

    @GET("/driver/trip/{tripId}/passengers")
    suspend fun getTripPassengers(
        @Path("tripId") tripId: String
    ): Response<TripPassengersResponse>

    @GET("/driver/trip/{tripId}/summary")
    suspend fun getTripSummary(
        @Path("tripId") tripId: String
    ): Response<TripSummaryDto>

    // ─── BAGGAGE (RAW 32) ─────────────────────────────────────────────────────

    @POST("/luggages")
    suspend fun addLuggage(
        @Body request: CreateLuggageRequest
    ): Response<CreateLuggageResponse>

    @GET("/luggages/ticket/{ticketId}")
    suspend fun getLuggagesByTicket(
        @Path("ticketId") ticketId: String
    ): Response<LuggagesByTicketResponse>

    @GET("/luggages/{id}")
    suspend fun getLuggageById(
        @Path("id") baggageId: String
    ): Response<LuggageDetailResponse>

    @DELETE("/luggages/{id}")
    suspend fun deleteLuggage(
        @Path("id") baggageId: String
    ): Response<DeleteLuggageResponse>

    // ─── WEBAUTHN / PASSKEYS ──────────────────────────────────────────────────

    @POST("/auth/webauthn/login/options")
    suspend fun getWebAuthnLoginOptions(
        @Body request: WebAuthnLoginOptionsRequest = WebAuthnLoginOptionsRequest()
    ): Response<Map<String, Any>>

    @POST("/auth/webauthn/login/verify")
    suspend fun verifyWebAuthnLogin(
        @Body request: WebAuthnLoginVerifyRequest
    ): Response<WebAuthnLoginVerifyResponse>

    @GET("/auth/webauthn/status/{userId}")
    suspend fun getWebAuthnStatus(
        @Path("userId") userId: String
    ): Response<WebAuthnStatusResponse>

    // ─── HEALTH ───────────────────────────────────────────────────────────────

    @GET("/health")
    suspend fun healthCheck(): Response<Map<String, Any>>

    @GET("/health/db")
    suspend fun healthDbCheck(): Response<Map<String, Any>>
}
