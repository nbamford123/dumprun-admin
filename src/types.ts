declare module 'cookie' {
	export interface CookieSerializeOptions {
		domain?: string;
		encode?(val: string): string;
		expires?: Date;
		httpOnly?: boolean;
		maxAge?: number;
		path?: string;
		sameSite?: boolean | 'lax' | 'strict' | 'none';
		secure?: boolean;
	}
}
