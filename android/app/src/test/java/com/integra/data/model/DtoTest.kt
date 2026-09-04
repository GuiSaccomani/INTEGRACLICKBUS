package com.integra.data.model

import org.junit.Assert.*
import org.junit.Test

class DtoTest {

    @Test
    fun testTicketReadyToBoardConditions() {
        val readyTicket = TicketDetailsDto(
            ticketId = "TICK-12345",
            tripId = "TRIP-999",
            passengerName = "Guilherme Santos",
            seat = 18,
            departure = "São Paulo",
            arrival = "Rio de Janeiro",
            tripDate = "2026-09-05",
            sold = 1,
            used = 0,
            utHash = "UT_7A9B2C4D8E1F3A5B"
        )
        assertTrue(readyTicket.isSold)
        assertFalse(readyTicket.isUsed)
        assertTrue(readyTicket.isReadyToBoard)

        val usedTicket = readyTicket.copy(used = 1)
        assertTrue(usedTicket.isUsed)
        assertFalse(usedTicket.isReadyToBoard)

        val unsoldTicket = readyTicket.copy(sold = 0)
        assertFalse(unsoldTicket.isSold)
        assertFalse(unsoldTicket.isReadyToBoard)
    }

    @Test
    fun testUserRolePermissions() {
        val passengerRole = UserRoleDto(isPassenger = true, isDriver = false, isOperator = false)
        assertTrue(passengerRole.isPassenger)
        assertFalse(passengerRole.isDriver)

        val driverRole = UserRoleDto(isPassenger = true, isDriver = true, isOperator = false)
        assertTrue(driverRole.isDriver)
    }
}
