package com.integra.qr

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import com.integra.ui.theme.*
import java.util.concurrent.Executors

sealed class QrScanState {
    object Idle : QrScanState()
    object RequestingPermission : QrScanState()
    object PermissionDenied : QrScanState()
    object Scanning : QrScanState()
    object Processing : QrScanState()
    data class Success(val credentialRef: String) : QrScanState()
    data class Error(val message: String) : QrScanState()
}

@Composable
fun QrScannerView(
    modifier: Modifier = Modifier,
    onCodeScanned: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    var scanState by remember {
        mutableStateOf<QrScanState>(
            if (hasCameraPermission) QrScanState.Scanning else QrScanState.RequestingPermission
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        scanState = if (isGranted) QrScanState.Scanning else QrScanState.PermissionDenied
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    Box(modifier = modifier.fillMaxSize().background(Color.Black)) {
        if (hasCameraPermission && (scanState == QrScanState.Scanning || scanState == QrScanState.Processing)) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    val executor = Executors.newSingleThreadExecutor()

                    val options = BarcodeScannerOptions.Builder()
                        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                        .build()
                    val barcodeScanner = BarcodeScanning.getClient(options)

                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()
                        val preview = Preview.Builder().build().also {
                            it.setSurfaceProvider(previewView.surfaceProvider)
                        }

                        val imageAnalysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()

                        var isCodeFound = false

                        imageAnalysis.setAnalyzer(executor) { imageProxy: ImageProxy ->
                            val mediaImage = imageProxy.image
                            if (mediaImage != null && !isCodeFound) {
                                val image = InputImage.fromMediaImage(
                                    mediaImage,
                                    imageProxy.imageInfo.rotationDegrees
                                )

                                barcodeScanner.process(image)
                                    .addOnSuccessListener { barcodes ->
                                        if (barcodes.isNotEmpty() && !isCodeFound) {
                                            val rawValue = barcodes[0].rawValue
                                            if (!rawValue.isNullOrBlank()) {
                                                isCodeFound = true
                                                scanState = QrScanState.Success(rawValue)
                                                onCodeScanned(rawValue)
                                            }
                                        }
                                    }
                                    .addOnFailureListener {
                                        Log.e("QrScannerView", "Erro na leitura do QR: ${it.message}")
                                    }
                                    .addOnCompleteListener {
                                        imageProxy.close()
                                    }
                            } else {
                                imageProxy.close()
                            }
                        }

                        try {
                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(
                                lifecycleOwner,
                                CameraSelector.DEFAULT_BACK_CAMERA,
                                preview,
                                imageAnalysis
                            )
                        } catch (e: Exception) {
                            Log.e("QrScannerView", "Erro ao vincular CameraX", e)
                            scanState = QrScanState.Error("Não foi possível iniciar a câmera.")
                        }
                    }, ContextCompat.getMainExecutor(ctx))

                    previewView
                }
            )

            // Overlay de retículo com cantos destacados
            Canvas(modifier = Modifier.fillMaxSize()) {
                val boxSize = 250.dp.toPx()
                val left = (size.width - boxSize) / 2
                val top = (size.height - boxSize) / 2

                // Fundo semi-transparente escurecido
                drawRect(
                    color = Color.Black.copy(alpha = 0.5f)
                )

                // Área do scanner limpa (recorte visual)
                drawRoundRect(
                    color = Color.Transparent,
                    topLeft = Offset(left, top),
                    size = Size(boxSize, boxSize),
                    cornerRadius = CornerRadius(16.dp.toPx(), 16.dp.toPx()),
                    blendMode = androidx.compose.ui.graphics.BlendMode.Clear
                )

                // Bordas de mira
                drawRoundRect(
                    color = DS_Primary,
                    topLeft = Offset(left, top),
                    size = Size(boxSize, boxSize),
                    cornerRadius = CornerRadius(16.dp.toPx(), 16.dp.toPx()),
                    style = Stroke(width = 3.dp.toPx())
                )
            }
        }

        // Top Bar com fechar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 50.dp, start = 20.dp, end = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.6f))
                    .clickable { onDismiss() },
                contentAlignment = Alignment.Center
            ) {
                Text("✕", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }

            Text(
                text = "Escanear QR Code",
                color = Color.White,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.size(40.dp))
        }

        // Rodapé de instruções / estados
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.Black.copy(alpha = 0.75f))
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            when (scanState) {
                is QrScanState.Scanning -> {
                    Text(
                        text = "Posicione o QR Code do passageiro na mira",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                is QrScanState.Processing -> {
                    CircularProgressIndicator(color = DS_Primary, modifier = Modifier.size(28.dp))
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Validando credencial...", color = Color.White, fontSize = 14.sp)
                }
                is QrScanState.PermissionDenied -> {
                    Text(
                        text = "Acesso à câmera necessário para ler QR Codes.",
                        color = DS_Error,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(DS_Primary)
                            .clickable { permissionLauncher.launch(Manifest.permission.CAMERA) }
                            .padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Text("Permitir Câmera", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
                is QrScanState.Error -> {
                    Text(
                        text = (scanState as QrScanState.Error).message,
                        color = DS_Error,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                is QrScanState.Success -> {
                    Text("✓ QR Code Detectado!", color = DS_Success, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
                else -> {}
            }
        }
    }
}
