import { UserData } from '@waves/signer';
import { IProviderTelegramConfig } from "..";
interface IProps {
    id: string;
    token: string;
    networkByte: number;
    config: IProviderTelegramConfig;
}
declare const _default: import("vue").DefineComponent<__VLS_TypePropsToOption<IProps>, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    connected: (value: UserData) => void;
    rejected: (value: string) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_TypePropsToOption<IProps>>> & {
    onRejected?: ((value: string) => any) | undefined;
    onConnected?: ((value: UserData) => any) | undefined;
}, {}, {}>;
export default _default;
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
