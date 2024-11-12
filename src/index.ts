import { ProviderTelegram } from "./provider";

export { ProviderTelegram }

type TLinkDeliveryMethod = 'qr' | 'message' | 'both'
type TProviderTelegramType = 'site' | 'webapp'

interface IProviderTelegramConfig {
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

export type { TLinkDeliveryMethod, IProviderTelegramConfig, TProviderTelegramType }