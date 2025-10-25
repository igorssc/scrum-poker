'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from './Button';

type ShareModalContentProps = {
  roomId: string;
  roomName?: string;
  onClose: () => void;
};

export const ShareModalContent = ({ roomId, roomName, onClose }: ShareModalContentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Gerar a URL de compartilhamento
    const url = `${window.location.origin}/room/${roomId}`;
    setShareUrl(url);

    // Gerar o QR Code
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('Erro ao gerar QR Code:', error);
      });
    }
  }, [roomId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
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
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Compartilhar Sala
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {roomName && `"${roomName}"`}
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <canvas ref={canvasRef} className="max-w-full h-auto" />
      </div>

      {/* URL */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Link da sala:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            onClick={copyToClipboard}
            className={`px-4 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            title="Copiar link"
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Link copiado para a área de transferência!
          </p>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3 w-full">
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={shareNative}
            className="flex-1 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Compartilhar
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={onClose}
          className="flex-1"
        >
          Fechar
        </Button>
      </div>
    </div>
  );
};