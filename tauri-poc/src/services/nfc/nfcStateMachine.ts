/**
 * Máquina de Estados NFC Oficial da POC Tauri 2 — ÍNTEGRA
 * 
 * Centraliza e isola todos os estados operacionais de NFC para evitar
 * dispersão de lógica e flags pelas telas do aplicativo.
 */

export type NfcOperationMode = "READ_BAGGAGE" | "WRITE_BAGGAGE" | "HCE_PASSENGER" | "READER_DRIVER";

export type NfcState =
  | "IDLE"
  | "CHECKING_SUPPORT"
  | "WAITING"
  | "READING"
  | "WRITING"
  | "PROCESSING"
  | "SUCCESS"
  | "ERROR";

export type NfcErrorCode =
  | "HARDWARE_UNAVAILABLE"
  | "NFC_DISABLED"
  | "UNSUPPORTED_ENVIRONMENT"
  | "TIMEOUT"
  | "USER_CANCELLED"
  | "TAG_INCOMPATIBLE"
  | "INVALID_PAYLOAD"
  | "API_UNAVAILABLE"
  | "UNKNOWN_ERROR";

export interface NfcStateSnapshot {
  state: NfcState;
  mode?: NfcOperationMode;
  message: string;
  progress?: number;
  data?: any;
  errorCode?: NfcErrorCode;
  errorMessage?: string;
  canCancel: boolean;
}

type StateListener = (snapshot: NfcStateSnapshot) => void;

class NfcStateMachine {
  private currentState: NfcState = "IDLE";
  private currentMode?: NfcOperationMode;
  private message: string = "NFC em repouso";
  private progress: number = 0;
  private data: any = null;
  private errorCode?: NfcErrorCode;
  private errorMessage?: string;
  private abortController: AbortController | null = null;
  private timeoutId: any = null;
  private listeners: Set<StateListener> = new Set();

  /**
   * Obtém o snapshot atual do estado da máquina.
   */
  public getSnapshot(): NfcStateSnapshot {
    return {
      state: this.currentState,
      mode: this.currentMode,
      message: this.message,
      progress: this.progress,
      data: this.data,
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      canCancel: ["WAITING", "READING", "WRITING", "PROCESSING"].includes(this.currentState),
    };
  }

  /**
   * Registra um listener para observar transições de estado.
   * Retorna uma função para cancelar a assinatura (cleanup).
   */
  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error("[NfcStateMachine] Erro no listener:", err);
      }
    }
  }

  /**
   * Reseta a máquina para o estado inicial IDLE.
   */
  public reset(): void {
    this.clearTimer();
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.currentState = "IDLE";
    this.currentMode = undefined;
    this.message = "NFC em repouso";
    this.progress = 0;
    this.data = null;
    this.errorCode = undefined;
    this.errorMessage = undefined;
    this.notify();
  }

  /**
   * Inicia uma nova operação NFC configurando timeout e signal de cancelamento.
   */
  public startOperation(mode: NfcOperationMode, timeoutMs: number = 25000): AbortSignal {
    this.reset();
    this.currentMode = mode;
    this.abortController = new AbortController();

    this.transition("CHECKING_SUPPORT", "Verificando hardware e suporte NFC...");

    this.timeoutId = setTimeout(() => {
      this.fail("TIMEOUT", "Tempo limite excedido aguardando aproximação NFC.");
    }, timeoutMs);

    return this.abortController.signal;
  }

  /**
   * Cancela a operação atual pelo usuário.
   */
  public cancel(): void {
    if (!this.getSnapshot().canCancel) return;
    this.fail("USER_CANCELLED", "Operação NFC cancelada pelo usuário.");
  }

  /**
   * Transições controladas de estado
   */
  public toWaiting(message: string = "Aproxime o dispositivo ou a tag NFC..."): void {
    this.transition("WAITING", message);
  }

  public toReading(message: string = "Lendo dados NFC... Mantenha imóvel."): void {
    this.transition("READING", message);
  }

  public toWriting(message: string = "Gravando dados na tag NFC..."): void {
    this.transition("WRITING", message);
  }

  public toProcessing(message: string = "Validando dados com a API ÍNTEGRA..."): void {
    this.transition("PROCESSING", message);
  }

  public success(data: any, message: string = "Operação NFC concluída com sucesso!"): void {
    this.clearTimer();
    this.currentState = "SUCCESS";
    this.message = message;
    this.data = data;
    this.errorCode = undefined;
    this.errorMessage = undefined;
    this.notify();
  }

  public fail(code: NfcErrorCode, message: string): void {
    this.clearTimer();
    if (this.abortController && !this.abortController.signal.aborted) {
      this.abortController.abort();
    }
    this.currentState = "ERROR";
    this.errorCode = code;
    this.errorMessage = message;
    this.message = message;
    this.notify();
  }

  private transition(nextState: NfcState, message: string): void {
    this.currentState = nextState;
    this.message = message;
    this.notify();
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const nfcStateMachine = new NfcStateMachine();
