import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

type ApiError = {
  message: string;
  error: string;
  statusCode: number;
};

// Sistema de controle direto usando contador
const MAX_TOASTS = 3;
let currentToastCount = 0;

// Função para garantir que não passe de 3 toasts
const enforceToastLimit = () => {
  if (currentToastCount >= MAX_TOASTS) {
    // Remove todos os toasts e reinicia
    toast.dismiss();
    currentToastCount = 0;
  }
  currentToastCount++;

  // Decrementa após o tempo do toast
  setTimeout(() => {
    currentToastCount = Math.max(0, currentToastCount - 1);
  }, 5000);
};

// Função para criar toast com controle rigoroso
const createControlledToast = (toastFn: () => string): string => {
  enforceToastLimit();
  return toastFn();
};

export const handleApiError = (error: unknown, customMessage?: string) => {
  let message = customMessage || 'Ocorreu um erro inesperado';

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data?.message) {
      message = axiosError.response.data.message;
    } else if (axiosError.message) {
      message = axiosError.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Não mostrar toast para erros genéricos do servidor e conexão
  if (
    message === 'Internal server error' ||
    message === 'Network Error' ||
    message === 'Request failed with status code 500' ||
    message.includes('Connection refused') ||
    message.includes('ERR_NETWORK') ||
    message.includes('ERR_INTERNET_DISCONNECTED') ||
    message.includes('fetch')
  ) {
    return;
  }

  createControlledToast(() => toast.error(message));
};

export const showSuccessToast = (message: string) => {
  createControlledToast(() => toast.success(message));
};

export const showLoadingToast = (message: string) => {
  return createControlledToast(() => toast.loading(message));
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
  currentToastCount = Math.max(0, currentToastCount - 1);
};
