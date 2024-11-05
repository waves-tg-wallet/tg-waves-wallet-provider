import { ConnectOptions, UserData, SignerTx, SignedTx } from "@waves/signer";
import { IProviderTelegram } from ".";
import { IProviderTelegramConfig, TProviderTelegramType } from "..";

export class FrameProviderTelegram implements IProviderTelegram {
    type: TProviderTelegramType = 'iframe';
    public user: UserData;
    options: ConnectOptions;
    providerConfig: IProviderTelegramConfig;

    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>> {
        throw new Error("Method not implemented.");
    }

    constructor(user: UserData, options: ConnectOptions, config: IProviderTelegramConfig) {
        this.options = options;
        this.providerConfig = config;
        this.user = user;
    }

    login(): Promise<UserData> {
        return new Promise((resolve) => {
            resolve(this.user);
        })
    }

    function sendMessageAndWaitForResponse(message) {
        return new Promise((resolve) => {
          const timeout = 60000; // 1 минута в миллисекундах
          let isResolved = false;
      
          // Слушатель для получения ответа от родительского окна
          function handleMessage(event) {
            // Проверяем источник сообщения для безопасности
            if (event.origin !== window.origin) return;
      
            // Если получен ответ, очищаем таймер и вызываем resolve
            if (event.data === 'response') { // проверка на нужное сообщение
              window.removeEventListener('message', handleMessage);
              isResolved = true;
              resolve(event.data);
            }
          }
      
          // Добавляем слушатель для ответа от родительского окна
          window.addEventListener('message', handleMessage);
      
          // Отправляем сообщение в родительское окно
          window.parent.postMessage(message, '*');
      
          // Устанавливаем таймер на случай, если ответа не будет
          setTimeout(() => {
            if (!isResolved) {
              window.removeEventListener('message', handleMessage);
              resolve('Timeout: No response received');
            }
          }, timeout);
        });
      }
}
