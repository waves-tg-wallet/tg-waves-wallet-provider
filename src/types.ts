import { UserData, ConnectOptions, SignerTx, SignedTx } from "@waves/signer";

export type TProviderTelegramType = 'site' | 'webapp'
export type TLinkDeliveryMethod = 'qr' | 'message' | 'both'

export interface IProviderTelegram {
    options: ConnectOptions;
    login(): Promise<UserData>;
    sign(toSign: SignerTx[]): Promise<SignedTx<SignerTx[]>>;
}


export interface IProviderTelegramConfig {
	botName: `${string}/${string}`,
	linkDeliveryMethod: TLinkDeliveryMethod,
	bgColor: string,
	textColor: string,
	buttonColor: string,
	buttonTextColor: string,
	darkBgColor: string,
	darkButtonTextColor: string,
	darkTextColor: string,
	darkButtonColor: string,
	lightDark: boolean
}