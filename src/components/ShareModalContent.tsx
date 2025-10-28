'use client';

import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from './Button';

type ShareModalContentProps = {
  roomId: string;
  roomName?: string;
  access?: string;
  onClose: () => void;
};

export const ShareModalContent = ({
  roomId,
  roomName,
  onClose,
  access,
}: ShareModalContentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Gerar a URL de compartilhamento
    const url = `${window.location.origin}/room/${roomId}${access ? `?access=${access}` : ''}`;
    setShareUrl(url);

    // Gerar o QR Code
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        error => {
          if (error) toast.error('Erro ao gerar QR Code');
        }
      );
    }
  }, [roomId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const shareNative = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Sala: ${roomName || 'Scrum Poker'}`,
          text: 'Participe da nossa sessão de Scrum Poker!',
          url: shareUrl,
        });
      } catch (error) {
        toast.error('Erro ao compartilhar link');
      }
    }
  };

  return (
    <div className="h-full max-h-[80dvh] w-full mx-auto">
      <div className="min-h-0">
        <div className="py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col items-center gap-6 lg:gap-8">
            {/* QR Code */}
            <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg shadow-sm shadow-purple-300 dark:shadow-current">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
            </div>

            {/* URL */}
            <div className="w-full flex flex-col">
              <label className="block text-[0.65rem] sm:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Link da sala:
              </label>
              <div className="flex gap-1.5 sm:gap-2 w-[99%] self-center">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[0.65rem] sm:text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  onClick={copyToClipboard}
                  className={`px-2.5 sm:px-3 md:px-4 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                  title="Copiar link"
                >
                  {copied ? (
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 sm:mt-1">
                  Link copiado para a área de transferência!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botões fixos no rodapé */}
      <div className="flex gap-2 sm:gap-3 w-full pb-3 sm:pb-4 md:pb-5 lg:pb-6">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Fechar
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button onClick={shareNative} className="flex-1 flex justify-center">
            <span className="flex items-center">
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1.5 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Compartilhar
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
