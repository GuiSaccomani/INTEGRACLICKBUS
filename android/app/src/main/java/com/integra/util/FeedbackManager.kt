package com.integra.util

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.speech.tts.TextToSpeech
import java.util.Locale

class FeedbackManager(private val context: Context) : TextToSpeech.OnInitListener {

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    private var toneGenerator: ToneGenerator? = try {
        ToneGenerator(AudioManager.STREAM_NOTIFICATION, 85)
    } catch (_: Exception) {
        null
    }

    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        try {
            tts = TextToSpeech(context.applicationContext, this)
        } catch (_: Exception) {}
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale("pt", "BR"))
            isTtsReady = (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED)
        }
    }

    fun triggerSuccessHaptic() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // Toque duplo curto de sucesso
                val timings = longArrayOf(0, 40, 60, 40)
                val amplitudes = intArrayOf(0, 180, 0, 220)
                vibrator?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(longArrayOf(0, 50, 70, 50), -1)
            }
        } catch (_: Exception) {}
    }

    fun triggerErrorHaptic() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val timings = longArrayOf(0, 80, 50, 80, 50, 100)
                val amplitudes = intArrayOf(0, 255, 0, 255, 0, 255)
                vibrator?.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(longArrayOf(0, 80, 50, 80), -1)
            }
        } catch (_: Exception) {}
    }

    fun playSuccessTone() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_ACK, 250)
        } catch (_: Exception) {}
    }

    fun playErrorTone() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_NACK, 350)
        } catch (_: Exception) {}
    }

    fun speak(text: String) {
        if (isTtsReady && !text.isBlank()) {
            try {
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "integra_feedback_${System.currentTimeMillis()}")
            } catch (_: Exception) {}
        }
    }

    fun notifySuccess(voiceMessage: String? = null) {
        triggerSuccessHaptic()
        playSuccessTone()
        if (voiceMessage != null) speak(voiceMessage)
    }

    fun notifyError(voiceMessage: String? = null) {
        triggerErrorHaptic()
        playErrorTone()
        if (voiceMessage != null) speak(voiceMessage)
    }

    companion object {
        @Volatile
        private var instance: FeedbackManager? = null

        fun getInstance(context: Context): FeedbackManager {
            return instance ?: synchronized(this) {
                instance ?: FeedbackManager(context.applicationContext).also { instance = it }
            }
        }

        fun vibrateSuccess(context: Context) {
            getInstance(context).triggerSuccessHaptic()
        }

        fun playBeepSuccess(context: Context? = null) {
            if (context != null) {
                getInstance(context).playSuccessTone()
            } else {
                try {
                    ToneGenerator(AudioManager.STREAM_NOTIFICATION, 85).startTone(ToneGenerator.TONE_PROP_ACK, 250)
                } catch (_: Exception) {}
            }
        }

        fun notifySuccess(context: Context, voiceMessage: String? = null) {
            getInstance(context).notifySuccess(voiceMessage)
        }

        fun notifyError(context: Context, voiceMessage: String? = null) {
            getInstance(context).notifyError(voiceMessage)
        }
    }
}
