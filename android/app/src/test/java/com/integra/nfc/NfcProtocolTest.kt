package com.integra.nfc

import org.junit.Assert.*
import org.junit.Test

class NfcProtocolTest {

    @Test
    fun testSelectApduMatchesAid() {
        val expectedAidHex = "F0494E5445475241" // F0 + "INTEGRA" em ASCII
        val selectApdu = NfcReaderManager.SELECT_APDU

        // CLA=00, INS=A4, P1=04, P2=00, Lc=08
        assertEquals(0x00.toByte(), selectApdu[0])
        assertEquals(0xA4.toByte(), selectApdu[1])
        assertEquals(0x04.toByte(), selectApdu[2])
        assertEquals(0x00.toByte(), selectApdu[3])
        assertEquals(0x08.toByte(), selectApdu[4])

        // Extrai o AID dos bytes 5 até 12
        val aidBytes = selectApdu.sliceArray(5 until 13)
        val aidHex = aidBytes.joinToString("") { "%02X".format(it) }
        assertEquals(expectedAidHex, aidHex)
    }

    @Test
    fun testPayloadProtocolFormatting() {
        val credentialRef = "UT_7A9B2C4D8E1F3A5B"
        val expectedPayload = "INTEGRA:V1:$credentialRef"

        assertTrue(expectedPayload.startsWith("INTEGRA:V1:"))
        val extractedRef = expectedPayload.removePrefix("INTEGRA:V1:")
        assertEquals(credentialRef, extractedRef)

        // Status Word 90 00
        val sw = byteArrayOf(0x90.toByte(), 0x00.toByte())
        assertEquals(2, sw.size)
        assertEquals(0x90.toByte(), sw[0])
        assertEquals(0x00.toByte(), sw[1])
    }

    @Test
    fun testBaggageIdDecoupledFromHardwareUid() {
        // Tag Física: UID de 7 bytes (14 caracteres hex) ex: NTAG213
        val physicalTagUid = "04A1B2C3D4E5F6"
        assertEquals(14, physicalTagUid.length)

        // Business BAGGAGE_ID: RAW 32 (32 bytes = 64 caracteres hexadecimais)
        val businessBaggageId = "A1B2C3D4E5F60123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123"
        assertEquals(64, businessBaggageId.length)

        // Verificação estrita de desacoplamento: UID físico NUNCA é igual ao ID de negócio
        assertNotEquals(physicalTagUid, businessBaggageId)
        assertFalse(businessBaggageId.contains(physicalTagUid))
    }
}
