package com.integra.data.model

import com.google.gson.annotations.SerializedName

// ─── AUTENTICAÇÃO E PERFIL ────────────────────────────────────────────────────

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class UserRoleDto(
    @SerializedName("isPassenger") val isPassenger: Boolean = true,
    @SerializedName("isDriver") val isDriver: Boolean = false,
    @SerializedName("isOperator") val isOperator: Boolean = false
)

data class UserProfileDto(
    @SerializedName("userId") val userId: String,
    @SerializedName("userName") val userName: String,
    @SerializedName("userEmail") val userEmail: String,
    @SerializedName("roles") val roles: UserRoleDto = UserRoleDto()
)

data class LoginResponse(
    @SerializedName("message") val message: String,
    @SerializedName("user") val user: UserProfileDto
)

// ─── PASSAGENS / TICKETS ──────────────────────────────────────────────────────

data class TicketDetailsDto(
    @SerializedName("ticketId") val ticketId: String,
    @SerializedName("tripId") val tripId: String,
    @SerializedName("passengerName") val passengerName: String,
    @SerializedName("passengerEmail") val passengerEmail: String? = null,
    @SerializedName("seat") val seat: Int,
    @SerializedName("departure") val departure: String,
    @SerializedName("arrival") val arrival: String,
    @SerializedName("tripDate") val tripDate: String,
    @SerializedName("sold") val sold: Int,
    @SerializedName("used") val used: Int,
    @SerializedName("utHash") val utHash: String? = null,
    @SerializedName("transitCardId") val transitCardId: String? = null
) {
    val isUsed: Boolean get() = used == 1
    val isSold: Boolean get() = sold == 1
    val isReadyToBoard: Boolean get() = sold == 1 && used == 0
}

data class TicketResponseDto(
    @SerializedName("ticket") val ticket: TicketDetailsDto,
    @SerializedName("luggages") val luggages: List<BaggageItemDto> = emptyList()
)

data class ValidatedTicketDataDto(
    @SerializedName("validated") val validated: Boolean,
    @SerializedName("ticketId") val ticketId: String,
    @SerializedName("passengerName") val passengerName: String,
    @SerializedName("seat") val seat: Int,
    @SerializedName("departure") val departure: String,
    @SerializedName("arrival") val arrival: String,
    @SerializedName("used") val used: Int,
    @SerializedName("luggagesCount") val luggagesCount: Int = 0,
    @SerializedName("luggagesDetails") val luggagesDetails: List<BaggageItemDto> = emptyList()
)

data class ValidatedTicketResponseDto(
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: ValidatedTicketDataDto
)

data class ValidateCredentialRequest(
    @SerializedName("credentialRef") val credentialRef: String,
    @SerializedName("driverId") val driverId: String? = null
)

data class ValidateTicketRequest(
    @SerializedName("driverId") val driverId: String? = null
)

// ─── VIAGENS E MOTORISTA ──────────────────────────────────────────────────────

data class TripDto(
    @SerializedName("tripId") val tripId: String,
    @SerializedName("departure") val departure: String,
    @SerializedName("arrival") val arrival: String,
    @SerializedName("tripDate") val tripDate: String,
    @SerializedName("ticketsCount") val ticketsCount: Int = 0,
    @SerializedName("occupation") val occupation: String = "0%"
)

data class DriverTripsResponse(
    @SerializedName("trips") val trips: List<TripDto> = emptyList()
)

data class TripPassengerDto(
    @SerializedName("ticketId") val ticketId: String,
    @SerializedName("seat") val seat: Int,
    @SerializedName("passengerName") val passengerName: String,
    @SerializedName("passengerEmail") val passengerEmail: String? = null,
    @SerializedName("status") val status: String = "Pendente",
    @SerializedName("isBoarded") val isBoarded: Boolean = false,
    @SerializedName("baggageCount") val baggageCount: Int = 0,
    @SerializedName("hasBaggage") val hasBaggage: Boolean = false
)

data class TripPassengersResponse(
    @SerializedName("passengers") val passengers: List<TripPassengerDto> = emptyList()
)

data class TripSummaryDto(
    @SerializedName("tripId") val tripId: String,
    @SerializedName("departure") val departure: String,
    @SerializedName("arrival") val arrival: String,
    @SerializedName("tripDate") val tripDate: String,
    @SerializedName("tripTickets") val tripTickets: Int = 0,
    @SerializedName("tripOccupation") val tripOccupation: String = "0%",
    @SerializedName("totalTicketsCount") val totalTicketsCount: Int = 0,
    @SerializedName("boardedCount") val boardedCount: Int = 0,
    @SerializedName("soldCount") val soldCount: Int = 0,
    @SerializedName("baggageCount") val baggageCount: Int = 0
)

// ─── BAGAGENS (RAW 32) ────────────────────────────────────────────────────────

data class BaggageItemDto(
    @SerializedName("baggageId") val baggageId: String,
    @SerializedName("baggageUtHash") val baggageUtHash: String
)

data class LuggageDetailDto(
    @SerializedName("baggageId") val baggageId: String,
    @SerializedName("baggageUtHash") val baggageUtHash: String,
    @SerializedName("ticketId") val ticketId: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("passengerName") val passengerName: String,
    @SerializedName("seat") val seat: Int,
    @SerializedName("departure") val departure: String,
    @SerializedName("arrival") val arrival: String,
    @SerializedName("tripDate") val tripDate: String
)

data class LuggageDetailResponse(
    @SerializedName("luggage") val luggage: LuggageDetailDto
)

data class LuggagesByTicketResponse(
    @SerializedName("luggages") val luggages: List<BaggageItemDto> = emptyList()
)

data class CreateLuggageRequest(
    @SerializedName("ticketId") val ticketId: String,
    @SerializedName("baggageId") val baggageId: String? = null
)

data class CreateLuggageResponse(
    @SerializedName("message") val message: String,
    @SerializedName("luggage") val luggage: BaggageItemDto
)

data class DeleteLuggageResponse(
    @SerializedName("message") val message: String,
    @SerializedName("deleted") val deleted: Boolean
)

// ─── WEBAUTHN / PASSKEYS DTOs ─────────────────────────────────────────────────

data class WebAuthnLoginOptionsRequest(
    @SerializedName("email") val email: String? = null
)

data class WebAuthnLoginVerifyRequest(
    @SerializedName("response") val response: Any,
    @SerializedName("challengeKey") val challengeKey: String? = null
)

data class WebAuthnLoginVerifyResponse(
    @SerializedName("verified") val verified: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("user") val user: UserProfileDto
)

data class WebAuthnStatusResponse(
    @SerializedName("registered") val registered: Boolean,
    @SerializedName("credentialsCount") val credentialsCount: Int = 0
)

data class ApiErrorResponse(
    @SerializedName("error") val error: String? = null,
    @SerializedName("message") val message: String? = null
)
